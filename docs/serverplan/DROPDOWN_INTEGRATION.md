# Frontend Integration: Loved Ones Dropdown

Complete guide for integrating the loved ones dropdown selector with profile-based AI conversations.

---

## Overview

Your backend now supports multiple loved one profiles with automatic system prompt generation. The frontend needs to:

1. Fetch the list of loved ones
2. Display a dropdown selector
3. Send the selected loved one's ID with chat messages
4. Backend automatically generates personalized prompts

---

## Step 1: Update API Client

Add the new `getLovedOnes()` method to your API client:

### `lib/api.ts`

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
  // ... existing methods ...

  // NEW: Get list of loved ones for dropdown
  getLovedOnes: () => apiCall('/loved-ones'),

  // UPDATED: sendMessage now uses lovedOneId (no more systemPrompt needed!)
  sendMessage: (messages: Array<{role: string, content: string}>, lovedOneId: string) =>
    apiCall('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, lovedOneId }),
    }),

  // ... other methods ...
};
```

---

## Step 2: Create Loved One Dropdown Component

### `components/LovedOneSelector.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface LovedOne {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  age: number;
  location: string;
  personality: string;
}

interface LovedOneSelectorProps {
  selectedId: string;
  onSelect: (lovedOneId: string) => void;
}

export default function LovedOneSelector({ selectedId, onSelect }: LovedOneSelectorProps) {
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLovedOnes();
  }, []);

  async function loadLovedOnes() {
    try {
      const response = await api.getLovedOnes();
      setLovedOnes(response.lovedOnes);

      // Auto-select first loved one if none selected
      if (!selectedId && response.lovedOnes.length > 0) {
        onSelect(response.lovedOnes[0].id);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load loved ones:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-xs">
        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Failed to load profiles: {error}
      </div>
    );
  }

  const selected = lovedOnes.find(l => l.id === selectedId);

  return (
    <div className="w-full max-w-xs">
      <label htmlFor="loved-one-select" className="block text-sm font-medium text-gray-700 mb-2">
        Who would you like to talk with?
      </label>

      <select
        id="loved-one-select"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {lovedOnes.map((lovedOne) => (
          <option key={lovedOne.id} value={lovedOne.id}>
            {lovedOne.firstName} {lovedOne.lastName} ({lovedOne.nickname}) - {lovedOne.age}
          </option>
        ))}
      </select>

      {selected && (
        <div className="mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{selected.location}</span>
          </div>
          <div className="mt-1 line-clamp-2">
            {selected.personality}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Step 3: Update Chat Component

### `app/chat/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import LovedOneSelector from '@/components/LovedOneSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLovedOne, setSelectedLovedOne] = useState<string>('');

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !selectedLovedOne) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send with selected loved one ID
      // Backend automatically generates personalized system prompt!
      const response = await api.sendMessage(
        [...messages, userMessage],
        selectedLovedOne
      );

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

  // When loved one changes, clear chat history for fresh conversation
  function handleLovedOneChange(lovedOneId: string) {
    setSelectedLovedOne(lovedOneId);
    setMessages([]);
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header with Loved One Selector */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">AI Companion Chat</h1>
        <LovedOneSelector
          selectedId={selectedLovedOne}
          onSelect={handleLovedOneChange}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && selectedLovedOne && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Start a conversation!</p>
            <p className="text-sm mt-2">
              The AI will match the personality and communication style
              of the selected person.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedLovedOne
              ? "Type your message..."
              : "Select a loved one first..."
          }
          disabled={loading || !selectedLovedOne}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading || !selectedLovedOne || !input.trim()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

---

## Step 4: Alternative - Inline Dropdown in Chat Header

For a more compact UI, you can embed the dropdown in the chat header:

### `components/ChatHeader.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ChatHeaderProps {
  selectedLovedOneId: string;
  onLovedOneChange: (id: string) => void;
}

export default function ChatHeader({ selectedLovedOneId, onLovedOneChange }: ChatHeaderProps) {
  const [lovedOnes, setLovedOnes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLovedOnes()
      .then(res => {
        setLovedOnes(res.lovedOnes);
        if (!selectedLovedOneId && res.lovedOnes.length > 0) {
          onLovedOneChange(res.lovedOnes[0].id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const selected = lovedOnes.find(l => l.id === selectedLovedOneId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Conversation with</h2>
        </div>

        <select
          value={selectedLovedOneId}
          onChange={(e) => onLovedOneChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
        >
          {lovedOnes.map((lovedOne) => (
            <option key={lovedOne.id} value={lovedOne.id}>
              {lovedOne.firstName} {lovedOne.lastName} ({lovedOne.nickname})
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="mr-4">📍 {selected.location}</span>
          <span>👤 {selected.age} years old</span>
        </div>
      )}
    </div>
  );
}
```

---

## How It Works

### Backend Automatic System Prompt Generation

When you send a chat message with a `lovedOneId`:

```typescript
api.sendMessage(messages, 'harold_123');
```

**Backend automatically:**

1. Fetches Harold's full profile from database
2. Generates a rich system prompt using `buildSystemPromptFromProfile()`
3. Includes:
   - Harold's personality (quiet, guarded)
   - Communication style (slow pacing, short sentences)
   - Interests (radios, detective shows, Buffalo weather)
   - Backstory (factory worker, Army mechanic)
   - Important people (Helen, Jason, Marty)
   - Health context
   - Safety contacts
   - Conversation guidelines

### Example Generated System Prompts

**For Harold (harold_123):**
```
# AI Companion for Harold Whitaker

## ROLE & MISSION
You are a caring AI companion for **Harold (Harold)**. Your mission is to provide
warm, steady companionship that reduces isolation...

## PERSONALITY & COMMUNICATION
**Their Personality:**
Quiet, guarded, self-reliant. Prefers routine and calm. Slow to open up...

**Communication Style to Match:**
Slow pacing, short sentences, dry humor. Prefers concrete topics over emotional ones...

## BACKGROUND
Grew up in Jamestown, NY. Worked assembly line, became foreman at tool-and-die factory...

## INTERESTS & PASSIONS
- Old radio repair
- Detective shows (Columbo, Perry Mason)
- Buffalo weather
- Factory stories
- Army memories

## CONVERSATION STARTERS
- "Did you ever fix radios in winter when the snow piled up?"
- "What was it like in the shop when things were busy?"
...
```

**For Mary (loved_789xyz):**
```
# AI Companion for Mary Smith

## ROLE & MISSION
You are a caring AI companion for **Mary (Mom)**...

## PERSONALITY & COMMUNICATION
**Their Personality:**
Warm, friendly, chatty. Loves sharing stories. Optimistic and family-oriented...

**Communication Style to Match:**
Friendly and upbeat. Likes to share details. Appreciates follow-up questions...

## INTERESTS & PASSIONS
- Gardening
- Knitting
- Reading mystery novels
- Watching Jeopardy
- Classic movies
- Frank Sinatra music
...
```

---

## API Response Example

### GET /loved-ones

```json
{
  "success": true,
  "lovedOnes": [
    {
      "id": "harold_123",
      "firstName": "Harold",
      "lastName": "Whitaker",
      "nickname": "Harold",
      "age": 75,
      "location": "North Buffalo, NY",
      "personality": "Quiet, guarded, self-reliant. Prefers routine and calm. Slow to open up but loyal once trust is buil..."
    },
    {
      "id": "loved_789xyz",
      "firstName": "Mary",
      "lastName": "Smith",
      "nickname": "Mom",
      "age": 75,
      "location": "Phoenix, AZ",
      "personality": "Warm, friendly, chatty. Loves sharing stories. Optimistic and family-oriented. Enjoys keeping busy w..."
    }
  ]
}
```

### POST /api/chat (with lovedOneId)

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hi, how are you today?"}
  ],
  "lovedOneId": "harold_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Hey there. I'm doing alright. How about you? How's the weather been on your end?"
  },
  "conversationId": "conv_abc123",
  "usage": {
    "prompt_tokens": 450,
    "completion_tokens": 25,
    "total_tokens": 475
  }
}
```

Notice: Harold's response is short, casual, concrete (asks about weather) - matching his personality!

---

## Testing the Integration

### 1. Test Loved Ones List
```bash
curl https://granular-ramonita-orthoptic.ngrok-free.dev/loved-ones \
  -H "ngrok-skip-browser-warning: true"
```

### 2. Test Chat with Harold
```bash
curl -X POST https://granular-ramonita-orthoptic.ngrok-free.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "messages": [{"role": "user", "content": "Tell me about your day"}],
    "lovedOneId": "harold_123"
  }'
```

### 3. Test Chat with Mary
```bash
curl -X POST https://granular-ramonita-orthoptic.ngrok-free.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "messages": [{"role": "user", "content": "Tell me about your day"}],
    "lovedOneId": "loved_789xyz"
  }'
```

You should see **different conversation styles** based on their personalities!

---

## Demo Flow

1. **User opens chat page**
   - Dropdown loads with Harold and Mary

2. **User selects Harold**
   - Chat history clears (fresh conversation)
   - Placeholder shows "Talk to Harold..."

3. **User sends: "Hi, how are you?"**
   - Backend generates Harold-specific system prompt
   - AI responds with Harold's personality (short, concrete, reserved)

4. **User switches to Mary**
   - Chat history clears
   - Placeholder shows "Talk to Mary..."

5. **User sends: "Hi, how are you?"**
   - Backend generates Mary-specific system prompt
   - AI responds with Mary's personality (warm, chatty, detailed)

---

## Styling Tips

### Tailwind CSS Classes

**Dropdown:**
```jsx
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   bg-white shadow-sm">
```

**Selected Profile Info:**
```jsx
<div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
  <div className="text-sm text-purple-900">
    📍 {location} • 👤 {age} years old
  </div>
  <div className="text-xs text-purple-700 mt-1 line-clamp-2">
    {personality}
  </div>
</div>
```

**Chat Messages:**
```jsx
// User message
<div className="bg-purple-600 text-white rounded-lg px-4 py-2">

// Assistant message
<div className="bg-gray-200 text-gray-900 rounded-lg px-4 py-2">
```

---

## Advanced: Custom Prompts Override

If you still want to send a custom system prompt (overriding auto-generation):

```typescript
// This will IGNORE the profile and use your custom prompt
api.sendMessage(messages, lovedOneId, customSystemPrompt);

// Update API client:
sendMessage: (messages: any[], lovedOneId: string, systemPrompt?: string) =>
  apiCall('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      lovedOneId,
      ...(systemPrompt && { systemPrompt }) // Only send if provided
    }),
  }),
```

---

## Success Criteria

✅ Dropdown displays both Harold and Mary
✅ Selecting Harold generates Harold-specific prompts
✅ Selecting Mary generates Mary-specific prompts
✅ Switching between them clears chat history
✅ AI responses match each person's communication style
✅ No manual system prompt needed in frontend

---

## Next Steps

1. **Copy the API client update** to your `lib/api.ts`
2. **Create the LovedOneSelector component**
3. **Update your chat page** to use the selector
4. **Test with both Harold and Mary**
5. **Notice the personality differences!**

---

**Backend URL:** `https://granular-ramonita-orthoptic.ngrok-free.dev`
**Current Profiles:** Harold Whitaker (harold_123), Mary Smith (loved_789xyz)
**Status:** ✅ Ready for integration

