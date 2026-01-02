/**
 * Voice Service - Speech-to-Text and Text-to-Speech
 * Provides voice-first interface for Senior app
 */

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// ============================================================================
// TEXT-TO-SPEECH (TTS)
// ============================================================================

/**
 * Speak text aloud
 */
export async function speak(text: string, options?: {
  rate?: number;
  pitch?: number;
  language?: string;
  onDone?: () => void;
}): Promise<void> {
  const {
    rate = 0.9, // Slightly slower for seniors
    pitch = 1.0,
    language = 'en-US',
    onDone,
  } = options || {};

  return new Promise((resolve) => {
    Speech.speak(text, {
      language,
      pitch,
      rate,
      onDone: () => {
        if (onDone) onDone();
        resolve();
      },
      onError: (error) => {
        console.error('TTS error:', error);
        resolve(); // Resolve anyway to not block the app
      },
    });
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  Speech.stop();
}

/**
 * Check if currently speaking
 */
export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

/**
 * Get available voices
 */
export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  try {
    return await Speech.getAvailableVoicesAsync();
  } catch (error) {
    console.error('Error getting voices:', error);
    return [];
  }
}

// ============================================================================
// SPEECH-TO-TEXT (STT)
// ============================================================================

/**
 * NOTE: For production STT, you'll need to add react-native-voice or similar.
 * expo-speech only handles TTS, not STT.
 *
 * Installation:
 * npm install @react-native-voice/voice
 * npx expo prebuild
 * npx expo run:ios / npx expo run:android
 *
 * This is a placeholder implementation that shows the interface.
 * The actual implementation requires native modules.
 */

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface VoiceRecognitionOptions {
  language?: string;
  onPartialResults?: (result: VoiceRecognitionResult) => void;
  onFinalResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Start listening for speech
 *
 * IMPLEMENTATION NOTE:
 * This is a placeholder. To implement:
 * 1. Install @react-native-voice/voice
 * 2. Import Voice from '@react-native-voice/voice'
 * 3. Implement Voice.start(), Voice.onSpeechResults, etc.
 *
 * Example real implementation:
 *
 * import Voice from '@react-native-voice/voice';
 *
 * Voice.onSpeechResults = (e) => {
 *   if (e.value && e.value[0]) {
 *     onFinalResult?.({ transcript: e.value[0], isFinal: true });
 *   }
 * };
 *
 * Voice.onSpeechPartialResults = (e) => {
 *   if (e.value && e.value[0]) {
 *     onPartialResults?.({ transcript: e.value[0], isFinal: false });
 *   }
 * };
 *
 * await Voice.start(language || 'en-US');
 */
export async function startListening(options?: VoiceRecognitionOptions): Promise<void> {
  const { language = 'en-US', onPartialResults, onFinalResult, onError } = options || {};

  // TODO: Implement with @react-native-voice/voice
  console.warn('STT not yet implemented. Install @react-native-voice/voice');

  // For now, throw error to indicate not implemented
  throw new Error(
    'Speech-to-text requires @react-native-voice/voice. Please install:\n' +
    'npm install @react-native-voice/voice\n' +
    'npx expo prebuild\n' +
    'npx expo run:ios (or run:android)'
  );
}

/**
 * Stop listening for speech
 */
export async function stopListening(): Promise<void> {
  // TODO: Implement with @react-native-voice/voice
  // await Voice.stop();
  console.warn('STT not yet implemented');
}

/**
 * Cancel listening (no results)
 */
export async function cancelListening(): Promise<void> {
  // TODO: Implement with @react-native-voice/voice
  // await Voice.cancel();
  console.warn('STT not yet implemented');
}

/**
 * Check if speech recognition is available
 */
export async function isRecognitionAvailable(): Promise<boolean> {
  // TODO: Implement with @react-native-voice/voice
  // return Voice.isAvailable();
  return false; // Not available until implemented
}

/**
 * Request microphone permissions
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  // TODO: For native, use react-native-permissions or expo-permissions
  // import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
  //
  // const permission = Platform.select({
  //   ios: PERMISSIONS.IOS.MICROPHONE,
  //   android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  // });
  //
  // const result = await request(permission);
  // return result === RESULTS.GRANTED;

  console.warn('Microphone permission check not implemented');
  return true; // Assume granted for now
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Read a message aloud with senior-friendly settings
 */
export async function readMessageAloud(
  message: string,
  options?: { onDone?: () => void }
): Promise<void> {
  // Clean up text for better TTS
  const cleanText = message
    .replace(/\n+/g, '. ') // Replace newlines with pauses
    .replace(/[*_~`]/g, '') // Remove markdown formatting
    .trim();

  return speak(cleanText, {
    rate: 0.85, // Slower rate for seniors
    pitch: 1.0,
    language: 'en-US',
    onDone: options?.onDone,
  });
}

/**
 * Speak a short prompt (e.g., "Listening...")
 */
export async function speakPrompt(prompt: string): Promise<void> {
  return speak(prompt, {
    rate: 1.0, // Normal rate for short prompts
    pitch: 1.1, // Slightly higher pitch to indicate system message
  });
}
