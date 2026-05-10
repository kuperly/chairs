# How to Find Agora RESTful API Credentials

## Step-by-Step Guide

### Option 1: Through Project Settings (Recommended)

1. **Go to Agora Console**: https://console.agora.io/
2. **Click on your project** (the one you're using for this app)
3. **Look for "Config" or "Settings" tab**
4. **Scroll down to find "RESTful API" or "HTTP API" section**
5. You should see:
   - **Customer ID** (or "API Key" or "Customer Key")
   - **Customer Secret** (or "API Secret") - click "View" or "Download"

### Option 2: Through Account Settings

1. **Go to**: https://console.agora.io/
2. **Click your account name** (top right corner)
3. **Select "RESTful API"** from dropdown
4. You'll see:
   - **Customer ID**
   - **Customer Secret** (may need to download/view)

### Option 3: Through Advanced Settings

1. **In Agora Console**: https://console.agora.io/
2. **Go to "Settings" or "Account"**
3. **Look for "API Credentials" or "Developer Tools"**
4. Find the RESTful API section

## If You Still Can't Find It

**The credentials might be labeled as:**
- Customer ID / Customer Secret
- API Key / API Secret
- RESTful API Key / RESTful API Secret
- HTTP API Credentials

**Screenshot locations to check:**
- Project settings page
- Account settings dropdown
- Advanced settings
- API management section

## Alternative: Contact Agora Support

If you absolutely cannot find these credentials:
1. Go to https://console.agora.io/
2. Click "Support" or "Help"
3. Ask: "Where can I find my RESTful API Customer ID and Secret?"

## What We Have vs What We Need

✅ **Already configured:**
- NEXT_PUBLIC_AGORA_APP_ID (for RTC tokens)
- AGORA_APP_CERTIFICATE (for RTC tokens)

❌ **Still needed:**
- AGORA_CUSTOMER_ID (for RESTful API)
- AGORA_CUSTOMER_SECRET (for RESTful API)

These are two different sets of credentials for different Agora services.
