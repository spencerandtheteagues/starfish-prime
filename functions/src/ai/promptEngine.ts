/*
 * promptEngine.ts
 *
 * The prompt engine assembles a prompt stack for the AI buddy. It reads
 * the system constitution and additional instruction files to build a
 * composite prompt. This implementation reads from the `prompts`
 * directory packaged with the server and concatenates the system
 * constitution with a context-specific system message and user messages.
 */
import * as fs from 'fs';
import * as path from 'path';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

// Load the system constitution once at startup
const constitutionPath = path.resolve(__dirname, '../../prompts/SYSTEM_CONSTITUTION.txt');
let constitution = '';
try {
  constitution = fs.readFileSync(constitutionPath, 'utf-8');
} catch (e) {
  console.warn('System constitution file not found:', constitutionPath);
  constitution = 'You are a conservative assistive AI.';
}

/**
 * buildPrompt
 *
 * Compose a sequence of chat messages that begins with the system
 * constitution and a contextual system prompt. Additional messages can
 * follow.
 */
export function buildPrompt(contextSystemMessage: string, messages: Message[]): Message[] {
  return [
    { role: 'system', content: constitution },
    { role: 'system', content: contextSystemMessage },
    ...messages,
  ];
}