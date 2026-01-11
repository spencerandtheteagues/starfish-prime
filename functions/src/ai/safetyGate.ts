import * as admin from 'firebase-admin';

/**
 * Explicit emergency phrases that should trigger caregiver alerts
 * Per integration package: ONLY explicit statements, NEVER inference from silence
 * Reserved for future client-side emergency detection
 */
// const EXPLICIT_EMERGENCY_PHRASES = [
//   'help me', 'i need help', 'call 911', 'emergency', 'i fell',
//   'im hurt', "i'm hurt", 'i cant breathe', "i can't breathe",
//   'chest pain', 'heart attack', 'stroke', 'bleeding',
//   'call ambulance', 'call an ambulance', 'i want to die',
//   'kill myself', 'end my life', 'hurt myself'
// ];

/**
 * Safety Gate - Conservative emergency detection
 * Rules:
 * - ONLY escalate on explicit emergency phrases or AI-detected high-severity concerns
 * - NEVER infer from silence, uncertainty, or ambiguous statements
 * - High-confidence threshold only
 */
export async function processSafety(seniorId: string, assistantOutput: any) {
  const db = admin.firestore();
  let alertCreated = false;

  // Check for AI-detected high-severity notify_caregiver actions
  const urgentActions = assistantOutput.actions?.filter(
    (a: any) => a.type === 'notify_caregiver' && (a.payload?.urgency === 'urgent' || a.payload?.urgency === 'critical')
  ) || [];

  for (const action of urgentActions) {
    await db.collection('seniors').doc(seniorId).collection('alerts').add({
      type: action.payload?.reason || 'conversation_concern',
      severity: action.payload?.urgency === 'critical' ? 'critical' : 'urgent',
      message: action.payload?.message || 'AI Buddy detected a potential concern',
      data: {
        assistantNote: assistantOutput.caregiver_note,
        timestamp: new Date().toISOString(),
        tone: assistantOutput.tone,
        source: 'ai_detection'
      },
      acknowledged: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    alertCreated = true;
    console.log(`Created ${action.payload?.urgency} alert for senior ${seniorId}`);
  }

  return alertCreated;
}
