import * as admin from 'firebase-admin';

/**
 * Maps cognitive level (0-3) to cognitive band (A-D) for integration package compatibility
 */
function mapCognitiveLevelToBand(level: number): 'A' | 'B' | 'C' | 'D' {
  switch (level) {
    case 0: return 'A'; // High function
    case 1: return 'B'; // Mild impairment
    case 2: return 'C'; // Moderate impairment
    case 3: return 'D'; // Severe impairment
    default: return 'B'; // Default to mild impairment
  }
}

/**
 * Assembles all context needed for AI Buddy to have intelligent, relevant conversations
 */
export async function assembleContext(seniorId: string) {
  const db = admin.firestore();

  // Fetch all data in parallel for performance
  const [
    seniorDoc,
    medsSnapshot,
    apptsSnapshot,
    remindersSnapshot,
    avoidanceSnapshot,
    memorySnapshot,
    lastReportSnapshot
  ] = await Promise.all([
    db.collection('seniors').doc(seniorId).get(),
    db.collection('seniors').doc(seniorId).collection('medications').where('active', '==', true).get(),
    db.collection('seniors').doc(seniorId).collection('appointments').get(),
    db.collection('seniors').doc(seniorId).collection('reminders').where('enabled', '==', true).get(),
    db.collection('seniors').doc(seniorId).collection('avoidanceRules').where('active', '==', true).get(),
    db.collection('seniors').doc(seniorId).collection('memory').orderBy('createdAt', 'desc').limit(10).get(),
    db.collection('seniors').doc(seniorId).collection('reports').orderBy('periodStart', 'desc').limit(1).get()
  ]);

  if (!seniorDoc.exists) {
    throw new Error(`Senior profile not found: ${seniorId}`);
  }

  const seniorData = seniorDoc.data()!;

  // Get current time in senior's timezone (or UTC if not set)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const next48Hours = new Date(now);
  next48Hours.setHours(next48Hours.getHours() + 48);

  // Filter medications scheduled for today
  const medsToday = medsSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((med: any) => {
      // Check if medication has reminder times scheduled for today
      // This is simplified - in production you'd check against actual scheduled times
      return med.active === true;
    });

  // Filter appointments in next 48 hours
  const appointmentsNext48h = apptsSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((appt: any) => {
      const apptTime = appt.dateTime?.toDate?.() || new Date(appt.dateTime);
      return apptTime >= now && apptTime <= next48Hours && appt.status !== 'cancelled';
    })
    .sort((a: any, b: any) => {
      const aTime = a.dateTime?.toDate?.() || new Date(a.dateTime);
      const bTime = b.dateTime?.toDate?.() || new Date(b.dateTime);
      return aTime.getTime() - bTime.getTime();
    });

  // Extract cognitive settings
  const cognitive = seniorData.cognitive || { level: 1, tone: 'friendly' };
  const cognitiveBand = cognitive.cognitiveBand || mapCognitiveLevelToBand(cognitive.level);

  // Extract preferences
  const preferences = seniorData.preferences || {};
  const quietHours = preferences.quietHours || { start: '21:00', end: '07:00' };

  // Extract caregiver guardrails
  const guardrails = seniorData.caregiverGuardrails || {
    blockedTopics: [],
    avoidanceStyle: 'gentle_redirect',
    privacyMode: 'full_excerpt',
    escalationTriggers: ['self_harm', 'depression'],
    autoNotify: true
  };

  return {
    // Senior profile info
    profile: {
      name: seniorData.profile?.name || 'Senior',
      preferredAddress: seniorData.profile?.preferredAddress || seniorData.profile?.name || 'Senior',
      timeZone: seniorData.profile?.timeZone || 'America/New_York'
    },

    // Product mode and features
    productMode: seniorData.subscriptionMode || 'BASIC',
    loggingLevel: seniorData.loggingLevel || 1,

    // AI configuration (provider and model selection)
    aiProvider: seniorData.aiConfig?.provider || 'gemini',
    aiModel: seniorData.aiConfig?.model,

    // Cognitive settings for tone adaptation
    cognitiveBand,
    cognitiveLevel: cognitive.level,
    tone: cognitive.tone || 'friendly',
    customToneNotes: cognitive.customToneNotes,

    // Privacy and safety settings
    quietHours,
    sharedRoomMode: preferences.sharedRoomMode || false,
    privacyMode: guardrails.privacyMode,
    avoidanceStyle: guardrails.avoidanceStyle,

    // Care context (medications, appointments, reminders)
    medsToday: medsToday.map((med: any) => ({
      name: med.name,
      dosage: med.dosage,
      times: med.reminderTimes || [],
      instructions: med.instructions
    })),

    appointmentsNext48h: appointmentsNext48h.map((appt: any) => ({
      title: appt.title || `${appt.doctorName} appointment`,
      doctorName: appt.doctorName,
      specialty: appt.specialty,
      location: appt.location,
      dateTime: appt.dateTime?.toDate?.() || new Date(appt.dateTime),
      notes: appt.notes
    })),

    remindersActive: remindersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        schedule: data.schedule,
        critical: data.critical || false
      };
    }),

    // AI memory and learning
    memoryItems: memorySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        type: data.type, // 'preference' | 'routine' | 'emotional' | 'care'
        summary: data.summary,
        createdAt: data.createdAt
      };
    }),

    // Avoidance rules (blocked topics)
    avoidanceRules: avoidanceSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        triggerTerms: data.triggerTerms || [],
        severity: data.severity || 'low',
        redirectionTargets: data.redirectionTargets || []
      };
    }),

    // Escalation configuration
    escalationTriggers: guardrails.escalationTriggers || [],
    autoNotify: guardrails.autoNotify !== false,

    // Last report summary for continuity
    lastReportSummary: lastReportSnapshot.docs[0]?.data()?.summary || null,
    lastReportDate: lastReportSnapshot.docs[0]?.data()?.periodEnd || null
  };
}
