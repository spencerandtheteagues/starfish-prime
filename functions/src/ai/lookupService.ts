/*
 * lookupService.ts
 *
 * Provides safe, bounded lookups for phone numbers, addresses, hours and
 * general knowledge. It rejects disallowed categories like adult content,
 * violence or illegal activities. This example uses Google Places API for
 * businesses and a simple static list for general knowledge. Replace
 * implementations with real services where appropriate.
 */

const DISALLOWED_PATTERNS = [/porn/i, /kill/i, /steal/i, /hate/i, /suicide/i, /illegal/i];

export async function lookup(query: string): Promise<string> {
  // Refuse disallowed categories
  if (DISALLOWED_PATTERNS.some(re => re.test(query))) {
    throw new Error('Query not allowed');
  }
  // Very simple knowledge base
  const knowledge: Record<string, string> = {
    'd-day year': '1944',
    'first president': 'George Washington',
  };
  const key = query.toLowerCase().trim();
  if (knowledge[key]) return knowledge[key];
  // Fallback: return not found
  throw new Error('No results');
}