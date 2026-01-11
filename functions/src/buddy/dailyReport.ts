/**
 * Daily Wellbeing Report Generator
 * Scheduled function to generate daily summaries for caregivers
 * Upgraded to use the new reportingEngine
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateReport } from '../ai/reportingEngine';

/**
 * Generate daily wellbeing report for a senior
 * Triggered by Cloud Scheduler (runs daily at 8 PM)
 */
export const generateDailyReport = functions.pubsub
  .schedule('0 20 * * *') // 8 PM daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const seniorsSnapshot = await db.collection('seniors').get();

      const reportPromises = seniorsSnapshot.docs.map(async (seniorDoc) => {
        const seniorId = seniorDoc.id;
        const seniorData = seniorDoc.data();

        try {
          // Use the new reporting engine to generate the report
          const report = await generateReport(seniorId, 'daily');

          // Notify caregiver if report ready
          const caregiversSnapshot = await db
            .collection('caregiverLinks')
            .where('seniors', 'array-contains', seniorId)
            .get();

          for (const caregiverDoc of caregiversSnapshot.docs) {
            const caregiverId = caregiverDoc.id;

            const caregiverUserDoc = await db
              .collection('users')
              .doc(caregiverId)
              .get();

            const caregiverData = caregiverUserDoc.data();

            if (caregiverData?.fcmTokens && caregiverData.fcmTokens.length > 0) {
              const messages = caregiverData.fcmTokens.map((token: string) => ({
                token,
                notification: {
                  title: `Daily Report: ${seniorData.profile?.name || 'Senior'}`,
                  body: "The daily wellness report is now available.",
                },
                data: {
                  type: 'daily_report',
                  seniorId,
                  reportId: report.id,
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