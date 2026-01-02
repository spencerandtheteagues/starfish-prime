/**
 * Daily Wellbeing Report Generator
 * Scheduled function to generate daily summaries for caregivers
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Generate daily wellbeing report for a senior
 * Triggered by Cloud Scheduler (runs daily at 8 PM)
 */
export const generateDailyReport = functions.pubsub
  .schedule('0 20 * * *') // 8 PM daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      // Get all seniors
      const seniorsSnapshot = await admin.firestore().collection('seniors').get();

      const reportPromises = seniorsSnapshot.docs.map(async (seniorDoc) => {
        const seniorId = seniorDoc.id;
        const seniorData = seniorDoc.data();

        try {
          // Date range: today 12 AM to 11:59:59 PM
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todayTimestamp = admin.firestore.Timestamp.fromDate(today);
          const tomorrowTimestamp = admin.firestore.Timestamp.fromDate(tomorrow);

          // 1. Get meds adherence
          const medEventsSnapshot = await admin
            .firestore()
            .collection('seniors')
            .doc(seniorId)
            .collection('medEvents')
            .where('scheduledTime', '>=', todayTimestamp)
            .where('scheduledTime', '<', tomorrowTimestamp)
            .get();

          const medsTaken = medEventsSnapshot.docs.filter(
            (doc) => doc.data().status === 'taken'
          ).length;

          const medsMissed = medEventsSnapshot.docs.filter(
            (doc) => doc.data().status === 'missed'
          ).length;

          const totalMeds = medEventsSnapshot.docs.length;
          const adherenceRate =
            totalMeds > 0 ? Math.round((medsTaken / totalMeds) * 100) : null;

          // 2. Get risk flags
          const flagsSnapshot = await admin
            .firestore()
            .collection('seniors')
            .doc(seniorId)
            .collection('flags')
            .where('timestamp', '>=', todayTimestamp)
            .where('timestamp', '<', tomorrowTimestamp)
            .get();

          const flags = flagsSnapshot.docs.map((doc) => doc.data());
          const flagCounts: Record<string, number> = {};

          flags.forEach((flag: any) => {
            flagCounts[flag.type] = (flagCounts[flag.type] || 0) + 1;
          });

          // 3. Get appointments
          const appointmentsSnapshot = await admin
            .firestore()
            .collection('seniors')
            .doc(seniorId)
            .collection('appointments')
            .where('dateTime', '>=', todayTimestamp)
            .where('dateTime', '<', tomorrowTimestamp)
            .get();

          const appointmentsToday = appointmentsSnapshot.docs.length;

          // 4. Get Buddy chat activity
          const buddyChatsSnapshot = await admin
            .firestore()
            .collection('seniors')
            .doc(seniorId)
            .collection('buddyChats')
            .where('timestamp', '>=', todayTimestamp)
            .where('timestamp', '<', tomorrowTimestamp)
            .where('sender', '==', 'senior')
            .get();

          const buddyChatCount = buddyChatsSnapshot.docs.length;

          // 5. Generate summary text
          const summaryText = generateSummaryText({
            seniorName: seniorData.profile?.name || 'Senior',
            adherenceRate,
            medsTaken,
            medsMissed,
            totalMeds,
            flagCounts,
            totalFlags: flags.length,
            appointmentsToday,
            buddyChatCount,
          });

          // 6. Store report
          const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

          await admin
            .firestore()
            .collection('seniors')
            .doc(seniorId)
            .collection('dailyReports')
            .doc(dateStr)
            .set({
              summaryText,
              stats: {
                medsTaken,
                medsMissed,
                totalMeds,
                adherenceRate,
                flagsCount: flags.length,
                flagBreakdown: flagCounts,
                appointmentsToday,
                buddyChatCount,
              },
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          // 7. Notify caregiver if report ready
          const caregiversSnapshot = await admin
            .firestore()
            .collection('caregiverLinks')
            .where('seniors', 'array-contains', seniorId)
            .get();

          for (const caregiverDoc of caregiversSnapshot.docs) {
            const caregiverId = caregiverDoc.id;

            // Send notification (low priority)
            const caregiverUserDoc = await admin
              .firestore()
              .collection('users')
              .doc(caregiverId)
              .get();

            const caregiverData = caregiverUserDoc.data();

            if (caregiverData?.fcmTokens && caregiverData.fcmTokens.length > 0) {
              const messages = caregiverData.fcmTokens.map((token: string) => ({
                token,
                notification: {
                  title: `Daily Report: ${seniorData.profile?.name || 'Senior'}`,
                  body: summaryText.substring(0, 100) + '...',
                },
                data: {
                  type: 'daily_report',
                  seniorId,
                  date: dateStr,
                },
                android: {
                  priority: 'normal' as const,
                  notification: {
                    channelId: 'daily_reports',
                    priority: 'normal' as const,
                  },
                },
                apns: {
                  headers: {
                    'apns-priority': '5',
                  },
                  payload: {
                    aps: {
                      alert: {
                        title: `Daily Report: ${seniorData.profile?.name || 'Senior'}`,
                        body: summaryText.substring(0, 100) + '...',
                      },
                      badge: 1,
                    },
                  },
                },
              }));

              await admin.messaging().sendEach(messages);
            }
          }

          console.log(`Daily report generated for senior ${seniorId}`);
        } catch (error) {
          console.error(`Error generating report for senior ${seniorId}:`, error);
        }
      });

      await Promise.all(reportPromises);

      console.log('Daily reports generation complete');
    } catch (error) {
      console.error('Error in generateDailyReport:', error);
    }
  });

/**
 * Generate human-readable summary text
 */
function generateSummaryText(data: {
  seniorName: string;
  adherenceRate: number | null;
  medsTaken: number;
  medsMissed: number;
  totalMeds: number;
  flagCounts: Record<string, number>;
  totalFlags: number;
  appointmentsToday: number;
  buddyChatCount: number;
}): string {
  const {
    seniorName,
    adherenceRate,
    medsTaken,
    medsMissed,
    totalMeds,
    flagCounts,
    totalFlags,
    appointmentsToday,
    buddyChatCount,
  } = data;

  let summary = `Daily Report for ${seniorName}\n\n`;

  // Medications
  if (totalMeds > 0) {
    summary += `Medications: ${medsTaken}/${totalMeds} taken`;
    if (adherenceRate !== null) {
      summary += ` (${adherenceRate}% adherence)`;
    }
    if (medsMissed > 0) {
      summary += `. ${medsMissed} missed.`;
    } else {
      summary += '. All medications taken on schedule.';
    }
    summary += '\n\n';
  } else {
    summary += `Medications: No medications scheduled today.\n\n`;
  }

  // Risk flags
  if (totalFlags > 0) {
    summary += `⚠️ Wellness Concerns: ${totalFlags} flag${totalFlags > 1 ? 's' : ''} detected.\n`;

    const flagLabels: Record<string, string> = {
      self_harm: 'Self-harm concerns',
      depression: 'Depression signs',
      missed_meds: 'Medication refusal',
      pain: 'Pain reported',
      confusion: 'Confusion',
      dementia_signs: 'Memory concerns',
    };

    Object.entries(flagCounts).forEach(([type, count]) => {
      summary += `  - ${flagLabels[type] || type}: ${count}\n`;
    });
    summary += '\n';
  } else {
    summary += `✓ No wellness concerns detected.\n\n`;
  }

  // Appointments
  if (appointmentsToday > 0) {
    summary += `Appointments: ${appointmentsToday} appointment${appointmentsToday > 1 ? 's' : ''} today.\n\n`;
  }

  // Activity
  if (buddyChatCount > 0) {
    summary += `Activity: ${buddyChatCount} conversation${buddyChatCount > 1 ? 's' : ''} with Buddy.\n`;
  } else {
    summary += `Activity: No Buddy conversations today.\n`;
  }

  return summary.trim();
}
