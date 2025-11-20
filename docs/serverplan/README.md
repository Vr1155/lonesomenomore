# Backend Integration Documentation

Complete documentation to integrate your v0 Next.js frontend with the LoneSomeNoMore backend API.

---

## 🚀 Getting Started

**Backend is live at:**
```
https://granular-ramonita-orthoptic.ngrok-free.dev
```

**Choose your path:**

### For Quick Integration (10 minutes)
👉 **[QUICK_START.md](./QUICK_START.md)**
- Copy-paste ready code
- Minimal setup
- Start coding immediately

### For Complete Understanding
👉 **[V0_INTEGRATION_GUIDE.md](./V0_INTEGRATION_GUIDE.md)**
- Detailed component examples
- Custom hooks
- Error handling
- Best practices

### For API Reference
👉 **[API_REFERENCE.md](./API_REFERENCE.md)**
- All endpoints documented
- Request/response examples
- cURL test commands
- Data models

---

## 📋 Quick Integration Checklist

- [ ] Add environment variable: `NEXT_PUBLIC_API_URL=https://granular-ramonita-orthoptic.ngrok-free.dev`
- [ ] Create `lib/api.ts` with API client
- [ ] Update login component to call `api.login()`
- [ ] Update dashboard to call `api.getDashboardSummary()`
- [ ] Update chat to call `api.sendMessage()`
- [ ] Update intake form to call `api.submitIntake()`
- [ ] Test all flows end-to-end

---

## 🎯 Key Endpoints

### Authentication (Mock)
```typescript
// Login - always succeeds
POST /auth/login
{ "email": "any@email.com", "password": "any" }

// Get current user
GET /auth/me
```

### Chat
```typescript
// Send message, get AI response
POST /api/chat
{
  "messages": [{"role": "user", "content": "Hello!"}],
  "lovedOneId": "loved_789xyz"
}
```

### Dashboard
```typescript
// Get overview with stats
GET /dashboard/summary?lovedOneId=loved_789xyz
```

### Conversations
```typescript
// List conversations
GET /conversations?lovedOneId=loved_789xyz

// Get full transcript
GET /conversations/:id
```

### Profile & Intake
```typescript
// Submit intake form
POST /intake/submit
{ /* form data */ }

// Get profile
GET /profile/:lovedOneId
```

---

## 💻 Minimum Code to Connect

### 1. API Client (`lib/api.ts`)

```typescript
const API_URL = 'https://granular-ramonita-orthoptic.ngrok-free.dev';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options.headers
    },
  });
  return response.json();
}

export const api = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  sendMessage: (messages: any[]) =>
    apiCall('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, lovedOneId: 'loved_789xyz' }),
    }),

  getDashboardSummary: () =>
    apiCall('/dashboard/summary?lovedOneId=loved_789xyz'),

  submitIntake: (formData: any) =>
    apiCall('/intake/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),
};
```

### 2. Use in Components

```typescript
'use client';

import { api } from '@/lib/api';

// Login
await api.login('any@email.com', 'any');

// Chat
const response = await api.sendMessage([
  { role: 'user', content: 'Hello!' }
]);

// Dashboard
const data = await api.getDashboardSummary();

// Intake
await api.submitIntake(formData);
```

---

## 🧪 Testing

### Test Backend is Running

```bash
curl https://granular-ramonita-orthoptic.ngrok-free.dev/
# Should return: {"status":"ok","message":"LoneSomeNoMore API","version":"1.0.0"}
```

### Test Chat Endpoint

```bash
curl -X POST https://granular-ramonita-orthoptic.ngrok-free.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

### Test Dashboard

```bash
curl https://granular-ramonita-orthoptic.ngrok-free.dev/dashboard/summary
```

---

## 📊 Pre-seeded Data

Backend comes with mock data ready to use:

### User
```json
{
  "id": "user_1",
  "email": "test@lonesomenomore.com",
  "firstName": "Test",
  "lastName": "User"
}
```

### Loved One
```json
{
  "id": "loved_789xyz",
  "firstName": "Mary",
  "lastName": "Smith",
  "nickname": "Mom",
  "age": 75,
  "phoneNumber": "(555) 987-6543",
  "location": "Phoenix, AZ"
}
```

Use these IDs in your API calls.

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://granular-ramonita-orthoptic.ngrok-free.dev
```

### CORS

✅ **Already enabled** - no configuration needed

### Authentication

✅ **Mock auth** - all requests auto-authenticated for prototype

---

## 📖 Documentation Structure

```
serverplan/
├── README.md                    # ← You are here
├── QUICK_START.md              # Fast integration (10 min)
├── V0_INTEGRATION_GUIDE.md     # Detailed guide with examples
└── API_REFERENCE.md            # Complete API documentation
```

**Recommended reading order:**
1. This README (overview)
2. QUICK_START.md (get it working fast)
3. V0_INTEGRATION_GUIDE.md (add features)
4. API_REFERENCE.md (reference as needed)

---

## 🎨 Example Components

### Minimal Chat

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  async function send(e) {
    e.preventDefault();
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);

    const res = await api.sendMessage([...messages, userMsg]);
    setMessages([...messages, userMsg, res.message]);
    setInput('');
  }

  return (
    <>
      {messages.map((m, i) => <div key={i}>{m.content}</div>)}
      <form onSubmit={send}>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button>Send</button>
      </form>
    </>
  );
}
```

### Minimal Dashboard

```typescript
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getDashboardSummary().then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.lovedOne.firstName}</h1>
      <p>Calls: {data.stats.totalCalls}</p>
      <p>Mood: {data.stats.averageMood}</p>
    </div>
  );
}
```

---

## ⚠️ Important Notes

### Ngrok URL
- URL is: `https://granular-ramonita-orthoptic.ngrok-free.dev`
- Changes if ngrok restarts (free tier)
- Update `.env.local` if URL changes

### Authentication
- **Mock authentication** for prototype
- No real login required
- All requests auto-authenticated
- Replace with real auth later

### Database
- SQLite database with pre-seeded data
- Persists between server restarts
- Can reset by deleting `lonesomenomore.db`

---

## 🐛 Troubleshooting

### "fetch failed" error
**Cause:** Backend not accessible
**Fix:** Check ngrok is running, verify URL

### Empty dashboard
**Cause:** No conversations yet
**Fix:** Send a chat message first to create conversation

### CORS errors
**Cause:** Shouldn't happen (CORS enabled)
**Fix:** Double-check URL, try different browser

### 404 errors
**Cause:** Wrong endpoint path
**Fix:** Check API_REFERENCE.md for correct paths

---

## 📞 Support

### Test Connection
```bash
curl https://granular-ramonita-orthoptic.ngrok-free.dev/
```

Should return:
```json
{"status":"ok","message":"LoneSomeNoMore API","version":"1.0.0"}
```

### Check Server Logs
Backend logs all requests - check terminal where server is running

### Verify Ngrok
Visit: http://localhost:4040 to see ngrok dashboard

---

## ✨ Features

### ✅ Implemented
- Mock authentication
- AI chat (OpenRouter + Claude)
- Dashboard with stats
- Conversation history
- Profile management
- Beta intake form

### 🔜 Coming Later
- ElevenLabs voice integration
- Real authentication
- Advanced analytics
- More loved ones per user

---

## 🎉 You're Ready!

**Your backend is:**
- ✅ Running locally
- ✅ Exposed via ngrok
- ✅ Fully functional
- ✅ Ready for integration

**Start with:** [QUICK_START.md](./QUICK_START.md)

**Backend URL:** `https://granular-ramonita-orthoptic.ngrok-free.dev`

---

**Last Updated:** November 19, 2025
**Status:** ✅ Production-ready for prototype
