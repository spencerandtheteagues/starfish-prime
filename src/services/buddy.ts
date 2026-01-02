/**
 * AI Buddy Service
 * Claude API integration for empathetic, cognitive-tuned senior companion
 */

import Anthropic from '@anthropic-ai/sdk';
import { CognitiveLevel, Tone, MedicationEvent, Appointment, SeniorProfile } from '../types';
import { getTodayMedEvents, appointmentsCollection, alertsCollection, serverTimestamp } from './firebase';

// Initialize Anthropic client
// For now, we'll load the API key directly. In production, use Firebase Remote Config
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Tool definitions for Claude
 */
const BUDDY_TOOLS: Anthropic.Tool[] = [
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

/**
 * Generate cognitive-level system prompt
 */
function getCognitiveSystemPrompt(
  seniorProfile: SeniorProfile,
  userName: string
): string {
  const { level, tone, customToneNotes } = seniorProfile.cognitive;

  // Base personality
  let basePersonality = `You are Buddy, a warm and caring AI companion for ${userName}. You provide emotional support, practical help, and friendly conversation.`;

  // Cognitive level adjustments
  const cognitiveGuidelines: Record<CognitiveLevel, string> = {
    0: `${userName} is fully independent. Use natural, adult conversation. Don't over-explain. Be respectful and treat them as a peer.`,
    1: `${userName} needs minimal support. Use clear language but keep conversation natural. Gently remind when needed but respect their autonomy.`,
    2: `${userName} needs moderate support. Use simple, clear sentences. Break complex tasks into steps. Be patient and encouraging. Repeat important information if needed.`,
    3: `${userName} needs high support. Use very simple language. Speak in short, clear sentences. Be extra patient and reassuring. Focus on one thing at a time. Use lots of positive reinforcement.`,
  };

  // Tone adjustments
  const toneGuidelines: Record<Tone, string> = {
    formal: 'Maintain a polite, respectful, professional demeanor. Use proper grammar and courteous language.',
    friendly: 'Be warm, conversational, and personable. Use a friendly, upbeat tone like talking to a good friend.',
    no_nonsense: 'Be direct and efficient. Skip small talk. Get straight to the point. Be helpful but concise.',
    funny: 'Use gentle humor and lightheartedness. Make jokes when appropriate. Keep things cheerful and fun.',
    custom: customToneNotes || 'Adapt your tone to what feels most comfortable for the user.',
  };

  // Combine guidelines
  const systemPrompt = `${basePersonality}

COGNITIVE LEVEL ${level}: ${cognitiveGuidelines[level]}

TONE: ${toneGuidelines[tone]}

IMPORTANT GUIDELINES:
- Always be patient, kind, and respectful
- Never condescend or talk down to ${userName}
- If they seem confused, gently clarify without making them feel bad
- Celebrate their wins and accomplishments
- If they express distress or emergency, take it seriously
- Keep responses conversational and natural, not robotic
- Use their name (${userName}) occasionally to personalize
- Remember you're a companion, not just a tool
- If you don't know something, be honest
- Encourage independence while offering support

AVAILABLE TOOLS:
You have access to tools to check their medications, schedule, and trigger emergency alerts. Use these when helpful, but don't mention the technical details to ${userName}.`;

  return systemPrompt;
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
        const snapshot = await getTodayMedEvents(seniorId).get();
        const events = snapshot.docs.map((doc) => doc.data()) as MedicationEvent[];

        if (events.length === 0) {
          return 'No medications scheduled for today.';
        }

        const pending = events.filter((e) => e.status === 'pending');
        const taken = events.filter((e) => e.status === 'taken');

        let result = `Today's medications:\n`;

        if (pending.length > 0) {
          result += `\nPending:\n`;
          pending.forEach((e) => {
            const time = new Date(0, 0, 0, e.scheduledTime.getHours(), e.scheduledTime.getMinutes());
            result += `- ${e.medicationName} (${e.dosage}) at ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n`;
          });
        }

        if (taken.length > 0) {
          result += `\nAlready taken:\n`;
          taken.forEach((e) => {
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

        const snapshot = await appointmentsCollection()
          .where('seniorId', '==', seniorId)
          .where('dateTime', '>=', today)
          .where('dateTime', '<', tomorrow)
          .orderBy('dateTime', 'asc')
          .get();

        const appointments = snapshot.docs.map((doc) => doc.data()) as Appointment[];

        if (appointments.length === 0) {
          return 'No appointments scheduled for today.';
        }

        let result = `Today's schedule:\n`;
        appointments.forEach((appt) => {
          const time = appt.dateTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          result += `\n- ${appt.title} at ${time}`;
          if (appt.location) result += ` (${appt.location})`;
        });

        return result;
      }

      case 'trigger_sos': {
        const reason = toolInput.reason || 'Emergency triggered by user via Buddy';

        await alertsCollection().add({
          seniorId,
          type: 'sos',
          severity: 'critical',
          message: `SOS triggered via AI Buddy: ${reason}`,
          status: 'active',
          acknowledgedBy: null,
          location: null,
          createdAt: serverTimestamp(),
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

/**
 * Chat with Buddy (single message)
 */
export async function chatWithBuddy(params: {
  seniorId: string;
  seniorProfile: SeniorProfile;
  userName: string;
  message: string;
  conversationHistory?: Anthropic.MessageParam[];
}): Promise<{
  response: string;
  toolCalls?: { name: string; input: any; result: string }[];
}> {
  const { seniorId, seniorProfile, userName, message, conversationHistory = [] } = params;

  // Build system prompt
  const systemPrompt = getCognitiveSystemPrompt(seniorProfile, userName);

  // Build messages array
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory,
    {
      role: 'user',
      content: message,
    },
  ];

  try {
    // Initial API call
    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      tools: BUDDY_TOOLS,
    });

    // Handle tool calls
    const toolCalls: { name: string; input: any; result: string }[] = [];

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
        tools: BUDDY_TOOLS,
      });
    }

    // Extract text response
    const textBlock = response.content.find(
      (block) => block.type === 'text'
    ) as Anthropic.TextBlock | undefined;

    return {
      response: textBlock?.text || 'I apologize, I had trouble responding. Could you try again?',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  } catch (error) {
    console.error('Error in chatWithBuddy:', error);
    throw error;
  }
}

/**
 * Chat with Buddy (streaming)
 */
export async function* chatWithBuddyStreaming(params: {
  seniorId: string;
  seniorProfile: SeniorProfile;
  userName: string;
  message: string;
  conversationHistory?: Anthropic.MessageParam[];
}): AsyncGenerator<string, void, unknown> {
  const { seniorId, seniorProfile, userName, message, conversationHistory = [] } = params;

  const systemPrompt = getCognitiveSystemPrompt(seniorProfile, userName);

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory,
    {
      role: 'user',
      content: message,
    },
  ];

  try {
    const stream = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      tools: BUDDY_TOOLS,
      stream: true,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }

      // Handle tool calls in streaming mode
      if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
        // Tool use detected - for now, we'll handle this non-streaming
        // In production, you might want to show a "Checking..." indicator
        continue;
      }
    }
  } catch (error) {
    console.error('Error in chatWithBuddyStreaming:', error);
    throw error;
  }
}

/**
 * Get conversation context summary (for privacy)
 * This creates a brief summary to maintain context without storing full conversations
 */
export async function summarizeConversation(
  messages: Anthropic.MessageParam[]
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Please create a brief 2-3 sentence summary of this conversation that captures the key topics discussed and the user's emotional state. This summary will help maintain context for future conversations while respecting privacy.

Conversation:
${JSON.stringify(messages, null, 2)}`,
        },
      ],
    });

    const textBlock = response.content.find(
      (block) => block.type === 'text'
    ) as Anthropic.TextBlock | undefined;

    return textBlock?.text || 'General conversation';
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    return 'General conversation';
  }
}

/**
 * Convert BuddyMessage format to Anthropic MessageParam format
 */
export function convertToAnthropicMessages(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Anthropic.MessageParam[] {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}
