/**
 * Core Types - Based on ElderCare Spec
 */

import { Timestamp } from '@react-native-firebase/firestore';

// ============================================================================
// USER & ROLES
// ============================================================================

export type UserRole = 'caregiver' | 'senior';

export interface User {
  uid: string;
  role: UserRole;
  email?: string;
  phone?: string;
  name?: string;
  createdAt: Date;
  activeSeniorId?: string; // Set for seniors after pairing
}

// ============================================================================
// SENIOR PROFILE
// ============================================================================

export type CognitiveLevel = 0 | 1 | 2 | 3;
export type CognitiveBand = 'A' | 'B' | 'C' | 'D';
export type Tone = 'formal' | 'friendly' | 'no_nonsense' | 'funny' | 'custom';
export type CareTeamRole = 'admin' | 'editor' | 'viewer' | 'emergency_only';
export type SubscriptionMode = 'BASIC' | 'BUDDY_PLUS';

export interface SeniorProfile {
  id: string;
  primaryCaregiverUserId: string;

  profile: {
    name: string;
    dob?: string;
    address?: string;
    preferredAddress?: string; // e.g., "Joe" instead of "Joseph"
    timeZone?: string; // IANA timezone
  };

  cognitive: {
    level: CognitiveLevel;
    tone: Tone;
    customToneNotes?: string;
    cognitiveBand?: CognitiveBand; // For integration package compatibility
  };

  // Subscription and product mode
  subscriptionMode?: SubscriptionMode;

  // AI configuration
  aiConfig?: {
    provider?: 'anthropic' | 'openai' | 'google' | 'gemini'; // AI model provider
    model?: string; // Specific model version (optional)
  };

  // Security settings
  security?: {
    caregiverPin?: string;
  };

  // Caregiver guardrails (for Privacy Settings Screen)
  caregiverGuardrails?: {
    allowedTopics: string[];
    blockedTopics: string[];
    avoidanceStyle: 'gentle_redirect' | 'strict_refusal';
    privacyMode: 'full_excerpt' | 'summary_only';
    escalationTriggers: string[];
    autoNotify: boolean;
  };

  autonomyFlags: {
    canEditContacts: boolean;
    canEditReminders: boolean;
    canEditSchedule: boolean;
  };

  preferences: {
    fontScale: number; // 1.0–1.8
    highContrast: boolean;
    voiceRate: number; // 0.8–1.2
    quietHours: { start: string; end: string }; // e.g., "21:00", "07:00"
    sharedRoomMode?: boolean; // For privacy in shared living spaces
    // Notification preferences
    notifications?: {
      medicationReminders: boolean;
      missedMedications: boolean;
      appointments: boolean;
      healthAlerts: boolean;
      messages: boolean;
      sosAlerts: boolean; // Always true, but included for UI
    };
  };

  deviceStatus: {
    lastSeenAt?: Date;
    lastLocation?: {
      lat: number;
      lng: number;
      accuracy: number;
      ts: Date;
    };
    batteryPct?: number;
  };

  // Logging configuration
  loggingLevel?: 0 | 1 | 2 | 3;
}

// ============================================================================
// CARE TEAM LINK
// ============================================================================

export interface CareTeamLink {
  seniorId: string;
  caregiverUserId: string;
  role: CareTeamRole;
}

// ============================================================================
// MESSAGING
// ============================================================================

export type MessageSenderRole = 'senior' | 'caregiver' | 'system';
export type MessageUrgency = 'normal' | 'urgent';

export interface Thread {
  id: string; // threadId: "senior_{seniorId}"
  seniorId: string;
  participants: string[]; // Array of user IDs
  participantRoles: { [uid: string]: MessageSenderRole };
  createdAt: Date;
  updatedAt: Date;

  lastMessageAt?: Date;
  lastMessagePreview?: string;
  lastSenderUserId?: string;
  lastSenderRole?: MessageSenderRole;

  unreadCounts: { [uid: string]: number };
}

export interface Message {
  id: string;
  seniorId: string;
  threadId: string;
  senderUserId: string;
  senderRole: MessageSenderRole;
  type: 'text';
  text: string;
  createdAt: Date;

  requiresVoiceRead: boolean; // Caregiver → Senior (TTS modal)
  awaitingVoiceReply: boolean; // Caregiver wants a response
  urgency: MessageUrgency;
}

// ============================================================================
// MEDICATIONS
// ============================================================================

export type MedFrequency = 'daily' | 'twice-daily' | 'three-times-daily' | 'weekly' | 'as-needed';
export type MedEventStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export interface MedicationScheduleTime {
  hour: number;
  minute: number;
}

export interface MedicationSchedule {
  frequency: 'daily' | 'as_needed' | 'weekly';
  times: MedicationScheduleTime[];
}

export interface Medication {
  id: string;
  seniorId: string;
  name: string;
  dosage: string;
  frequency?: MedFrequency; // Legacy field
  reminderTimes?: string[]; // Legacy field ["09:00", "21:00"]
  schedule: MedicationSchedule; // New structured schedule
  instructions?: string;
  requiresFood?: boolean;
  active?: boolean;
  isActive?: boolean; // Used in some places
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationEvent {
  id: string;
  seniorId: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: Date;
  takenAt?: Date;
  status: MedEventStatus;
  notes?: string;
}

// ============================================================================
// APPOINTMENTS
// ============================================================================

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled' | 'missed';

export interface Appointment {
  id: string;
  seniorId: string;
  doctorName: string;
  specialty?: string;
  title?: string; // Optional display title
  location: string;
  address?: string;
  phone?: string;
  dateTime: Date;
  duration: number; // minutes
  notes?: string;
  reminderEnabled: boolean;
  reminderTimes: number[]; // minutes before (e.g., [1440, 60] = 1 day, 1 hour)
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CONTACTS
// ============================================================================

export type ContactType = 'doctor' | 'pharmacy' | 'caregiver' | 'family' | 'emergency' | 'other';

export interface Contact {
  id: string;
  seniorId: string;
  name: string;
  type: ContactType;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  callScript?: string; // Caregiver-written script for senior
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SAFE ZONES
// ============================================================================

export interface SafeZone {
  id: string;
  seniorId: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // meters
  notifyOnExit: boolean;
  notifyOnEnter: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ALERTS
// ============================================================================

export type AlertType =
  | 'med_missed'
  | 'message_urgent'
  | 'sos'
  | 'geofence_exit'
  | 'geofence_enter'
  | 'inactivity'
  | 'low_battery';

export type AlertSeverity = 'info' | 'warning' | 'urgent' | 'critical';

export interface Alert {
  id: string;
  seniorId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  data?: any;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

// ============================================================================
// HEALTH LOGS
// ============================================================================

export type HealthLogType =
  | 'blood_pressure'
  | 'weight'
  | 'heart_rate'
  | 'glucose'
  | 'temperature'
  | 'oxygen';

export interface HealthLog {
  id: string;
  seniorId: string;
  type: HealthLogType;
  value: any; // number or object (e.g., { systolic: 120, diastolic: 80 })
  unit: string;
  notes?: string;
  timestamp: Date;
  createdAt: Date;
}

// ============================================================================
// NOTES
// ============================================================================

export interface Note {
  id: string;
  seniorId: string;
  authorUserId: string;
  authorName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DEVICE TOKENS (FCM)
// ============================================================================

export interface DeviceToken {
  token: string;
  platform: 'ios' | 'android';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AI BUDDY
// ============================================================================

export interface BuddyConversation {
  id: string;
  seniorId: string;
  messages: BuddyMessage[];
  summary?: string; // Stored summary (privacy-first)
  createdAt: Date;
  updatedAt: Date;
}

export interface BuddyMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BuddyToolCall {
  name: string;
  arguments: any;
  result?: any;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Senior: undefined;
  Caregiver: undefined;
};

export type SeniorStackParamList = {
  SeniorHome: undefined;
  SeniorMessages: undefined;
  SeniorMeds: undefined;
  SeniorToday: undefined;
  SeniorContacts: undefined;
  SeniorSOS: undefined;
  SeniorHealth: undefined;
  BuddyChat: undefined;
  HealthCharts: undefined;
};

export type CaregiverTabParamList = {
  Dashboard: undefined;
  Medications: undefined;
  Appointments: undefined;
  Health: undefined;
  Messages: undefined;
  Settings: undefined;
};

export type CaregiverStackParamList = {
  // Medications
  MedicationsList: undefined;
  AddMedication: undefined;
  EditMedication: { medicationId: string };
  MedicationHistory: undefined;

  // Appointments
  AppointmentsList: undefined;
  AddAppointment: undefined;
  EditAppointment: { appointmentId: string };
  AppointmentDetail: { appointmentId: string };

  // Health
  HealthDashboard: undefined;
  HealthCharts: { type: HealthLogType };

  // Messages
  MessagesList: undefined;
  ChatThread: { threadId: string };

  // Settings
  CaregiverSettings: undefined;
  SeniorProfileEdit: undefined;
  CognitiveSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;

  // Subscription
  Subscription: undefined;
};

// ============================================================================
// SUBSCRIPTION & PAYMENTS
// ============================================================================

export type SubscriptionTier = 'free' | 'basic' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial' | 'pending';
export type PaymentProvider = 'apple' | 'stripe';

export interface Subscription {
  id: string;
  userId: string;
  seniorId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  provider: PaymentProvider;

  // Product info
  productId: string;
  originalTransactionId?: string;

  // Timing
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;

  // Pricing
  priceUsd: number;
  currency: string;

  // Auto-renewal
  autoRenew: boolean;
  canceledAt?: Date;
  cancellationReason?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionProduct {
  id: string;
  productId: string; // App Store product ID
  name: string;
  description: string;
  tier: SubscriptionTier;
  priceUsd: number;
  billingPeriod: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  popular?: boolean;
}

export interface PurchaseReceipt {
  transactionId: string;
  productId: string;
  purchaseDate: Date;
  expirationDate?: Date;
  originalTransactionId: string;
  receiptData: string;
  verified: boolean;
  verifiedAt?: Date;
}

// Feature flags based on subscription
export interface SubscriptionFeatures {
  maxSeniors: number;
  voiceMinutesPerMonth: number;
  sunnyAIEnabled: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customPrompts: boolean;
  exportData: boolean;
  familySharing: boolean;
}
