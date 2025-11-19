# v0 Frontend Integration Guide

Complete guide to integrate your v0 Next.js frontend with the LoneSomeNoMore backend.

---

## Quick Setup

### 1. Environment Variables

Create or update `.env.local` in your Next.js project:

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://granular-ramonita-orthoptic.ngrok-free.dev

# Optional
NEXT_PUBLIC_ENABLE_MOCK_AUTH=true
```

### 2. API Client Setup

Create `lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://granular-ramonita-orthoptic.ngrok-free.dev';

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!data.success && response.ok === false) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}

// Export specific API methods
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => apiCall('/auth/me'),

  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),

  // Chat
  sendMessage: (messages: any[], lovedOneId?: string) =>
    apiCall('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, lovedOneId }),
    }),

  // Dashboard
  getDashboardSummary: (lovedOneId?: string) => {
    const params = lovedOneId ? `?lovedOneId=${lovedOneId}` : '';
    return apiCall(`/dashboard/summary${params}`);
  },

  // Conversations
  getConversations: (lovedOneId: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      lovedOneId,
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall(`/conversations?${params}`);
  },

  getConversation: (conversationId: string) =>
    apiCall(`/conversations/${conversationId}`),

  // Profile & Intake
  submitIntake: (formData: any) =>
    apiCall('/intake/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  getProfile: (lovedOneId: string) =>
    apiCall(`/profile/${lovedOneId}`),

  enrichProfile: (lovedOneId: string, update: any) =>
    apiCall(`/profile/${lovedOneId}/enrich`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    }),
};
```

---

## Integration by Component

### 1. Login Page

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.login(email, password);

      // Store token (optional for mock auth)
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
```

---

### 2. Chat Interface

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send to backend
      const response = await api.sendMessage(
        [...messages, userMessage],
        'loved_789xyz' // Use actual loved one ID
      );

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg px-4 py-2">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

### 3. Dashboard

```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DashboardData {
  lovedOne: {
    firstName: string;
    lastName: string;
    nickname: string;
  };
  stats: {
    totalCalls: number;
    averageMood: string;
    currentStreak: number;
  };
  recentConversations: any[];
  weeklyInsight: {
    summary: string;
    moodTrend: string;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await api.getDashboardSummary('loved_789xyz');
      setData(response);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!data) {
    return <div>Failed to load dashboard</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {data.lovedOne.firstName} {data.lovedOne.lastName}
        </h1>
        <p className="text-gray-600">"{data.lovedOne.nickname}"</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Total Calls</p>
          <p className="text-3xl font-bold">{data.stats.totalCalls}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Average Mood</p>
          <p className="text-3xl font-bold capitalize">{data.stats.averageMood}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Current Streak</p>
          <p className="text-3xl font-bold">{data.stats.currentStreak}</p>
        </div>
      </div>

      {/* Weekly Insight */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Weekly Insight</h2>
        <p>{data.weeklyInsight.summary}</p>
        <p className="text-sm text-gray-600 mt-2">
          Mood Trend: {data.weeklyInsight.moodTrend}
        </p>
      </div>

      {/* Recent Conversations */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Conversations</h2>
        <div className="space-y-2">
          {data.recentConversations.map((conv) => (
            <div key={conv.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium">{conv.summary}</p>
              <p className="text-sm text-gray-600">
                {new Date(conv.date).toLocaleDateString()} • {Math.floor(conv.duration / 60)} min
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Beta Intake Form

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function BetaIntakeForm() {
  const [formData, setFormData] = useState({
    'your-info': {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      relationship: '',
    },
    'loved-one': {
      lovedOneFirstName: '',
      lovedOneLastName: '',
      nickname: '',
      age: '',
      phoneNumber: '',
      location: '',
    },
    'life-story': {
      birthplace: '',
      career: '',
      achievements: '',
    },
    interests: {
      hobbies: '',
      music: '',
      entertainment: '',
    },
    health: {
      healthConditions: '',
      mobilityAids: '',
      cognitiveHealth: '',
    },
    communication: {
      callFrequency: 'daily',
      preferredTime: '10:00',
      timezone: 'MST',
      callLength: '10-15',
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.submitIntake(formData);

      alert('Application submitted successfully!');

      // Redirect to dashboard
      router.push(`/dashboard?lovedOneId=${response.lovedOneId}`);
    } catch (error) {
      console.error('Failed to submit intake:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Your Info Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Your Information</h2>
        <input
          type="text"
          placeholder="First Name"
          value={formData['your-info'].firstName}
          onChange={(e) =>
            setFormData({
              ...formData,
              'your-info': { ...formData['your-info'], firstName: e.target.value },
            })
          }
          required
          className="w-full px-4 py-2 border rounded"
        />
        {/* Add more fields... */}
      </section>

      {/* Loved One Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">About Your Loved One</h2>
        <input
          type="text"
          placeholder="First Name"
          value={formData['loved-one'].lovedOneFirstName}
          onChange={(e) =>
            setFormData({
              ...formData,
              'loved-one': { ...formData['loved-one'], lovedOneFirstName: e.target.value },
            })
          }
          required
          className="w-full px-4 py-2 border rounded"
        />
        {/* Add more fields... */}
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

---

## Custom Hooks

### useChat Hook

```typescript
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat(lovedOneId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const response = await api.sendMessage(
          [...messages, userMessage],
          lovedOneId
        );

        const assistantMessage: Message = {
          role: 'assistant',
          content: response.message.content,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [messages, lovedOneId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
}
```

### useDashboard Hook

```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useDashboard(lovedOneId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.getDashboardSummary(lovedOneId);
        setData(response);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [lovedOneId]);

  return { data, loading, error };
}
```

---

## Error Handling

### Global Error Handler

```typescript
// lib/errorHandler.ts

export function handleApiError(error: any) {
  console.error('API Error:', error);

  // Show user-friendly message
  if (error.message) {
    alert(error.message);
  } else {
    alert('Something went wrong. Please try again.');
  }
}

// Usage
try {
  await api.sendMessage(messages);
} catch (error) {
  handleApiError(error);
}
```

---

## Testing Your Integration

### 1. Test Login
- Visit `/login`
- Enter any email/password
- Should redirect to dashboard

### 2. Test Dashboard
- Visit `/dashboard`
- Should see Mary Smith's profile
- Should see stats and recent conversations

### 3. Test Chat
- Visit `/chat`
- Send a message
- Should receive AI response

### 4. Test Intake Form
- Visit `/beta-intake`
- Fill out form
- Submit should create new loved one

---

## Troubleshooting

### CORS Errors
- Backend has CORS enabled for all origins
- If you see CORS errors, check the ngrok URL is correct

### 404 Errors
- Verify ngrok is still running
- Check the URL: `https://granular-ramonita-orthoptic.ngrok-free.dev`
- Test endpoint manually: `curl https://granular-ramonita-orthoptic.ngrok-free.dev/`

### Empty Responses
- Check browser console for errors
- Verify API response structure matches types
- Test endpoint with cURL first

---

## Next Steps

1. **Deploy Frontend**: Deploy to Vercel
2. **Test End-to-End**: Test all flows
3. **Add Features**: Conversation history, profile editing, etc.
4. **Voice Integration**: Add ElevenLabs later

---

**Backend URL:** `https://granular-ramonita-orthoptic.ngrok-free.dev`

**All endpoints ready to use!** 🚀
