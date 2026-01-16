# DEVIN: BUILD INSTRUCTIONS FOR SILVERGUARD ELDERCARE

## YOUR MISSION

Build a **production-ready, fully tested, App Store ready** iOS application.

**Read PRODUCTION_BUILD_SCRIPT.md for complete specifications.**

## QUICK START

```bash
# 1. Clone and install
git clone https://github.com/spencerandtheteagues/Silverguard-Eldercare.git
cd Silverguard-Eldercare
npm install

# 2. Install Cloud Functions dependencies
cd functions && npm install && cd ..

# 3. Build Cloud Functions
cd functions && npm run build && cd ..

# 4. Run TypeScript check
npx tsc --noEmit

# 5. Generate iOS project
npx expo prebuild --clean --platform ios

# 6. Install CocoaPods
cd ios && pod install && cd ..

# 7. Open in Xcode
open ios/ElderCare.xcworkspace
```

## CRITICAL: OPENAI API KEY

The OpenAI API key must be configured server-side:
```bash
firebase functions:config:set openai.key="THE_API_KEY"
```

**NEVER expose the API key in client code.**

## WHAT YOU MUST DELIVER

1. **Working IPA file** or TestFlight build
2. **Test report** with all 30 acceptance criteria PASSED
3. **Screenshot bundle** for App Store
4. **Video demo** (5-10 minutes) showing:
   - Sunny voice conversations working
   - All 7 Sunny functions executing
   - SOS emergency alert flow
   - Medication tracking
   - Caregiver dashboard

## ACCEPTANCE CRITERIA (ALL MUST PASS)

See PRODUCTION_BUILD_SCRIPT.md for the full 30-item checklist.

**Key items:**
- [ ] App launches without crash
- [ ] Sunny voice chat connects and responds
- [ ] All 7 Sunny functions execute without error
- [ ] SOS button triggers emergency alert
- [ ] Subscription flow completes
- [ ] VoiceOver accessibility works

## SUNNY AI CONFIGURATION

- **Model**: gpt-4o-realtime-preview-2024-12-17
- **Voice**: shimmer (warm, friendly female)
- **Custom Prompt ID**: pmpt_696464a11e8c8193b22df8bb67bd8f530cf75992db71453b (v7)

## 7 SUNNY FUNCTIONS

1. `get_weather` - Weather info
2. `general_information_lookup` - Phone numbers, facts
3. `get_news` - Filtered news
4. `log_and_report_daily_senior_status` - Daily wellness
5. `integrate_eldercare_features` - App data access
6. `build_and_log_senior_profile` - Learn preferences
7. `emergency_notify_protocol` - CRITICAL emergency alerts

## FAILURE CONDITIONS

If ANY of these occur, the build is REJECTED:
- App crashes on launch
- Sunny voice chat fails to connect
- Any Sunny function throws errors
- SOS alert fails to notify caregivers
- API keys exposed in client code

---

**START NOW. DELIVER PERFECTION.**
