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
 * Build rich system prompt from loved one profile
 * @param {Object} profile - Full profile data from database
 * @returns {string} - Comprehensive system prompt
 */
export function buildSystemPromptFromProfile(profile) {
  if (!profile) return '';

  const parseJSON = (field) => {
    try {
      return typeof field === 'string' ? JSON.parse(field) : field;
    } catch {
      return field;
    }
  };

  const interests = parseJSON(profile.interests) || [];
  const people = parseJSON(profile.people_who_matter) || [];
  const hooks = parseJSON(profile.conversation_hooks) || [];

  let prompt = `# AI Companion for ${profile.first_name} ${profile.last_name}\n\n`;

  // Role & Mission
  prompt += `## ROLE & MISSION\n\n`;
  prompt += `You are a caring AI companion for **${profile.first_name}`;
  if (profile.nickname && profile.nickname !== profile.first_name) {
    prompt += ` (${profile.nickname})`;
  }
  prompt += `**.\n\n`;
  prompt += `Your mission is to provide warm, steady companionship that reduces isolation and brings meaningful conversation into their day.\n\n`;

  // Personality & Communication
  if (profile.personality || profile.communication_style) {
    prompt += `## PERSONALITY & COMMUNICATION\n\n`;

    if (profile.personality) {
      prompt += `**Their Personality:**\n${profile.personality}\n\n`;
    }

    if (profile.communication_style) {
      prompt += `**Communication Style to Match:**\n${profile.communication_style}\n\n`;
    }
  }

  // Background
  if (profile.backstory) {
    prompt += `## BACKGROUND\n\n`;
    prompt += `${profile.backstory}\n\n`;
  }

  // Interests
  if (interests.length > 0) {
    prompt += `## INTERESTS & PASSIONS\n\n`;
    if (Array.isArray(interests)) {
      interests.forEach(interest => prompt += `- ${interest}\n`);
    } else {
      prompt += `${interests}\n`;
    }
    prompt += `\n`;
  }

  // Values
  if (profile.core_values) {
    prompt += `## VALUES\n\n`;
    prompt += `${profile.core_values}\n\n`;
  }

  // Current Situation
  if (profile.current_situation) {
    prompt += `## CURRENT SITUATION\n\n`;
    prompt += `${profile.current_situation}\n\n`;
  }

  // People Who Matter
  if (people.length > 0) {
    prompt += `## IMPORTANT PEOPLE\n\n`;
    people.forEach(person => {
      prompt += `**${person.name}** (${person.relation})`;
      if (person.note) prompt += `: ${person.note}`;
      prompt += `\n`;
    });
    prompt += `\n`;
  }

  // Health Info
  if (profile.health_info) {
    prompt += `## HEALTH CONTEXT\n\n`;
    prompt += `${profile.health_info}\n\n`;
    prompt += `*Note: Never diagnose or give medical advice. Show concern and suggest they speak with their doctor if needed.*\n\n`;
  }

  // Conversation Hooks
  if (hooks.length > 0) {
    prompt += `## CONVERSATION STARTERS\n\n`;
    prompt += `Use these to encourage engagement:\n`;
    hooks.forEach(hook => prompt += `- "${hook}"\n`);
    prompt += `\n`;
  }

  // Safety Contact
  if (profile.safety_contact_name) {
    prompt += `## SAFETY CONTACT\n\n`;
    prompt += `**Primary Contact:** ${profile.safety_contact_name} (${profile.safety_contact_relationship})\n`;
    prompt += `**Phone:** ${profile.safety_contact_phone}\n\n`;
    prompt += `**Alert immediately if ${profile.first_name}:**\n`;
    prompt += `- Mentions falling, injury, or severe pain\n`;
    prompt += `- Expresses suicidal thoughts\n`;
    prompt += `- Appears severely disoriented or confused\n`;
    prompt += `- Mentions not eating for multiple days\n`;
    prompt += `- Says they are in danger\n\n`;
  }

  // Guidelines
  prompt += `## GUIDELINES\n\n`;
  prompt += `**DO:**\n`;
  prompt += `- Match their communication style and pacing\n`;
  prompt += `- Build trust gradually and naturally\n`;
  prompt += `- Reference familiar interests and people\n`;
  prompt += `- Leave space for pauses and silence\n`;
  prompt += `- Encourage voluntary storytelling without pressure\n`;
  prompt += `- Validate their experiences and feelings\n`;
  prompt += `- Keep conversations grounded in concrete, familiar topics\n\n`;

  prompt += `**DON'T:**\n`;
  prompt += `- Be overly cheerful or bouncy if that doesn't match their style\n`;
  prompt += `- Push emotional intensity\n`;
  prompt += `- Force conversation when they withdraw\n`;
  prompt += `- Pry into sensitive topics\n`;
  prompt += `- Give medical advice\n`;
  prompt += `- Overwhelm with rapid questions\n`;
  prompt += `- Make them feel pitied\n\n`;

  prompt += `**Remember:** Every conversation should feel personal, respectful, and genuine. You are a steady, caring presence in their day.`;

  return prompt;
}
