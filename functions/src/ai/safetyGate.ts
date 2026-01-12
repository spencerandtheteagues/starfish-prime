/*
 * safetyGate.ts
 *
 * Detects explicit emergencies in transcripts. Only high-confidence
 * explicit statements trigger caregiver alerts or emergency services.
 * This simple implementation looks for a list of phrases. In a
 * production system, use a language model or specialized classifier.
 */

const TRIGGER_PHRASES = [
  'call 911',
  'emergency',
  'help me now',
  'i fell',
  'i can’t breathe',
  'i cannot breathe',
  'chest pain',
  'suicide',
  'kill myself',
];

export function detectEmergency(transcript: string): boolean {
  const lower = transcript.toLowerCase();
  return TRIGGER_PHRASES.some(phrase => lower.includes(phrase));
}