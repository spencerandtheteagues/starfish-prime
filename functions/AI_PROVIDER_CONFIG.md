# AI Provider Configuration Guide

## Overview

The ElderCare AI Buddy now supports **multiple AI providers**:
- **Gemini 2.0 Flash** (default) - Google's voice-optimized model
- **ChatGPT** (GPT-4 Turbo) - OpenAI's flagship model
- **Claude 3.5 Sonnet** - Anthropic's advanced conversational model

## Quick Start

### 1. Configure API Keys

Set your API keys in Firebase Functions configuration:

```bash
# Navigate to functions directory
cd functions

# Set API keys (choose the providers you want to use)
firebase functions:config:set google.ai_key="YOUR_GOOGLE_AI_API_KEY"
firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"
firebase functions:config:set anthropic.key="YOUR_ANTHROPIC_API_KEY"

# Deploy the updated configuration
firebase deploy --only functions
```

### 2. Set Provider Per Senior

You can configure which AI provider each senior uses by updating their Firestore document:

```javascript
// In Firestore: seniors/{seniorId}
{
  aiConfig: {
    provider: 'gemini',  // Options: 'gemini', 'openai', 'anthropic'
    model: 'gemini-2.0-flash-exp'  // Optional: override default model
  }
}
```

**Default Models:**
- `gemini` → `gemini-2.0-flash-exp` (recommended for voice)
- `openai` → `gpt-4-turbo-preview`
- `anthropic` → `claude-3-5-sonnet-20241022`

### 3. Testing Different Providers

To test different providers, you can:

**Option A: Update via Firestore Console**
1. Go to Firebase Console → Firestore Database
2. Navigate to `seniors/{seniorId}`
3. Add/edit the `aiConfig` field:
   ```json
   {
     "provider": "openai",
     "model": "gpt-4-turbo-preview"
   }
   ```

**Option B: Update via Caregiver Settings (Future Enhancement)**
A UI screen can be added to allow caregivers to select the AI provider preference.

## Provider Comparison

| Feature | Gemini 2.0 Flash | ChatGPT (GPT-4) | Claude 3.5 Sonnet |
|---------|------------------|-----------------|-------------------|
| **Voice Optimized** | ✅ Native voice-to-voice | ⚠️ Via TTS | ⚠️ Via TTS |
| **Latency** | Fast (~1-2s) | Medium (~2-3s) | Medium (~2-3s) |
| **Cost per 1M tokens** | Low | Medium | Medium |
| **Context Window** | 1M tokens | 128K tokens | 200K tokens |
| **JSON Mode** | Native | Native | Requires parsing |
| **Best For** | Real-time voice, seniors | Complex reasoning | Nuanced conversations |

## Budget Tracking

All providers share the same budget limits:
- **20,000 tokens per day** per senior (BUDDY+ mode)
- Budget automatically resets at midnight (senior's timezone)
- When budget exceeded, graceful fallback message is returned

Budget usage is tracked in Firestore:
```
seniors/{seniorId}/budgets/{YYYY-MM-DD}
  - tokensUsed: number
  - limit: number
  - date: string
```

## Environment Variables (Development)

For local development, you can use environment variables instead of Firebase config:

```bash
# Create functions/.env
GOOGLE_AI_KEY=your_google_ai_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

## Troubleshooting

### API Key Not Found
**Error:** `API key not configured for provider X`

**Solution:** Ensure you've set the Firebase Functions config:
```bash
firebase functions:config:get
```

You should see:
```json
{
  "google": { "ai_key": "..." },
  "openai": { "key": "..." },
  "anthropic": { "key": "..." }
}
```

### Budget Exceeded
**Error:** "I've reached my daily conversation limit"

**Solution:** Budget resets at midnight. To manually reset:
1. Go to Firestore: `seniors/{seniorId}/budgets/{today}`
2. Set `tokensUsed: 0` or delete the document

### JSON Parsing Errors
**Error:** "Failed to parse model response as JSON"

**Solution:** The model router includes automatic fallback. If this persists:
1. Check the model supports JSON mode
2. Verify the system prompt includes JSON instructions
3. Review Firebase Functions logs for the raw response

## Cost Estimates

Based on average senior conversation (5 turns/day, ~500 tokens per turn):

| Provider | Daily Cost | Monthly Cost |
|----------|------------|--------------|
| Gemini 2.0 Flash | $0.001 | $0.03 |
| GPT-4 Turbo | $0.025 | $0.75 |
| Claude 3.5 Sonnet | $0.015 | $0.45 |

**Note:** These are estimates. Actual costs depend on conversation length and frequency.

## Recommended Configuration

For **production** with **voice-to-voice**:
```javascript
{
  aiConfig: {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp'
  }
}
```

For **testing different responses**:
- Try `openai` for more creative, verbose responses
- Try `anthropic` for more nuanced, empathetic responses
- Compare conversation quality and choose your favorite

## Next Steps

1. ✅ Set up API keys in Firebase Functions config
2. ✅ Deploy functions: `firebase deploy --only functions`
3. ✅ Test with default provider (Gemini)
4. ✅ Experiment with other providers via Firestore updates
5. 🔲 (Optional) Add UI screen for caregiver to select provider
6. 🔲 Monitor costs and usage in Firebase Console

## Support

If you encounter issues:
1. Check Firebase Functions logs: `firebase functions:log`
2. Verify API keys are valid and have sufficient credits
3. Ensure the selected model is available in your region
4. Review the budget tracking in Firestore

For voice-to-voice features, Gemini 2.0 Flash is currently the best option due to native voice support.
