# SilverGuard App Store Submission Checklist

## Pre-Submission Requirements

### 1. Apple Developer Account Setup
- [ ] Apple Developer Program membership active ($99/year)
- [ ] App Store Connect account configured
- [ ] Certificates and provisioning profiles created
- [ ] App ID registered with bundle identifier: `com.silverguard.eldercare`

### 2. App Information in App Store Connect
- [ ] App name: "SilverGuard - AI Elder Care"
- [ ] Subtitle configured (max 30 characters)
- [ ] Primary category: Health & Fitness
- [ ] Secondary category: Medical
- [ ] Content rating questionnaire completed
- [ ] Age rating: 4+

### 3. Required Assets

#### App Icon
- [ ] 1024x1024 PNG icon uploaded
- [ ] No transparency, no rounded corners
- [ ] All sizes generated for Xcode asset catalog

#### Screenshots
- [ ] 6.9" iPhone screenshots (1320 x 2868) - at least 3
- [ ] 6.7" iPhone screenshots (1290 x 2796) - at least 3
- [ ] 6.5" iPhone screenshots (1284 x 2778) - at least 3
- [ ] 5.5" iPhone screenshots (1242 x 2208) - at least 3
- [ ] 12.9" iPad screenshots (2048 x 2732) - at least 3
- [ ] 11" iPad screenshots (1668 x 2388) - at least 3

#### App Preview Video (Optional but Recommended)
- [ ] 15-30 second video showcasing key features
- [ ] H.264 format, .mov or .mp4
- [ ] Portrait orientation for iPhones

### 4. App Store Description
- [ ] Full description (up to 4000 characters)
- [ ] Keywords (up to 100 characters, comma-separated)
- [ ] Promotional text (up to 170 characters)
- [ ] What's New text for this version
- [ ] Support URL
- [ ] Marketing URL
- [ ] Privacy Policy URL (required)

### 5. In-App Purchases Configuration

#### Products to Create in App Store Connect
- [ ] `com.silverguard.eldercare.unlock` - Non-consumable, $4.99
  - Display name: "SilverGuard Unlock"
  - Description: "One-time purchase to unlock basic app features"

- [ ] `com.silverguard.eldercare.premium.monthly` - Auto-renewable subscription, $19.99/month
  - Subscription group: "SilverGuard Premium"
  - Display name: "Premium Monthly"
  - Description: "Full access to Sunny AI and all premium features"
  - Free trial: 3 days

- [ ] `com.silverguard.eldercare.premium.yearly` - Auto-renewable subscription, $149.99/year
  - Subscription group: "SilverGuard Premium"
  - Display name: "Premium Yearly"
  - Description: "Annual subscription - save 2 months"
  - Free trial: 3 days

#### Subscription Localization
- [ ] All subscription descriptions localized
- [ ] Pricing set for all territories

### 6. Legal & Privacy

- [ ] Privacy Policy URL live and accessible
- [ ] Terms of Service URL live and accessible
- [ ] App Privacy labels completed in App Store Connect
  - Data types collected
  - Data linked to user
  - Data used to track
- [ ] GDPR compliance for EU users
- [ ] CCPA disclosure for California users

### 7. App Review Information

- [ ] Demo account credentials provided
- [ ] Contact information for App Review team
- [ ] Notes explaining app functionality
- [ ] Any special instructions for testing

### 8. Technical Requirements

#### Build Configuration
- [ ] Release build (not debug)
- [ ] App thinning enabled
- [ ] Bitcode disabled (Expo requirement)
- [ ] Minimum iOS version: 15.0
- [ ] Architectures: arm64 only

#### Info.plist Keys
- [ ] NSMicrophoneUsageDescription - Voice conversations
- [ ] NSLocationWhenInUseUsageDescription - Weather/geofencing
- [ ] NSSpeechRecognitionUsageDescription - Voice input
- [ ] NSUserNotificationsUsageDescription - Reminders/alerts

#### Capabilities
- [ ] Push Notifications enabled
- [ ] In-App Purchase enabled
- [ ] Background Modes: Audio (for voice)
- [ ] Sign in with Apple (if used)

### 9. Testing Completed

- [ ] All user flows tested on physical devices
- [ ] Voice conversations with Sunny work correctly
- [ ] In-app purchases tested in sandbox environment
- [ ] Subscription flow tested (start trial, purchase, restore)
- [ ] Push notifications received
- [ ] Emergency SOS flow works
- [ ] Accessibility testing with VoiceOver
- [ ] Dark mode appearance verified
- [ ] No crashes in release build

### 10. Backend Ready for Production

- [ ] Firebase project in production mode
- [ ] Cloud Functions deployed and tested
- [ ] Apple App Store Server Notifications webhook configured
- [ ] Apple shared secret set in Firebase config
- [ ] Environment variables configured for production
- [ ] Database indexes created
- [ ] Firestore security rules deployed

## Build and Submit

### Generate Release Build
```bash
# Install dependencies
npm install

# Generate iOS build
npx expo prebuild --platform ios

# Open in Xcode
open ios/ElderCare.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device (arm64)"
# 2. Product > Archive
# 3. Distribute App > App Store Connect
```

### Submit for Review
1. Log in to App Store Connect
2. Select your app
3. Create new version (1.0.0)
4. Upload build from Xcode
5. Fill in all metadata
6. Add screenshots and preview
7. Configure pricing and availability
8. Submit for Review

## Common Rejection Reasons to Avoid

1. **Guideline 2.1 - App Completeness**
   - All features must work
   - No placeholder content
   - Demo accounts must work

2. **Guideline 2.3 - Accurate Metadata**
   - Screenshots must match app
   - Description must be accurate

3. **Guideline 3.1.1 - In-App Purchase**
   - IAP for premium features only
   - Cannot link to external payment

4. **Guideline 4.2 - Minimum Functionality**
   - App must provide value
   - Not a simple webview wrapper

5. **Guideline 5.1.1 - Data Collection**
   - Privacy policy required
   - Must disclose all data collected

## Post-Submission

- [ ] Monitor App Store Connect for review status
- [ ] Respond promptly to any rejection notes
- [ ] Prepare marketing materials for launch
- [ ] Set up app analytics monitoring
- [ ] Configure crash reporting alerts
- [ ] Plan for version 1.0.1 with any needed fixes

---

**Estimated Review Time**: 24-48 hours (may vary)

**Contact Apple App Review**: If rejected, use Resolution Center in App Store Connect
