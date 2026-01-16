/**
 * Sunny Caregiver Bridge Service
 *
 * Enables bidirectional communication between Sunny AI and caregivers.
 * - Sends alerts from Sunny to caregivers
 * - Sends reports and updates
 * - Receives caregiver instructions for Sunny
 */

import firestore from '@react-native-firebase/firestore';
import { firebaseFunctions } from './firebase';

export type AlertType =
  | 'emergency'
  | 'missed_medication'
  | 'unusual_behavior'
  | 'health_concern'
  | 'mood_change'
  | 'fall_detected'
  | 'general';

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CaregiverAlert {
  id?: string;
  type: AlertType;
  message: string;
  priority: AlertPriority;
  timestamp: Date;
  source: 'sunny_ai' | 'system' | 'senior';
  acknowledged: boolean;
  data?: any;
}

export interface DailyReport {
  date: string;
  seniorId: string;
  summary: string;
  mood: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  medicationCompliance: number; // percentage
  activitiesLogged: string[];
  conversationCount: number;
  concerns: string[];
  highlights: string[];
  generatedBy: 'sunny_ai';
  generatedAt: Date;
}

export interface CaregiverInstruction {
  id?: string;
  seniorId: string;
  type: 'reminder' | 'message' | 'schedule_update' | 'setting_change';
  instruction: string;
  data?: any;
  createdAt: Date;
  executedAt?: Date;
  executedBy?: 'sunny_ai' | 'system';
}

class SunnyCaregiverBridgeService {
  private db = firestore();

  // ============================================================================
  // ALERTS: Sunny → Caregiver
  // ============================================================================

  /**
   * Send an alert to the caregiver
   */
  async sendAlert(
    seniorId: string,
    type: AlertType,
    message: string,
    priority: AlertPriority,
    data?: any
  ): Promise<string> {
    try {
      const alert: CaregiverAlert = {
        type,
        message,
        priority,
        timestamp: new Date(),
        source: 'sunny_ai',
        acknowledged: false,
        data,
      };

      // Save to Firestore
      const alertRef = await this.db
        .collection('seniors')
        .doc(seniorId)
        .collection('alerts')
        .add({
          ...alert,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      // For high/critical alerts, also create a notification
      if (priority === 'high' || priority === 'critical') {
        await this.createCaregiverNotification(seniorId, alert);
      }

      console.log(`Alert sent: ${type} - ${message}`);
      return alertRef.id;
    } catch (error) {
      console.error('Failed to send alert:', error);
      throw error;
    }
  }

  /**
   * Send emergency alert (highest priority)
   */
  async sendEmergencyAlert(
    seniorId: string,
    emergencyType: string,
    message: string,
    data?: any
  ): Promise<void> {
    await this.sendAlert(seniorId, 'emergency', message, 'critical', {
      emergencyType,
      ...data,
    });

    // Also try to trigger immediate notification
    try {
      const notifyFn = firebaseFunctions.httpsCallable('sendEmergencyNotification');
      await notifyFn({ seniorId, emergencyType, message });
    } catch (error) {
      console.error('Failed to send emergency notification:', error);
    }
  }

  /**
   * Send missed medication alert
   */
  async sendMissedMedicationAlert(
    seniorId: string,
    medicationName: string,
    scheduledTime: string
  ): Promise<void> {
    await this.sendAlert(
      seniorId,
      'missed_medication',
      `${medicationName} was not taken at ${scheduledTime}`,
      'high',
      { medicationName, scheduledTime }
    );
  }

  /**
   * Send mood change alert
   */
  async sendMoodChangeAlert(
    seniorId: string,
    currentMood: string,
    previousMood: string,
    context: string
  ): Promise<void> {
    const priority: AlertPriority =
      currentMood === 'sad' || currentMood === 'anxious' ? 'high' : 'medium';

    await this.sendAlert(
      seniorId,
      'mood_change',
      `Mood changed from ${previousMood} to ${currentMood}. Context: ${context}`,
      priority,
      { currentMood, previousMood, context }
    );
  }

  // ============================================================================
  // REPORTS: Sunny → Caregiver
  // ============================================================================

  /**
   * Generate and send daily report
   */
  async sendDailyReport(seniorId: string): Promise<void> {
    try {
      // Use Cloud Function to generate comprehensive report
      const generateReportFn = firebaseFunctions.httpsCallable('generateReportFn');
      const result = await generateReportFn({
        seniorId,
        timeframe: 'daily',
      });

      const report = result.data as DailyReport;

      // Save report to Firestore
      const today = new Date().toISOString().split('T')[0];
      await this.db
        .collection('seniors')
        .doc(seniorId)
        .collection('reports')
        .doc(today)
        .set({
          ...report,
          generatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Notify caregiver that report is ready
      await this.createCaregiverNotification(seniorId, {
        type: 'general',
        message: `Daily report for ${today} is ready`,
        priority: 'low',
        timestamp: new Date(),
        source: 'sunny_ai',
        acknowledged: false,
      });

      console.log('Daily report sent');
    } catch (error) {
      console.error('Failed to send daily report:', error);
      throw error;
    }
  }

  /**
   * Send status update to caregiver
   */
  async sendStatusUpdate(
    seniorId: string,
    updateType: string,
    data: any
  ): Promise<void> {
    try {
      await this.db
        .collection('seniors')
        .doc(seniorId)
        .collection('statusUpdates')
        .add({
          type: updateType,
          data,
          timestamp: firestore.FieldValue.serverTimestamp(),
          source: 'sunny_ai',
        });

      console.log(`Status update sent: ${updateType}`);
    } catch (error) {
      console.error('Failed to send status update:', error);
    }
  }

  // ============================================================================
  // INSTRUCTIONS: Caregiver → Sunny
  // ============================================================================

  /**
   * Listen for caregiver instructions
   */
  subscribeToInstructions(
    seniorId: string,
    callback: (instruction: CaregiverInstruction) => void
  ): () => void {
    const unsubscribe = this.db
      .collection('seniors')
      .doc(seniorId)
      .collection('caregiverInstructions')
      .where('executedAt', '==', null)
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const instruction: CaregiverInstruction = {
                id: change.doc.id,
                seniorId: data.seniorId,
                type: data.type,
                instruction: data.instruction,
                data: data.data,
                createdAt: data.createdAt?.toDate() || new Date(),
              };
              callback(instruction);
            }
          });
        },
        error => {
          console.error('Error listening to instructions:', error);
        }
      );

    return unsubscribe;
  }

  /**
   * Mark instruction as executed
   */
  async markInstructionExecuted(
    seniorId: string,
    instructionId: string
  ): Promise<void> {
    await this.db
      .collection('seniors')
      .doc(seniorId)
      .collection('caregiverInstructions')
      .doc(instructionId)
      .update({
        executedAt: firestore.FieldValue.serverTimestamp(),
        executedBy: 'sunny_ai',
      });
  }

  /**
   * Get pending instructions for senior
   */
  async getPendingInstructions(seniorId: string): Promise<CaregiverInstruction[]> {
    const snapshot = await this.db
      .collection('seniors')
      .doc(seniorId)
      .collection('caregiverInstructions')
      .where('executedAt', '==', null)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        seniorId: data.seniorId,
        type: data.type,
        instruction: data.instruction,
        data: data.data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  }

  // ============================================================================
  // MESSAGES: Bidirectional
  // ============================================================================

  /**
   * Send message from senior (via Sunny) to caregiver
   */
  async sendMessageToCaregiver(
    seniorId: string,
    message: string,
    isVoiceMessage: boolean = false
  ): Promise<void> {
    const threadId = `senior_${seniorId}`;

    await this.db
      .collection('threads')
      .doc(threadId)
      .collection('messages')
      .add({
        text: message,
        senderRole: 'senior',
        type: 'text',
        createdAt: firestore.FieldValue.serverTimestamp(),
        source: isVoiceMessage ? 'sunny_voice' : 'sunny_text',
      });

    // Update thread metadata
    await this.db.collection('threads').doc(threadId).set(
      {
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
        lastMessagePreview: message.substring(0, 100),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log('Message sent to caregiver');
  }

  /**
   * Get unread messages from caregiver
   */
  async getUnreadCaregiverMessages(seniorId: string): Promise<any[]> {
    const threadId = `senior_${seniorId}`;

    const snapshot = await this.db
      .collection('threads')
      .doc(threadId)
      .collection('messages')
      .where('senderRole', '==', 'caregiver')
      .where('readBySenior', '==', false)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Create a notification for the caregiver
   */
  private async createCaregiverNotification(
    seniorId: string,
    alert: CaregiverAlert
  ): Promise<void> {
    // Get primary caregiver ID
    const seniorDoc = await this.db.collection('seniors').doc(seniorId).get();
    const caregiverId = seniorDoc.data()?.primaryCaregiverUserId;

    if (!caregiverId) {
      console.warn('No primary caregiver found for senior:', seniorId);
      return;
    }

    // Create notification
    await this.db
      .collection('users')
      .doc(caregiverId)
      .collection('notifications')
      .add({
        type: alert.type,
        title: this.getAlertTitle(alert.type, alert.priority),
        body: alert.message,
        seniorId,
        priority: alert.priority,
        read: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  }

  private getAlertTitle(type: AlertType, priority: AlertPriority): string {
    if (priority === 'critical') return 'EMERGENCY ALERT';
    if (priority === 'high') return 'Urgent Alert';

    switch (type) {
      case 'missed_medication':
        return 'Missed Medication';
      case 'mood_change':
        return 'Mood Update';
      case 'health_concern':
        return 'Health Concern';
      case 'unusual_behavior':
        return 'Behavior Alert';
      default:
        return 'Update from Sunny';
    }
  }
}

export const sunnyCaregiverBridge = new SunnyCaregiverBridgeService();
export default sunnyCaregiverBridge;
