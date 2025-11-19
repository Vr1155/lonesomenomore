# LoneSomeNoMore Backend API Reference

**Base URL:** `https://granular-ramonita-orthoptic.ngrok-free.dev`

**Authentication:** Mock authentication - all requests automatically authenticated for prototype

---

## Table of Contents

1. [Authentication](#authentication)
2. [Chat API](#chat-api)
3. [Dashboard](#dashboard)
4. [Conversations](#conversations)
5. [Profile & Intake](#profile--intake)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)

---

## Authentication

### POST /auth/login

Mock login endpoint - always succeeds for prototype.

**Request:**
```json
POST /auth/login
Content-Type: application/json

{
  "email": "any@email.com",
  "password": "any-password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "mock_jwt_token_here",
  "refreshToken": "mock_refresh_token",
  "user": {
    "id": "user_1",
    "email": "test@lonesomenomore.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

**Implementation Example:**
```typescript
async function login(email: string, password: string) {
  const response = await fetch('https://granular-ramonita-orthoptic.ngrok-free.dev/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}
```

---

### GET /auth/me

Get current authenticated user.

**Request:**
```
GET /auth/me
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_1",
    "email": "test@lonesomenomore.com",
    "first_name": "Test",
    "last_name": "User",
    "lovedOnes": [
      {
        "id": "loved_789xyz",
        "firstName": "Mary",
        "lastName": "Smith",
        "relationship": "Family"
      }
    ]
  }
}
```

**Implementation Example:**
```typescript
async function getCurrentUser() {
  const response = await fetch('https://granular-ramonita-orthoptic.ngrok-free.dev/auth/me');
  return response.json();
}
```

---

### POST /auth/logout

Mock logout endpoint.

**Request:**
```
POST /auth/logout
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Chat API

### POST /api/chat

Send message and receive AI response.

**Request:**
```json
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Hello! How are you today?"
    }
  ],
  "lovedOneId": "loved_789xyz",
  "model": "anthropic/claude-3.5-sonnet"
}
```

**Request Fields:**
- `messages` (required): Array of message objects with `role` and `content`
- `lovedOneId` (optional): ID of loved one for context
- `model` (optional): Model to use (default: anthropic/claude-3.5-sonnet)
- `systemPrompt` (optional): Custom system prompt
- `systemPromptFile` (optional): Path to system prompt file

**Response (200 OK):**
```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Hello! I'm doing well, thank you for asking. How has your day been?"
  },
  "conversationId": "conv_abc12345",
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 15,
    "total_tokens": 40
  }
}
```

**Implementation Example:**
```typescript
async function sendMessage(messages: Array<{role: string, content: string}>, lovedOneId?: string) {
  const response = await fetch('https://granular-ramonita-orthoptic.ngrok-free.dev/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, lovedOneId })
  });
  return response.json();
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to process chat request"
  }
}
```

---

## Dashboard

### GET /dashboard/summary

Get dashboard overview with stats and recent conversations.

**Request:**
```
GET /dashboard/summary?lovedOneId=loved_789xyz
```

**Query Parameters:**
- `lovedOneId` (optional): Specific loved one ID (defaults to loved_789xyz)

**Response (200 OK):**
```json
{
  "success": true,
  "lovedOne": {
    "id": "loved_789xyz",
    "firstName": "Mary",
    "lastName": "Smith",
    "nickname": "Mom",
    "phoneNumber": "(555) 987-6543"
  },
  "stats": {
    "lastCallDate": "2025-01-15T10:00:00Z",
    "totalCalls": 24,
    "averageMood": "positive",
    "currentStreak": 24,
    "upcomingCall": {
      "scheduledAt": "2025-01-16T10:00:00Z",
      "timezone": "MST"
    }
  },
  "recentConversations": [
    {
      "id": "conv_abc123",
      "date": "2025-01-15T10:00:00Z",
      "duration": 720,
      "summary": "Had a wonderful chat about her garden plans for spring...",
      "topics": ["Gardening", "Family", "Future Plans"],
      "sentiment": "positive",
      "flags": [],
      "transcriptAvailable": true
    }
  ],
  "weeklyInsight": {
    "period": "2025-01-08 to 2025-01-15",
    "summary": "Mary has been consistently engaged and positive this week.",
    "moodTrend": "stable",
    "healthMentions": [],
    "notableTopics": ["Gardening", "Family visits", "Spring plans"]
  },
  "alerts": []
}
```

**Implementation Example:**
```typescript
async function getDashboardSummary(lovedOneId?: string) {
  const params = new URLSearchParams();
  if (lovedOneId) params.append('lovedOneId', lovedOneId);

  const response = await fetch(
    `https://granular-ramonita-orthoptic.ngrok-free.dev/dashboard/summary?${params}`
  );
  return response.json();
}
```

---

## Conversations

### GET /conversations

List all conversations with pagination.

**Request:**
```
GET /conversations?lovedOneId=loved_789xyz&page=1&limit=20
```

**Query Parameters:**
- `lovedOneId` (required): ID of loved one
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_abc123",
      "date": "2025-01-15T10:00:00Z",
      "duration": 720,
      "summary": "Had a wonderful chat...",
      "sentiment": "positive"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 52,
    "itemsPerPage": 20
  }
}
```

**Implementation Example:**
```typescript
async function getConversations(lovedOneId: string, page = 1, limit = 20) {
  const params = new URLSearchParams({
    lovedOneId,
    page: page.toString(),
    limit: limit.toString()
  });

  const response = await fetch(
    `https://granular-ramonita-orthoptic.ngrok-free.dev/conversations?${params}`
  );
  return response.json();
}
```

---

### GET /conversations/:id

Get detailed conversation with full transcript.

**Request:**
```
GET /conversations/conv_abc123
```

**Response (200 OK):**
```json
{
  "success": true,
  "conversation": {
    "id": "conv_abc123",
    "lovedOneId": "loved_789xyz",
    "date": "2025-01-15T10:00:00Z",
    "duration": 720,
    "summary": "Had a wonderful chat about her garden plans for spring.",
    "fullTranscript": [
      {
        "timestamp": "2025-01-15T10:00:00Z",
        "speaker": "AI",
        "text": "Good morning, Mary! How are you doing today?"
      },
      {
        "timestamp": "2025-01-15T10:00:03Z",
        "speaker": "User",
        "text": "Oh, I'm doing just fine! The weather is beautiful today."
      }
    ],
    "topics": ["Gardening", "Family"],
    "sentiment": {
      "overall": "positive",
      "score": 0.8,
      "emotionalMarkers": ["engaged", "positive"]
    },
    "healthMentions": [],
    "flags": [],
    "insights": {
      "engagementLevel": "high",
      "memoryRecall": "good",
      "conversationFlow": "natural",
      "concernLevel": "none"
    }
  }
}
```

**Implementation Example:**
```typescript
async function getConversation(conversationId: string) {
  const response = await fetch(
    `https://granular-ramonita-orthoptic.ngrok-free.dev/conversations/${conversationId}`
  );
  return response.json();
}
```

---

## Profile & Intake

### POST /intake/submit

Submit beta intake form to create new loved one profile.

**Request:**
```json
POST /intake/submit
Content-Type: application/json

{
  "your-info": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "relationship": "Son"
  },
  "loved-one": {
    "lovedOneFirstName": "Mary",
    "lovedOneLastName": "Smith",
    "nickname": "Mom",
    "age": "75",
    "gender": "female",
    "phoneNumber": "(555) 987-6543",
    "location": "Phoenix, AZ"
  },
  "life-story": {
    "birthplace": "Born in rural Iowa, grew up on a farm...",
    "career": "Elementary school teacher for 35 years...",
    "achievements": "Raised 4 children, community volunteer...",
    "memories": "Family vacations to the lake...",
    "challenges": "Lost husband 5 years ago..."
  },
  "interests": {
    "hobbies": "Gardening, knitting, reading mystery novels",
    "music": "Frank Sinatra, big band era music",
    "entertainment": "Watches Jeopardy daily, enjoys classic movies"
  },
  "health": {
    "healthConditions": "Type 2 diabetes, arthritis...",
    "mobilityAids": "Uses a cane for longer walks",
    "cognitiveHealth": "Sharp memory, no concerns"
  },
  "communication": {
    "callFrequency": "daily",
    "preferredTime": "10:00",
    "timezone": "MST",
    "callLength": "10-15"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "intakeId": "intake_xyz789abc",
  "lovedOneId": "loved_456def789",
  "status": "approved",
  "message": "Application submitted successfully",
  "estimatedReviewTime": "Approved for prototype"
}
```

**Implementation Example:**
```typescript
async function submitIntake(formData: any) {
  const response = await fetch('https://granular-ramonita-orthoptic.ngrok-free.dev/intake/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return response.json();
}
```

---

### GET /profile/:lovedOneId

Get complete profile of loved one.

**Request:**
```
GET /profile/loved_789xyz
```

**Response (200 OK):**
```json
{
  "success": true,
  "profile": {
    "id": "loved_789xyz",
    "personalInfo": {
      "firstName": "Mary",
      "lastName": "Smith",
      "nickname": "Mom",
      "age": 75,
      "phoneNumber": "(555) 987-6543",
      "location": "Phoenix, AZ"
    },
    "lifeStory": {
      "birthplace": "Born in rural Iowa...",
      "career": "Elementary school teacher...",
      "achievements": "Raised 4 children..."
    },
    "interests": {
      "hobbies": ["Gardening", "Knitting", "Reading"],
      "music": ["Frank Sinatra", "Big band"]
    },
    "health": {
      "conditions": ["Type 2 diabetes", "Arthritis"],
      "mobility": "Uses a cane"
    },
    "communicationPreferences": {
      "callFrequency": "daily",
      "preferredTime": "10:00",
      "timezone": "MST"
    }
  }
}
```

**Implementation Example:**
```typescript
async function getProfile(lovedOneId: string) {
  const response = await fetch(
    `https://granular-ramonita-orthoptic.ngrok-free.dev/profile/${lovedOneId}`
  );
  return response.json();
}
```

---

### PATCH /profile/:lovedOneId/enrich

Update or add information to profile.

**Request:**
```json
PATCH /profile/loved_789xyz/enrich
Content-Type: application/json

{
  "section": "interests",
  "field": "hobbies",
  "value": "Started learning watercolor painting",
  "append": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile enriched successfully"
}
```

**Implementation Example:**
```typescript
async function enrichProfile(lovedOneId: string, update: any) {
  const response = await fetch(
    `https://granular-ramonita-orthoptic.ngrok-free.dev/profile/${lovedOneId}/enrich`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    }
  );
  return response.json();
}
```

---

## Data Models

### Message
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  lovedOneId: string;
  date: string;
  duration: number;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'concerned';
  topics: string[];
  flags: string[];
  transcriptAvailable: boolean;
}
```

### LovedOne
```typescript
interface LovedOne {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  age: number;
  phoneNumber: string;
  location: string;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lovedOnes?: LovedOne[];
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_REQUEST | Missing required fields or malformed request |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_ERROR | Server error |

### Error Handling Example

```typescript
async function handleApiCall() {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## Testing

### Quick Test Examples

**Test Health:**
```bash
curl https://granular-ramonita-orthoptic.ngrok-free.dev/
```

**Test Login:**
```bash
curl -X POST https://granular-ramonita-orthoptic.ngrok-free.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Test Chat:**
```bash
curl -X POST https://granular-ramonita-orthoptic.ngrok-free.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

**Test Dashboard:**
```bash
curl https://granular-ramonita-orthoptic.ngrok-free.dev/dashboard/summary
```

---

## Rate Limits

No rate limits for prototype version.

## CORS

CORS is enabled for all origins in prototype.

## API Versioning

Current version: v1.0.0 (no version prefix in URLs for prototype)

---

**Last Updated:** November 19, 2025
