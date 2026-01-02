/**
 * AI Buddy Cloud Function - Server-side LLM calls with guardrails and risk detection
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import {
  Guardrails,
  checkBlockedTopics,
  getGuardrailsPrompt,
  checkResponseCompliance,
} from './guardrails';
import {
  RiskFlag,
  detectRisks,
  getRiskDetectionPrompt,
  shouldNotifyCaregiver,
} from './riskDetection';

// Initialize Anthropic client with API key from environment
const anthropic = new Anthropic({
  apiKey: functions.config().anthropic?.key || process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Buddy Chat Cloud Function
 * Handles all AI Buddy conversations with guardrails and risk detection
 */
export const buddyChat = functions.https.onCall(
  async (
    data: {
      seniorId: string;
      caregiverId: string;
      message: string;
      seniorProfile: {
        name: string;
        cognitive: {
          level: number;
          tone: string;
          customToneNotes?: string;
        };
      };
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
    context
  ) => {
    const { seniorId, caregiverId, message, seniorProfile, conversationHistory = [] } = data;

    try {
      // 1. Load guardrails from Firestore
      const seniorDoc = await admin
        .firestore()
        .collection('seniors')
        .doc(seniorId)
        .get();

      const seniorData = seniorDoc.data();
      const guardrails: Guardrails = seniorData?.caregiverGuardrails || {
        blockedTopics: [],
        avoidanceStyle: 'gentle_redirect',
        privacyMode: 'full_excerpt',
      };

      const escalationSettings = seniorData?.caregiverGuardrails?.escalation || {
        notifyCaregiverOn: ['self_harm', 'depression', 'missed_meds', 'pain', 'confusion', 'dementia_signs'],
        autoNotify: true,
      };

      // 2. Check if message contains blocked topics (pre-filter)
      const blockedCheck = checkBlockedTopics(message, guardrails.blockedTopics);
      if (blockedCheck.isBlocked) {
        const refusalMessage =
          guardrails.avoidanceStyle === 'strict_refusal'
            ? "I'm sorry, but I'm not able to discuss that topic. Is there something else I can help you with today?"
            : "I understand you're thinking about that, but I'm better suited to help with other things. How about we talk about your schedule, medications, or just chat about your day?";

        return {
          reply: refusalMessage,
          flags: [],
          actions: [],
        };
      }

      // 3. Detect risk signals in user message
      const risks = detectRisks(message);

      // 4. Build system prompt with cognitive tuning + guardrails + risk detection
      const systemPrompt = buildSystemPrompt(
        seniorProfile,
        guardrails,
        escalationSettings
      );

      // 5. Build messages array
      const messages: Anthropic.MessageParam[] = [
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: message,
        },
      ];

      // 6. Call Claude API with tools
      const tools = getBuddyTools();
      let response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        tools,
      });

      // 7. Handle tool calls
      const toolCalls: Array<{ name: string; input: any; result: string }> = [];

      while (response.stop_reason === 'tool_use') {
        const toolUseBlock = response.content.find(
          (block) => block.type === 'tool_use'
        ) as Anthropic.ToolUseBlock | undefined;

        if (!toolUseBlock) break;

        // Execute tool
        const toolResult = await executeToolCall(
          toolUseBlock.name,
          toolUseBlock.input,
          seniorId
        );

        toolCalls.push({
          name: toolUseBlock.name,
          input: toolUseBlock.input,
          result: toolResult,
        });

        // Continue conversation with tool result
        messages.push({
          role: 'assistant',
          content: response.content,
        });

        messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUseBlock.id,
              content: toolResult,
            },
          ],
        });

        // Get next response
        response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
          tools,
        });
      }

      // 8. Extract text response
      const textBlock = response.content.find(
        (block) => block.type === 'text'
      ) as Anthropic.TextBlock | undefined;

      const reply = textBlock?.text || "I apologize, I had trouble responding. Could you try again?";

      // 9. Post-check: ensure response doesn't violate guardrails
      const complianceCheck = checkResponseCompliance(reply, guardrails.blockedTopics);
      if (!complianceCheck.isCompliant) {
        console.warn('Response violated guardrails:', complianceCheck.violation);
        return {
          reply: "I'm sorry, I can't discuss that topic. How else can I help you?",
          flags: risks,
          actions: [],
        };
      }

      // 10. Save conversation to Firestore
      const batch = admin.firestore().batch();

      // Save user message
      const userMessageRef = admin
        .firestore()
        .collection('seniors')
        .doc(seniorId)
        .collection('buddyChats')
        .doc();

      batch.set(userMessageRef, {
        sender: 'senior',
        text: message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Save buddy response
      const buddyMessageRef = admin
        .firestore()
        .collection('seniors')
        .doc(seniorId)
        .collection('buddyChats')
        .doc();

      batch.set(buddyMessageRef, {
        sender: 'buddy',
        text: reply,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          flags: risks,
          toolCalls: toolCalls.length > 0 ? toolCalls : null,
        },
      });

      // 11. Save risk flags if detected
      if (risks.length > 0) {
        for (const risk of risks) {
          const flagRef = admin
            .firestore()
            .collection('seniors')
            .doc(seniorId)
            .collection('flags')
            .doc();

          batch.set(flagRef, {
            type: risk.type,
            severity: risk.severity,
            excerpt:
              guardrails.privacyMode === 'summary_only'
                ? `[Privacy mode: Summary only] ${risk.type} detected`
                : risk.excerpt,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            conversationRef: userMessageRef.id,
            acknowledged: false,
          });
        }
      }

      await batch.commit();

      // 12. Notify caregiver if needed
      if (risks.length > 0 && shouldNotifyCaregiver(risks, escalationSettings)) {
        // Call notification function asynchronously (don't wait)
        admin
          .functions()
          .httpsCallable('sendRiskNotification')({
            seniorId,
            caregiverId,
            seniorName: seniorProfile.name,
            flags: risks,
            excerpt:
              guardrails.privacyMode === 'summary_only'
                ? `Risk detected during conversation`
                : message.substring(0, 150),
          })
          .catch((error) => {
            console.error('Error sending notification:', error);
          });
      }

      // 13. Return response with flags and actions
      const actions = [];

      // Suggest actions based on tool calls
      if (toolCalls.some((t) => t.name === 'get_medications')) {
        actions.push({ type: 'OPEN_SCREEN', screen: 'Meds' });
      }
      if (toolCalls.some((t) => t.name === 'get_schedule')) {
        actions.push({ type: 'OPEN_SCREEN', screen: 'Appointments' });
      }

      return {
        reply,
        flags: risks,
        actions,
      };
    } catch (error) {
      console.error('Error in buddyChat:', error);
      throw new functions.https.HttpsError('internal', 'Failed to process chat message');
    }
  }
);

/**
 * Build cognitive-tuned system prompt with guardrails and risk detection
 */
function buildSystemPrompt(
  seniorProfile: {
    name: string;
    cognitive: {
      level: number;
      tone: string;
      customToneNotes?: string;
    };
  },
  guardrails: Guardrails,
  escalationSettings: any
): string {
  const { name, cognitive } = seniorProfile;
  const { level, tone, customToneNotes } = cognitive;

  // Base personality
  let basePersonality = `You are Buddy, a warm and caring AI companion for ${name}. You provide emotional support, practical help, and friendly conversation.`;

  // Cognitive level adjustments
  const cognitiveGuidelines: Record<number, string> = {
    0: `${name} is fully independent. Use natural, adult conversation. Don't over-explain. Be respectful and treat them as a peer.`,
    1: `${name} needs minimal support. Use clear language but keep conversation natural. Gently remind when needed but respect their autonomy.`,
    2: `${name} needs moderate support. Use simple, clear sentences. Break complex tasks into steps. Be patient and encouraging. Repeat important information if needed.`,
    3: `${name} needs high support. Use very simple language. Speak in short, clear sentences. Be extra patient and reassuring. Focus on one thing at a time. Use lots of positive reinforcement.`,
  };

  // Tone adjustments
  const toneGuidelines: Record<string, string> = {
    formal: 'Maintain a polite, respectful, professional demeanor. Use proper grammar and courteous language.',
    friendly: 'Be warm, conversational, and personable. Use a friendly, upbeat tone like talking to a good friend.',
    no_nonsense: 'Be direct and efficient. Skip small talk. Get straight to the point. Be helpful but concise.',
    funny: 'Use gentle humor and lightheartedness. Make jokes when appropriate. Keep things cheerful and fun.',
    custom: customToneNotes || 'Adapt your tone to what feels most comfortable for the user.',
  };

  const systemPrompt = `${basePersonality}

COGNITIVE LEVEL ${level}: ${cognitiveGuidelines[level] || cognitiveGuidelines[0]}

TONE: ${toneGuidelines[tone] || toneGuidelines['friendly']}

IMPORTANT GUIDELINES:
- Always be patient, kind, and respectful
- Never condescend or talk down to ${name}
- If they seem confused, gently clarify without making them feel bad
- Celebrate their wins and accomplishments
- If they express distress or emergency, take it seriously
- Keep responses conversational and natural, not robotic
- Use their name (${name}) occasionally to personalize
- Remember you're a companion, not just a tool
- If you don't know something, be honest
- Encourage independence while offering support

AVAILABLE TOOLS:
You have access to tools to check their medications, schedule, and trigger emergency alerts. Use these when helpful, but don't mention the technical details to ${name}.${getGuardrailsPrompt(guardrails)}${getRiskDetectionPrompt()}`;

  return systemPrompt;
}

/**
 * Get Buddy tools (medications, schedule, SOS)
 */
function getBuddyTools(): Anthropic.Tool[] {
  return [
    {
      name: 'get_medications',
      description: "Get the user's medications scheduled for today. Use this when they ask about their pills, meds, or what medications they need to take.",
      input_schema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'get_schedule',
      description: "Get the user's appointments for today. Use this when they ask about their schedule, appointments, or what's happening today.",
      input_schema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'trigger_sos',
      description: 'Trigger an emergency SOS alert. ONLY use this if the user explicitly says they need emergency help, are in danger, or feeling very unwell.',
      input_schema: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Brief description of why SOS was triggered',
          },
        },
        required: ['reason'],
      },
    },
  ];
}

/**
 * Execute tool calls
 */
async function executeToolCall(
  toolName: string,
  toolInput: any,
  seniorId: string
): Promise<string> {
  try {
    switch (toolName) {
      case 'get_medications': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const snapshot = await admin
          .firestore()
          .collection('seniors')
          .doc(seniorId)
          .collection('medEvents')
          .where('scheduledTime', '>=', admin.firestore.Timestamp.fromDate(today))
          .where('scheduledTime', '<', admin.firestore.Timestamp.fromDate(tomorrow))
          .orderBy('scheduledTime', 'asc')
          .get();

        if (snapshot.empty) {
          return 'No medications scheduled for today.';
        }

        const events = snapshot.docs.map((doc) => doc.data());
        const pending = events.filter((e: any) => e.status === 'pending');
        const taken = events.filter((e: any) => e.status === 'taken');

        let result = `Today's medications:\n`;

        if (pending.length > 0) {
          result += `\nPending:\n`;
          pending.forEach((e: any) => {
            const time = e.scheduledTime.toDate();
            result += `- ${e.medicationName} (${e.dosage}) at ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n`;
          });
        }

        if (taken.length > 0) {
          result += `\nAlready taken:\n`;
          taken.forEach((e: any) => {
            result += `- ${e.medicationName} ✓\n`;
          });
        }

        return result;
      }

      case 'get_schedule': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const snapshot = await admin
          .firestore()
          .collection('seniors')
          .doc(seniorId)
          .collection('appointments')
          .where('dateTime', '>=', admin.firestore.Timestamp.fromDate(today))
          .where('dateTime', '<', admin.firestore.Timestamp.fromDate(tomorrow))
          .orderBy('dateTime', 'asc')
          .get();

        if (snapshot.empty) {
          return 'No appointments scheduled for today.';
        }

        const appointments = snapshot.docs.map((doc) => doc.data());

        let result = `Today's schedule:\n`;
        appointments.forEach((appt: any) => {
          const time = appt.dateTime.toDate();
          result += `\n- ${appt.title} at ${time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}`;
          if (appt.location) result += ` (${appt.location})`;
        });

        return result;
      }

      case 'trigger_sos': {
        const reason = toolInput.reason || 'Emergency triggered by user via Buddy';

        await admin
          .firestore()
          .collection('seniors')
          .doc(seniorId)
          .collection('alerts')
          .add({
            type: 'sos',
            severity: 'critical',
            message: `SOS triggered via AI Buddy: ${reason}`,
            status: 'active',
            acknowledgedBy: null,
            location: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            resolvedAt: null,
          });

        return 'Emergency alert has been sent to your care team. Help is on the way.';
      }

      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return `I had trouble checking that information. Let me know if you'd like me to try again.`;
  }
}
