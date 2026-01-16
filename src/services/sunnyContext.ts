/**
 * Sunny Context Provider Service
 *
 * Provides senior context data to Sunny AI for personalized conversations.
 * This enables Sunny to know about medications, appointments, caregiver messages,
 * and senior preferences without the senior having to repeat information.
 */

import firestore from '@react-native-firebase/firestore';
import { format, isToday, isTomorrow } from 'date-fns';

export interface SunnyContext {
  senior: {
    name: string;
    preferredName?: string;
    cognitiveLevel: number;
    tone: string;
  };
  medications: MedicationContext[];
  appointments: AppointmentContext[];
  caregiverMessages: MessageContext[];
  recentActivities: ActivityContext[];
  preferences: SeniorPreferences;
  currentDateTime: {
    date: string;
    time: string;
    dayOfWeek: string;
  };
}

interface MedicationContext {
  name: string;
  dosage: string;
  nextDue: string;
  lastTaken?: string;
  instructions?: string;
}

interface AppointmentContext {
  title: string;
  doctorName?: string;
  location: string;
  dateTime: string;
  relativeTime: string; // "today at 2pm", "tomorrow at 10am"
}

interface MessageContext {
  from: string;
  preview: string;
  receivedAt: string;
  isUrgent: boolean;
}

interface ActivityContext {
  type: string;
  description: string;
  timestamp: string;
}

interface SeniorPreferences {
  fontScale: number;
  voiceRate: number;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

class SunnyContextService {
  private db = firestore();

  /**
   * Get complete context for Sunny's current conversation
   */
  async getContextForSenior(seniorId: string): Promise<SunnyContext> {
    try {
      const [
        seniorProfile,
        medications,
        appointments,
        messages,
        recentLogs,
      ] = await Promise.all([
        this.getSeniorProfile(seniorId),
        this.getTodayMedications(seniorId),
        this.getUpcomingAppointments(seniorId),
        this.getUnreadMessages(seniorId),
        this.getRecentActivityLogs(seniorId),
      ]);

      const now = new Date();

      return {
        senior: {
          name: seniorProfile.profile?.name || 'Friend',
          preferredName: seniorProfile.profile?.preferredAddress,
          cognitiveLevel: seniorProfile.cognitive?.level || 1,
          tone: seniorProfile.cognitive?.tone || 'friendly',
        },
        medications,
        appointments,
        caregiverMessages: messages,
        recentActivities: recentLogs,
        preferences: {
          fontScale: seniorProfile.preferences?.fontScale || 1.0,
          voiceRate: seniorProfile.preferences?.voiceRate || 1.0,
          quietHoursStart: seniorProfile.preferences?.quietHours?.start,
          quietHoursEnd: seniorProfile.preferences?.quietHours?.end,
        },
        currentDateTime: {
          date: format(now, 'EEEE, MMMM d, yyyy'),
          time: format(now, 'h:mm a'),
          dayOfWeek: format(now, 'EEEE'),
        },
      };
    } catch (error) {
      console.error('Error getting Sunny context:', error);
      throw error;
    }
  }

  /**
   * Format context as natural language for Sunny's system prompt
   */
  async getContextAsText(seniorId: string): Promise<string> {
    const context = await this.getContextForSenior(seniorId);
    const lines: string[] = [];

    lines.push(`CURRENT CONTEXT FOR ${context.senior.preferredName || context.senior.name}:`);
    lines.push(`It is ${context.currentDateTime.dayOfWeek}, ${context.currentDateTime.date} at ${context.currentDateTime.time}.`);
    lines.push('');

    // Medications
    if (context.medications.length > 0) {
      lines.push('MEDICATIONS TODAY:');
      context.medications.forEach(med => {
        lines.push(`- ${med.name} (${med.dosage}): ${med.nextDue}`);
        if (med.instructions) {
          lines.push(`  Instructions: ${med.instructions}`);
        }
      });
      lines.push('');
    }

    // Appointments
    if (context.appointments.length > 0) {
      lines.push('UPCOMING APPOINTMENTS:');
      context.appointments.forEach(appt => {
        lines.push(`- ${appt.title} with ${appt.doctorName || 'doctor'}: ${appt.relativeTime} at ${appt.location}`);
      });
      lines.push('');
    }

    // Unread messages
    if (context.caregiverMessages.length > 0) {
      lines.push('UNREAD MESSAGES FROM CAREGIVER:');
      context.caregiverMessages.forEach(msg => {
        lines.push(`- ${msg.from}: "${msg.preview}"${msg.isUrgent ? ' (URGENT)' : ''}`);
      });
      lines.push('');
    }

    // Recent activities
    if (context.recentActivities.length > 0) {
      lines.push('RECENT ACTIVITIES:');
      context.recentActivities.forEach(activity => {
        lines.push(`- ${activity.description} (${activity.timestamp})`);
      });
    }

    return lines.join('\n');
  }

  private async getSeniorProfile(seniorId: string): Promise<any> {
    const doc = await this.db.collection('seniors').doc(seniorId).get();
    return doc.data() || {};
  }

  private async getTodayMedications(seniorId: string): Promise<MedicationContext[]> {
    const snapshot = await this.db
      .collection('seniors')
      .doc(seniorId)
      .collection('medications')
      .where('active', '==', true)
      .get();

    const now = new Date();
    const currentTime = format(now, 'HH:mm');

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const reminderTimes = data.reminderTimes || [];

      // Find next due time
      const nextDueTime = reminderTimes.find((time: string) => time > currentTime) || reminderTimes[0];

      return {
        name: data.name,
        dosage: data.dosage,
        nextDue: nextDueTime ? `Due at ${this.formatTime(nextDueTime)}` : 'All doses completed today',
        instructions: data.instructions,
      };
    });
  }

  private async getUpcomingAppointments(seniorId: string): Promise<AppointmentContext[]> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const snapshot = await this.db
      .collection('seniors')
      .doc(seniorId)
      .collection('appointments')
      .where('dateTime', '>=', now)
      .where('dateTime', '<=', nextWeek)
      .orderBy('dateTime')
      .limit(5)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const dateTime = data.dateTime?.toDate() || new Date();

      let relativeTime = format(dateTime, 'EEEE') + ' at ' + format(dateTime, 'h:mm a');
      if (isToday(dateTime)) {
        relativeTime = 'Today at ' + format(dateTime, 'h:mm a');
      } else if (isTomorrow(dateTime)) {
        relativeTime = 'Tomorrow at ' + format(dateTime, 'h:mm a');
      }

      return {
        title: data.title || `Appointment with ${data.doctorName}`,
        doctorName: data.doctorName,
        location: data.location || 'Location not specified',
        dateTime: format(dateTime, 'PPpp'),
        relativeTime,
      };
    });
  }

  private async getUnreadMessages(seniorId: string): Promise<MessageContext[]> {
    const threadId = `senior_${seniorId}`;

    const snapshot = await this.db
      .collection('threads')
      .doc(threadId)
      .collection('messages')
      .where('senderRole', '==', 'caregiver')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        from: data.senderName || 'Caregiver',
        preview: (data.text || '').substring(0, 100),
        receivedAt: data.createdAt?.toDate()
          ? format(data.createdAt.toDate(), 'h:mm a')
          : 'Recently',
        isUrgent: data.urgency === 'urgent',
      };
    });
  }

  private async getRecentActivityLogs(seniorId: string): Promise<ActivityContext[]> {
    const snapshot = await this.db
      .collection('seniors')
      .doc(seniorId)
      .collection('activityLogs')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        type: data.type || 'activity',
        description: data.description || data.type,
        timestamp: data.timestamp?.toDate()
          ? format(data.timestamp.toDate(), 'h:mm a')
          : 'Recently',
      };
    });
  }

  private formatTime(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

export const sunnyContextService = new SunnyContextService();
export default sunnyContextService;
