/**
 * OpenAI Text-to-Speech Cloud Function
 * Generates natural, human-like speech using OpenAI's TTS API
 * Same quality as ChatGPT voice mode
 */

import * as functions from 'firebase-functions';
import OpenAI from 'openai';

let openai: OpenAI | null = null;

// Lazy-load OpenAI client (only when function is called)
const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

export interface GenerateSpeechRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number; // 0.25 to 4.0
}

/**
 * Generate speech from text using OpenAI TTS
 *
 * Voice options:
 * - alloy: Neutral, balanced (good default)
 * - echo: Male, clear
 * - fable: British accent, storytelling
 * - onyx: Deep male voice
 * - nova: Female, warm and friendly (RECOMMENDED for AI Buddy)
 * - shimmer: Female, energetic
 *
 * Models:
 * - tts-1: Faster, lower latency (~500ms)
 * - tts-1-hd: Higher quality, slightly slower
 */
export const generateSpeech = functions.https.onCall(
  async (data: GenerateSpeechRequest, context) => {
    try {
      const { text, voice = 'nova', model = 'tts-1', speed = 1.0 } = data;

      // Validate input
      if (!text || text.trim().length === 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Text is required'
        );
      }

      if (text.length > 4096) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Text must be 4096 characters or less'
        );
      }

      // Check API key
      if (!process.env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY not configured');
        throw new functions.https.HttpsError(
          'failed-precondition',
          'OpenAI API key not configured'
        );
      }

      console.log(`🎙️ Generating speech for text: "${text.substring(0, 50)}..." with voice: ${voice}`);

      // Get OpenAI client
      const client = getOpenAIClient();

      // Generate speech using OpenAI TTS
      const mp3Response = await client.audio.speech.create({
        model,
        voice,
        input: text,
        speed,
        response_format: 'mp3',
      });

      // Convert response to base64
      const buffer = Buffer.from(await mp3Response.arrayBuffer());
      const base64Audio = buffer.toString('base64');

      console.log(`✅ Generated speech: ${buffer.length} bytes`);

      return {
        audio: base64Audio,
        format: 'mp3',
        voice,
        model,
      };
    } catch (error: any) {
      console.error('Error generating speech:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      // Handle OpenAI API errors
      if (error.response) {
        console.error('OpenAI API error:', error.response.status, error.response.data);
        throw new functions.https.HttpsError(
          'internal',
          `OpenAI API error: ${error.response.status}`
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate speech'
      );
    }
  }
);
