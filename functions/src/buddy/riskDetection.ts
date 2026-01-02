/**
 * Risk detection system - Detect depression, self-harm, pain, confusion, medication refusal
 */

export type RiskType =
  | 'self_harm'
  | 'depression'
  | 'missed_meds'
  | 'pain'
  | 'confusion'
  | 'dementia_signs'
  | 'other';

export type RiskSeverity = 'low' | 'med' | 'high';

export interface RiskFlag {
  type: RiskType;
  severity: RiskSeverity;
  excerpt: string;
  confidence: number;
}

/**
 * Risk detection patterns (keyword-based for speed)
 */
const RISK_PATTERNS: Record<
  RiskType,
  { keywords: string[]; severityMultiplier: number }
> = {
  self_harm: {
    keywords: [
      'kill myself',
      'end it all',
      'suicide',
      'hurt myself',
      'harm myself',
      'don\'t want to live',
      'better off dead',
      'end my life',
    ],
    severityMultiplier: 1.5, // High severity
  },
  depression: {
    keywords: [
      'hopeless',
      'worthless',
      'nothing matters',
      'give up',
      'depressed',
      'empty inside',
      'no point',
      'can\'t go on',
      'burden',
      'alone',
      'nobody cares',
    ],
    severityMultiplier: 1.2,
  },
  missed_meds: {
    keywords: [
      'forgot my pills',
      'skip medication',
      'don\'t need pills',
      'refuse medication',
      'won\'t take',
      'hate these pills',
      'stop taking',
    ],
    severityMultiplier: 1.0,
  },
  pain: {
    keywords: [
      'hurts',
      'pain',
      'aching',
      'unbearable',
      'agony',
      'suffering',
      'can\'t stand',
      'excruciating',
    ],
    severityMultiplier: 1.1,
  },
  confusion: {
    keywords: [
      'confused',
      'don\'t understand',
      'can\'t remember',
      'where am i',
      'what day is it',
      'lost',
      'disoriented',
      'foggy',
    ],
    severityMultiplier: 1.0,
  },
  dementia_signs: {
    keywords: [
      'can\'t recall',
      'memory problems',
      'forget things',
      'who are you',
      'don\'t recognize',
      'where do i live',
      'what year',
    ],
    severityMultiplier: 1.0,
  },
  other: {
    keywords: [],
    severityMultiplier: 1.0,
  },
};

/**
 * Detect risk signals in user message
 */
export function detectRisks(message: string): RiskFlag[] {
  const messageLower = message.toLowerCase();
  const flags: RiskFlag[] = [];

  for (const [riskType, config] of Object.entries(RISK_PATTERNS)) {
    if (riskType === 'other') continue;

    let matchCount = 0;
    let matchedKeywords: string[] = [];

    for (const keyword of config.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    if (matchCount > 0) {
      // Calculate severity based on match count and multiplier
      const baseScore = Math.min(matchCount * 0.3, 1.0);
      const adjustedScore = baseScore * config.severityMultiplier;

      let severity: RiskSeverity;
      if (adjustedScore >= 0.7) {
        severity = 'high';
      } else if (adjustedScore >= 0.4) {
        severity = 'med';
      } else {
        severity = 'low';
      }

      // Create excerpt (first 150 chars or sentence containing match)
      const excerpt = message.substring(0, 150);

      flags.push({
        type: riskType as RiskType,
        severity,
        excerpt,
        confidence: adjustedScore,
      });
    }
  }

  return flags;
}

/**
 * Generate system prompt additions for risk detection
 */
export function getRiskDetectionPrompt(): string {
  return `

SAFETY MONITORING:
You are helping monitor the wellbeing of a senior user. Pay attention to signs of:
- Self-harm or suicidal thoughts (HIGHEST PRIORITY)
- Depression or hopelessness
- Medication refusal or skipped medications
- Pain or physical distress
- Confusion or disorientation
- Memory problems or dementia signs

If you detect any of these:
1. Respond with empathy and care
2. For self-harm: Express concern and ask if they'd like you to notify their care team
3. For other issues: Gently explore and offer appropriate help
4. Never dismiss or minimize their concerns

Your responses are monitored for these risk signals to ensure appropriate caregiver notification when needed.`;
}

/**
 * Determine if caregiver should be notified based on flags and settings
 */
export function shouldNotifyCaregiver(
  flags: RiskFlag[],
  escalationSettings: {
    notifyCaregiverOn: RiskType[];
    autoNotify: boolean;
  }
): boolean {
  if (!escalationSettings.autoNotify) {
    return false;
  }

  // Check if any detected risk matches notification settings
  for (const flag of flags) {
    if (
      escalationSettings.notifyCaregiverOn.includes(flag.type) &&
      flag.severity !== 'low' // Only notify for med+ severity
    ) {
      return true;
    }
  }

  return false;
}
