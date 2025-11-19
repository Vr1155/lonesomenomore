// Example hooks and utilities to integrate v0 frontend with backend
// Place these in your Next.js project after setting up

// ============================================
// 1. Custom Hook: useChat
// ============================================
// File: hooks/useChat.ts

'use client';

import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

interface UseChatOptions {
  model?: string;
  systemPrompt?: string;
  systemPromptFile?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].filter(m => m.role !== 'system'),
          model: options.model,
          systemPrompt: options.systemPrompt,
          systemPromptFile: options.systemPromptFile
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
}

// ============================================
// 2. Example: Integrating with v0 Components
// ============================================
// File: app/page.tsx

'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import ChatInterface from '@/components/ChatInterface'; // From v0
import Sidebar from '@/components/Sidebar'; // From v0

export default function Home() {
  const [model, setModel] = useState('anthropic/claude-3.5-sonnet');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [systemPromptFile, setSystemPromptFile] = useState('');

  const { messages, isLoading, error, sendMessage, clearMessages } = useChat({
    model,
    systemPrompt,
    systemPromptFile
  });

  return (
    <div className="flex h-screen">
      <Sidebar
        model={model}
        onModelChange={setModel}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        systemPromptFile={systemPromptFile}
        onSystemPromptFileChange={setSystemPromptFile}
        onClearChat={clearMessages}
      />
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendMessage={sendMessage}
      />
    </div>
  );
}

// ============================================
// 3. Type Definitions
// ============================================
// File: types/chat.ts

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  id?: string;
}

export interface ChatConfig {
  model: string;
  systemPrompt?: string;
  systemPromptFile?: string;
}

export interface ChatError {
  message: string;
  details?: any;
}

// ============================================
// 4. Utility Functions
// ============================================
// File: lib/utils.ts

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function exportConversation(messages: Message[], format: 'json' | 'markdown' = 'json') {
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  } else {
    const markdown = messages
      .map(m => `**${m.role.toUpperCase()}:** ${m.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    return URL.createObjectURL(blob);
  }
}

// ============================================
// 5. Local Storage Persistence (Optional)
// ============================================
// File: hooks/usePersistedChat.ts

'use client';

import { useEffect } from 'react';
import { useChat } from './useChat';

const STORAGE_KEY = 'lonesomenomore-chat-history';

export function usePersistedChat(options: any) {
  const chat = useChat(options);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // You'd need to add a setMessages function to useChat
        // chat.setMessages(parsed);
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (chat.messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chat.messages));
    }
  }, [chat.messages]);

  return chat;
}
