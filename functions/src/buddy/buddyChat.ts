/**
 * AI Buddy Cloud Function - Upgraded with Model Router and Module Architecture
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  assembleContext,
  buildSystemPrompt,
  callModel,
  logEvent,
  processSafety,
  saveMemory,
  verifySeniorVoice
} from '../ai';

/**
 * Buddy Chat Cloud Function
 * Handles all AI Buddy conversations with the new upgraded architecture
 * Optimized for voice-to-voice modality
 */
export const buddyChat = functions.https.onCall(
  async (
    data: {
      seniorId: string;
      message: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
      metadata?: any;
    },
    context
  ) => {
    const { seniorId, message, conversationHistory = [], metadata = {} } = data;

    try {
      // 1. Assemble full context from Firestore
      const seniorContext = await assembleContext(seniorId);

      // 2. Build upgraded prompt stack with enhanced context
      const systemPrompt = buildSystemPrompt({
        product_mode: seniorContext.productMode as 'BASIC' | 'BUDDY_PLUS',
        logging_level: seniorContext.loggingLevel,

        // Senior profile
        preferred_name: seniorContext.profile.preferredAddress,
        cognitive_level: seniorContext.cognitiveLevel,
        cognitive_band: seniorContext.cognitiveBand,
        tone_preference: seniorContext.tone,
        custom_tone_notes: seniorContext.customToneNotes,

        // Settings
        quiet_hours: seniorContext.quietHours,
        shared_room_mode: seniorContext.sharedRoomMode,
        privacy_mode: seniorContext.privacyMode,
        avoidance_style: seniorContext.avoidanceStyle,

        // Care context
        avoidance_rules: seniorContext.avoidanceRules,
        meds_today: seniorContext.medsToday,
        appointments_next_48h: seniorContext.appointmentsNext48h,
        reminders_active: seniorContext.remindersActive,
        memory_items: seniorContext.memoryItems,
        last_report_summary: seniorContext.lastReportSummary,

        // Escalation
        escalation_triggers: seniorContext.escalationTriggers,
        auto_notify: seniorContext.autoNotify
      });

      // Add voice-specific instructions
      const voiceSystemPrompt = systemPrompt + "\n\nCRITICAL: You are interacting via VOICE. Keep responses concise, conversational, and easy to understand when spoken aloud. Avoid long lists or complex formatting.";

      // 3. Prepare messages for the model
      const messages = [
        ...conversationHistory,
        { role: 'user' as const, content: message }
      ];

      // 4. Call model via router (using configured provider, defaults to Gemini 2.0 Flash)
      const provider = seniorContext.aiProvider || 'gemini';
      const model = seniorContext.aiModel || (
        provider === 'gemini' ? 'gemini-2.0-flash-exp' :
        provider === 'openai' ? 'gpt-4-turbo-preview' :
        provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' :
        undefined
      );

      const modelResponseText = await callModel({
        provider: provider as any,
        model,
        seniorId,
        messages,
        system: voiceSystemPrompt,
        jsonOnly: true
      });

      // 5. Parse structured JSON response
      let assistantOutput;
      try {
        assistantOutput = JSON.parse(modelResponseText);
      } catch (e) {
        console.error('Failed to parse model response as JSON:', modelResponseText);
        assistantOutput = {
          assistant_text: "I'm having a little trouble thinking clearly right now. Could you repeat that?",
          tone: "calm",
          actions: []
        };
      }

      // 6. Voice Verification Gate
      const isVerified = verifySeniorVoice(metadata);

      // 7. Post-processing: Logging, Safety, Memory
      if (isVerified) {
        // Logging Engine
        if (assistantOutput.log_payload) {
          await logEvent(seniorId, assistantOutput.log_payload, seniorContext.loggingLevel);
        }

        // Safety Gate
        await processSafety(seniorId, assistantOutput);

        // Memory Manager (if Buddy+)
        if (seniorContext.productMode === 'BUDDY_PLUS' && assistantOutput.actions) {
          const memoryAction = assistantOutput.actions.find((a: any) => a.type === 'update_memory');
          if (memoryAction) {
            await saveMemory(seniorId, memoryAction.payload);
          }
        }
      }

      // 8. Save conversation to Firestore (legacy support & auditing)
      const db = admin.firestore();
      const batch = db.batch();
      
      const chatRef = db.collection('seniors').doc(seniorId).collection('buddyChats').doc();
      batch.set(chatRef, {
        sender: 'senior',
        text: message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        verified: isVerified
      });

      const replyRef = db.collection('seniors').doc(seniorId).collection('buddyChats').doc();
      batch.set(replyRef, {
        sender: 'buddy',
        text: assistantOutput.assistant_text,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          tone: assistantOutput.tone,
          actions: assistantOutput.actions
        }
      });

      await batch.commit();

      // 9. Return response in the format the mobile app expects
      return {
        reply: assistantOutput.assistant_text,
        tone: assistantOutput.tone,
        actions: assistantOutput.actions,
        flags: assistantOutput.actions?.filter((a: any) => a.type === 'notify_caregiver') || []
      };

    } catch (error) {
      console.error('Error in upgraded buddyChat:', error);
      throw new functions.https.HttpsError('internal', 'Failed to process chat message');
    }
  }
);