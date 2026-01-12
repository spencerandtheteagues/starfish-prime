/*
 * modelRouter.ts
 *
 * This module defines a simple model routing abstraction. In a production
 * implementation this would support multiple LLM providers (e.g. OpenAI,
 * Anthropic, Google Gemini) and handle budget limits, timeouts and fallbacks.
 * The default implementation here simply forwards the given messages to the
 * configured provider.  Keys and provider names must never be stored in
 * client apps; they are expected to be provided via Firebase Functions
 * configuration or environment variables.
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

interface CallModelOptions {
  provider?: 'openai' | 'anthropic' | 'gemini';
  model?: string;
  messages: Message[];
  jsonOnly?: boolean;
  timeoutMs?: number;
  budget?: number;
}

/**
 * callModel
 *
 * Routes a call to the configured model provider. This minimal implementation
 * supports OpenAI's chat API. Additional providers can be added by
 * extending the switch statement.
 */
export async function callModel(options: CallModelOptions): Promise<string> {
  const provider = options.provider || process.env.LLM_PROVIDER || 'gemini';
  const model = options.model || process.env.LLM_MODEL || 'gemini-2.0-flash-exp';

  switch (provider) {
    case 'gemini': {
      // Prefer GEMINI_API_KEY, fallback to GOOGLE_API_KEY
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY not configured');

      const genAI = new GoogleGenerativeAI(apiKey);

      // Extract system instruction if present
      const systemMessage = options.messages.find(m => m.role === 'system');
      const history = options.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      // The last message is the new prompt for the chat session, 
      // but if we are doing a single generation, we might pass the whole history differently.
      // For simplicity in this "stateless" router, we'll treat the last user message as the prompt
      // and the rest as history.
      
      const lastMessage = history.pop();
      if (!lastMessage || lastMessage.role !== 'user') {
        // Fallback: if no user message at end, just send the whole thing as prompt (rare)
        const generativeModel = genAI.getGenerativeModel({ 
            model,
            systemInstruction: systemMessage?.content 
        });
        const result = await generativeModel.generateContent({
             contents: options.messages.map(m => ({
                 role: m.role === 'assistant' ? 'model' : 'user',
                 parts: [{ text: m.content }]
             })) 
        });
        return result.response.text();
      }

      const generativeModel = genAI.getGenerativeModel({
        model,
        systemInstruction: systemMessage?.content,
        generationConfig: {
            temperature: 0.2,
            ...(options.jsonOnly ? { responseMimeType: "application/json" } : {})
        }
      });

      const chatSession = generativeModel.startChat({
        history: history,
      });

      const result = await chatSession.sendMessage(lastMessage.parts[0].text);
      return result.response.text();
    }

    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model,
        messages: options.messages as any,
        temperature: 0.2,
        ...(options.jsonOnly ? { response_format: { type: "json_object" } } : {})
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from model');
      return content;
    }
    
    case 'anthropic': {
       throw new Error('Anthropic provider not yet implemented in this simplified router.');
    }

    default:
      throw new Error(`Unsupported model provider: ${provider}`);
  }
}