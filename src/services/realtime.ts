/**
 * OpenAI Realtime API Client Service
 * Handles WebSocket connection for real-time voice conversations
 * with the custom AI Buddy prompt
 */

import { firebaseFunctions } from './firebase';
import { Audio } from 'expo-av';

interface RealtimeSessionConfig {
  sessionId: string;
  clientSecret: string;
  expiresAt: string;
  model: string;
  voice: string;
  wsUrl: string;
}

interface RealtimeCallbacks {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onAudioDelta?: (audioDelta: string) => void;
  onResponseDone?: () => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

class RealtimeService {
  private ws: WebSocket | null = null;
  private sessionConfig: RealtimeSessionConfig | null = null;
  private callbacks: RealtimeCallbacks = {};
  private audioContext: any = null;
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isRecording: boolean = false;

  /**
   * Initialize a real-time voice session with your custom AI Buddy prompt
   * Prompt ID: pmpt_696464a11e8c8193b22df8bb67bd8f530cf75992db71453b (v4)
   */
  async startSession(seniorId: string, callbacks: RealtimeCallbacks): Promise<void> {
    try {
      console.log('🎙️ Starting Realtime session with custom AI Buddy prompt...');

      this.callbacks = callbacks;

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Call Cloud Function to create session
      const createSessionFn = firebaseFunctions.httpsCallable('createRealtimeSession');
      const result = await createSessionFn({
        seniorId,
        voice: 'shimmer', // Energetic, friendly female voice
      });

      this.sessionConfig = result.data as RealtimeSessionConfig;
      console.log('✅ Session created:', this.sessionConfig.sessionId);

      // Connect to WebSocket
      await this.connectWebSocket();

    } catch (error) {
      console.error('Failed to start Realtime session:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    if (!this.sessionConfig) {
      throw new Error('No session config available');
    }

    return new Promise((resolve, reject) => {
      const wsUrl = `${this.sessionConfig!.wsUrl}&session_id=${this.sessionConfig!.sessionId}`;

      console.log('🔌 Connecting to WebSocket...');
      this.ws = new WebSocket(wsUrl, undefined, {
        headers: {
          'Authorization': `Bearer ${this.sessionConfig!.clientSecret}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      });

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.callbacks.onConnected?.();

        // Send session configuration
        this.sendEvent({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are using the custom AI Buddy prompt for eldercare.',
            voice: 'shimmer',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        });

        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.callbacks.onError?.(new Error('WebSocket error'));
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.callbacks.onDisconnected?.();
      };
    });
  }

  private handleMessage(message: any): void {
    console.log('📨 Received:', message.type);

    switch (message.type) {
      case 'conversation.item.input_audio_transcription.completed':
        // User's speech transcription
        this.callbacks.onTranscript?.(message.transcript, true);
        break;

      case 'response.audio.delta':
        // AI voice audio chunk
        this.callbacks.onAudioDelta?.(message.delta);
        this.playAudioDelta(message.delta);
        break;

      case 'response.audio_transcript.delta':
        // AI's speech transcription
        this.callbacks.onTranscript?.(message.delta, false);
        break;

      case 'response.done':
        // AI finished responding
        this.callbacks.onResponseDone?.();
        break;

      case 'error':
        console.error('Realtime API error:', message.error);
        this.callbacks.onError?.(new Error(message.error.message));
        break;
    }
  }

  private sendEvent(event: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  /**
   * Start recording user's voice and stream to Realtime API
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) return;

    try {
      console.log('🎤 Starting recording...');

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 24000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 24000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      this.recording = recording;
      this.isRecording = true;

      // Set up audio data callback (if supported)
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          // In production, we'd stream audio chunks here
          // For now, we'll use the complete recording when stopped
        }
      });

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Stop recording and send audio to Realtime API
   */
  async stopRecording(): Promise<void> {
    if (!this.isRecording || !this.recording) return;

    try {
      console.log('🛑 Stopping recording...');

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      if (uri) {
        // Read the audio file
        const response = await fetch(uri);
        const audioBlob = await response.blob();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');

        // Send to Realtime API
        this.sendEvent({
          type: 'input_audio_buffer.append',
          audio: base64Audio,
        });

        // Commit the audio
        this.sendEvent({
          type: 'input_audio_buffer.commit',
        });

        // Create a response
        this.sendEvent({
          type: 'response.create',
        });
      }

      this.recording = null;
      this.isRecording = false;

    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Play audio delta from AI
   */
  private async playAudioDelta(audioDelta: string): Promise<void> {
    try {
      // In production, we'd use a streaming audio player
      // For now, we'll accumulate and play
      // This is a simplified version - you'd want to use a proper audio streaming library

    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  /**
   * Stop the session and cleanup
   */
  async stopSession(): Promise<void> {
    console.log('🛑 Stopping Realtime session...');

    if (this.isRecording) {
      await this.stopRecording();
    }

    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.sessionConfig = null;
    this.callbacks = {};
  }

  /**
   * Send a text message (as a fallback to voice)
   */
  sendTextMessage(text: string): void {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text,
          },
        ],
      },
    });

    // Create response
    this.sendEvent({
      type: 'response.create',
    });
  }

  /**
   * Interrupt the AI's current response
   */
  interrupt(): void {
    this.sendEvent({
      type: 'response.cancel',
    });
  }
}

export const realtimeService = new RealtimeService();
