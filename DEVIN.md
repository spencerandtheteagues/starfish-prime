# Silverguard-Eldercare Project Guide for Devin

## Project Overview
This is a React Native/Expo eldercare app with Firebase backend. It has two modes:
- **Senior App**: Large accessible UI for elderly users with AI companion (Sunny)
- **Caregiver App**: Dashboard for family members to manage senior's care

## Key Technologies
- React Native + Expo (managed workflow with native modules)
- Firebase (Auth, Firestore, Cloud Functions, FCM)
- OpenAI Realtime API for voice conversations with Sunny AI
- TypeScript throughout
- React Navigation 6.x

## Project Structure
```
/src/
  /screens/
    /auth/          - Login, Signup screens
    /senior/        - 7 senior-facing screens (Home, BuddyChat, Meds, Today, Messages, Contacts, SOS, Health)
    /caregiver/     - 13+ caregiver screens (Dashboard, Medications, Appointments, Health, Messages, Settings)
    /shared/        - Subscription screen
  /services/        - Firebase, messaging, health, payments, realtime voice services
  /navigation/      - RootNavigator, SeniorNavigator, CaregiverNavigator
  /components/      - Reusable UI components (SunnyOrb, AccessibleButton, etc.)
  /design/          - Colors, typography, spacing, accessibility utilities
  /types/           - TypeScript type definitions
  /state/           - React hooks for state management

/functions/
  /src/
    index.ts        - Main Cloud Functions entry (AI chat, subscriptions, Sunny functions)
    /sunny/         - 7 Sunny AI function implementations
    /payments/      - IAP verification
```

## Running the App

### Development
```bash
# Install dependencies (if not done)
npm install

# Start Expo dev server
npm start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### Building Cloud Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## Required Configuration

### Firebase
- `ios/GoogleService-Info.plist` - iOS Firebase config
- `android/app/google-services.json` - Android Firebase config

### Environment Variables (functions/.env)
```
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

### For Production
- Apple App Store Connect secrets for IAP
- Firebase project with Blaze plan for Cloud Functions

## Key Features

### Senior App
1. **SunnyOrb** - Beautiful animated 3D orb for AI companion (like ChatGPT voice mode)
2. **Voice Conversations** - Real-time voice with OpenAI Realtime API
3. **7 AI Functions** - Weather, news, health logging, emergency protocols, eldercare features, profile building, general lookup
4. **Large Touch Targets** - WCAG AAA compliant, 60-280pt touch targets
5. **High Contrast** - 7:1 minimum contrast ratios

### Caregiver App
1. **Dashboard** - Overview of senior's health, medications, alerts
2. **Medication Management** - Full CRUD with scheduling
3. **Appointment Management** - Calendar integration
4. **Health Tracking** - Charts for vitals (BP, weight, glucose, etc.)
5. **Real-time Messaging** - Threads with seniors
6. **Settings** - Cognitive settings, notification preferences, privacy controls

## Known Issues
- Some TypeScript strict mode errors exist (don't affect runtime)
- Permission issues with dist/ and functions/lib/ folders on some systems
- WebSocket headers may need adjustment for React Native in realtime.ts

## Testing
No automated tests are currently set up. Manual testing recommended:
1. Test auth flow (signup/login)
2. Test senior navigation and SOS button
3. Test caregiver medication CRUD
4. Test messaging between senior and caregiver
5. Test AI Buddy voice conversation (requires API keys)

## Deployment
1. Configure Firebase project
2. Deploy Cloud Functions: `firebase deploy --only functions`
3. Build with EAS: `eas build --platform all`
4. Submit to App Stores

## Contact
This project uses the Silverguard design system for eldercare applications.
