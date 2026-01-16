/**
 * Voice Service - Speech-to-Text and Text-to-Speech
 * Provides voice-first interface for Senior app
 */

import * as Speech from 'expo-speech';
import { Platform, PermissionsAndroid } from 'react-native';
import Voice from '@react-native-voice/voice';

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

// Setup event handlers for @react-native-voice/voice
let _onPartialResults: ((result: VoiceRecognitionResult) => void) | undefined;
let _onFinalResult: ((result: VoiceRecognitionResult) => void) | undefined;
let _onError: ((error: Error) => void) | undefined;

Voice.onSpeechResults = (e: any) => {
  if (e.value && e.value[0]) {
    _onFinalResult?.({ transcript: e.value[0], isFinal: true });
  }
};

Voice.onSpeechPartialResults = (e: any) => {
  if (e.value && e.value[0]) {
    _onPartialResults?.({ transcript: e.value[0], isFinal: false });
  }
};

Voice.onSpeechError = (e: any) => {
  console.error('STT Voice Error:', e);
  _onError?.(new Error(e.error?.message || 'Unknown STT error'));
};

/**
 * Start listening for speech
 */
export async function startListening(options?: VoiceRecognitionOptions): Promise<void> {
  const { language = 'en-US', onPartialResults, onFinalResult, onError } = options || {};

  _onPartialResults = onPartialResults;
  _onFinalResult = onFinalResult;
  _onError = onError;

  try {
    await Voice.start(language);
    console.log('STT listening started');
  } catch (error) {
    console.error('STT start error:', error);
    _onError?.(error as Error);
    throw error;
  }
}

/**
 * Stop listening for speech
 */
export async function stopListening(): Promise<void> {
  try {
    await Voice.stop();
    console.log('STT listening stopped');
  } catch (error) {
    console.error('STT stop error:', error);
    throw error;
  }
}

/**
 * Cancel listening (no results)
 */
export async function cancelListening(): Promise<void> {
  try {
    await Voice.cancel();
    console.log('STT listening cancelled');
  } catch (error) {
    console.error('STT cancel error:', error);
    throw error;
  }
}

/**
 * Check if speech recognition is available
 */
export async function isRecognitionAvailable(): Promise<boolean> {
  try {
    const result = await Voice.isAvailable();
    return Boolean(result);
  } catch (error) {
    console.error('STT availability error:', error);
    return false;
  }
}

/**
 * Request microphone permissions
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    try {
      // Web API for microphone access
      const nav = navigator as any;
      if (typeof nav !== 'undefined' && nav.mediaDevices) {
        const stream = await nav.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track: any) => track.stop());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Web microphone permission error:', error);
      return false;
    }
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'SilverGuard needs access to your microphone for voice features.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Android microphone permission error:', error);
      return false;
    }
  }

  // iOS handles permissions through expo-speech and @react-native-voice/voice
  // Permission is requested automatically when the microphone is first accessed
  return true;
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
