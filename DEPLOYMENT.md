# SilverGuard ElderCare - Deployment Guide

Complete step-by-step deployment instructions for the production-ready ElderCare app.

## 🎯 Prerequisites

- macOS Tahoe 25.2.0 (or compatible)
- Xcode 26.2 (installed)
- Node.js 18+ with npm
- Firebase CLI: `npm install -g firebase-tools`
- Physical iOS device (iPhone) with Developer Mode enabled
- Apple Developer account (for code signing)
- Firebase project created at https://console.firebase.google.com
- Anthropic API key from https://console.anthropic.com

## 📋 Pre-Deployment Checklist

✅ All items completed during development:
- [x] Firebase project created (silverguard-eldercare)
- [x] GoogleService-Info.plist downloaded and placed in project root
- [x] google-services.json downloaded and placed in project root
- [x] Xcode code signing configured
- [x] Developer Mode enabled on iPhone
- [x] Anthropic API key obtained
- [x] Git repository initialized

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

#### App Dependencies
```bash
cd /Users/spencerallenteague/ProjectX/eldercare
npm install
```

#### Cloud Functions Dependencies
```bash
cd functions
npm install
cd ..
```

### Step 2: Configure Firebase

#### Login to Firebase
```bash
firebase login
```

#### Verify Project Configuration
Check `.firebaserc`:
```json
{
  "projects": {
    "default": "silverguard-eldercare"
  }
}
```

Update the project ID if needed:
```bash
firebase use silverguard-eldercare
```

#### Set Anthropic API Key (Server-Side)
```bash
firebase functions:config:set anthropic.key="YOUR_ANTHROPIC_API_KEY_HERE"
```

**IMPORTANT**: After deployment, the API key in `functions/.env` will only work locally. In production, Firebase uses `firebase functions:config` for secrets.

### Step 3: Build Cloud Functions

```bash
cd functions
npm run build
cd ..
```

This compiles TypeScript to JavaScript in `functions/lib/`.

### Step 4: Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore
```

This deploys:
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes

### Step 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This deploys:
- `buddyChat` - AI Buddy with guardrails and risk detection
- `generateDailyReport` - Daily wellbeing reports (scheduled)
- `sendRiskNotification` - Caregiver alert system

**Expected output:**
```
✔  functions[buddyChat(us-central1)]: Successful create operation.
✔  functions[generateDailyReport(us-central1)]: Successful create operation.
✔  functions[sendRiskNotification(us-central1)]: Successful create operation.
```

### Step 6: Enable Firebase Services

In Firebase Console (https://console.firebase.google.com):

1. **Authentication**
   - Enable Email/Password authentication
   - (Optional) Enable Google/Apple Sign-In

2. **Cloud Messaging**
   - Ensure FCM is enabled for push notifications
   - Download updated config files if needed

3. **Cloud Scheduler** (for daily reports)
   - Go to Cloud Scheduler in Google Cloud Console
   - The `generateDailyReport` function creates a schedule automatically
   - Verify it's set to run at 8 PM daily

### Step 7: Build iOS App

#### Clean and Rebuild Native Modules
```bash
npx expo prebuild --clean --platform ios
```

#### Install CocoaPods Dependencies
```bash
cd ios
pod install
cd ..
```

#### Open in Xcode
```bash
open ios/ElderCare.xcworkspace
```

#### Configure in Xcode:
1. Select ElderCare target
2. Signing & Capabilities:
   - Enable "Automatically manage signing"
   - Select your Team
   - Bundle Identifier: `com.silverguard.eldercare`
3. Build Settings:
   - Verify iOS Deployment Target: 13.4+

### Step 8: Build to Physical Device

#### Option A: Using Xcode
1. Connect iPhone via USB
2. Select your device in Xcode
3. Click Run (Cmd+R)

#### Option B: Using Command Line
```bash
xcodebuild \
  -workspace ios/ElderCare.xcworkspace \
  -scheme ElderCare \
  -configuration Debug \
  -destination "platform=iOS,id=00008150-000164DC3641401C" \
  -allowProvisioningUpdates \
  build
```

Replace device ID with your iPhone's ID (find via `xcrun xctrace list devices`).

### Step 9: Test Core Features

#### Test Checklist:

**Authentication**
- [ ] Sign up new user
- [ ] Login existing user
- [ ] Role selection (Senior/Caregiver)

**AI Buddy (Server-Side)**
- [ ] Send message to Buddy
- [ ] Verify response from Cloud Function
- [ ] Test guardrails (try blocked topic if configured)
- [ ] Test risk detection (mention pain/confusion)
- [ ] Verify caregiver notification sent

**Medications**
- [ ] Add medication (caregiver)
- [ ] View medications (senior)
- [ ] Mark medication as taken
- [ ] Verify adherence tracking

**Voice Features**
- [ ] Text-to-speech reads messages aloud
- [ ] Buddy responses are spoken

**Firestore Security**
- [ ] Senior can only see own data
- [ ] Caregiver can see linked senior data
- [ ] Unauthorized access blocked

### Step 10: Monitor Logs

#### Cloud Functions Logs
```bash
firebase functions:log
```

Or view in Firebase Console → Functions → Logs

#### App Logs (iOS)
View in Xcode Console or:
```bash
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "ElderCare"'
```

---

## 🔐 Security Verification

### ✅ Critical Security Checklist

- [x] **No API keys in client code** - Anthropic API key is in `functions/.env` and `firebase functions:config`
- [x] **Firestore rules deployed** - Role-based access control active
- [x] **Server-side LLM calls** - All AI processing happens in Cloud Functions
- [x] **Guardrails implemented** - Caregiver-programmable blocked topics
- [x] **Risk detection active** - Automatic flagging and notifications
- [x] **Encrypted communication** - Firebase uses TLS for all connections

### Verify Security Rules
```bash
firebase firestore:rules:list
```

Test rules in Firebase Console → Firestore → Rules → Playground

---

## 📊 Production Monitoring

### Set Up Cloud Monitoring

1. **Error Tracking**
   - Consider adding Sentry: https://sentry.io
   - Add to `app.json` and install `sentry-expo`

2. **Analytics**
   - Enable Firebase Analytics in console
   - Track key events: meds_taken, sos_triggered, buddy_chat

3. **Performance**
   - Enable Firebase Performance Monitoring
   - Monitor Cloud Functions execution time
   - Set up alerts for slow functions

### Key Metrics to Monitor

- **Daily Reports**: Generated daily at 8 PM
- **Risk Flags**: Count and severity distribution
- **Medication Adherence**: Percentage across all seniors
- **Cloud Functions**: Invocations, errors, duration
- **Firestore**: Read/write counts, costs

---

## 🐛 Troubleshooting

### Cloud Functions Not Deploying
```bash
# Check Node version
node --version  # Should be 18+

# Rebuild functions
cd functions
npm run build
cd ..

# Check for TypeScript errors
cd functions
npx tsc --noEmit
cd ..
```

### App Can't Call Cloud Functions
```bash
# Verify Firebase config
cat GoogleService-Info.plist | grep PROJECT_ID

# Check functions region (default: us-central1)
# Update in firebase.json if needed
```

### Firestore Permission Denied
```bash
# Redeploy rules
firebase deploy --only firestore:rules

# Test in Firebase Console Rules Playground
```

### CocoaPods Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Build Errors (gRPC)
The Podfile already includes fixes for Xcode 26 gRPC issues. If you encounter build errors:
```bash
cd ios
pod update gRPC-Core gRPC-C++
cd ..
```

---

## 📱 App Store Submission (Future)

### Requirements Before Submission

1. **EAS Build** (Expo Application Services)
```bash
npm install -g eas-cli
eas build:configure
eas build --platform ios
```

2. **App Store Connect**
   - Create app listing
   - Upload build via EAS Submit
   - Complete App Privacy questionnaire

3. **Required Documentation**
   - Privacy Policy (link in App Store)
   - Terms of Service
   - Support URL

4. **Subscription Setup**
   - Integrate RevenueCat or StoreKit
   - Configure pricing: $14.99/mo (with AI) or $9.99 one-time

5. **App Store Assets**
   - App Icon (1024x1024)
   - Screenshots (all device sizes)
   - App Preview video (optional)

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd functions && npm install && npm run build
      - uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions,firestore
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## 📞 Support

- Firebase Console: https://console.firebase.google.com
- Firebase Support: https://firebase.google.com/support
- Anthropic Support: https://support.anthropic.com
- GitHub Issues: https://github.com/spencerandtheteagues/Silverguard-Eldercare/issues

---

**Last Updated**: 2026-01-02
**App Version**: 1.0.0
**Firebase Project**: silverguard-eldercare
