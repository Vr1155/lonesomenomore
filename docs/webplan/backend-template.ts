// app/api/chat/route.ts
// Copy this file to your Next.js project after setting it up

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { messages, model, systemPrompt, systemPromptFile } = body;

    // Validate API key
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Build conversation history with system prompt
    let conversationHistory = [];

    // Add system prompt if provided
    if (systemPromptFile) {
      try {
        const filePath = path.join(process.cwd(), systemPromptFile);
        const promptContent = fs.readFileSync(filePath, 'utf-8').trim();
        conversationHistory.push({
          role: 'system',
          content: promptContent
        });
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to read system prompt file: ${systemPromptFile}` },
          { status: 400 }
        );
      }
    } else if (systemPrompt) {
      conversationHistory.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Add message history
    conversationHistory = [...conversationHistory, ...messages];

    // Call OpenRouter API
    const response = await axios.post(
      API_URL,
      {
        model: model || 'anthropic/claude-3.5-sonnet',
        messages: conversationHistory
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'LoneSomeNoMore Chat Interface'
        }
      }
    );

    const assistantMessage = response.data.choices[0].message;

    return NextResponse.json({
      message: assistantMessage,
      usage: response.data.usage
    });

  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return NextResponse.json(
      {
        error: error.response?.data?.error?.message || error.message || 'Failed to get response from LLM',
        details: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Optional: Add streaming support
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'Chat API is running',
      endpoints: {
        POST: '/api/chat - Send messages to LLM'
      }
    }
  );
}
