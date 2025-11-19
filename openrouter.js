import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Chat with LLM using OpenRouter API
 * @param {Array} messages - Array of message objects {role, content}
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Response with message content
 */
export async function chatWithLLM(messages, options = {}) {
  const {
    model = 'anthropic/claude-3.5-sonnet',
    systemPrompt = '',
    systemPromptFile = '',
  } = options;

  // Check API key
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Build conversation history
  let conversationHistory = [];

  // Add system prompt if provided
  if (systemPromptFile) {
    try {
      const filePath = path.isAbsolute(systemPromptFile)
        ? systemPromptFile
        : path.join(process.cwd(), systemPromptFile);
      const promptContent = fs.readFileSync(filePath, 'utf-8').trim();
      conversationHistory.push({
        role: 'system',
        content: promptContent
      });
    } catch (error) {
      console.error(`Failed to read system prompt file: ${systemPromptFile}`);
      throw new Error(`Failed to read system prompt file: ${error.message}`);
    }
  } else if (systemPrompt) {
    conversationHistory.push({
      role: 'system',
      content: systemPrompt
    });
  }

  // Add message history
  conversationHistory = [...conversationHistory, ...messages];

  try {
    // Call OpenRouter API
    const response = await axios.post(
      API_URL,
      {
        model: model,
        messages: conversationHistory
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
          'X-Title': 'LoneSomeNoMore API'
        }
      }
    );

    const assistantMessage = response.data.choices[0].message;

    return {
      success: true,
      message: assistantMessage,
      usage: response.data.usage
    };

  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);

    throw {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get response from LLM',
      details: error.response?.data
    };
  }
}

/**
 * Build system prompt from loved one profile
 * @param {Object} lovedOneProfile - Profile data
 * @returns {string} - System prompt
 */
export function buildSystemPromptFromProfile(lovedOneProfile) {
  if (!lovedOneProfile) return '';

  const { first_name, nickname, interests, life_story } = lovedOneProfile;

  let prompt = `You are a warm, friendly AI companion having a conversation with ${first_name}`;

  if (nickname) {
    prompt += ` (who prefers to be called ${nickname})`;
  }

  prompt += '.\n\n';

  if (life_story) {
    try {
      const story = typeof life_story === 'string' ? JSON.parse(life_story) : life_story;
      prompt += `Background: ${story.career || ''}\n`;
      prompt += `Achievements: ${story.achievements || ''}\n\n`;
    } catch (e) {
      if (typeof life_story === 'string') {
        prompt += `Background: ${life_story}\n\n`;
      }
    }
  }

  if (interests) {
    try {
      const interestsList = typeof interests === 'string' ? JSON.parse(interests) : interests;
      if (Array.isArray(interestsList)) {
        prompt += `Interests: ${interestsList.join(', ')}\n\n`;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  prompt += `Guidelines:
- Be warm, patient, and genuinely interested
- Ask about their day and interests
- Share engaging stories when appropriate
- Keep responses conversational and natural
- Be respectful and considerate
- Listen actively and remember previous conversation topics`;

  return prompt;
}
