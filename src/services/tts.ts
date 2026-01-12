/**
 * Text-to-Speech Service
 * Using expo-speech with high-quality neural voices for natural, human-like speech
 * Similar to ChatGPT/Gemini voice conversations
 */

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// ============================================================================
// TTS CONFIGURATION - NATURAL VOICE SETTINGS
// ============================================================================

const DEFAULT_VOICE_RATE = 1.0; // Natural speaking pace
const DEFAULT_PITCH = 1.0;
const DEFAULT_LANGUAGE = 'en-US';

// Best quality voices for iOS (neural/enhanced)
// These are the same voices used in Siri and modern iOS apps
const IOS_VOICES = [
  'com.apple.voice.enhanced.en-US.Samantha', // Female, warm and natural
  'com.apple.voice.premium.en-US.Zoe',       // Female, young and friendly
  'com.apple.voice.premium.en-US.Ava',       // Female, professional
  'com.apple.ttsbundle.Samantha-premium',    // Fallback
  'com.apple.speech.synthesis.voice.samantha', // System fallback
];

let selectedVoice: string | null = null;
let voicesInitialized = false;

// Initialize and select the best available voice
const initializeVoice = async () => {
  if (voicesInitialized) return;

  try {
    const availableVoices = await Speech.getAvailableVoicesAsync();
    console.log('📢 Available TTS voices:', availableVoices.length);

    if (Platform.OS === 'ios') {
      // Try to find premium/enhanced voices
      for (const preferredVoice of IOS_VOICES) {
        const found = availableVoices.find(v => v.identifier === preferredVoice);
        if (found) {
          selectedVoice = found.identifier;
          console.log('✅ Selected high-quality voice:', found.name, found.identifier);
          break;
        }
      }

      // Fallback: Find any enhanced/premium en-US voice
      if (!selectedVoice) {
        const enhancedVoice = availableVoices.find(v =>
          v.language.startsWith('en-US') &&
          (v.identifier.includes('enhanced') ||
           v.identifier.includes('premium') ||
           v.quality === Speech.VoiceQuality.Enhanced)
        );
        if (enhancedVoice) {
          selectedVoice = enhancedVoice.identifier;
          console.log('✅ Selected enhanced voice:', enhancedVoice.name);
        }
      }
    }

    voicesInitialized = true;
  } catch (error) {
    console.warn('Could not initialize premium voice, using system default:', error);
  }
};

// ============================================================================
// SPEAK TEXT WITH NATURAL VOICE
// ============================================================================

export const speak = async (
  text: string,
  options?: {
    rate?: number; // 0.5 - 2.0
    pitch?: number; // 0.5 - 2.0
    language?: string;
    voice?: string;
    onDone?: () => void;
    onStopped?: () => void;
    onError?: (error: any) => void;
  }
): Promise<void> => {
  try {
    // Initialize voice on first use
    await initializeVoice();

    // Stop any ongoing speech
    await stop();

    const speechOptions: Speech.SpeechOptions = {
      language: options?.language || DEFAULT_LANGUAGE,
      pitch: options?.pitch || DEFAULT_PITCH,
      rate: options?.rate || DEFAULT_VOICE_RATE,
      voice: options?.voice || selectedVoice || undefined,
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
 * Speak message from AI Buddy with natural, conversational voice
 * Sounds like a real person, similar to ChatGPT/Gemini voice mode
 */
export const speakBuddyMessage = async (
  text: string,
  voiceRate: number = DEFAULT_VOICE_RATE,
  onDone?: () => void
): Promise<void> => {
  // Ensure we have the best voice selected
  await initializeVoice();

  return speak(text, {
    rate: voiceRate,
    pitch: 1.0, // Natural pitch
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
