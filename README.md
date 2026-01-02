# ElderCare App

Compassionate dual-mode eldercare app with AI companion, built with Expo and Firebase.

## 🎯 Features

### Senior Mode (Voice-First, Simplified UX)
- **6 Giant Tiles**: Talk to Buddy, Take My Meds, Today, Messages, Call Someone, SOS
- **AI Buddy**: Claude-powered voice companion with cognitive-level tuning
- **Medication Management**: Simple "I took it" buttons with reminders
- **Voice Messages**: TTS read-aloud for caregiver messages
- **Emergency SOS**: Hold-to-activate emergency alert
- **One-Tap Calling**: Call contacts with caregiver-written scripts

### Caregiver Mode (Full Dashboard)
- **Dashboard**: Real-time alerts, medication stats, quick actions
- **Medications**: Schedule, track, and view history
- **Appointments**: Calendar management with reminders
- **Health Tracking**: Log blood pressure, weight, glucose, etc.
- **Messaging**: Send messages with voice read-aloud option
- **Cognitive Settings**: Adjust AI tone and support level (0-3)

## 🛠 Tech Stack

- **Framework**: Expo 50 + React Native 0.73
- **Database**: Firebase Firestore (real-time)
- **Authentication**: Firebase Auth
- **Push Notifications**: Firebase Cloud Messaging
- **AI**: Claude 3.5 Sonnet (Anthropic API)
- **TTS**: expo-speech (on-device, privacy-first)
- **Navigation**: React Navigation (stack + bottom tabs)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio
- Firebase project
- Anthropic API key

### Setup

1. **Clone and install dependencies**
```bash
cd eldercare
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. **Add Firebase configuration files**
- iOS: Place `GoogleService-Info.plist` in project root
- Android: Place `google-services.json` in project root

4. **Install development build** (required for Firebase native modules)
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

**Note**: Standard `expo start` won't work due to native modules. Use `npx expo run:ios` or `npx expo run:android`.

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

## 🤖 AI Buddy Configuration

The AI Buddy uses Claude 3.5 Sonnet with cognitive-level system prompts:

### Cognitive Levels
- **Level 0** (Independent): Natural adult conversation, minimal assistance
- **Level 1** (Minimal Support): Clear language, gentle reminders
- **Level 2** (Moderate Support): Simple sentences, step-by-step guidance
- **Level 3** (High Support): Very simple language, extra patience, positive reinforcement

### Tone Options
- **Formal**: Polite, respectful, professional
- **Friendly**: Warm, conversational, like a good friend
- **No-nonsense**: Direct, efficient, straight to the point
- **Funny**: Gentle humor, lighthearted, cheerful
- **Custom**: User-defined tone with custom notes

### Tool Calling
Buddy has access to these tools:
- `get_medications`: Check today's medication schedule
- `get_schedule`: View today's appointments
- `trigger_sos`: Send emergency alert (only when explicitly requested)

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

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

- `ANTHROPIC_API_KEY`: Claude API key from console.anthropic.com
- `FIREBASE_*`: Firebase project configuration

## 📂 Project Structure

```
eldercare/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── common/        # Input, Button, LoadingSpinner, etc.
│   ├── design/            # Design tokens (colors, typography, spacing)
│   ├── navigation/        # Navigation structure (role-based routing)
│   ├── screens/           # All app screens
│   │   ├── auth/          # Login, Signup
│   │   ├── senior/        # 7 senior mode screens
│   │   └── caregiver/     # 13 caregiver mode screens
│   ├── services/          # Core services
│   │   ├── auth.ts        # Firebase auth
│   │   ├── firebase.ts    # Firestore references
│   │   ├── tts.ts         # Text-to-speech
│   │   ├── push.ts        # FCM notifications
│   │   ├── messaging.ts   # Thread and message management
│   │   └── buddy.ts       # AI Buddy with Claude API
│   ├── state/             # State management hooks
│   │   ├── useCurrentUser.ts
│   │   └── useSeniorProfile.ts
│   ├── types/             # TypeScript types (spec-aligned)
│   └── utils/             # Utilities (date, validation)
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── eas.json               # EAS Build configuration
└── tsconfig.json          # TypeScript configuration
```

## 🚀 Deployment Checklist

- [ ] Set up Firebase project
- [ ] Add Firebase config files (GoogleService-Info.plist, google-services.json)
- [ ] Get Anthropic API key
- [ ] Configure environment variables
- [ ] Set up Firestore collections and security rules
- [ ] Enable FCM for push notifications
- [ ] Test on physical device (required for FCM)
- [ ] Build with EAS (`eas build`)
- [ ] Submit to TestFlight / Play Internal Testing
- [ ] Get beta testers
- [ ] Submit to App Store / Play Store

## 📄 License

Proprietary - ElderCare App

## 🤝 Support

For questions or issues, contact: support@eldercare.com
