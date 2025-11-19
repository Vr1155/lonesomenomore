# Quick Start: Connect v0 Frontend to Backend

**Time to integrate: ~10 minutes**

---

## Step 1: Add Environment Variable

In your Next.js project, create or update `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://granular-ramonita-orthoptic.ngrok-free.dev
```

---

## Step 2: Create API Client

Create `lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
}

export const api = {
  // Auth (mock - always succeeds)
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => apiCall('/auth/me'),

  // Chat
  sendMessage: (messages: any[], lovedOneId = 'loved_789xyz') =>
    apiCall('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, lovedOneId }),
    }),

  // Dashboard
  getDashboardSummary: (lovedOneId = 'loved_789xyz') =>
    apiCall(`/dashboard/summary?lovedOneId=${lovedOneId}`),

  // Conversations
  getConversations: (lovedOneId = 'loved_789xyz') =>
    apiCall(`/conversations?lovedOneId=${lovedOneId}`),

  getConversation: (conversationId: string) =>
    apiCall(`/conversations/${conversationId}`),

  // Intake
  submitIntake: (formData: any) =>
    apiCall('/intake/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  // Profile
  getProfile: (lovedOneId: string) =>
    apiCall(`/profile/${lovedOneId}`),
};
```

---

## Step 3: Update Your Components

### Login Component

```typescript
'use client';

import { api } from '@/lib/api';

export default function Login() {
  async function handleLogin(e: any) {
    e.preventDefault();
    const response = await api.login('any@email.com', 'anypassword');
    localStorage.setItem('user', JSON.stringify(response.user));
    window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={handleLogin}>
      <button>Log In</button>
    </form>
  );
}
```

### Chat Component

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  async function sendMessage(e: any) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setInput('');

    const response = await api.sendMessage([...messages, userMsg]);
    setMessages([...messages, userMsg, response.message]);
  }

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <div key={i}>{msg.content}</div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button>Send</button>
      </form>
    </div>
  );
}
```

### Dashboard Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getDashboardSummary().then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.lovedOne.firstName} {data.lovedOne.lastName}</h1>
      <p>Total Calls: {data.stats.totalCalls}</p>
      <p>Mood: {data.stats.averageMood}</p>

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

### Beta Intake Form

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function BetaIntake() {
  const [formData, setFormData] = useState({
    'loved-one': {
      lovedOneFirstName: '',
      lovedOneLastName: '',
      nickname: '',
      age: '',
      phoneNumber: '',
      location: '',
    },
    // ... other sections
  });

  async function handleSubmit(e: any) {
    e.preventDefault();
    const response = await api.submitIntake(formData);
    alert('Submitted! Loved One ID: ' + response.lovedOneId);
    window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Step 4: Test

1. **Start your Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **Test Login:**
   - Go to `/login`
   - Click login (any credentials work)
   - Should redirect to dashboard

3. **Test Dashboard:**
   - Should see Mary Smith's data
   - Should see stats: 0 calls, neutral mood

4. **Test Chat:**
   - Send a message
   - Should get AI response from Claude

---

## Pre-seeded Data

The backend has mock data ready to use:

**User:**
- ID: `user_1`
- Email: `test@lonesomenomore.com`

**Loved One:**
- ID: `loved_789xyz`
- Name: Mary Smith
- Nickname: Mom
- Age: 75

---

## Available Endpoints

All at: `https://granular-ramonita-orthoptic.ngrok-free.dev`

- `POST /auth/login` - Mock login
- `GET /auth/me` - Get user
- `POST /api/chat` - Send chat message
- `GET /dashboard/summary` - Get dashboard data
- `GET /conversations` - List conversations
- `GET /conversations/:id` - Get conversation detail
- `POST /intake/submit` - Submit intake form
- `GET /profile/:lovedOneId` - Get profile

---

## Common Issues

**Issue:** `fetch failed` error
**Fix:** Check ngrok is running and URL is correct

**Issue:** Empty dashboard
**Fix:** Backend has no conversations yet - send a chat message first

**Issue:** CORS errors
**Fix:** Backend has CORS enabled - shouldn't happen

---

## Test with cURL

Quick test if backend is working:

```bash
# Health check
curl https://granular-ramonita-orthoptic.ngrok-free.dev/

# Dashboard
curl https://granular-ramonita-orthoptic.ngrok-free.dev/dashboard/summary

# Chat
curl -X POST https://granular-ramonita-orthoptic.ngrok-free.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

---

## That's It!

Your v0 frontend is now connected to the backend. All API calls will work through ngrok.

**Next:** Style your components and add more features!

---

**Backend Status:** ✅ Running
**Ngrok URL:** `https://granular-ramonita-orthoptic.ngrok-free.dev`
**Auth:** Mock (no real login needed)
**Database:** SQLite with pre-seeded data
