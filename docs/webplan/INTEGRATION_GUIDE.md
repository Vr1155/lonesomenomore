# Lonesome No More - Frontend-Backend Integration Guide

## Overview

This guide explains how to integrate the Next.js frontend with your backend API services for the Lonesome No More application.

---

## Prerequisites

1. **Environment Variables Setup**
2. **API Client Configuration**
3. **Authentication Flow**
4. **Error Handling**
5. **State Management**

---

## 1. Environment Variables Setup

Create a `.env.local` file in the root of your Next.js project:

\`\`\`bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.lonesomenomore.com/v1
API_SECRET_KEY=your_secret_key_here

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
JWT_SECRET=your_jwt_secret_here

# Webhook Configuration (for receiving backend notifications)
WEBHOOK_SECRET=your_webhook_secret_here

# Feature Flags
NEXT_PUBLIC_ENABLE_BETA_FEATURES=true

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
\`\`\`

**Important:** Never commit `.env.local` to version control. Add it to `.gitignore`.

---

## 2. Key Integration Points

### Beta Intake Form

The form automatically saves to localStorage and can be connected to your backend by updating the submit handler in `components/beta-intake/beta-intake-form.tsx`.

### Dashboard

Replace mock data in `components/dashboard/dashboard-content.tsx` with real API calls using the provided API client.

### Webhooks

Set up webhook endpoints in `app/api/webhooks/` to receive real-time updates from your backend.

---

## 3. Testing Integration

1. Start the development server: `npm run dev`
2. Fill out the beta intake form
3. Check browser console for API calls
4. Verify data is sent to your backend
5. Test dashboard data fetching
6. Verify webhook endpoints receive data

---

## 4. Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Configure CORS on backend to allow frontend domain
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure webhook endpoints on backend
- [ ] Test authentication flow end-to-end
- [ ] Verify all API endpoints are accessible
- [ ] Set up monitoring and error tracking

---

## Need Help?

Refer to the detailed API documentation in `docs/API_REFERENCE.md` for complete endpoint specifications and examples.
