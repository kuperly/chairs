# Agora Server-Side Viewer Tracking Setup

## Overview

The application now uses server-side viewer tracking by querying Agora's Channel Query API. This is more reliable than client-side tracking.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Agora App Credentials (already configured)
NEXT_PUBLIC_AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_app_certificate

# Agora RESTful API Credentials (NEW - required for server-side tracking)
AGORA_CUSTOMER_ID=your_customer_id
AGORA_CUSTOMER_SECRET=your_customer_secret
```

## How to Get Agora RESTful API Credentials

1. **Log in to Agora Console**
   - Go to https://console.agora.io/
   - Sign in with your account

2. **Navigate to RESTful API**
   - Click on your username in the top right
   - Select "RESTful API" from the dropdown menu
   - Or go directly to: https://console.agora.io/restfulApi

3. **Get Customer ID and Customer Secret**
   - You'll see your **Customer ID** displayed
   - Click "Download" or "View" to get your **Customer Secret**
   - **IMPORTANT**: Save the Customer Secret securely - you can only view it once

4. **Add to Environment Variables**
   ```bash
   AGORA_CUSTOMER_ID=abc123def456  # Your Customer ID
   AGORA_CUSTOMER_SECRET=xyz789uvw012  # Your Customer Secret
   ```

5. **Deploy to Vercel**
   ```bash
   vercel env add AGORA_CUSTOMER_ID
   vercel env add AGORA_CUSTOMER_SECRET
   ```

## How It Works

1. **Server-Side Sync**: Every 5 seconds, the app queries Agora's API to get the real number of users in the channel
2. **Database Update**: The server updates the `viewerCount` in the database
3. **Real-time Broadcast**: Supabase Realtime broadcasts the change to all connected clients
4. **Client Display**: All viewers and broadcasters see the updated count in real-time

## Benefits

- ✅ **100% Accurate**: Gets real count directly from Agora, not client-side estimates
- ✅ **Reliable**: Not affected by browser crashes or network issues
- ✅ **Secure**: Credentials stay on server, never exposed to client
- ✅ **Scalable**: Single source of truth from Agora

## Troubleshooting

If viewer count shows 0:

1. **Check environment variables are set**:
   ```bash
   echo $AGORA_CUSTOMER_ID
   echo $AGORA_CUSTOMER_SECRET
   ```

2. **Check server logs** for Agora API errors:
   ```bash
   vercel logs
   ```

3. **Verify Agora credentials** in console:
   - https://console.agora.io/restfulApi

4. **Test API endpoint manually**:
   ```bash
   curl https://your-app.vercel.app/api/events/[event-id]/sync-viewers
   ```
