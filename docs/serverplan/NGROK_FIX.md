# Ngrok Browser Warning Fix

## Issue

When using free ngrok tunnels, browsers show an interstitial warning page that blocks API requests from web applications. This causes errors like:

```
Unable to connect to server. Please check if the backend is running.
```

## Root Cause

Ngrok's free tier shows a browser warning page on first visit that requires user interaction. This prevents fetch() calls from JavaScript/browser applications from reaching your backend.

## Solution

Add the `ngrok-skip-browser-warning` header to all API requests.

### Updated API Client

```typescript
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',  // ← This bypasses ngrok warning
      ...options.headers,
    },
  });
  return response.json();
}
```

## Testing the Fix

Test with curl:
```bash
curl -X POST https://granular-ramonita-orthoptic.ngrok-free.dev/auth/login \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"email":"test","password":"test"}'
```

Should return:
```json
{
  "success": true,
  "token": "...",
  "user": { ... }
}
```

## Status

✅ **Fixed** - All integration documentation has been updated with this header:
- V0_PROMPT.md
- docs/serverplan/QUICK_START.md
- docs/serverplan/README.md

## Alternative Solutions

If you still have issues:

1. **Visit ngrok URL directly first**: Open `https://granular-ramonita-orthoptic.ngrok-free.dev/` in your browser and click through the warning once

2. **Upgrade to ngrok paid plan**: Removes the browser warning entirely ($8/month)

3. **Use a different tunneling service**:
   - Cloudflare Tunnel (free, no warning page)
   - LocalTunnel (free, but less stable)
   - Tailscale Funnel (free, more complex setup)

## For v0 Integration

Make sure your v0 frontend includes this header in the API client (`lib/api.ts`). The updated V0_PROMPT.md already includes this fix.

---

**Last Updated:** November 19, 2025
