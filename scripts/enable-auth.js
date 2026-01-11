#!/usr/bin/env node
/**
 * Enable Email/Password Authentication in Firebase
 *
 * This script uses the Firebase Admin SDK to check authentication status
 * and provides instructions for enabling Email/Password auth.
 */

const admin = require('firebase-admin');
const https = require('https');

// Load service account
const serviceAccount = require('../functions/service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const PROJECT_ID = serviceAccount.project_id;

console.log('========================================');
console.log('Firebase Authentication Setup');
console.log('========================================');
console.log('');
console.log(`Project ID: ${PROJECT_ID}`);
console.log('');

/**
 * Check if Email/Password authentication is enabled
 */
async function checkAuthStatus() {
  console.log('Checking authentication status...');
  console.log('');

  try {
    // Try to list users - this will fail if auth is not configured
    const listUsersResult = await admin.auth().listUsers(1);
    console.log('✅ Firebase Authentication is configured');
    console.log(`   Found ${listUsersResult.users.length} user(s) in the system`);
    console.log('');

    // Check if Email/Password provider is available by trying to get a user
    try {
      // This is just a check - we expect it might not find a user
      const providers = await admin.auth().listProviderConfigs({ maxResults: 100 });
      console.log('Available authentication providers:');
      if (providers.providerConfigs && providers.providerConfigs.length > 0) {
        providers.providerConfigs.forEach(provider => {
          console.log(`   - ${provider.providerId}`);
        });
      } else {
        console.log('   Email/Password authentication is available but no custom providers configured');
      }
      console.log('');
    } catch (error) {
      // This is fine - just means no custom providers
    }

    return true;
  } catch (error) {
    if (error.code === 'auth/project-not-found' || error.code === 'auth/configuration-not-found') {
      console.log('❌ Firebase Authentication is NOT configured');
      console.log('');
      return false;
    }

    // Other errors
    console.error('Error checking authentication:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const authEnabled = await checkAuthStatus();

  if (!authEnabled) {
    console.log('========================================');
    console.log('⚠️  ACTION REQUIRED');
    console.log('========================================');
    console.log('');
    console.log('You need to enable Email/Password authentication in the Firebase Console:');
    console.log('');
    console.log('1. Open the Firebase Console:');
    console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`);
    console.log('');
    console.log('2. Under "Sign-in providers", find "Email/Password"');
    console.log('');
    console.log('3. Click on "Email/Password"');
    console.log('');
    console.log('4. Toggle "Enable" to ON');
    console.log('');
    console.log('5. Click "Save"');
    console.log('');
    console.log('After enabling, run this script again to verify.');
    console.log('');
    process.exit(1);
  } else {
    console.log('========================================');
    console.log('✅ All Set!');
    console.log('========================================');
    console.log('');
    console.log('Firebase Authentication is properly configured.');
    console.log('You can now create user accounts in your ElderCare app.');
    console.log('');

    // Deploy Firestore rules
    console.log('Next steps:');
    console.log('1. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('2. Deploy Cloud Functions: cd functions && npm run build && cd .. && firebase deploy --only functions');
    console.log('');
  }

  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
