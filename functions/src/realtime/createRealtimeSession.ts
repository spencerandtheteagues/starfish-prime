/**
 * OpenAI Realtime API Session Creator
 * Creates a real-time voice conversation session with custom AI Buddy prompt
 *
 * This enables ChatGPT-quality real-time voice conversations with natural interruptions,
 * turn-taking, and instant responses.
 */

import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

export interface CreateRealtimeSessionRequest {
  seniorId: string;
  voice?: 'alloy' | 'echo' | 'shimmer';
  instructions?: string; // Override instructions if needed
}

/**
 * Creates an OpenAI Realtime API session with custom AI Buddy prompt
 *
 * The custom prompt ID: pmpt_696464a11e8c8193b22df8bb67bd8f530cf75992db71453b
 * This prompt is purpose-built for the AI Buddy role
 *
 * Returns a session configuration that the client can use to connect via WebSocket
 */
export const createRealtimeSession = functions.https.onCall(
  async (data: CreateRealtimeSessionRequest, context) => {
    try {
      const { seniorId, voice = 'shimmer', instructions } = data;

      // Validate input
      if (!seniorId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'seniorId is required'
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

      console.log(`🎙️ Creating OpenAI Realtime session for senior: ${seniorId}`);

      // Create Realtime API session with custom prompt
      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1',
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-12-17',
          voice: voice,
          // Use custom AI Buddy prompt with guardrails (version 7)
          prompt: {
            id: 'pmpt_696464a11e8c8193b22df8bb67bd8f530cf75992db71453b',
            version: '7'
          },
          // Optional: Override instructions if provided
          ...(instructions && { instructions }),
          // Enable turn detection for natural conversation
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          // Input audio format from client
          input_audio_format: 'pcm16',
          // Output audio format to client
          output_audio_format: 'pcm16',
          // Transcription enabled
          input_audio_transcription: {
            model: 'whisper-1',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI Realtime API error:', response.status, errorData);
        throw new functions.https.HttpsError(
          'internal',
          `OpenAI Realtime API error: ${response.status}`
        );
      }

      const sessionData = await response.json();
      console.log(`✅ Created Realtime session:`, sessionData);

      // Return session configuration
      // The client will use this to establish a WebSocket connection
      return {
        sessionId: sessionData.id,
        clientSecret: sessionData.client_secret,
        expiresAt: sessionData.expires_at,
        model: sessionData.model,
        voice: sessionData.voice,
        // WebSocket URL for client connection
        wsUrl: `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
      };

    } catch (error: any) {
      console.error('Error creating Realtime session:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      // Handle fetch errors
      if (error.message) {
        console.error('Fetch error:', error.message);
        throw new functions.https.HttpsError(
          'internal',
          `Failed to create Realtime session: ${error.message}`
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to create Realtime session'
      );
    }
  }
);
