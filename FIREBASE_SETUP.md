# Firebase Setup Guide for ElderCare App

## Current Issue
Account creation is failing because Firebase Authentication is not properly configured.

## Step-by-Step Setup

### 1. Enable Firebase Authentication

1. Open the Firebase Console Authentication page:
   **https://console.firebase.google.com/project/eldercare-app-17d19/authentication/providers**

2. You'll see a list of "Sign-in providers"

3. Find **"Email/Password"** in the list

4. Click on "Email/Password"

5. Toggle **"Enable"** to ON

6. Click **"Save"**

### 2. Enable Required Google Cloud APIs

The following APIs need to be enabled for Firebase Authentication to work:

1. Open the Google Cloud Console API Library:
   **https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=eldercare-app-17d19**

2. Click **"ENABLE"** to enable the Identity Toolkit API

3. Also enable the Firebase Authentication API:
   **https://console.cloud.google.com/apis/library/firebase.googleapis.com?project=eldercare-app-17d19**

4. Click **"ENABLE"**

### 3. Verify Service Account Permissions

The service account needs proper permissions:

1. Go to IAM & Admin:
   **https://console.cloud.google.com/iam-admin/iam?project=eldercare-app-17d19**

2. Find your Firebase Admin service account (usually ends with `@eldercare-app-17d19.iam.gserviceaccount.com`)

3. Make sure it has these roles:
   - Firebase Admin SDK Administrator Service Agent
   - Service Usage Consumer
   - Cloud Functions Service Agent

### 4. Deploy Firestore Rules and Indexes

After enabling authentication, deploy the Firestore configuration:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules --project eldercare-app-17d19

# Deploy Firestore indexes
firebase deploy --only firestore:indexes --project eldercare-app-17d19
```

### 5. Build and Deploy Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build the functions
npm run build

# Go back to root
cd ..

# Deploy functions
firebase deploy --only functions --project eldercare-app-17d19
```

### 6. Test Account Creation

After completing the above steps:

1. Open the ElderCare app in the iOS Simulator

2. Try creating a new account with:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPassword123!
   - Role: Caregiver or Senior

3. If successful, you should be logged in automatically

## Verification Commands

Run these commands to verify the setup:

```bash
# Check if authentication is working
node scripts/enable-auth.js

# Check Firestore rules
firebase firestore:rules:list --project eldercare-app-17d19

# Check deployed functions
firebase functions:list --project eldercare-app-17d19
```

## Troubleshooting

### "Configuration not found" error
- Make sure Email/Password authentication is enabled in the Firebase Console
- Verify the Identity Toolkit API is enabled

### "Permission denied" error
- Check service account permissions in IAM & Admin
- Make sure the service account has the required roles

### "Network request failed" error in app
- Make sure GoogleService-Info.plist is in the iOS project
- Verify the app is properly connected to Firebase

### Account creation succeeds but can't sign in
- Check Firestore rules are deployed
- Verify the user document is being created in Firestore

## Quick Setup Script

Run this script to deploy everything after enabling authentication:

```bash
./scripts/setup-firebase.sh
```

## Project Information

- **Project ID**: eldercare-app-17d19
- **Project Number**: 337154350320
- **Bundle ID**: com.silverguard.eldercare

## Support

If you continue to experience issues:

1. Check the iOS logs in Xcode for detailed error messages
2. Check Cloud Functions logs: `firebase functions:log --project eldercare-app-17d19`
3. Check Firestore usage in the Firebase Console
