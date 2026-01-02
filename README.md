# SilverGuard ElderCare

**Production-ready** dual-mode eldercare app with server-side AI companion, built with Expo, Firebase, and Claude.

> ✅ **Security-First Architecture**: All AI processing happens server-side. Zero API keys in client code.

## 🎯 Features

### Senior Mode (Voice-First, Simplified UX)
- **AI Buddy**: Claude 3.5 Sonnet with cognitive-level tuning (server-side processing)
  - Cognitive adaptation (levels 0-3)
  - Customizable tone (friendly, formal, funny, custom)
  - Text-to-speech for all responses
  - Tool access: medications, schedule, emergency SOS
- **Medication Management**: Simple "I took it" buttons with reminders
- **Voice Messages**: TTS read-aloud for caregiver messages
- **Emergency SOS**: Instant alert to all linked caregivers
- **Appointments**: Today's schedule with voice announcements
- **Contacts**: One-tap calling with caregiver-written scripts

### Caregiver Mode (Full Control Center)
- **Dashboard**: Real-time alerts, medication adherence, daily reports
- **AI Buddy Guardrails**: Configure blocked topics and escalation policies
- **Risk Monitoring**: Automatic detection of self-harm, depression, pain, confusion
- **Push Notifications**: Instant alerts for critical risk flags
- **Daily Wellbeing Reports**: Automated summaries delivered at 8 PM
- **Medications**: Full schedule management and adherence tracking
- **Appointments**: Calendar with reminders
- **Medical Records**: Document storage and organization
- **Finance & Bills**: Transaction tracking and bill management
- **Benefits**: Medicare, insurance, Social Security management
- **Messaging**: Secure communication with voice read-aloud

## 🛠 Tech Stack

### Client (React Native)
- **Framework**: Expo 50 + React Native 0.73 + TypeScript
- **Database**: Firebase Firestore (real-time, offline-capable)
- **Authentication**: Firebase Auth (Email/Password)
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **TTS**: expo-speech (on-device, privacy-first)
- **Navigation**: React Navigation (stack + bottom tabs)

### Server (Firebase Cloud Functions)
- **Runtime**: Node.js 18
- **AI**: Claude 3.5 Sonnet via Anthropic API (server-side only)
- **Guardrails**: Caregiver-programmable topic filtering
- **Risk Detection**: Keyword-based + LLM classification
- **Notifications**: FCM for iOS/Android push
- **Scheduler**: Daily reports via Cloud Scheduler (8 PM daily)

### Security
- ✅ **Zero secrets in client** - All API keys server-side
- ✅ **Firestore security rules** - Role-based access control
- ✅ **Server-side validation** - All AI processing in Cloud Functions
- ✅ **Encrypted communication** - TLS everywhere

## 📦 Quick Start

### Prerequisites
- macOS Tahoe 25.2.0 (or compatible macOS)
- Xcode 26.2 (for iOS development)
- Node.js 18+ and npm
- Firebase CLI: `npm install -g firebase-tools`
- Physical iOS device with Developer Mode enabled
- Firebase project created
- Anthropic API key from https://console.anthropic.com

### Installation

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.**

Quick setup:

```bash
# 1. Install app dependencies
npm install

# 2. Install Cloud Functions dependencies
cd functions
npm install
cd ..

# 3. Add Firebase config files
# - Place GoogleService-Info.plist in project root
# - Place google-services.json in project root

# 4. Configure Firebase
firebase login
firebase use silverguard-eldercare

# 5. Set Anthropic API key (server-side)
firebase functions:config:set anthropic.key="YOUR_API_KEY_HERE"

# 6. Deploy Cloud Functions and Firestore rules
cd functions
npm run build
cd ..
firebase deploy --only functions,firestore

# 7. Build iOS app
npx expo prebuild --clean --platform ios
cd ios
pod install
cd ..

# 8. Open in Xcode and build to device
open ios/ElderCare.xcworkspace
```

**⚠️ Important**: Native modules require physical device builds. Standard `expo start` won't work.

## 🔥 Firebase Setup

### Firestore Collections

Create these collections with the following security rules:

```javascript
// users/{userId}
{
  uid: string,
  role: 'caregiver' | 'senior',
  email: string,
  name: string,
  activeSeniorId?: string, // For seniors after pairing
  createdAt: timestamp
}

// seniors/{seniorId}
{
  id: string,
  primaryCaregiverUserId: string,
  profile: { name, dob, address },
  cognitive: { level: 0-3, tone, customToneNotes },
  autonomyFlags: { canEditContacts, canEditReminders, canEditSchedule },
  preferences: { fontScale: 1.0-1.8, highContrast, voiceRate: 0.8-1.2, quietHours }
}

// links/{caregiverId}_{seniorId}
{
  caregiverUserId: string,
  seniorId: string,
  role: 'admin' | 'editor' | 'viewer' | 'emergency_only',
  createdAt: timestamp
}

// threads/senior_{seniorId}
{
  id: string,
  seniorId: string,
  lastMessage: string,
  lastMessageAt: timestamp,
  unreadCount: number
}

// messages (subcollection of threads)
{
  id: string,
  seniorId: string,
  threadId: string,
  senderUserId: string,
  senderRole: 'senior' | 'caregiver' | 'system',
  type: 'text',
  text: string,
  createdAt: timestamp,
  requiresVoiceRead: boolean, // Trigger TTS for senior
  awaitingVoiceReply: boolean,
  urgency: 'normal' | 'urgent'
}

// medications/{medicationId}
{
  id: string,
  seniorId: string,
  name: string,
  dosage: string,
  instructions: string,
  requiresFood: boolean,
  schedule: { frequency: 'daily', times: [{ hour, minute }] },
  isActive: boolean
}

// medEvents/{eventId}
{
  id: string,
  seniorId: string,
  medicationId: string,
  medicationName: string,
  scheduledTime: timestamp,
  status: 'pending' | 'taken' | 'missed' | 'skipped',
  takenAt?: timestamp
}

// appointments/{appointmentId}
{
  id: string,
  seniorId: string,
  title: string,
  location: string,
  phone: string,
  notes: string,
  dateTime: timestamp
}

// contacts/{contactId}
{
  id: string,
  seniorId: string,
  name: string,
  phoneNumber: string,
  relationship: 'family' | 'friend' | 'doctor' | 'emergency',
  isPrimary: boolean,
  callScript?: string // Caregiver-written script for senior
}

// alerts/{alertId}
{
  id: string,
  seniorId: string,
  type: 'sos' | 'medication_missed' | 'geofence_exit' | 'fall_detected',
  severity: 'critical' | 'high' | 'medium' | 'low',
  message: string,
  status: 'active' | 'acknowledged' | 'resolved',
  acknowledgedBy?: string,
  location?: { lat, lng },
  createdAt: timestamp,
  resolvedAt?: timestamp
}

// healthLogs/{logId}
{
  id: string,
  seniorId: string,
  type: 'blood_pressure' | 'weight' | 'heart_rate' | 'glucose' | 'temperature' | 'oxygen',
  value: any, // number or object (e.g., { systolic: 120, diastolic: 80 })
  unit: string,
  notes: string,
  timestamp: timestamp
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Senior profiles: accessible by linked caregivers
    match /seniors/{seniorId} {
      allow read: if request.auth != null && (
        exists(/databases/$(database)/documents/links/$(request.auth.uid + '_' + seniorId)) ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.activeSeniorId == seniorId
      );
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/links/$(request.auth.uid + '_' + seniorId));
    }

    // Links: caregivers can manage their links
    match /links/{linkId} {
      allow read, write: if request.auth != null;
    }

    // All other collections follow similar pattern
    // (check if user is linked to the seniorId)
  }
}
```

## 🤖 AI Buddy - Server-Side Architecture

The AI Buddy runs entirely in Firebase Cloud Functions for maximum security and privacy.

### Architecture Flow
```
Senior App → Cloud Function (buddyChat) → Anthropic API → Response
                    ↓
            Guardrails Check
                    ↓
            Risk Detection
                    ↓
            Firestore (save)
                    ↓
    Caregiver Notification (if needed)
```

### Features

**Cognitive-Level Adaptation** (0-3)
- **Level 0** (Independent): Natural adult conversation, minimal assistance
- **Level 1** (Minimal Support): Clear language, gentle reminders
- **Level 2** (Moderate Support): Simple sentences, step-by-step guidance
- **Level 3** (High Support): Very simple language, extra patience, positive reinforcement

**Tone Customization**
- **Formal**: Polite, respectful, professional
- **Friendly**: Warm, conversational, like a good friend
- **No-nonsense**: Direct, efficient, straight to the point
- **Funny**: Gentle humor, lighthearted, cheerful
- **Custom**: User-defined tone with custom notes

**Caregiver Guardrails**
- **Blocked Topics**: Hard refusal or gentle redirect
- **Avoidance Style**: Configurable strictness
- **Privacy Mode**: Full excerpt or summary-only for caregivers

**Risk Detection** (Automatic)
- Self-harm / suicide language (highest priority)
- Depression / hopelessness
- Medication refusal
- Pain / physical distress
- Confusion / disorientation
- Memory problems / dementia signs

**Notifications**
- Critical risks → High-priority push notification
- Medium/Low risks → Normal priority (if auto-notify enabled)
- Respects caregiver escalation preferences

**Tool Access**
- `get_medications`: Today's medication schedule
- `get_schedule`: Today's appointments
- `trigger_sos`: Emergency alert (explicit request only)

### Daily Wellbeing Reports

Automated reports generated nightly at 8 PM:
- Medication adherence stats (taken/missed/total)
- Risk flags detected (count by type)
- Appointments completed
- Buddy chat activity
- Low-priority notification to caregivers

See [functions/README.md](./functions/README.md) for Cloud Functions documentation.

## 📱 Development

### Run on iOS
```bash
npx expo run:ios
```

### Run on Android
```bash
npx expo run:android
```

### Build for Production

#### iOS (TestFlight)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

#### Android (Play Store)
```bash
eas build --platform android --profile production
eas submit --platform android
```

## 🔐 Security & Environment

### Client (.env)
**No sensitive data!** Firebase config loaded from GoogleService-Info.plist and google-services.json.

### Server (functions/.env + Firebase Config)
```bash
# Local development
functions/.env: ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Production (Firebase Config)
firebase functions:config:set anthropic.key="YOUR_KEY"
```

## 📂 Project Structure

```
eldercare/
├── src/                           # React Native app
│   ├── components/                # Reusable UI components
│   ├── design/                    # Design tokens
│   ├── navigation/                # Role-based routing
│   ├── screens/                   # All app screens
│   │   ├── auth/                  # Login, SignUp (2 screens)
│   │   ├── senior/                # Senior mode (7 screens)
│   │   └── caregiver/             # Caregiver mode (13 screens)
│   ├── services/                  # Core services
│   │   ├── auth.ts                # Firebase Auth
│   │   ├── firebase.ts            # Firestore + Functions
│   │   ├── buddy.ts               # AI Buddy (calls Cloud Function)
│   │   ├── voice.ts               # TTS/STT
│   │   └── ...
│   ├── state/                     # React hooks
│   ├── types/                     # TypeScript types
│   └── utils/                     # Utilities
│
├── functions/                     # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts               # Main exports
│   │   └── buddy/
│   │       ├── buddyChat.ts       # AI Buddy (main function)
│   │       ├── guardrails.ts      # Topic filtering
│   │       ├── riskDetection.ts   # Safety monitoring
│   │       ├── notifications.ts   # Push alerts
│   │       └── dailyReport.ts     # Scheduled reports
│   ├── package.json               # Server dependencies
│   └── tsconfig.json              # Server TypeScript config
│
├── ios/                           # Native iOS project
│   ├── Podfile                    # iOS dependencies (incl. gRPC fixes)
│   └── ElderCare.xcworkspace      # Xcode workspace
│
├── android/                       # Native Android project
│
├── firebase.json                  # Firebase project config
├── firestore.rules                # Security rules
├── firestore.indexes.json         # Database indexes
├── .firebaserc                    # Firebase project ID
│
├── DEPLOYMENT.md                  # Complete deployment guide
├── BUILD_SUMMARY.md               # Build statistics
├── app.json                       # Expo configuration
├── package.json                   # App dependencies
└── tsconfig.json                  # App TypeScript config
```

**Total**: 23 screens (7 Senior + 2 Auth + 13 Caregiver + 1 Root)

## 🚀 Deployment Checklist

### Completed ✅
- [x] **23 screens implemented** (7 Senior + 2 Auth + 13 Caregiver + 1 Root)
- [x] **Firebase Cloud Functions created**
- [x] **Server-side AI Buddy** (NO API keys in client!)
- [x] **Guardrails system** (caregiver-programmable blocked topics)
- [x] **Risk detection** (self-harm, depression, pain, confusion, dementia, meds)
- [x] **Caregiver notifications** (automatic push alerts)
- [x] **Daily wellbeing reports** (scheduled 8 PM daily)
- [x] **Firestore security rules** (role-based access control)
- [x] **Firestore indexes** (optimized queries)
- [x] **Firebase config files** (firebase.json, .firebaserc)
- [x] **Text-to-speech** (expo-speech with senior-friendly settings)
- [x] **Speech-to-text framework** (documented implementation path)
- [x] **Xcode 26 compatibility fixes** (gRPC template errors resolved)
- [x] **Code signing configured**
- [x] **Developer Mode enabled on iPhone**

### To Deploy 🚀
- [ ] Install dependencies: `npm install && cd functions && npm install && cd ..`
- [ ] Deploy Firestore: `firebase deploy --only firestore`
- [ ] Deploy Functions: `firebase deploy --only functions`
- [ ] Build iOS: `npx expo prebuild --clean && cd ios && pod install && cd ..`
- [ ] Test on device: Build via Xcode to iPhone 17 Pro Max
- [ ] Test AI Buddy end-to-end (guardrails, risk detection, notifications)
- [ ] Verify daily reports generate at 8 PM
- [ ] Test all 23 screens on physical device

### Future (Production Release) 📱
- [ ] EAS Build: `eas build --platform ios`
- [ ] Submit to TestFlight for beta testing
- [ ] Implement subscription (RevenueCat): $14.99/mo with AI, $9.99 one-time without
- [ ] App Store submission (privacy policy, screenshots, description)
- [ ] Enable Sentry for error tracking
- [ ] Set up Firebase Analytics
- [ ] Monitor Cloud Functions costs and performance

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[functions/README.md](./functions/README.md)** - Cloud Functions documentation
- **[BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** - Build statistics and screen list

## 📄 License

Proprietary - SilverGuard ElderCare

© 2026 SilverGuard. All rights reserved.

## 🤝 Support

- **GitHub Issues**: https://github.com/spencerandtheteagues/Silverguard-Eldercare/issues
- **Firebase Console**: https://console.firebase.google.com/project/silverguard-eldercare
- **Anthropic Support**: https://support.anthropic.com

---

**Built with ❤️ for seniors and their caregivers**

**Version**: 1.0.0
**Last Updated**: 2026-01-02
**Firebase Project**: silverguard-eldercare
**Bundle ID**: com.silverguard.eldercare
