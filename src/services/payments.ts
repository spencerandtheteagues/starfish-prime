/**
 * Payment Service
 *
 * Handles iOS StoreKit in-app purchases and subscription management.
 * Uses expo-in-app-purchases for App Store integration.
 *
 * Product IDs:
 * - com.silverguard.eldercare.premium.monthly: $19.99/month
 * - com.silverguard.eldercare.premium.yearly: $149.99/year
 * - com.silverguard.eldercare.unlock: $4.99 one-time
 */

import * as InAppPurchases from 'expo-in-app-purchases';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import {
  Subscription,
  SubscriptionProduct,
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionFeatures,
  PurchaseReceipt,
} from '../types';

// ============================================================================
// PRODUCT CONFIGURATION
// ============================================================================

export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'com.silverguard.eldercare.premium.monthly',
  PREMIUM_YEARLY: 'com.silverguard.eldercare.premium.yearly',
  APP_UNLOCK: 'com.silverguard.eldercare.unlock',
} as const;

// Trial configuration
export const TRIAL_CONFIG = {
  durationDays: 3,
  enabled: true,
  eligibleProducts: [PRODUCT_IDS.PREMIUM_MONTHLY, PRODUCT_IDS.PREMIUM_YEARLY],
};

export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    id: 'premium_monthly',
    productId: PRODUCT_IDS.PREMIUM_MONTHLY,
    name: 'Premium Monthly',
    description: 'Start with 3-day FREE trial, then $19.99/month',
    tier: 'premium',
    priceUsd: 19.99,
    billingPeriod: 'monthly',
    popular: true,
    features: [
      '3-day FREE trial included',
      'Unlimited Sunny AI conversations',
      'Voice-activated AI companion',
      'Real-time health insights',
      'Advanced caregiver analytics',
      'Priority emergency alerts',
      'Custom AI personality',
      'Family sharing (up to 5)',
      'Export data & reports',
    ],
  },
  {
    id: 'premium_yearly',
    productId: PRODUCT_IDS.PREMIUM_YEARLY,
    name: 'Premium Yearly',
    description: '3-day FREE trial + 2 months free with annual billing',
    tier: 'premium',
    priceUsd: 149.99,
    billingPeriod: 'yearly',
    features: [
      '3-day FREE trial included',
      'All Premium Monthly features',
      'Save $89.89 per year',
      'Priority feature access',
      'Extended conversation history',
    ],
  },
  {
    id: 'app_unlock',
    productId: PRODUCT_IDS.APP_UNLOCK,
    name: 'SilverGuard Unlock',
    description: 'One-time purchase to unlock basic app features',
    tier: 'basic',
    priceUsd: 4.99,
    billingPeriod: 'lifetime',
    features: [
      'Medication tracking',
      'Appointment management',
      'Basic messaging',
      'Health logging',
      'Emergency SOS',
    ],
  },
];

// Feature limits by tier
export const TIER_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    maxSeniors: 0,
    voiceMinutesPerMonth: 0,
    sunnyAIEnabled: false,
    advancedAnalytics: false,
    prioritySupport: false,
    customPrompts: false,
    exportData: false,
    familySharing: false,
  },
  basic: {
    maxSeniors: 1,
    voiceMinutesPerMonth: 30,
    sunnyAIEnabled: false,
    advancedAnalytics: false,
    prioritySupport: false,
    customPrompts: false,
    exportData: false,
    familySharing: false,
  },
  premium: {
    maxSeniors: 5,
    voiceMinutesPerMonth: -1, // Unlimited
    sunnyAIEnabled: true,
    advancedAnalytics: true,
    prioritySupport: true,
    customPrompts: true,
    exportData: true,
    familySharing: true,
  },
};

// ============================================================================
// SERVICE STATE
// ============================================================================

let isInitialized = false;
let purchaseListener: InAppPurchases.IAPItemDetails[] | null = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the in-app purchase system
 * Call this on app startup
 */
export async function initializePayments(): Promise<void> {
  if (isInitialized) return;

  try {
    // Connect to App Store
    await InAppPurchases.connectAsync();

    // Set up purchase listener
    InAppPurchases.setPurchaseListener(handlePurchaseUpdate);

    isInitialized = true;
    console.log('[Payments] Initialized successfully');
  } catch (error) {
    console.error('[Payments] Initialization failed:', error);
    throw error;
  }
}

/**
 * Disconnect from the store (call on app close)
 */
export async function disconnectPayments(): Promise<void> {
  if (!isInitialized) return;

  try {
    await InAppPurchases.disconnectAsync();
    isInitialized = false;
    console.log('[Payments] Disconnected');
  } catch (error) {
    console.error('[Payments] Disconnect failed:', error);
  }
}

// ============================================================================
// PRODUCT FETCHING
// ============================================================================

/**
 * Fetch product details from App Store
 */
export async function fetchProducts(): Promise<InAppPurchases.IAPItemDetails[]> {
  if (!isInitialized) {
    await initializePayments();
  }

  try {
    const productIds = Object.values(PRODUCT_IDS);
    const { results } = await InAppPurchases.getProductsAsync(productIds);
    console.log('[Payments] Fetched products:', results.length);
    return results;
  } catch (error) {
    console.error('[Payments] Failed to fetch products:', error);
    return [];
  }
}

/**
 * Get product details with local enrichment
 */
export async function getEnrichedProducts(): Promise<{
  product: SubscriptionProduct;
  storeDetails?: InAppPurchases.IAPItemDetails;
}[]> {
  const storeProducts = await fetchProducts();

  return SUBSCRIPTION_PRODUCTS.map(product => {
    const storeDetail = storeProducts.find(sp => sp.productId === product.productId);
    return {
      product,
      storeDetails: storeDetail,
    };
  });
}

// ============================================================================
// PURCHASE FLOW
// ============================================================================

/**
 * Purchase a product
 */
export async function purchaseProduct(productId: string): Promise<boolean> {
  if (!isInitialized) {
    await initializePayments();
  }

  try {
    console.log('[Payments] Starting purchase for:', productId);
    await InAppPurchases.purchaseItemAsync(productId);
    return true;
  } catch (error: any) {
    if (error.code === 'E_USER_CANCELLED') {
      console.log('[Payments] User cancelled purchase');
      return false;
    }
    console.error('[Payments] Purchase failed:', error);
    throw error;
  }
}

/**
 * Handle purchase updates from App Store
 */
async function handlePurchaseUpdate(
  result: InAppPurchases.IAPQueryResponse<InAppPurchases.InAppPurchase>
): Promise<void> {
  const { responseCode, results } = result;

  if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
    for (const purchase of results) {
      if (!purchase.acknowledged) {
        console.log('[Payments] Processing purchase:', purchase.productId);

        try {
          // Verify with backend
          const verified = await verifyPurchaseWithBackend(purchase);

          if (verified) {
            // Finish the transaction
            await InAppPurchases.finishTransactionAsync(purchase, true);
            console.log('[Payments] Purchase completed:', purchase.productId);
          } else {
            console.error('[Payments] Purchase verification failed');
            await InAppPurchases.finishTransactionAsync(purchase, false);
          }
        } catch (error) {
          console.error('[Payments] Error processing purchase:', error);
        }
      }
    }
  } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
    console.log('[Payments] User cancelled');
  } else {
    console.error('[Payments] Purchase error:', responseCode);
  }
}

// ============================================================================
// VERIFICATION & BACKEND
// ============================================================================

/**
 * Verify purchase with backend
 */
async function verifyPurchaseWithBackend(
  purchase: InAppPurchases.InAppPurchase
): Promise<boolean> {
  try {
    const verifyFunction = functions().httpsCallable('verifyApplePurchase');
    const result = await verifyFunction({
      transactionId: purchase.orderId,
      productId: purchase.productId,
      receiptData: purchase.transactionReceipt,
      originalTransactionId: purchase.originalOrderId,
    });

    const data = result.data as { verified?: boolean };
    return data.verified === true;
  } catch (error) {
    console.error('[Payments] Verification error:', error);
    return false;
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Get current user's subscription
 */
export async function getCurrentSubscription(
  userId: string
): Promise<Subscription | null> {
  try {
    const snapshot = await firestore()
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trial'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      startDate: data.startDate?.toDate(),
      endDate: data.endDate?.toDate(),
      trialEndDate: data.trialEndDate?.toDate(),
      canceledAt: data.canceledAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Subscription;
  } catch (error) {
    console.error('[Payments] Error fetching subscription:', error);
    return null;
  }
}

/**
 * Get subscription features for a user
 */
export async function getSubscriptionFeatures(
  userId: string
): Promise<SubscriptionFeatures> {
  const subscription = await getCurrentSubscription(userId);

  if (!subscription || subscription.status !== 'active') {
    return TIER_FEATURES.free;
  }

  return TIER_FEATURES[subscription.tier] || TIER_FEATURES.free;
}

/**
 * Check if user has active premium subscription
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const subscription = await getCurrentSubscription(userId);
  return (
    subscription !== null &&
    subscription.status === 'active' &&
    subscription.tier === 'premium'
  );
}

/**
 * Check if user has basic or premium access
 */
export async function hasBasicAccess(userId: string): Promise<boolean> {
  const subscription = await getCurrentSubscription(userId);
  return (
    subscription !== null &&
    subscription.status === 'active' &&
    (subscription.tier === 'basic' || subscription.tier === 'premium')
  );
}

// ============================================================================
// RESTORE PURCHASES
// ============================================================================

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<boolean> {
  if (!isInitialized) {
    await initializePayments();
  }

  try {
    console.log('[Payments] Restoring purchases...');
    const history = await InAppPurchases.getPurchaseHistoryAsync();

    if (history.results && history.results.length > 0) {
      // Send to backend for verification and restoration
      const restoreFunction = functions().httpsCallable('restoreApplePurchases');
      const result = await restoreFunction({
        purchases: history.results.map((p: InAppPurchases.InAppPurchase) => ({
          transactionId: p.orderId,
          productId: p.productId,
          receiptData: p.transactionReceipt,
          originalTransactionId: p.originalOrderId,
        })),
      });

      console.log('[Payments] Restore result:', result.data);
      const data = result.data as { restored?: boolean };
      return data.restored === true;
    }

    return false;
  } catch (error) {
    console.error('[Payments] Restore failed:', error);
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION LISTENERS
// ============================================================================

/**
 * Listen to subscription changes
 */
export function subscribeToSubscriptionChanges(
  userId: string,
  callback: (subscription: Subscription | null) => void
): () => void {
  const unsubscribe = firestore()
    .collection('subscriptions')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .onSnapshot(
      snapshot => {
        if (snapshot.empty) {
          callback(null);
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        callback({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          trialEndDate: data.trialEndDate?.toDate(),
          canceledAt: data.canceledAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Subscription);
      },
      error => {
        console.error('[Payments] Subscription listener error:', error);
        callback(null);
      }
    );

  return unsubscribe;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Get subscription status display text
 */
export function getStatusDisplayText(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trial':
      return 'Free Trial';
    case 'canceled':
      return 'Canceled';
    case 'expired':
      return 'Expired';
    case 'pending':
      return 'Pending';
    default:
      return 'Unknown';
  }
}

/**
 * Get days remaining in subscription
 */
export function getDaysRemaining(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ============================================================================
// FREE TRIAL MANAGEMENT
// ============================================================================

/**
 * Check if user is eligible for free trial
 */
export async function checkTrialEligibility(userId: string): Promise<boolean> {
  try {
    // Check if user has ever had a subscription
    const snapshot = await firestore()
      .collection('subscriptions')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    // User is eligible if they've never had a subscription
    return snapshot.empty;
  } catch (error) {
    console.error('[Payments] Error checking trial eligibility:', error);
    return false;
  }
}

/**
 * Start a free trial for a user
 */
export async function startFreeTrial(userId: string): Promise<Subscription | null> {
  try {
    // Verify eligibility
    const isEligible = await checkTrialEligibility(userId);
    if (!isEligible) {
      console.log('[Payments] User not eligible for trial:', userId);
      return null;
    }

    // Calculate trial dates
    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_CONFIG.durationDays * 24 * 60 * 60 * 1000);

    // Create trial subscription
    const trialData = {
      userId,
      tier: 'premium' as const,
      status: 'trial' as const,
      provider: 'apple' as const,
      productId: 'trial',
      startDate: now,
      endDate: trialEnd,
      trialEndDate: trialEnd,
      priceUsd: 0,
      currency: 'USD',
      autoRenew: false,
      isTrialPeriod: true,
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore
    const docRef = await firestore().collection('subscriptions').add(trialData);

    // Update user record
    await firestore().collection('users').doc(userId).update({
      activeSubscriptionId: docRef.id,
      subscriptionTier: 'premium',
      subscriptionStatus: 'trial',
      trialStartDate: now,
      trialEndDate: trialEnd,
      updatedAt: now,
    });

    console.log('[Payments] Started trial for user:', userId);

    return {
      id: docRef.id,
      ...trialData,
    };
  } catch (error) {
    console.error('[Payments] Error starting trial:', error);
    return null;
  }
}

/**
 * Get trial status for a user
 */
export async function getTrialStatus(userId: string): Promise<{
  isOnTrial: boolean;
  isEligible: boolean;
  daysRemaining?: number;
  trialEndDate?: Date;
}> {
  try {
    // Check current subscription
    const subscription = await getCurrentSubscription(userId);

    if (subscription?.status === 'trial') {
      const daysRemaining = getDaysRemaining(subscription.endDate);
      return {
        isOnTrial: true,
        isEligible: false,
        daysRemaining,
        trialEndDate: subscription.endDate,
      };
    }

    // Check eligibility
    const isEligible = await checkTrialEligibility(userId);

    return {
      isOnTrial: false,
      isEligible,
    };
  } catch (error) {
    console.error('[Payments] Error getting trial status:', error);
    return { isOnTrial: false, isEligible: false };
  }
}

/**
 * Extend trial (for promotional purposes)
 */
export async function extendTrial(
  userId: string,
  additionalDays: number
): Promise<boolean> {
  try {
    const subscription = await getCurrentSubscription(userId);

    if (!subscription || subscription.status !== 'trial') {
      return false;
    }

    const newEndDate = new Date(
      subscription.endDate.getTime() + additionalDays * 24 * 60 * 60 * 1000
    );

    await firestore().collection('subscriptions').doc(subscription.id).update({
      endDate: newEndDate,
      trialEndDate: newEndDate,
      updatedAt: new Date(),
    });

    console.log(`[Payments] Extended trial by ${additionalDays} days for user:`, userId);
    return true;
  } catch (error) {
    console.error('[Payments] Error extending trial:', error);
    return false;
  }
}
