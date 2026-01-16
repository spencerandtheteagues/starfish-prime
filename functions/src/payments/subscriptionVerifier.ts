/**
 * Subscription Verifier
 *
 * Backend functions for verifying Apple App Store purchases
 * and managing subscription state in Firestore.
 */

import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

// ============================================================================
// TYPES
// ============================================================================

interface AppleReceiptResponse {
  status: number;
  environment?: string;
  receipt?: {
    bundle_id: string;
    in_app?: AppleInAppPurchase[];
  };
  latest_receipt_info?: AppleInAppPurchase[];
  pending_renewal_info?: ApplePendingRenewal[];
}

interface AppleInAppPurchase {
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchase_date_ms: string;
  expires_date_ms?: string;
  is_trial_period?: string;
  is_in_intro_offer_period?: string;
  cancellation_date_ms?: string;
}

interface ApplePendingRenewal {
  auto_renew_product_id: string;
  auto_renew_status: string;
  expiration_intent?: string;
}

interface VerificationResult {
  verified: boolean;
  subscription?: {
    productId: string;
    transactionId: string;
    originalTransactionId: string;
    purchaseDate: Date;
    expirationDate?: Date;
    isTrialPeriod: boolean;
    autoRenew: boolean;
    tier: 'basic' | 'premium';
    status: 'active' | 'trial' | 'expired' | 'canceled';
  };
  error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Apple's verification endpoints
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// Product ID to tier mapping
const PRODUCT_TIERS: Record<string, 'basic' | 'premium'> = {
  'com.silverguard.eldercare.premium.monthly': 'premium',
  'com.silverguard.eldercare.premium.yearly': 'premium',
  'com.silverguard.eldercare.unlock': 'basic',
};

// ============================================================================
// VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Verify an Apple receipt with Apple's servers
 */
export async function verifyAppleReceipt(
  receiptData: string,
  excludeOldTransactions: boolean = false
): Promise<AppleReceiptResponse | null> {
  const sharedSecret = process.env.APPLE_SHARED_SECRET || '';

  const requestBody = {
    'receipt-data': receiptData,
    password: sharedSecret,
    'exclude-old-transactions': excludeOldTransactions,
  };

  try {
    // Try production first
    let response = await fetch(APPLE_PRODUCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    let result = await response.json() as AppleReceiptResponse;

    // If status 21007, retry with sandbox
    if (result.status === 21007) {
      console.log('[Payment] Retrying with sandbox URL');
      response = await fetch(APPLE_SANDBOX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      result = await response.json() as AppleReceiptResponse;
    }

    return result;
  } catch (error) {
    console.error('[Payment] Apple verification error:', error);
    return null;
  }
}

/**
 * Process and verify a purchase
 */
export async function verifyPurchase(
  userId: string,
  receiptData: string,
  productId: string,
  transactionId: string
): Promise<VerificationResult> {
  // Verify with Apple
  const appleResponse = await verifyAppleReceipt(receiptData, true);

  if (!appleResponse) {
    return { verified: false, error: 'Failed to connect to Apple servers' };
  }

  // Check status
  if (appleResponse.status !== 0) {
    return { verified: false, error: `Apple verification failed: ${appleResponse.status}` };
  }

  // Find the relevant purchase
  const purchases = appleResponse.latest_receipt_info || appleResponse.receipt?.in_app || [];
  const purchase = purchases.find(
    p => p.product_id === productId && p.transaction_id === transactionId
  );

  if (!purchase) {
    return { verified: false, error: 'Transaction not found in receipt' };
  }

  // Determine subscription details
  const tier = PRODUCT_TIERS[productId] || 'basic';
  const purchaseDate = new Date(parseInt(purchase.purchase_date_ms));
  const expirationDate = purchase.expires_date_ms
    ? new Date(parseInt(purchase.expires_date_ms))
    : undefined;
  const isTrialPeriod = purchase.is_trial_period === 'true';
  const isCanceled = !!purchase.cancellation_date_ms;

  // Check pending renewal info for auto-renew status
  const pendingRenewal = appleResponse.pending_renewal_info?.find(
    p => p.auto_renew_product_id === productId
  );
  const autoRenew = pendingRenewal?.auto_renew_status === '1';

  // Determine status
  let status: 'active' | 'trial' | 'expired' | 'canceled' = 'active';
  if (isCanceled) {
    status = 'canceled';
  } else if (isTrialPeriod) {
    status = 'trial';
  } else if (expirationDate && expirationDate < new Date()) {
    status = 'expired';
  }

  // Save to Firestore
  const subscriptionData = {
    userId,
    tier,
    status,
    provider: 'apple',
    productId,
    transactionId: purchase.transaction_id,
    originalTransactionId: purchase.original_transaction_id,
    purchaseDate,
    expirationDate: expirationDate || null,
    isTrialPeriod,
    autoRenew,
    priceUsd: getPriceForProduct(productId),
    currency: 'USD',
    receiptData,
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Upsert subscription by original transaction ID
  const subscriptionRef = admin.firestore()
    .collection('subscriptions')
    .doc(purchase.original_transaction_id);

  await subscriptionRef.set(subscriptionData, { merge: true });

  // Update user's subscription reference
  await admin.firestore()
    .collection('users')
    .doc(userId)
    .update({
      activeSubscriptionId: purchase.original_transaction_id,
      subscriptionTier: tier,
      subscriptionStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log(`[Payment] Verified purchase for user ${userId}: ${productId} (${status})`);

  return {
    verified: true,
    subscription: {
      productId,
      transactionId: purchase.transaction_id,
      originalTransactionId: purchase.original_transaction_id,
      purchaseDate,
      expirationDate,
      isTrialPeriod,
      autoRenew,
      tier,
      status,
    },
  };
}

/**
 * Restore purchases for a user
 */
export async function restorePurchases(
  userId: string,
  purchases: Array<{
    receiptData: string;
    productId: string;
    transactionId: string;
    originalTransactionId: string;
  }>
): Promise<{ restored: boolean; count: number }> {
  let restoredCount = 0;

  for (const purchase of purchases) {
    try {
      const result = await verifyPurchase(
        userId,
        purchase.receiptData,
        purchase.productId,
        purchase.transactionId
      );

      if (result.verified && result.subscription?.status === 'active') {
        restoredCount++;
      }
    } catch (error) {
      console.error('[Payment] Error restoring purchase:', error);
    }
  }

  console.log(`[Payment] Restored ${restoredCount} purchases for user ${userId}`);

  return {
    restored: restoredCount > 0,
    count: restoredCount,
  };
}

/**
 * Handle App Store Server Notification (webhook)
 */
export async function handleAppStoreNotification(
  notificationPayload: any
): Promise<void> {
  const { notification_type, unified_receipt, auto_renew_status_change_date_ms } = notificationPayload;

  console.log(`[Payment] App Store notification: ${notification_type}`);

  const latestReceipt = unified_receipt?.latest_receipt_info?.[0];
  if (!latestReceipt) {
    console.warn('[Payment] No receipt info in notification');
    return;
  }

  const originalTransactionId = latestReceipt.original_transaction_id;

  // Find existing subscription
  const subscriptionRef = admin.firestore()
    .collection('subscriptions')
    .doc(originalTransactionId);

  const subscriptionDoc = await subscriptionRef.get();
  if (!subscriptionDoc.exists) {
    console.warn(`[Payment] Subscription not found: ${originalTransactionId}`);
    return;
  }

  const updates: any = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  switch (notification_type) {
    case 'DID_RENEW':
      updates.status = 'active';
      updates.expirationDate = new Date(parseInt(latestReceipt.expires_date_ms));
      break;

    case 'DID_FAIL_TO_RENEW':
      updates.status = 'expired';
      updates.autoRenew = false;
      break;

    case 'CANCEL':
    case 'DID_CHANGE_RENEWAL_STATUS':
      if (notificationPayload.auto_renew_status === 'false') {
        updates.autoRenew = false;
        updates.canceledAt = auto_renew_status_change_date_ms
          ? new Date(parseInt(auto_renew_status_change_date_ms))
          : admin.firestore.FieldValue.serverTimestamp();
      }
      break;

    case 'REFUND':
      updates.status = 'canceled';
      updates.refundedAt = admin.firestore.FieldValue.serverTimestamp();
      break;

    case 'INTERACTIVE_RENEWAL':
      updates.status = 'active';
      updates.autoRenew = true;
      updates.expirationDate = new Date(parseInt(latestReceipt.expires_date_ms));
      break;

    default:
      console.log(`[Payment] Unhandled notification type: ${notification_type}`);
  }

  await subscriptionRef.update(updates);

  // Also update the user record
  const subscriptionData = subscriptionDoc.data();
  if (subscriptionData?.userId) {
    await admin.firestore()
      .collection('users')
      .doc(subscriptionData.userId)
      .update({
        subscriptionStatus: updates.status || subscriptionData.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get price for a product ID
 */
function getPriceForProduct(productId: string): number {
  const prices: Record<string, number> = {
    'com.silverguard.eldercare.premium.monthly': 19.99,
    'com.silverguard.eldercare.premium.yearly': 149.99,
    'com.silverguard.eldercare.unlock': 4.99,
  };
  return prices[productId] || 0;
}

/**
 * Check if user has active subscription
 */
export async function checkSubscriptionStatus(
  userId: string
): Promise<{ hasAccess: boolean; tier: string; status: string }> {
  const snapshot = await admin.firestore()
    .collection('subscriptions')
    .where('userId', '==', userId)
    .where('status', 'in', ['active', 'trial'])
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { hasAccess: false, tier: 'free', status: 'none' };
  }

  const subscription = snapshot.docs[0].data();

  // Check if subscription is still valid
  if (subscription.expirationDate) {
    const expirationDate = subscription.expirationDate.toDate();
    if (expirationDate < new Date()) {
      return { hasAccess: false, tier: 'free', status: 'expired' };
    }
  }

  return {
    hasAccess: true,
    tier: subscription.tier,
    status: subscription.status,
  };
}
