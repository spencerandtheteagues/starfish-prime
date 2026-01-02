/**
 * Text-to-Speech Service
 * Using expo-speech for on-device TTS (privacy-first, free, offline-capable)
 */

import * as Speech from 'expo-speech';

// ============================================================================
// TTS CONFIGURATION
// ============================================================================

const DEFAULT_VOICE_RATE = 0.9; // Slightly slower for seniors
const DEFAULT_PITCH = 1.0;
const DEFAULT_LANGUAGE = 'en-US';

// ============================================================================
// SPEAK TEXT
// ============================================================================

export const speak = async (
  text: string,
  options?: {
    rate?: number; // 0.5 - 2.0
    pitch?: number; // 0.5 - 2.0
    language?: string;
    onDone?: () => void;
    onStopped?: () => void;
    onError?: (error: any) => void;
  }
): Promise<void> => {
  try {
    // Stop any ongoing speech
    await stop();

    const speechOptions: Speech.SpeechOptions = {
      language: options?.language || DEFAULT_LANGUAGE,
      pitch: options?.pitch || DEFAULT_PITCH,
      rate: options?.rate || DEFAULT_VOICE_RATE,
      onDone: options?.onDone,
      onStopped: options?.onStopped,
      onError: options?.onError,
    };

    Speech.speak(text, speechOptions);
  } catch (error) {
    console.error('TTS speak error:', error);
    if (options?.onError) {
      options.onError(error);
    }
  }
};

// ============================================================================
// STOP SPEECH
// ============================================================================

export const stop = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('TTS stop error:', error);
  }
};

// ============================================================================
// CHECK IF SPEAKING
// ============================================================================

export const isSpeaking = async (): Promise<boolean> => {
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error('TTS isSpeaking error:', error);
    return false;
  }
};

// ============================================================================
// PAUSE / RESUME (iOS only)
// ============================================================================

export const pause = async (): Promise<void> => {
  try {
    await Speech.pause();
  } catch (error) {
    console.error('TTS pause error:', error);
  }
};

export const resume = async (): Promise<void> => {
  try {
    await Speech.resume();
  } catch (error) {
    console.error('TTS resume error:', error);
  }
};

// ============================================================================
// GET AVAILABLE VOICES
// ============================================================================

export const getAvailableVoices = async (): Promise<Speech.Voice[]> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices;
  } catch (error) {
    console.error('TTS getAvailableVoices error:', error);
    return [];
  }
};

// ============================================================================
// BUDDY-SPECIFIC HELPERS
// ============================================================================

/**
 * Speak message from AI Buddy with appropriate settings
 */
export const speakBuddyMessage = async (
  text: string,
  voiceRate: number = DEFAULT_VOICE_RATE,
  onDone?: () => void
): Promise<void> => {
  return speak(text, {
    rate: voiceRate,
    pitch: 1.0,
    language: 'en-US',
    onDone,
  });
};

/**
 * Read caregiver message aloud to senior
 */
export const readCaregiverMessage = async (
  senderName: string,
  message: string,
  voiceRate: number = DEFAULT_VOICE_RATE,
  onDone?: () => void
): Promise<void> => {
  const intro = `Message from ${senderName}:`;
  const fullText = `${intro} ${message}`;

  return speak(fullText, {
    rate: voiceRate,
    pitch: 1.0,
    language: 'en-US',
    onDone,
  });
};

/**
 * Speak medication reminder
 */
export const speakMedReminder = async (
  medicationName: string,
  voiceRate: number = DEFAULT_VOICE_RATE
): Promise<void> => {
  const text = `It's time to take your ${medicationName}.`;

  return speak(text, {
    rate: voiceRate,
    pitch: 1.0,
    language: 'en-US',
  });
};

/**
 * Speak appointment reminder
 */
export const speakAppointmentReminder = async (
  doctorName: string,
  timeDescription: string,
  voiceRate: number = DEFAULT_VOICE_RATE
): Promise<void> => {
  const text = `Reminder: You have an appointment with ${doctorName} ${timeDescription}.`;

  return speak(text, {
    rate: voiceRate,
    pitch: 1.0,
    language: 'en-US',
  });
};

export default {
  speak,
  stop,
  isSpeaking,
  pause,
  resume,
  getAvailableVoices,
  speakBuddyMessage,
  readCaregiverMessage,
  speakMedReminder,
  speakAppointmentReminder,
};
