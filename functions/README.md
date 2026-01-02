# SilverGuard ElderCare - Cloud Functions

Server-side Firebase Cloud Functions for AI Buddy, risk detection, and reporting.

## 📁 Structure

```
functions/
├── src/
│   ├── index.ts                 # Main exports
│   └── buddy/
│       ├── buddyChat.ts         # AI Buddy Cloud Function (main)
│       ├── guardrails.ts        # Caregiver-programmable topic filtering
│       ├── riskDetection.ts     # Detect self-harm, depression, pain, etc.
│       ├── notifications.ts     # Push notifications to caregivers
│       └── dailyReport.ts       # Scheduled daily wellbeing reports
├── package.json
├── tsconfig.json
├── .env                         # Anthropic API key (local dev)
└── .env.example                 # Template
```

## 🚀 Functions

### 1. `buddyChat` (HTTPS Callable)

**Purpose**: Server-side AI Buddy with guardrails and risk detection

**Request**:
```typescript
{
  seniorId: string;
  caregiverId: string;
  message: string;
  seniorProfile: {
    name: string;
    cognitive: { level: 0-3, tone: string };
  };
  conversationHistory?: Array<{role, content}>;
}
```

**Response**:
```typescript
{
  reply: string;               // Buddy's response
  flags: RiskFlag[];          // Detected risks
  actions: BuddyAction[];     // Suggested actions
}
```

**Features**:
- ✅ Cognitive-level adaptation (0-3)
- ✅ Tone customization (friendly, formal, funny, etc.)
- ✅ Caregiver guardrails (blocked topics)
- ✅ Risk detection (self-harm, depression, pain, confusion)
- ✅ Automatic caregiver notifications
- ✅ Conversation history saved to Firestore
- ✅ Tool calls: medications, schedule, SOS

**Security**:
- API key never exposed to client
- Firestore security rules enforced
- Rate limiting via Firebase (automatic)

### 2. `generateDailyReport` (Scheduled - 8 PM Daily)

**Purpose**: Generate daily wellbeing reports for all seniors

**Schedule**: `0 20 * * *` (8 PM daily, America/New_York)

**Report Includes**:
- Medication adherence (taken/missed/total)
- Risk flags detected (count by type)
- Appointments today
- Buddy chat activity

**Output**: Stored in `/seniors/{id}/dailyReports/{YYYY-MM-DD}`

**Notifications**: Low-priority push notification to linked caregivers

### 3. `sendRiskNotification` (HTTPS Callable)

**Purpose**: Send push notifications to caregivers for risk flags

**Request**:
```typescript
{
  seniorId: string;
  caregiverId: string;
  seniorName: string;
  flags: RiskFlag[];
  excerpt: string;
}
```

**Notification Priority**:
- High severity risk → High priority (critical alert)
- Med/Low severity → Normal priority

**Channels**:
- iOS: APNs
- Android: FCM
- Sound: Critical for self-harm, default for others

## 🛠️ Development

### Setup

```bash
cd functions
npm install
```

### Environment Variables

Create `functions/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### Build

```bash
npm run build
```

Compiles TypeScript to `lib/` directory.

### Local Testing (Emulators)

```bash
npm run serve
```

Starts Firebase Emulators:
- Functions: http://localhost:5001
- Firestore: http://localhost:8080
- Emulator UI: http://localhost:4000

### Deploy

```bash
# From project root
firebase deploy --only functions

# Or specific function
firebase deploy --only functions:buddyChat
```

### Logs

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only buddyChat
```

## 🔐 Security

### API Key Management

**Local Development**:
- API key in `functions/.env`
- Loaded via `process.env.ANTHROPIC_API_KEY`

**Production**:
- API key set via Firebase config:
```bash
firebase functions:config:set anthropic.key="YOUR_KEY"
```
- Accessed via `functions.config().anthropic.key`

**Never**:
- ❌ Commit `.env` to git (already in `.gitignore`)
- ❌ Put API key in client code
- ❌ Hardcode secrets in source

### Firestore Security

All writes to risk flags, daily reports, and notifications are restricted to Cloud Functions only via Firestore security rules:

```javascript
match /seniors/{seniorId}/flags/{flagId} {
  allow create: if false; // Only server can create
}
```

## 📊 Monitoring

### Key Metrics

- **buddyChat**:
  - Invocations per day
  - Average execution time
  - Error rate
  - Risk flags generated

- **generateDailyReport**:
  - Daily execution success
  - Number of reports generated
  - Execution time

- **sendRiskNotification**:
  - Notifications sent
  - Delivery success rate

### Alerts

Set up Firebase Alerts for:
- Function errors > 5% rate
- Function timeout (> 9 seconds)
- Daily report not executed
- High risk flag volume (> 10/day per senior)

## 🧪 Testing

### Unit Tests (TODO)

```bash
npm test
```

### Integration Tests (TODO)

Use Firebase Emulators:
```bash
npm run serve
# In another terminal
npm run test:integration
```

### Manual Testing

Use Firebase Console Functions → Test:
1. Select function
2. Enter test data
3. Run and view logs

## 🔄 CI/CD

### GitHub Actions

See `.github/workflows/deploy.yml` for automatic deployment on push to main.

### Version Control

- Tag releases: `git tag v1.0.0`
- Each deployment logs git commit SHA
- Rollback via Firebase Console

## 📈 Performance

### Optimization Tips

1. **Cold Start**: Keep functions warm with scheduled pings
2. **Memory**: Default 256MB, increase if needed in `functions/src/index.ts`
3. **Timeout**: Default 60s, increase for long operations
4. **Region**: Use `us-central1` for lowest latency to Anthropic API

### Cost Optimization

- Use Firestore offline cache in client
- Batch daily reports instead of individual calls
- Monitor Anthropic API usage (tokens per request)

## 🐛 Debugging

### Common Issues

**Function not deploying**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Rebuild
npm run build
```

**Anthropic API errors**:
```bash
# Verify config
firebase functions:config:get

# Check quota
# Visit https://console.anthropic.com
```

**Firestore permission denied**:
- Check Firestore rules
- Verify service account permissions
- Ensure Firebase Admin SDK initialized

### Debug Logs

Add to function:
```typescript
console.log('Debug:', { data });
```

View in Firebase Console → Functions → Logs

## 📚 Resources

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Anthropic API Docs](https://docs.anthropic.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Version**: 1.0.0
**Node Runtime**: 18
**Last Updated**: 2026-01-02
