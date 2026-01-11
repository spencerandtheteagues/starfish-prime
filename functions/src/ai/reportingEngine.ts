import * as admin from 'firebase-admin';
import { callModel } from './modelRouter';

export async function generateReport(seniorId: string, type: 'daily' | 'weekly' | 'monthly') {
  const db = admin.firestore();
  
  // Fetch data for the period
  const now = new Date();
  let startTime = new Date();
  if (type === 'daily') startTime.setDate(now.getDate() - 1);
  else if (type === 'weekly') startTime.setDate(now.getDate() - 7);
  else if (type === 'monthly') startTime.setMonth(now.getMonth() - 1);

  // Fetch logs, alerts, meds adherence, etc.
  const [logsSnapshot, alertsSnapshot, medsSnapshot] = await Promise.all([
    db.collection('seniors').doc(seniorId).collection('logs')
      .where('timestamp', '>=', startTime.toISOString())
      .get(),
    db.collection('seniors').doc(seniorId).collection('alerts')
      .where('timestamp', '>=', startTime.toISOString())
      .get(),
    db.collection('seniors').doc(seniorId).collection('medEvents')
      .where('scheduledTime', '>=', admin.firestore.Timestamp.fromDate(startTime))
      .get()
  ]);

  const logs = logsSnapshot.docs.map(doc => doc.data());
  const alerts = alertsSnapshot.docs.map(doc => doc.data());
  const meds = medsSnapshot.docs.map(doc => doc.data());
  
  // Use model to generate report summary
  const reportSummary = await callModel({
    seniorId,
    messages: [
      { 
        role: 'user', 
        content: `Generate a ${type} report for the caregiver. 
        Logs: ${JSON.stringify(logs)}
        Alerts: ${JSON.stringify(alerts)}
        Medication Events: ${JSON.stringify(meds)}` 
      }
    ],
    system: "You are the SilverGuard Reporting Engine. Summarize senior activity, health trends, and any concerns into a professional, actionable report for a caregiver. Focus on patterns and wellbeing. Output JSON if possible, but for the summary field, provide clear text."
  });

  const reportDoc = {
    type,
    periodStart: startTime.toISOString(),
    periodEnd: now.toISOString(),
    summary: reportSummary, // This might be JSON depending on model response, handle appropriately
    createdAt: now.toISOString(),
    sections: [
      { title: "Wellness Summary", content: reportSummary },
      { title: "Medication Adherence", content: `${meds.filter(m => m.status === 'taken').length}/${meds.length} taken` }
    ]
  };

  const reportRef = await db.collection('seniors').doc(seniorId).collection('reports').add(reportDoc);
  return { id: reportRef.id, ...reportDoc };
}