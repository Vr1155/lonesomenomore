# v0 Integration Prompt

Integrate the existing v0 Next.js frontend with the LoneSomeNoMore backend API.

---

## Backend Information

**Base URL:** `https://granular-ramonita-orthoptic.ngrok-free.dev`

**Authentication:** Mock authentication - all requests are automatically authenticated for this prototype. No real login credentials needed.

**Pre-seeded Data:**
- User ID: `user_1`
- Loved One ID: `loved_789xyz` (Mary Smith, age 75)

---

## Task

Integrate the existing frontend components with the backend API by:

1. Creating an API client utility (`lib/api.ts`)
2. Updating all components to use real API calls
3. Replacing mock data with actual backend responses
4. Implementing error handling

---

## API Client Setup

Create `lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://granular-ramonita-orthoptic.ngrok-free.dev';

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!data.success && !response.ok) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Authentication (mock - always succeeds)
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
  sendMessage: (messages: Array<{role: string, content: string}>, lovedOneId = 'loved_789xyz') =>
    apiCall('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, lovedOneId }),
    }),

  // Dashboard
  getDashboardSummary: (lovedOneId = 'loved_789xyz') =>
    apiCall(`/dashboard/summary?lovedOneId=${lovedOneId}`),

  // Conversations
  getConversations: (lovedOneId = 'loved_789xyz', page = 1, limit = 20) => {
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

## Component Updates

### 1. Login Component

Replace mock login with real API call:

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

      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

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
      {/* Your existing form UI */}
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

### 2. Dashboard Component

Replace mock data with real API call:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await api.getDashboardSummary();
      setData(response);
    } catch (err: any) {
      setError(err.message);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      {/* Your existing dashboard UI */}
      <h1>{data.lovedOne.firstName} {data.lovedOne.lastName}</h1>
      <p>Total Calls: {data.stats.totalCalls}</p>
      <p>Average Mood: {data.stats.averageMood}</p>

      <h2>Recent Conversations</h2>
      {data.recentConversations.map((conv: any) => (
        <div key={conv.id}>
          <p>{conv.summary}</p>
          <small>{new Date(conv.date).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}
```

### 3. Chat Component

Replace mock chat with real API call:

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendMessage([...messages, userMessage]);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Your existing chat UI */}
      <div>
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

### 4. Beta Intake Form

Replace mock submission with real API call:

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
      router.push(`/dashboard?lovedOneId=${response.lovedOneId}`);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your existing form UI */}
      {/* Update each input to use formData state */}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

---

## Environment Variables

Ensure `.env.local` has:

```bash
NEXT_PUBLIC_APP_URL=https://granular-ramonita-orthoptic.ngrok-free.dev
```

---

## API Endpoints Reference

All endpoints use base URL: `https://granular-ramonita-orthoptic.ngrok-free.dev`

### Authentication
- `POST /auth/login` - Mock login (always succeeds)
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Chat
- `POST /api/chat` - Send message, get AI response

### Dashboard
- `GET /dashboard/summary?lovedOneId=loved_789xyz` - Get dashboard data

### Conversations
- `GET /conversations?lovedOneId=loved_789xyz` - List conversations
- `GET /conversations/:id` - Get conversation detail

### Profile & Intake
- `POST /intake/submit` - Submit intake form
- `GET /profile/:lovedOneId` - Get profile
- `PATCH /profile/:lovedOneId/enrich` - Update profile

---

## Request/Response Examples

### Login
```typescript
// Request
POST /auth/login
{ "email": "any@email.com", "password": "any" }

// Response
{
  "success": true,
  "token": "mock_jwt_token",
  "user": {
    "id": "user_1",
    "email": "test@lonesomenomore.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

### Chat
```typescript
// Request
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "lovedOneId": "loved_789xyz"
}

// Response
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Hello! How are you today?"
  },
  "conversationId": "conv_abc123"
}
```

### Dashboard
```typescript
// Request
GET /dashboard/summary?lovedOneId=loved_789xyz

// Response
{
  "success": true,
  "lovedOne": {
    "id": "loved_789xyz",
    "firstName": "Mary",
    "lastName": "Smith",
    "nickname": "Mom"
  },
  "stats": {
    "totalCalls": 24,
    "averageMood": "positive",
    "currentStreak": 24
  },
  "recentConversations": [...]
}
```

---

## Error Handling

All errors follow this format:

```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Implement try-catch blocks and show user-friendly error messages.

---

## Testing

After integration, test:

1. ✅ Login flow (any credentials work)
2. ✅ Dashboard loads with Mary Smith's data
3. ✅ Chat sends messages and receives AI responses
4. ✅ Intake form submits successfully
5. ✅ Conversation history displays

---

## Important Notes

- **Mock Auth:** No real authentication needed - all requests auto-authenticated
- **Pre-seeded Data:** Use `loved_789xyz` as default loved one ID
- **CORS:** Already enabled on backend
- **Error Handling:** Always wrap API calls in try-catch
- **Loading States:** Show loading indicators during API calls

---

## Complete Documentation

Full API documentation and integration examples are available in:
- `docs/serverplan/README.md` - Overview
- `docs/serverplan/QUICK_START.md` - Fast integration
- `docs/serverplan/V0_INTEGRATION_GUIDE.md` - Detailed guide
- `docs/serverplan/API_REFERENCE.md` - Complete API docs

---

## Success Criteria

Integration is complete when:
- ✅ All components use real API calls (no mock data)
- ✅ Login redirects to dashboard
- ✅ Dashboard displays real backend data
- ✅ Chat sends/receives messages from OpenRouter
- ✅ Intake form creates new loved ones
- ✅ Error handling shows user-friendly messages
- ✅ Loading states display during API calls

---

**Backend Status:** ✅ Running at `https://granular-ramonita-orthoptic.ngrok-free.dev`

**Start with:** Create `lib/api.ts` then update each component to use it.
