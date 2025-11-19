# Lonesome No More - API Documentation

## Overview

This document provides comprehensive API specifications for integrating the Lonesome No More frontend with your backend services.

**Base URL:** `https://api.lonesomenomore.com/v1` (update with your actual API base URL)

**Authentication:** All authenticated endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Beta Intake](#beta-intake)
3. [Dashboard](#dashboard)
4. [Conversations](#conversations)
5. [Profile Management](#profile-management)
6. [Call Scheduling](#call-scheduling)
7. [Webhooks](#webhooks)
8. [Error Handling](#error-handling)

---

## Authentication

### POST /auth/signup

Create a new user account.

**Request Body:**
\`\`\`json
{
  "email": "john.doe@example.com",
  "password": "securePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "userId": "usr_abc123def456",
  "email": "john.doe@example.com",
  "message": "Verification email sent"
}
\`\`\`

**Errors:**
- `400` - Invalid email format or weak password
- `409` - Email already exists

---

### POST /auth/login

Authenticate a user and receive JWT token.

**Request Body:**
\`\`\`json
{
  "email": "john.doe@example.com",
  "password": "securePassword123!"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "usr_abc123def456",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
\`\`\`

**Errors:**
- `401` - Invalid credentials
- `403` - Email not verified

---

### POST /auth/logout

Invalidate current session.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

---

### GET /auth/me

Get current authenticated user information.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "usr_abc123def456",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "lovedOnes": [
      {
        "id": "loved_789xyz",
        "firstName": "Mary",
        "lastName": "Smith",
        "relationship": "Mother"
      }
    ]
  }
}
\`\`\`

---

## Beta Intake

### POST /intake/submit

Submit completed beta intake form.

**Request Body:**
\`\`\`json
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
  "relationships": {
    "spouse": "Robert Smith (deceased 2020)",
    "spouseDetails": "Married for 50 years...",
    "children": "4 children: John (50), Sarah (48), Michael (45), Lisa (42)",
    "grandchildren": "8 grandchildren aged 10-25...",
    "friends": "Bridge club every Tuesday...",
    "pets": "Had a golden retriever named Max..."
  },
  "health": {
    "healthConditions": "Type 2 diabetes, arthritis...",
    "mobilityAids": "Uses a cane for longer walks",
    "cognitiveHealth": "Sharp memory, no concerns",
    "medications": "Metformin, blood pressure medication",
    "emotionalWellbeing": "Generally positive, occasional loneliness",
    "alertOnHealthMentions": true
  },
  "interests": {
    "hobbies": "Gardening, knitting, reading mystery novels",
    "music": "Frank Sinatra, big band era music",
    "entertainment": "Watches Jeopardy daily, enjoys classic movies",
    "sports": "Follows the local baseball team",
    "faith": "Active in her church community",
    "currentActivities": "Morning walks, afternoon reading..."
  },
  "communication": {
    "callFrequency": "daily",
    "preferredTime": "10:00",
    "timezone": "MST",
    "callLength": "10-15",
    "communicationStyle": "Prefers casual conversation, speaks clearly",
    "topicsToAvoid": "Discussions about death or serious illness",
    "emailSummaries": true,
    "missedCallAlerts": true,
    "moodAlerts": true
  }
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "intakeId": "intake_xyz789abc",
  "lovedOneId": "loved_456def789",
  "status": "pending_review",
  "message": "Application submitted successfully",
  "estimatedReviewTime": "2-3 business days"
}
\`\`\`

**Errors:**
- `400` - Validation error (missing required fields)
- `422` - Invalid data format
- `500` - Server error

---

## Dashboard

### GET /dashboard/summary

Get overview of loved one's conversations and status.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Query Parameters:**
- `lovedOneId` (optional) - If user has multiple loved ones

**Response (200 OK):**
\`\`\`json
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
    },
    {
      "id": "conv_def456",
      "date": "2025-01-13T10:00:00Z",
      "duration": 900,
      "summary": "Discussed her bridge club meeting...",
      "topics": ["Social Activities", "Career Memories"],
      "sentiment": "positive",
      "flags": [],
      "transcriptAvailable": true
    }
  ],
  "weeklyInsight": {
    "period": "2025-01-08 to 2025-01-15",
    "summary": "Mary has been consistently engaged and positive...",
    "moodTrend": "stable",
    "healthMentions": [],
    "notableTopics": ["Gardening", "Family visits", "Spring plans"]
  },
  "alerts": []
}
\`\`\`

**Errors:**
- `401` - Unauthorized
- `404` - Loved one not found

---

## Conversations

### GET /conversations/:id

Get detailed conversation transcript and metadata.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "conversation": {
    "id": "conv_abc123",
    "lovedOneId": "loved_789xyz",
    "date": "2025-01-15T10:00:00Z",
    "duration": 720,
    "summary": "Had a wonderful chat about her garden plans for spring. She's excited about planting tomatoes and mentioned her grandson's upcoming visit.",
    "fullTranscript": [
      {
        "timestamp": "00:00:00",
        "speaker": "AI",
        "text": "Good morning, Mary! How are you doing today?"
      },
      {
        "timestamp": "00:00:03",
        "speaker": "Mary",
        "text": "Oh, I'm doing just fine! The weather is beautiful today."
      }
    ],
    "topics": [
      {
        "topic": "Gardening",
        "mentions": 8,
        "sentiment": "very positive"
      },
      {
        "topic": "Family",
        "mentions": 3,
        "sentiment": "positive"
      }
    ],
    "sentiment": {
      "overall": "positive",
      "score": 0.82,
      "emotionalMarkers": ["excited", "hopeful", "content"]
    },
    "healthMentions": [],
    "flags": [],
    "insights": {
      "engagementLevel": "high",
      "memoryRecall": "excellent",
      "conversationFlow": "natural",
      "concernLevel": "none"
    }
  }
}
\`\`\`

**Errors:**
- `401` - Unauthorized
- `403` - Access denied (not your loved one)
- `404` - Conversation not found

---

### GET /conversations

List all conversations with pagination and filters.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Query Parameters:**
- `lovedOneId` (required) - ID of loved one
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `startDate` (optional) - Filter by date range (ISO 8601)
- `endDate` (optional) - Filter by date range (ISO 8601)
- `sentiment` (optional) - Filter by sentiment: `positive`, `neutral`, `concerned`
- `topic` (optional) - Filter by topic keyword

**Response (200 OK):**
\`\`\`json
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
\`\`\`

---

### GET /conversations/:id/transcript/download

Download conversation transcript as PDF or text file.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Query Parameters:**
- `format` (default: `pdf`) - Options: `pdf`, `txt`, `json`

**Response (200 OK):**
Returns file download with appropriate Content-Type header.

---

## Profile Management

### GET /profile/:lovedOneId

Get complete profile of loved one.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "profile": {
    "id": "loved_789xyz",
    "personalInfo": {
      "firstName": "Mary",
      "lastName": "Smith",
      "nickname": "Mom",
      "age": 75,
      "birthDate": "1950-03-15",
      "phoneNumber": "(555) 987-6543",
      "location": "Phoenix, AZ"
    },
    "lifeStory": {
      "birthplace": "Born in rural Iowa...",
      "career": "Elementary school teacher...",
      "achievements": "Raised 4 children...",
      "favoriteMemories": "Family vacations..."
    },
    "relationships": {
      "spouse": {...},
      "children": [...],
      "grandchildren": [...],
      "friends": [...]
    },
    "health": {
      "conditions": [...],
      "mobility": "...",
      "cognitive": "...",
      "medications": [...]
    },
    "interests": {
      "hobbies": [...],
      "music": [...],
      "entertainment": [...],
      "sports": [...]
    },
    "communicationPreferences": {
      "callFrequency": "daily",
      "preferredTime": "10:00",
      "timezone": "MST",
      "callDuration": "10-15 minutes"
    },
    "conversationContext": {
      "topicsOfInterest": ["Gardening", "Family", "Church"],
      "topicsToAvoid": ["Death", "Serious illness"],
      "communicationStyle": "Casual and warm",
      "recentTopics": ["Spring gardening plans", "Grandson's visit"]
    }
  }
}
\`\`\`

---

### PUT /profile/:lovedOneId

Update loved one's profile (full update).

**Headers:**
\`\`\`
Authorization: Bearer <token>
Content-Type: application/json
\`\`\`

**Request Body:**
Same structure as GET response, but with updated fields.

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {...}
}
\`\`\`

---

### PATCH /profile/:lovedOneId/enrich

Add new information to profile without full update.

**Headers:**
\`\`\`
Authorization: Bearer <token>
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "section": "interests",
  "field": "hobbies",
  "value": "Started learning watercolor painting",
  "append": true
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Profile enriched successfully"
}
\`\`\`

---

## Call Scheduling

### GET /calls/schedule

Get upcoming scheduled calls.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Query Parameters:**
- `lovedOneId` (optional)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "schedule": [
    {
      "id": "call_schedule_123",
      "lovedOneId": "loved_789xyz",
      "frequency": "daily",
      "preferredTime": "10:00",
      "timezone": "MST",
      "duration": "10-15",
      "nextCallAt": "2025-01-16T10:00:00Z",
      "active": true
    }
  ]
}
\`\`\`

---

### POST /calls/schedule

Create or update call schedule.

**Headers:**
\`\`\`
Authorization: Bearer <token>
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "lovedOneId": "loved_789xyz",
  "frequency": "daily",
  "preferredTime": "10:00",
  "timezone": "MST",
  "duration": "10-15",
  "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "startDate": "2025-01-16"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "scheduleId": "call_schedule_123",
  "message": "Call schedule created successfully",
  "nextCallAt": "2025-01-16T10:00:00Z"
}
\`\`\`

---

### PUT /calls/schedule/:id

Update existing call schedule.

**Headers:**
\`\`\`
Authorization: Bearer <token>
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "preferredTime": "14:00",
  "frequency": "every-other-day"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Schedule updated successfully",
  "nextCallAt": "2025-01-16T14:00:00Z"
}
\`\`\`

---

### DELETE /calls/schedule/:id

Cancel scheduled calls.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Call schedule cancelled"
}
\`\`\`

---

## Webhooks

### POST /webhooks/conversation-complete

**Incoming webhook from backend after each conversation completes.**

Frontend should implement this endpoint to receive real-time conversation updates.

**Request Body:**
\`\`\`json
{
  "event": "conversation.completed",
  "timestamp": "2025-01-15T10:12:30Z",
  "data": {
    "conversationId": "conv_abc123",
    "lovedOneId": "loved_789xyz",
    "userId": "usr_abc123def456",
    "date": "2025-01-15T10:00:00Z",
    "duration": 720,
    "summary": "Had a wonderful chat about her garden plans...",
    "sentiment": "positive",
    "topics": ["Gardening", "Family", "Future Plans"],
    "flags": [],
    "healthMentions": []
  }
}
\`\`\`

**Expected Response (200 OK):**
\`\`\`json
{
  "success": true,
  "received": true
}
\`\`\`

---

### POST /webhooks/alert

**Incoming webhook for urgent alerts (health concerns, mood changes).**

**Request Body:**
\`\`\`json
{
  "event": "alert.created",
  "severity": "high",
  "timestamp": "2025-01-15T10:05:30Z",
  "data": {
    "alertId": "alert_xyz789",
    "conversationId": "conv_abc123",
    "lovedOneId": "loved_789xyz",
    "userId": "usr_abc123def456",
    "alertType": "health_concern",
    "message": "Mary mentioned experiencing chest pain during today's call",
    "excerpt": "I've been having some chest pain this morning...",
    "actionRequired": true,
    "recommendations": [
      "Contact Mary immediately",
      "Consider consulting her healthcare provider",
      "Review full conversation transcript"
    ]
  }
}
\`\`\`

---

## Error Handling

### Standard Error Response Format

All error responses follow this structure:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific field that caused error",
      "reason": "detailed explanation"
    }
  }
}
\`\`\`

### Common Error Codes

| Status Code | Error Code | Description |
|------------|------------|-------------|
| 400 | `INVALID_REQUEST` | Malformed request body or missing required fields |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | User doesn't have permission to access resource |
| 404 | `NOT_FOUND` | Requested resource doesn't exist |
| 409 | `CONFLICT` | Resource already exists (e.g., duplicate email) |
| 422 | `VALIDATION_ERROR` | Request data failed validation |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Example Error Responses

**400 Bad Request:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "reason": "Must be a valid email address"
    }
  }
}
\`\`\`

**401 Unauthorized:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or invalid"
  }
}
\`\`\`

**404 Not Found:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Conversation not found",
    "details": {
      "conversationId": "conv_nonexistent"
    }
  }
}
\`\`\`

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- **Authentication endpoints:** 5 requests per minute per IP
- **Dashboard/Conversation endpoints:** 100 requests per minute per user
- **Profile updates:** 20 requests per minute per user
- **Webhooks:** Unlimited (authenticated by signature)

Rate limit headers are included in all responses:

\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642348800
\`\`\`

---

## Pagination

All list endpoints support pagination with consistent parameters:

**Query Parameters:**
- `page` (default: 1) - Page number (1-indexed)
- `limit` (default: 20, max: 100) - Items per page

**Response Format:**
\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 97,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
\`\`\`

---

## Data Types

### Timestamp Format
All timestamps use ISO 8601 format with UTC timezone:
\`\`\`
2025-01-15T10:00:00Z
\`\`\`

### Phone Numbers
Phone numbers stored as strings with formatting:
\`\`\`
"(555) 123-4567"
\`\`\`

### Duration
Call duration in seconds (integer):
\`\`\`
720  // 12 minutes
\`\`\`

### Sentiment Values
\`\`\`
"positive" | "neutral" | "concerned"
\`\`\`

### Call Frequency Values
\`\`\`
"daily" | "every-other-day" | "three-times-week" | "twice-week" | "weekly"
\`\`\`

---

## Security

### Authentication Flow

1. User signs up via `/auth/signup`
2. Email verification required (link sent to email)
3. User logs in via `/auth/login` → receives JWT token
4. Token included in `Authorization: Bearer <token>` header for all authenticated requests
5. Token expires after 24 hours → use refresh token to get new access token
6. User can logout via `/auth/logout` to invalidate session

### JWT Token Structure

\`\`\`json
{
  "sub": "usr_abc123def456",
  "email": "john.doe@example.com",
  "iat": 1642348800,
  "exp": 1642435200,
  "aud": "lonesomenomore-app",
  "iss": "lonesomenomore-api"
}
\`\`\`

### Webhook Signature Verification

All incoming webhooks include a signature header for verification:

\`\`\`
X-Webhook-Signature: sha256=hash_value
\`\`\`

Verify signature using HMAC-SHA256 with your webhook secret:

\`\`\`typescript
import crypto from 'crypto'

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return signature === `sha256=${expectedSignature}`
}
\`\`\`

---

## Testing

### Sandbox Environment

**Base URL:** `https://api-sandbox.lonesomenomore.com/v1`

Use sandbox for testing without affecting production data.

### Test Credentials

\`\`\`
Email: test@lonesomenomore.com
Password: TestPassword123!
\`\`\`

### Mock Webhooks

Use `/test/webhook` endpoint to simulate incoming webhooks in sandbox.

---

## Support

For API support or questions:
- **Email:** dev@lonesomenomore.com
- **Documentation:** https://docs.lonesomenomore.com
- **Status Page:** https://status.lonesomenomore.com

---

**Last Updated:** January 19, 2025  
**API Version:** v1.0.0
