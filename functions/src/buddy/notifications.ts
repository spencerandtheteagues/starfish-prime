/**
 * Caregiver notification system for risk flags
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { RiskFlag } from './riskDetection';

/**
 * Send risk notification to caregiver
 */
export const sendRiskNotification = functions.https.onCall(
  async (
    data: {
      seniorId: string;
      caregiverId: string;
      seniorName: string;
      flags: RiskFlag[];
      excerpt: string;
    },
    context
  ) => {
    const { seniorId, caregiverId, seniorName, flags, excerpt } = data;

    try {
      // Get caregiver's FCM tokens
      const caregiver Doc = await admin
        .firestore()
        .collection('users')
        .doc(caregiverId)
        .get();

      const caregiverData = caregiverDoc.data();
      if (!caregiverData?.fcmTokens || caregiverData.fcmTokens.length === 0) {
        console.log('No FCM tokens found for caregiver:', caregiverId);
        return { success: false, reason: 'no_tokens' };
      }

      // Determine notification priority based on highest severity
      const hasHighSeverity = flags.some((f) => f.severity === 'high');
      const priority = hasHighSeverity ? 'high' : 'normal';

      // Create notification message
      const highestSeverityFlag = flags.reduce((prev, curr) =>
        curr.severity === 'high'
          ? curr
          : prev.severity === 'high'
          ? prev
          : curr.severity === 'med'
          ? curr
          : prev
      );

      const riskTypeLabels: Record<string, string> = {
        self_harm: '⚠️ Self-Harm Risk',
        depression: '💙 Depression Signs',
        missed_meds: '💊 Medication Issue',
        pain: '🩹 Pain Reported',
        confusion: '🧠 Confusion Detected',
        dementia_signs: '🧠 Memory Concerns',
        other: '⚠️ Concern Detected',
      };

      const title = `${seniorName}: ${riskTypeLabels[highestSeverityFlag.type]}`;
      const body = excerpt.substring(0, 100) + (excerpt.length > 100 ? '...' : '');

      // Send notification to all devices
      const messages = caregiverData.fcmTokens.map((token: string) => ({
        token,
        notification: {
          title,
          body,
        },
        data: {
          type: 'risk_alert',
          seniorId,
          seniorName,
          riskType: highestSeverityFlag.type,
          severity: highestSeverityFlag.severity,
          excerpt,
        },
        android: {
          priority: priority as 'high' | 'normal',
          notification: {
            channelId: 'risk_alerts',
            priority: priority as 'high' | 'normal',
          },
        },
        apns: {
          headers: {
            'apns-priority': priority === 'high' ? '10' : '5',
          },
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: priority === 'high' ? 'critical.wav' : 'default',
              badge: 1,
            },
          },
        },
      }));

      // Send notifications
      const results = await admin.messaging().sendEach(messages);

      // Log notification to Firestore
      await admin.firestore().collection('notifications').add({
        caregiverId,
        seniorId,
        seniorName,
        type: 'risk_alert',
        riskType: highestSeverityFlag.type,
        severity: highestSeverityFlag.severity,
        excerpt,
        flags,
        sent: results.successCount > 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        sent: results.successCount,
        failed: results.failureCount,
      };
    } catch (error) {
      console.error('Error sending risk notification:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
  }
);
