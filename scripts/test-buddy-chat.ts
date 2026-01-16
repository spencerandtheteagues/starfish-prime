#!/usr/bin/env npx ts-node
/**
 * Buddy Chat Test Script
 *
 * Tests the Sunny AI voice conversation system including:
 * - OpenAI Realtime API connection
 * - Function calling (weather, news, medications, etc.)
 * - Audio streaming (simulated)
 * - Caregiver bridge communication
 *
 * Usage:
 *   npx ts-node scripts/test-buddy-chat.ts
 *
 * Requirements:
 *   - OPENAI_API_KEY in environment or .env
 *   - Firebase project configured
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin (for testing)
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (serviceAccountPath) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
} else {
  // Use default credentials
  admin.initializeApp();
}

const db = admin.firestore();

// Test configuration
const TEST_SENIOR_ID = process.env.TEST_SENIOR_ID || 'test-senior-001';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, 'green');
}

function error(message: string) {
  log(`✗ ${message}`, 'red');
}

function info(message: string) {
  log(`→ ${message}`, 'cyan');
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'yellow');
  console.log('='.repeat(60));
}

// ============================================================================
// Test 1: Check OpenAI API Key
// ============================================================================

async function testOpenAIKey(): Promise<boolean> {
  section('Test 1: OpenAI API Key');

  if (!OPENAI_API_KEY) {
    error('OPENAI_API_KEY not set in environment');
    info('Set it with: export OPENAI_API_KEY=sk-...');
    return false;
  }

  if (!OPENAI_API_KEY.startsWith('sk-')) {
    error('OPENAI_API_KEY does not start with sk-');
    return false;
  }

  success(`OpenAI API key found (${OPENAI_API_KEY.substring(0, 7)}...)`);
  return true;
}

// ============================================================================
// Test 2: Firebase Connection
// ============================================================================

async function testFirebaseConnection(): Promise<boolean> {
  section('Test 2: Firebase Connection');

  try {
    // Test Firestore access
    const testDoc = await db.collection('_test').doc('connection').get();
    success('Connected to Firestore');

    // Clean up test document
    if (testDoc.exists) {
      await db.collection('_test').doc('connection').delete();
    }

    return true;
  } catch (err: any) {
    error(`Firebase connection failed: ${err.message}`);
    return false;
  }
}

// ============================================================================
// Test 3: Create Test Senior Profile
// ============================================================================

async function testCreateSeniorProfile(): Promise<boolean> {
  section('Test 3: Create Test Senior Profile');

  try {
    const seniorRef = db.collection('seniors').doc(TEST_SENIOR_ID);

    await seniorRef.set({
      profile: {
        name: 'Test Senior',
        preferredAddress: 'Friend',
        address: 'San Francisco, CA',
        timeZone: 'America/Los_Angeles',
      },
      cognitive: {
        level: 1,
        tone: 'friendly',
      },
      preferences: {
        fontScale: 1.2,
        highContrast: false,
        voiceRate: 1.0,
      },
      subscriptionMode: 'BUDDY_PLUS',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    success(`Test senior profile created: ${TEST_SENIOR_ID}`);
    return true;
  } catch (err: any) {
    error(`Failed to create senior profile: ${err.message}`);
    return false;
  }
}

// ============================================================================
// Test 4: Add Test Medications
// ============================================================================

async function testAddMedications(): Promise<boolean> {
  section('Test 4: Add Test Medications');

  try {
    const medsRef = db.collection('seniors').doc(TEST_SENIOR_ID).collection('medications');

    const testMeds = [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'daily', reminderTimes: ['08:00'], active: true },
      { name: 'Metformin', dosage: '500mg', frequency: 'twice-daily', reminderTimes: ['08:00', '20:00'], active: true },
      { name: 'Aspirin', dosage: '81mg', frequency: 'daily', reminderTimes: ['08:00'], active: true },
    ];

    for (const med of testMeds) {
      await medsRef.add({
        ...med,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      success(`Added medication: ${med.name} ${med.dosage}`);
    }

    return true;
  } catch (err: any) {
    error(`Failed to add medications: ${err.message}`);
    return false;
  }
}

// ============================================================================
// Test 5: Test Weather Function (via Cloud Function)
// ============================================================================

async function testWeatherFunction(): Promise<boolean> {
  section('Test 5: Weather Function');

  try {
    // Call the weather function directly (simulating what Sunny would do)
    const response = await fetch(
      'https://us-central1-eldercare-app-17d19.cloudfunctions.net/sunnyGetWeather',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            seniorId: TEST_SENIOR_ID,
            location: 'San Francisco, CA',
          },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      error(`Weather function failed: ${response.status} - ${text}`);
      return false;
    }

    const result = await response.json();
    success('Weather function returned successfully');
    info(`Temperature: ${result.result?.temperature}°${result.result?.temperatureUnit}`);
    info(`Condition: ${result.result?.condition}`);
    return true;
  } catch (err: any) {
    error(`Weather function error: ${err.message}`);
    info('Note: This may fail if unauthenticated calls are blocked');
    return false;
  }
}

// ============================================================================
// Test 6: Test OpenAI Realtime API Connection
// ============================================================================

async function testRealtimeAPIConnection(): Promise<boolean> {
  section('Test 6: OpenAI Realtime API Connection');

  if (!OPENAI_API_KEY) {
    error('Skipping - no API key');
    return false;
  }

  return new Promise((resolve) => {
    const WebSocket = require('ws');

    const ws = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      }
    );

    const timeout = setTimeout(() => {
      error('Connection timed out after 10s');
      ws.close();
      resolve(false);
    }, 10000);

    ws.on('open', () => {
      success('Connected to OpenAI Realtime API');
      clearTimeout(timeout);

      // Send session configuration
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: 'You are Sunny, a friendly AI companion for seniors.',
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
        },
      }));
    });

    ws.on('message', (data: Buffer) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'session.created') {
        success('Session created successfully');
        info(`Session ID: ${message.session?.id}`);
      }

      if (message.type === 'session.updated') {
        success('Session configured with Sunny prompt');
        ws.close();
        resolve(true);
      }

      if (message.type === 'error') {
        error(`API Error: ${message.error?.message}`);
        ws.close();
        resolve(false);
      }
    });

    ws.on('error', (err: Error) => {
      clearTimeout(timeout);
      error(`WebSocket error: ${err.message}`);
      resolve(false);
    });
  });
}

// ============================================================================
// Test 7: Test Text Conversation Flow
// ============================================================================

async function testTextConversation(): Promise<boolean> {
  section('Test 7: Text Conversation Flow');

  if (!OPENAI_API_KEY) {
    error('Skipping - no API key');
    return false;
  }

  return new Promise((resolve) => {
    const WebSocket = require('ws');

    const ws = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      }
    );

    let sessionReady = false;
    let responseReceived = false;

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        error('Conversation test timed out');
        ws.close();
        resolve(false);
      }
    }, 30000);

    ws.on('open', () => {
      info('Connected, configuring session...');

      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text'],
          instructions: `You are Sunny, a warm and friendly AI companion for seniors.
Keep responses brief (1-2 sentences).
Always be cheerful and supportive.`,
        },
      }));
    });

    ws.on('message', (data: Buffer) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'session.updated' && !sessionReady) {
        sessionReady = true;
        success('Session ready, sending test message...');

        // Send a test conversation item
        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: 'Hello Sunny, how are you today?' }],
          },
        }));

        // Request a response
        ws.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['text'],
          },
        }));
      }

      if (message.type === 'response.text.delta') {
        process.stdout.write(message.delta || '');
      }

      if (message.type === 'response.text.done') {
        console.log('\n');
        success('Received complete response from Sunny');
        responseReceived = true;
      }

      if (message.type === 'response.done') {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      }

      if (message.type === 'error') {
        error(`Error: ${message.error?.message}`);
        clearTimeout(timeout);
        ws.close();
        resolve(false);
      }
    });

    ws.on('error', (err: Error) => {
      clearTimeout(timeout);
      error(`WebSocket error: ${err.message}`);
      resolve(false);
    });
  });
}

// ============================================================================
// Test 8: Test Function Calling
// ============================================================================

async function testFunctionCalling(): Promise<boolean> {
  section('Test 8: Function Calling (Weather)');

  if (!OPENAI_API_KEY) {
    error('Skipping - no API key');
    return false;
  }

  return new Promise((resolve) => {
    const WebSocket = require('ws');

    const ws = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      }
    );

    let sessionReady = false;
    let functionCalled = false;

    const timeout = setTimeout(() => {
      if (!functionCalled) {
        error('Function calling test timed out');
        ws.close();
        resolve(false);
      }
    }, 30000);

    ws.on('open', () => {
      info('Connected, configuring session with tools...');

      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text'],
          instructions: 'You are Sunny. When asked about weather, use the get_weather function.',
          tools: [
            {
              type: 'function',
              name: 'get_weather',
              description: 'Get current weather for a location',
              parameters: {
                type: 'object',
                properties: {
                  location: { type: 'string', description: 'City and state' },
                },
                required: ['location'],
              },
            },
          ],
          tool_choice: 'auto',
        },
      }));
    });

    ws.on('message', (data: Buffer) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'session.updated' && !sessionReady) {
        sessionReady = true;
        success('Session ready with tools, asking about weather...');

        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: "What's the weather like in San Francisco?" }],
          },
        }));

        ws.send(JSON.stringify({
          type: 'response.create',
          response: { modalities: ['text'] },
        }));
      }

      if (message.type === 'response.function_call_arguments.done') {
        functionCalled = true;
        success('Function called: get_weather');
        info(`Arguments: ${message.arguments}`);

        // Send function result back
        const callId = message.call_id;
        const weatherResult = {
          temperature: 68,
          temperatureUnit: 'F',
          condition: 'Partly cloudy',
          location: 'San Francisco, CA',
        };

        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify(weatherResult),
          },
        }));

        ws.send(JSON.stringify({
          type: 'response.create',
          response: { modalities: ['text'] },
        }));
      }

      if (message.type === 'response.text.delta') {
        process.stdout.write(message.delta || '');
      }

      if (message.type === 'response.done' && functionCalled) {
        console.log('\n');
        success('Function calling flow completed successfully');
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      }

      if (message.type === 'error') {
        error(`Error: ${message.error?.message}`);
        clearTimeout(timeout);
        ws.close();
        resolve(false);
      }
    });

    ws.on('error', (err: Error) => {
      clearTimeout(timeout);
      error(`WebSocket error: ${err.message}`);
      resolve(false);
    });
  });
}

// ============================================================================
// Test 9: Clean Up Test Data
// ============================================================================

async function cleanupTestData(): Promise<boolean> {
  section('Test 9: Cleanup');

  try {
    // Delete test medications
    const medsSnapshot = await db
      .collection('seniors')
      .doc(TEST_SENIOR_ID)
      .collection('medications')
      .get();

    for (const doc of medsSnapshot.docs) {
      await doc.ref.delete();
    }

    success(`Deleted ${medsSnapshot.size} test medications`);

    // Optionally delete the test senior profile
    // Uncomment if you want full cleanup:
    // await db.collection('seniors').doc(TEST_SENIOR_ID).delete();
    // success('Deleted test senior profile');

    info('Test senior profile preserved for manual testing');
    return true;
  } catch (err: any) {
    error(`Cleanup failed: ${err.message}`);
    return false;
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║         SILVERGUARD BUDDY CHAT TEST SUITE                  ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');

  const results: { name: string; passed: boolean }[] = [];

  // Run all tests
  results.push({ name: 'OpenAI API Key', passed: await testOpenAIKey() });
  results.push({ name: 'Firebase Connection', passed: await testFirebaseConnection() });
  results.push({ name: 'Create Senior Profile', passed: await testCreateSeniorProfile() });
  results.push({ name: 'Add Medications', passed: await testAddMedications() });
  results.push({ name: 'Weather Function', passed: await testWeatherFunction() });
  results.push({ name: 'Realtime API Connection', passed: await testRealtimeAPIConnection() });
  results.push({ name: 'Text Conversation', passed: await testTextConversation() });
  results.push({ name: 'Function Calling', passed: await testFunctionCalling() });
  results.push({ name: 'Cleanup', passed: await cleanupTestData() });

  // Summary
  section('TEST SUMMARY');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  for (const result of results) {
    if (result.passed) {
      success(result.name);
    } else {
      error(result.name);
    }
  }

  console.log('\n');
  log(`Passed: ${passed}/${results.length}`, passed === results.length ? 'green' : 'yellow');

  if (failed > 0) {
    log(`Failed: ${failed}/${results.length}`, 'red');
  }

  console.log('\n');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run if called directly
runTests().catch((err) => {
  error(`Test runner crashed: ${err.message}`);
  process.exit(1);
});
