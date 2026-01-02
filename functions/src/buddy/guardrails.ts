/**
 * Guardrails system - Caregiver-programmable topic filtering
 */

export interface Guardrails {
  blockedTopics: string[];
  allowedTopics?: string[];
  avoidanceStyle: 'gentle_redirect' | 'strict_refusal';
  privacyMode: 'full_excerpt' | 'summary_only';
}

/**
 * Check if message contains blocked topics
 */
export function checkBlockedTopics(
  message: string,
  blockedTopics: string[]
): { isBlocked: boolean; matchedTopic?: string } {
  const messageLower = message.toLowerCase();

  for (const topic of blockedTopics) {
    const topicLower = topic.toLowerCase();

    // Check for exact word match or phrase match
    const wordBoundaryRegex = new RegExp(`\\b${topicLower}\\b`, 'i');

    if (wordBoundaryRegex.test(messageLower) || messageLower.includes(topicLower)) {
      return { isBlocked: true, matchedTopic: topic };
    }
  }

  return { isBlocked: false };
}

/**
 * Generate system prompt additions for guardrails
 */
export function getGuardrailsPrompt(guardrails: Guardrails): string {
  const { blockedTopics, avoidanceStyle } = guardrails;

  if (blockedTopics.length === 0) {
    return '';
  }

  const topicList = blockedTopics.map(t => `"${t}"`).join(', ');

  if (avoidanceStyle === 'strict_refusal') {
    return `

BLOCKED TOPICS (DO NOT DISCUSS):
The following topics are off-limits: ${topicList}

If the user tries to discuss any of these topics, politely but firmly decline:
"I'm sorry, but I'm not able to discuss that topic. Is there something else I can help you with today?"

Do not provide any information about these topics, even if the user insists.`;
  } else {
    // gentle_redirect
    return `

TOPICS TO REDIRECT:
These topics should be gently redirected: ${topicList}

If the user brings up any of these topics, kindly redirect the conversation:
"I understand you're thinking about that, but I'm better suited to help with other things. How about we talk about [suggest alternative topic like their schedule, medications, or just chat]?"

Be warm and understanding, but guide the conversation away from these topics.`;
  }
}

/**
 * Check if response violates guardrails
 */
export function checkResponseCompliance(
  response: string,
  blockedTopics: string[]
): { isCompliant: boolean; violation?: string } {
  const responseLower = response.toLowerCase();

  for (const topic of blockedTopics) {
    const topicLower = topic.toLowerCase();

    if (responseLower.includes(topicLower)) {
      return { isCompliant: false, violation: topic };
    }
  }

  return { isCompliant: true };
}
