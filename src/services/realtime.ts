/**
 * OpenAI Realtime API Client Service
 * Handles WebSocket connection for real-time voice conversations
 * with the custom AI Buddy prompt
 */

import { firebaseFunctions } from './firebase';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { sunnyContextService } from './sunnyContext';
import { sunnyCaregiverBridge } from './sunnyCaregiverBridge';

interface RealtimeSessionConfig {
  sessionId: string;
  clientSecret: string;
  expiresAt: string;
  model: string;
  voice: string;
  wsUrl: string;
}

// Helper to convert ArrayBuffer to base64 (React Native compatible)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

interface RealtimeCallbacks {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onAudioDelta?: (audioDelta: string) => void;
  onResponseDone?: () => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onFunctionCall?: (functionName: string, args: any) => void;
  onFunctionResult?: (functionName: string, result: any) => void;
}

// Define the 7 Sunny functions for OpenAI Realtime API
const SUNNY_TOOLS = [
  {
    type: 'function',
    name: 'get_weather',
    description: 'Get current weather information for the senior\'s location or a specified location. Use when the senior asks about weather.',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name or address. If not provided, uses senior\'s home location.',
        },
      },
      required: [],
    },
  },
  {
    type: 'function',
    name: 'general_information_lookup',
    description: 'Look up general information like phone numbers, business hours, or simple facts. Use for practical queries the senior might have.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The information to look up',
        },
      },
      required: ['query'],
    },
  },
  {
    type: 'function',
    name: 'get_news',
    description: 'Get age-appropriate, filtered news headlines. Use when the senior asks about news or current events.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['general', 'health', 'science', 'technology', 'entertainment', 'sports', 'local'],
          description: 'News category to fetch',
        },
      },
      required: [],
    },
  },
  {
    type: 'function',
    name: 'log_and_report_daily_senior_status',
    description: 'Log information about the senior\'s day including mood, activities, meals, and medications. Call this when the senior shares information about their day or wellbeing.',
    parameters: {
      type: 'object',
      properties: {
        mood: {
          type: 'string',
          enum: ['happy', 'neutral', 'sad', 'anxious', 'confused', 'tired', 'energetic'],
          description: 'Senior\'s current mood',
        },
        activities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Activities the senior has done today',
        },
        mealsEaten: {
          type: 'number',
          description: 'Number of meals eaten today (0-3)',
        },
        medicationsTaken: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of medications taken',
        },
        concerns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Any concerns the senior mentioned',
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the conversation',
        },
      },
      required: [],
    },
  },
  {
    type: 'function',
    name: 'integrate_eldercare_features',
    description: 'Access eldercare app features like medication schedules, appointments, messages, and contacts.',
    parameters: {
      type: 'object',
      properties: {
        featureType: {
          type: 'string',
          enum: ['reminder', 'alert', 'schedule', 'message', 'contact'],
          description: 'Type of feature to access',
        },
        action: {
          type: 'string',
          enum: ['get', 'add', 'update', 'delete'],
          description: 'Action to perform',
        },
        data: {
          type: 'object',
          description: 'Data for the action (depends on feature type)',
        },
      },
      required: ['featureType', 'action'],
    },
  },
  {
    type: 'function',
    name: 'build_and_log_senior_profile',
    description: 'Record information learned about the senior during conversation such as preferences, memories, routines, or health observations.',
    parameters: {
      type: 'object',
      properties: {
        dataType: {
          type: 'string',
          enum: ['preference', 'memory', 'routine', 'health', 'interest'],
          description: 'Type of information to record',
        },
        profileData: {
          type: 'object',
          description: 'The data to record',
          properties: {
            key: { type: 'string', description: 'Identifier for this information' },
            value: { type: 'string', description: 'The information value' },
            context: { type: 'string', description: 'Context in which this was learned' },
          },
        },
      },
      required: ['dataType', 'profileData'],
    },
  },
  {
    type: 'function',
    name: 'emergency_notify_protocol',
    description: 'CRITICAL: Trigger emergency notification to caregivers. Use when the senior mentions emergencies, falls, severe pain, can\'t breathe, or asks to call 911.',
    parameters: {
      type: 'object',
      properties: {
        emergencyType: {
          type: 'string',
          description: 'Type of emergency (fall, medical, 911, chest_pain, breathing, etc.)',
        },
        seniorStatement: {
          type: 'string',
          description: 'Exact words the senior said that triggered this',
        },
        severity: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Severity level: 1=minor concern, 3=needs attention, 5=call 911',
        },
        additionalContext: {
          type: 'string',
          description: 'Any additional context from the conversation',
        },
      },
      required: ['emergencyType', 'seniorStatement', 'severity'],
    },
  },
];

class RealtimeService {
  private ws: WebSocket | null = null;
  private sessionConfig: RealtimeSessionConfig | null = null;
  private callbacks: RealtimeCallbacks = {};
  private audioRecording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isRecordingAudio: boolean = false;
  private isConnected: boolean = false;
  private isSpeaking: boolean = false;

  // Audio buffering for playback
  private audioChunks: string[] = [];
  private isPlayingAudio: boolean = false;

  // Senior context for function calls
  private currentSeniorId: string | null = null;

  // Pending function calls
  private pendingFunctionCalls: Map<string, { name: string; args: any }> = new Map();

  /**
   * Initialize a real-time voice session with your custom AI Buddy prompt
   * Prompt ID: pmpt_696464a11e8c8193b22df8bb67bd8f530cf75992db71453b (v7)
   */
  async startSession(seniorId: string, callbacks: RealtimeCallbacks): Promise<void> {
    try {
      console.log('🎙️ Starting Realtime session with custom AI Buddy prompt...');

      this.callbacks = callbacks;
      this.currentSeniorId = seniorId;

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Fetch senior context for personalized conversations
      let contextText = '';
      try {
        contextText = await sunnyContextService.getContextAsText(seniorId);
        console.log('📋 Context loaded for senior');
      } catch (e) {
        console.warn('Failed to load senior context:', e);
      }

      // Subscribe to caregiver instructions
      this.subscribeToInstructions(seniorId);

      // Call Cloud Function to create session
      const createSessionFn = firebaseFunctions.httpsCallable('createRealtimeSession');
      const result = await createSessionFn({
        seniorId,
        voice: 'shimmer', // Energetic, friendly female voice
        context: contextText, // Pass context for personalization
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

  /**
   * Subscribe to caregiver instructions for real-time relay
   */
  private instructionUnsubscribe: (() => void) | null = null;

  private subscribeToInstructions(seniorId: string): void {
    // Unsubscribe from previous if exists
    if (this.instructionUnsubscribe) {
      this.instructionUnsubscribe();
    }

    this.instructionUnsubscribe = sunnyCaregiverBridge.subscribeToInstructions(
      seniorId,
      async (instruction) => {
        console.log('📨 Received caregiver instruction:', instruction.type);

        // Relay important messages to Sunny in the conversation
        if (instruction.type === 'message' && this.isConnected) {
          const message = `Your caregiver sent you a message: "${instruction.instruction}"`;
          this.sendTextMessage(message);
        }

        // Mark as executed
        if (instruction.id) {
          await sunnyCaregiverBridge.markInstructionExecuted(seniorId, instruction.id);
        }
      }
    );
  }

  private async connectWebSocket(): Promise<void> {
    if (!this.sessionConfig) {
      throw new Error('No session config available');
    }

    return new Promise((resolve, reject) => {
      // Build WebSocket URL with model parameter
      // The client_secret is used as Authorization bearer token
      const wsUrl = `wss://api.openai.com/v1/realtime?model=${this.sessionConfig!.model}`;

      console.log('🔌 Connecting to WebSocket...');
      console.log('Session ID:', this.sessionConfig!.sessionId);

      // Note: React Native WebSocket may not support custom headers directly
      // If this fails, you may need to use a library like 'react-native-websocket'
      // For now, trying the standard approach
      try {
        // @ts-ignore - React Native WebSocket may accept headers in options
        this.ws = new WebSocket(wsUrl, undefined, {
          headers: {
            'Authorization': `Bearer ${this.sessionConfig!.clientSecret}`,
            'OpenAI-Beta': 'realtime=v1',
          },
        });
      } catch (e) {
        // Fallback: try without headers option (will likely fail auth)
        console.warn('WebSocket with headers failed, trying standard connection');
        this.ws = new WebSocket(wsUrl);
      }

      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('❌ WebSocket connection timeout');
          this.ws?.close();
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        clearTimeout(connectionTimeout);
        this.isConnected = true;
        this.callbacks.onConnected?.();

        // The session was already configured server-side with the prompt
        // Update session with tools and audio settings
        this.sendEvent({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            voice: this.sessionConfig!.voice || 'shimmer',
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
            // Add the 7 Sunny functions
            tools: SUNNY_TOOLS,
            tool_choice: 'auto',
          },
        });

        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? event.data : '';
          this.handleMessage(JSON.parse(data));
        } catch (e) {
          console.warn('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        clearTimeout(connectionTimeout);
        this.isConnected = false;
        this.callbacks.onError?.(new Error('WebSocket connection failed'));
        reject(error);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected', event.code, event.reason);
        clearTimeout(connectionTimeout);
        this.isConnected = false;
        this.callbacks.onDisconnected?.();
      };
    });
  }

  private handleMessage(message: any): void {
    // Only log non-audio messages to avoid spam
    if (message.type !== 'response.audio.delta') {
      console.log('📨 Received:', message.type);
    }

    switch (message.type) {
      case 'session.created':
        console.log('✅ Session created on server');
        break;

      case 'session.updated':
        console.log('✅ Session updated');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // User's speech transcription
        this.callbacks.onTranscript?.(message.transcript, true);
        break;

      case 'response.audio.delta':
        // AI voice audio chunk - buffer it
        if (message.delta) {
          this.audioChunks.push(message.delta);
          this.callbacks.onAudioDelta?.(message.delta);
          this.isSpeaking = true;
        }
        break;

      case 'response.audio_transcript.delta':
        // AI's speech transcription (streaming)
        this.callbacks.onTranscript?.(message.delta, false);
        break;

      case 'response.audio.done':
        // Audio response complete - play accumulated audio
        console.log('🔊 Audio response complete, playing...');
        this.playBufferedAudio();
        break;

      case 'response.done':
        // AI finished responding completely
        console.log('✅ Response complete');
        this.isSpeaking = false;
        this.callbacks.onResponseDone?.();
        break;

      case 'input_audio_buffer.speech_started':
        // User started speaking - interrupt AI if needed
        console.log('🎤 User speech detected');
        if (this.isSpeaking) {
          this.stopAudioPlayback();
        }
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('🎤 User speech ended');
        break;

      case 'error':
        console.error('Realtime API error:', message.error);
        this.callbacks.onError?.(new Error(message.error?.message || 'Unknown error'));
        break;

      // Function calling events
      case 'response.function_call_arguments.delta':
        // Function arguments streaming - accumulate if needed
        break;

      case 'response.function_call_arguments.done':
        // Function call complete - execute it
        console.log('🔧 Function call received:', message.name);
        this.handleFunctionCall(message);
        break;

      case 'response.output_item.done':
        // Check if this is a function call output
        if (message.item?.type === 'function_call') {
          console.log('🔧 Function call item done:', message.item.name);
        }
        break;
    }
  }

  /**
   * Handle function calls from OpenAI Realtime API
   */
  private async handleFunctionCall(message: any): Promise<void> {
    const { call_id, name, arguments: argsString } = message;

    if (!call_id || !name) {
      console.error('Invalid function call message:', message);
      return;
    }

    let args: any = {};
    try {
      args = argsString ? JSON.parse(argsString) : {};
    } catch (e) {
      console.error('Failed to parse function arguments:', argsString);
      this.sendFunctionError(call_id, 'Invalid function arguments');
      return;
    }

    console.log(`🔧 Executing Sunny function: ${name}`, args);
    this.callbacks.onFunctionCall?.(name, args);

    try {
      // Execute the function via Firebase Cloud Function
      const executeFn = firebaseFunctions.httpsCallable('executeSunnyFunction');
      const result = await executeFn({
        functionName: name,
        arguments: args,
        seniorId: this.currentSeniorId,
      });

      console.log(`✅ Function ${name} completed:`, result.data);
      this.callbacks.onFunctionResult?.(name, result.data);

      // Send the result back to OpenAI
      this.sendFunctionResult(call_id, result.data);

    } catch (error: any) {
      console.error(`❌ Function ${name} failed:`, error);
      this.sendFunctionError(call_id, error.message || 'Function execution failed');
    }
  }

  /**
   * Send function result back to OpenAI Realtime API
   */
  private sendFunctionResult(callId: string, result: any): void {
    // Create the function output item
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(result),
      },
    });

    // Trigger a response so the AI can speak the result
    this.sendEvent({
      type: 'response.create',
    });
  }

  /**
   * Send function error back to OpenAI Realtime API
   */
  private sendFunctionError(callId: string, errorMessage: string): void {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify({ error: errorMessage }),
      },
    });

    // Trigger a response so the AI can handle the error gracefully
    this.sendEvent({
      type: 'response.create',
    });
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
    if (this.isRecordingAudio) return;

    try {
      console.log('🎤 Starting recording...');

      const { recording: newRecording } = await Audio.Recording.createAsync({
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

      this.audioRecording = newRecording;
      this.isRecordingAudio = true;

      // Set up audio data callback (if supported)
      newRecording.setOnRecordingStatusUpdate((status) => {
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
    if (!this.isRecordingAudio || !this.audioRecording) return;

    try {
      console.log('🛑 Stopping recording...');

      await this.audioRecording.stopAndUnloadAsync();
      const uri = this.audioRecording.getURI();

      if (uri) {
        // Read the audio file as base64 using expo-file-system
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log('📤 Sending audio to Realtime API...');

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

        // Clean up temp file
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      this.audioRecording = null;
      this.isRecordingAudio = false;

    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Play all buffered audio chunks
   */
  private async playBufferedAudio(): Promise<void> {
    if (this.audioChunks.length === 0) {
      console.log('No audio to play');
      return;
    }

    try {
      this.isPlayingAudio = true;

      // Combine all audio chunks into one base64 string
      const combinedAudio = this.audioChunks.join('');
      this.audioChunks = []; // Clear buffer

      // OpenAI Realtime API sends PCM16 audio at 24kHz
      // We need to convert it to a playable format
      // Create a WAV file from PCM data
      const wavBase64 = this.createWavFromPcm16(combinedAudio);

      // Save to temp file
      const tempPath = `${FileSystem.cacheDirectory}buddy_response_${Date.now()}.wav`;
      await FileSystem.writeAsStringAsync(tempPath, wavBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Unload any previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: tempPath },
        { shouldPlay: true }
      );

      this.sound = sound;

      // Set up completion handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('✅ Audio playback finished');
          this.isPlayingAudio = false;
          this.isSpeaking = false;
          // Clean up temp file
          FileSystem.deleteAsync(tempPath, { idempotent: true }).catch(() => {});
        }
      });

    } catch (error) {
      console.error('Failed to play audio:', error);
      this.isPlayingAudio = false;
      this.isSpeaking = false;
    }
  }

  /**
   * Create a WAV file from PCM16 audio data
   * OpenAI Realtime API outputs PCM16 at 24kHz mono
   */
  private createWavFromPcm16(pcmBase64: string): string {
    const pcmData = base64ToArrayBuffer(pcmBase64);
    const pcmBytes = new Uint8Array(pcmData);

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmBytes.length;
    const headerSize = 44;
    const fileSize = headerSize + dataSize - 8;

    const wavBuffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(wavBuffer);

    // RIFF header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Copy PCM data
    const wavBytes = new Uint8Array(wavBuffer);
    wavBytes.set(pcmBytes, headerSize);

    return arrayBufferToBase64(wavBuffer);
  }

  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /**
   * Stop audio playback (e.g., when user interrupts)
   */
  private async stopAudioPlayback(): Promise<void> {
    try {
      this.audioChunks = []; // Clear any pending audio

      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.isPlayingAudio = false;
      this.isSpeaking = false;

      // Cancel the current response
      this.interrupt();
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }

  /**
   * Stop the session and cleanup
   */
  async stopSession(): Promise<void> {
    console.log('🛑 Stopping Realtime session...');

    if (this.isRecordingAudio) {
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

    // Clean up caregiver instruction subscription
    if (this.instructionUnsubscribe) {
      this.instructionUnsubscribe();
      this.instructionUnsubscribe = null;
    }

    this.sessionConfig = null;
    this.callbacks = {};
    this.currentSeniorId = null;
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

  /**
   * Check if connected to Realtime API
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Check if AI is currently speaking
   */
  get speaking(): boolean {
    return this.isSpeaking || this.isPlayingAudio;
  }

  /**
   * Check if currently recording
   */
  get recording(): boolean {
    return this.isRecordingAudio;
  }
}

export const realtimeService = new RealtimeService();
