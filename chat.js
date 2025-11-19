#!/usr/bin/env node

import readline from 'readline';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || 'anthropic/claude-3.5-sonnet';
const SYSTEM_PROMPT_FILE = process.env.SYSTEM_PROMPT_FILE || '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Load system prompt from file or environment variable
let SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || '';
let systemPromptSource = '';

if (SYSTEM_PROMPT_FILE) {
  try {
    const filePath = path.isAbsolute(SYSTEM_PROMPT_FILE)
      ? SYSTEM_PROMPT_FILE
      : path.join(process.cwd(), SYSTEM_PROMPT_FILE);
    SYSTEM_PROMPT = fs.readFileSync(filePath, 'utf-8').trim();
    systemPromptSource = SYSTEM_PROMPT_FILE;
  } catch (error) {
    console.log('\n\x1b[31m╔═════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[31m║\x1b[0m  \x1b[1m\x1b[31m⚠  File Error\x1b[0m                                               \x1b[31m║\x1b[0m');
    console.log('\x1b[31m╠═════════════════════════════════════════════════════════════╣\x1b[0m');
    console.log('\x1b[31m║\x1b[0m  \x1b[37mCould not read system prompt file:\x1b[0m                          \x1b[31m║\x1b[0m');
    console.log(`\x1b[31m║\x1b[0m  \x1b[33m${SYSTEM_PROMPT_FILE.substring(0, 55).padEnd(55)}\x1b[0m  \x1b[31m║\x1b[0m`);
    console.log('\x1b[31m║\x1b[0m                                                               \x1b[31m║\x1b[0m');
    console.log(`\x1b[31m║\x1b[0m  \x1b[90m${error.message.substring(0, 55).padEnd(55)}\x1b[0m  \x1b[31m║\x1b[0m`);
    console.log('\x1b[31m╚═════════════════════════════════════════════════════════════╝\x1b[0m\n');
    process.exit(1);
  }
} else if (SYSTEM_PROMPT) {
  systemPromptSource = 'inline';
}

// Conversation history
const conversationHistory = [];

// Initialize conversation with system prompt if provided
if (SYSTEM_PROMPT) {
  conversationHistory.push({
    role: 'system',
    content: SYSTEM_PROMPT
  });
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n\x1b[1m\x1b[32m❯\x1b[0m \x1b[1m\x1b[37mYou:\x1b[0m '
});

// Check if API key is set
if (!OPENROUTER_API_KEY) {
  console.log('\n\x1b[31m╔═════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[31m║\x1b[0m  \x1b[1m\x1b[31m⚠  Configuration Error\x1b[0m                                      \x1b[31m║\x1b[0m');
  console.log('\x1b[31m╠═════════════════════════════════════════════════════════════╣\x1b[0m');
  console.log('\x1b[31m║\x1b[0m  \x1b[37mOPENROUTER_API_KEY is not set in .env file\x1b[0m                  \x1b[31m║\x1b[0m');
  console.log('\x1b[31m║\x1b[0m                                                               \x1b[31m║\x1b[0m');
  console.log('\x1b[31m║\x1b[0m  \x1b[90mPlease create a .env file with your API key:\x1b[0m                \x1b[31m║\x1b[0m');
  console.log('\x1b[31m║\x1b[0m  \x1b[33mOPENROUTER_API_KEY=your_api_key_here\x1b[0m                        \x1b[31m║\x1b[0m');
  console.log('\x1b[31m╚═════════════════════════════════════════════════════════════╝\x1b[0m\n');
  process.exit(1);
}

// Function to call OpenRouter API
async function chatWithLLM(userMessage) {
  // Add user message to history
  conversationHistory.push({
    role: 'user',
    content: userMessage
  });

  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: conversationHistory
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'CLI Chat Interface'
        }
      }
    );

    const assistantMessage = response.data.choices[0].message.content;

    // Add assistant message to history
    conversationHistory.push({
      role: 'assistant',
      content: assistantMessage
    });

    return assistantMessage;
  } catch (error) {
    console.log('\n\x1b[31m╔════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[31m║\x1b[0m  \x1b[1m\x1b[31m⚠  API Error\x1b[0m                                                 \x1b[31m║\x1b[0m');
    console.log('\x1b[31m╠════════════════════════════════════════════════════════════╣\x1b[0m');
    if (error.response) {
      const errorMsg = JSON.stringify(error.response.data, null, 2);
      console.log('\x1b[31m║\x1b[0m  \x1b[37m' + errorMsg.substring(0, 55).padEnd(55) + '\x1b[0m  \x1b[31m║\x1b[0m');
    } else {
      console.log('\x1b[31m║\x1b[0m  \x1b[37m' + error.message.substring(0, 55).padEnd(55) + '\x1b[0m  \x1b[31m║\x1b[0m');
    }
    console.log('\x1b[31m╚════════════════════════════════════════════════════════════╝\x1b[0m\n');
    return null;
  }
}

// Welcome message with enhanced styling
console.log('\n');
console.log('\x1b[35m╔═══════════════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[35m║\x1b[0m                                                               \x1b[35m║\x1b[0m');
console.log('\x1b[35m║\x1b[0m         \x1b[1m\x1b[36m✨ LoneSomeNoMore \x1b[0m\x1b[90m─\x1b[0m \x1b[37mCLI Chat Interface\x1b[0m           \x1b[35m║\x1b[0m');
console.log('\x1b[35m║\x1b[0m            \x1b[90mPowered by\x1b[0m \x1b[1m\x1b[35mOpenRouter\x1b[0m \x1b[90mAPI\x1b[0m                      \x1b[35m║\x1b[0m');
console.log('\x1b[35m║\x1b[0m                                                               \x1b[35m║\x1b[0m');
console.log('\x1b[35m╚═══════════════════════════════════════════════════════════════╝\x1b[0m');
console.log('');

// Configuration section with box
console.log('\x1b[36m┌─────────────────────────────────────────────────────────────┐\x1b[0m');
console.log('\x1b[36m│\x1b[0m \x1b[1m\x1b[33m⚙  Configuration\x1b[0m                                              \x1b[36m│\x1b[0m');
console.log('\x1b[36m├─────────────────────────────────────────────────────────────┤\x1b[0m');
console.log(`\x1b[36m│\x1b[0m   \x1b[37m🤖 Model:\x1b[0m \x1b[1m\x1b[33m${MODEL.padEnd(47)}\x1b[0m \x1b[36m│\x1b[0m`);
if (systemPromptSource) {
  const promptText = systemPromptSource === 'inline'
    ? '✓ Active (inline)'.padEnd(47)
    : `✓ ${systemPromptSource}`.padEnd(47);
  console.log(`\x1b[36m│\x1b[0m   \x1b[37m📝 System Prompt:\x1b[0m \x1b[1m\x1b[32m${promptText}\x1b[0m \x1b[36m│\x1b[0m`);
}
console.log('\x1b[36m└─────────────────────────────────────────────────────────────┘\x1b[0m');
console.log('');

// Commands section
console.log('\x1b[90m┌─────────────────────────────────────────────────────────────┐\x1b[0m');
console.log('\x1b[90m│\x1b[0m \x1b[1m\x1b[37m💡 Quick Commands\x1b[0m                                              \x1b[90m│\x1b[0m');
console.log('\x1b[90m├─────────────────────────────────────────────────────────────┤\x1b[0m');
console.log('\x1b[90m│\x1b[0m   \x1b[36m▸\x1b[0m Type your message and press \x1b[1mEnter\x1b[0m to chat              \x1b[90m│\x1b[0m');
console.log('\x1b[90m│\x1b[0m   \x1b[36m▸\x1b[0m Type \x1b[1m\x1b[33mclear\x1b[0m to reset conversation history             \x1b[90m│\x1b[0m');
console.log('\x1b[90m│\x1b[0m   \x1b[36m▸\x1b[0m Type \x1b[1m\x1b[33mexit\x1b[0m or \x1b[1m\x1b[33mquit\x1b[0m to exit (or press \x1b[1mCtrl+C\x1b[0m)        \x1b[90m│\x1b[0m');
console.log('\x1b[90m└─────────────────────────────────────────────────────────────┘\x1b[0m');
console.log('');
console.log('\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');

// Show the prompt
rl.prompt();

// Handle user input
rl.on('line', async (input) => {
  const userInput = input.trim();

  // Handle exit commands
  if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
    console.log('\n\x1b[35m╔═════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[35m║\x1b[0m          \x1b[1m\x1b[36m👋 Thank you for chatting!\x1b[0m                         \x1b[35m║\x1b[0m');
    console.log('\x1b[35m║\x1b[0m             \x1b[90mHave a wonderful day!\x1b[0m                          \x1b[35m║\x1b[0m');
    console.log('\x1b[35m╚═════════════════════════════════════════════════════════════╝\x1b[0m\n');
    rl.close();
    process.exit(0);
  }

  // Handle clear command
  if (userInput.toLowerCase() === 'clear') {
    conversationHistory.length = 0;
    // Re-add system prompt if it exists
    if (SYSTEM_PROMPT) {
      conversationHistory.push({
        role: 'system',
        content: SYSTEM_PROMPT
      });
    }
    console.log('\n\x1b[32m✓ Conversation history cleared successfully!\x1b[0m');
    console.log('\x1b[90m  Starting fresh conversation...\x1b[0m');
    rl.prompt();
    return;
  }

  // Ignore empty input
  if (!userInput) {
    rl.prompt();
    return;
  }

  // Show loading indicator
  process.stdout.write('\x1b[35m⏳ Thinking...\x1b[0m');

  // Get response from LLM
  const response = await chatWithLLM(userInput);

  // Clear the "Thinking..." line
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  if (response) {
    console.log(`\n\x1b[1m\x1b[35m❮\x1b[0m \x1b[1m\x1b[36mAssistant:\x1b[0m`);
    console.log(`\x1b[37m${response}\x1b[0m\n`);
    console.log('\x1b[90m─────────────────────────────────────────────────────────────\x1b[0m');
  }

  rl.prompt();
});

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n\x1b[35m╔═════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[35m║\x1b[0m          \x1b[1m\x1b[36m👋 Thank you for chatting!\x1b[0m                         \x1b[35m║\x1b[0m');
  console.log('\x1b[35m║\x1b[0m             \x1b[90mHave a wonderful day!\x1b[0m                          \x1b[35m║\x1b[0m');
  console.log('\x1b[35m╚═════════════════════════════════════════════════════════════╝\x1b[0m\n');
  process.exit(0);
});

// Handle close
rl.on('close', () => {
  process.exit(0);
});
