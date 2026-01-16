#!/usr/bin/env node
/**
 * Buddy Chat Test Script
 *
 * Tests the Sunny AI voice conversation system including:
 * - OpenAI Realtime API connection
 * - Function calling (weather, news, medications, etc.)
 * - Text conversations
 *
 * Usage:
 *   node scripts/test-buddy-chat.js
 *
 * Requirements:
 *   - OPENAI_API_KEY in environment
 */

const WebSocket = require('ws');

// Test configuration
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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`→ ${message}`, 'cyan');
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'yellow');
  console.log('='.repeat(60));
}

// ============================================================================
// Test 1: Check OpenAI API Key
// ============================================================================

function testOpenAIKey() {
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
// Test 2: Test OpenAI Realtime API Connection
// ============================================================================

function testRealtimeAPIConnection() {
  section('Test 2: OpenAI Realtime API Connection');

  if (!OPENAI_API_KEY) {
    error('Skipping - no API key');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
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

    ws.on('message', (data) => {
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

    ws.on('error', (err) => {
      clearTimeout(timeout);
      error(`WebSocket error: ${err.message}`);
      resolve(false);
    });
  });
}

// ============================================================================
// Test 3: Test Text Conversation Flow
// ============================================================================

function testTextConversation() {
  section('Test 3: Text Conversation with Sunny');

  if (!OPENAI_API_KEY) {
    error('Skipping - no API key');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
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

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'session.updated' && !sessionReady) {
        sessionReady = true;
        success('Session ready, sending test message...');
        info('User: "Hello Sunny, how are you today?"');

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

    ws.on('error', (err) => {
      clearTimeout(timeout);
      error(`WebSocket error: ${err.message}`);
      resolve(false);
    });
  });
}

// ============================================================================
// Test 4: Test Function Calling (Weather)
// ============================================================================

function testFunctionCalling() {
  section('Test 4: Function Calling (Weather)');

  if (!OPENAI_API_KEY) {
    error('Skipping - no API key');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
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

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'session.updated' && !sessionReady) {
        sessionReady = true;
        success('Session ready with tools');
        info('User: "What\'s the weather like in San Francisco?"');

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
          humidity: 55,
          windSpeed: 12,
          forecast: 'Pleasant day with mild temperatures',
          location: 'San Francisco, CA',
        };

        info('Returning weather data to Sunny...');

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

    ws.on('error', (err) => {
      clearTimeout(timeout);
      error(`WebSocket error: ${err.message}`);
      resolve(false);
    });
  });
}

// ============================================================================
// Test 5: Test Multiple Functions (Medications)
// ============================================================================

function testMedicationFunction() {
  section('Test 5: Function Calling (Medications)');

  if (!OPENAI_API_KEY) {
    error('Skipping - no API key');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
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
        error('Medication function test timed out');
        ws.close();
        resolve(false);
      }
    }, 30000);

    ws.on('open', () => {
      info('Connected, configuring session with medication tools...');

      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text'],
          instructions: 'You are Sunny. When asked about medications, use the integrate_eldercare_features function with featureType="medication".',
          tools: [
            {
              type: 'function',
              name: 'integrate_eldercare_features',
              description: 'Integrate with eldercare features like medications, reminders, appointments',
              parameters: {
                type: 'object',
                properties: {
                  featureType: {
                    type: 'string',
                    enum: ['medication', 'reminder', 'appointment', 'message', 'contact'],
                    description: 'The type of eldercare feature',
                  },
                  action: {
                    type: 'string',
                    enum: ['get', 'add', 'update', 'confirm'],
                    description: 'The action to perform',
                  },
                },
                required: ['featureType', 'action'],
              },
            },
          ],
          tool_choice: 'auto',
        },
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'session.updated' && !sessionReady) {
        sessionReady = true;
        success('Session ready with medication tools');
        info('User: "What medications do I need to take today?"');

        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: 'What medications do I need to take today?' }],
          },
        }));

        ws.send(JSON.stringify({
          type: 'response.create',
          response: { modalities: ['text'] },
        }));
      }

      if (message.type === 'response.function_call_arguments.done') {
        functionCalled = true;
        success('Function called: integrate_eldercare_features');
        info(`Arguments: ${message.arguments}`);

        // Send function result back
        const callId = message.call_id;
        const medsResult = {
          success: true,
          medications: [
            { name: 'Lisinopril', dosage: '10mg', time: '8:00 AM', taken: false },
            { name: 'Metformin', dosage: '500mg', time: '8:00 AM', taken: false },
            { name: 'Aspirin', dosage: '81mg', time: '8:00 AM', taken: true },
          ],
          message: 'You have 3 medications scheduled for today',
        };

        info('Returning medication data to Sunny...');

        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify(medsResult),
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
        success('Medication function flow completed successfully');
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

    ws.on('error', (err) => {
      clearTimeout(timeout);
      error(`WebSocket error: ${err.message}`);
      resolve(false);
    });
  });
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║         SILVERGUARD BUDDY CHAT TEST SUITE                  ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');

  const results = [];

  // Run all tests
  results.push({ name: 'OpenAI API Key', passed: testOpenAIKey() });
  results.push({ name: 'Realtime API Connection', passed: await testRealtimeAPIConnection() });
  results.push({ name: 'Text Conversation', passed: await testTextConversation() });
  results.push({ name: 'Function Calling (Weather)', passed: await testFunctionCalling() });
  results.push({ name: 'Function Calling (Medications)', passed: await testMedicationFunction() });

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
    console.log('\n');
    info('If tests failed due to missing API key:');
    info('  export OPENAI_API_KEY=sk-your-key-here');
    info('  node scripts/test-buddy-chat.js');
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
