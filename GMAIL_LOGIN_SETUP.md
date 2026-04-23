# Gmail Login Setup Guide

## Summary of Changes Made

Your fitness platform now supports Gmail/Google authentication! The infrastructure has been fully set up. Here's what was implemented:

### Backend Changes
- ✅ **Passport Configuration** - OAuth 2.0 strategy configured
- ✅ **Google OAuth Routes** - `/api/auth/google` and callback handler
- ✅ **User Model** - Extended to support Google login (googleId, authProvider fields)
- ✅ **Database** - Users can now login via Gmail without a password

### Frontend Changes
- ✅ **Login Page** - Added "Sign in with Google" button
- ✅ **OAuth Handling** - Automatic token parsing and redirect to dashboard

### Servers Status
- ✅ Backend: Running on `http://localhost:5000`
- ✅ Frontend: Running on `http://localhost:5174`

---

## Setup Instructions

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing) named "FitForge"
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5174` (for development)

### Step 2: Get Your Credentials

- Copy your **Client ID**
- Copy your **Client Secret**

### Step 3: Update Environment Variables

Edit `backend/.env` and replace:

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5174
```

### Step 4: Restart Backend Server

The backend will automatically pick up the new environment variables. If it's still running, you may need to restart it:

```bash
# Press Ctrl+C to stop the server, then:
npm run dev
```

---

## How Gmail Login Works

### Login Flow

1. **User clicks "Sign in with Google"** button on login page
2. **Redirects to Google OAuth** → User approves permissions
3. **Backend receives Google profile** → Passport strategy handles it
4. **User lookup/creation**:
   - If user with this Google ID exists → Login
   - If email exists → Link Google ID to account
   - Otherwise → Create new user from Google profile
5. **JWT token generated** → Redirect to dashboard
6. **User logged in** ✅

### Account Linking

- If you already signed up with email, your first Google login will link the Google account to your email
- This means: `user@example.com` (email signup) = `user@example.com` (Google signup) ✅

---

## Testing

### Option 1: With Email/Password (Demo)
```
Email: user@demo.com
Password: password123
```

### Option 2: With Your Personal Gmail
1. Click "Sign in with Google" button
2. Select your Gmail account
3. Approve permissions
4. Should redirect to dashboard ✅

---

## Troubleshooting

### Error: "Invalid credentials" on Google login
- **Fix**: Make sure Google client credentials are correct in `.env`
- Check that `GOOGLE_CALLBACK_URL` in `.env` matches what's registered in Google Cloud

### Error: "Address already in use" on backend
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### OAuth not redirecting to dashboard
- Make sure `FRONTEND_URL` in `.env` is correct
- Check browser console for errors
- Verify token exists in localStorage

### User profile not showing after Google login
- Profile is automatically created on first Google login
- Check MongoDB to verify user was created
- Profile data syncs on next page refresh

---

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/signup` - Create account
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google callback (automatic)

### Protected Endpoints
- `GET /api/auth/me` - Get current user (requires JWT token)

---

## Environment Variables Reference

```env
# API Configuration
PORT=5000
JWT_SECRET=soca_dev_jwt_secret_key_2024
JWT_EXPIRE=7d

# Database
MONGO_URI=mongodb+srv://...

# Gmail/Email (optional, for future email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

# Google OAuth (Required for Gmail login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5174
```

---

## File Changes Summary

### New Files
- `backend/config/passport.js` - Passport Google OAuth strategy

### Modified Files
- `backend/.env` - Added Google OAuth config
- `backend/package.json` - Added passport packages
- `backend/server.js` - Added Passport middleware & session support
- `backend/models/User.js` - Added googleId & authProvider fields
- `backend/controllers/authController.js` - Added googleAuth handler
- `backend/routes/auth.js` - Added Google OAuth routes
- `frontend/package.json` - Added @react-oauth/google
- `frontend/src/pages/Login.jsx` - Added Google sign-in button & OAuth flow

---

## Next Steps

1. ✅ Set up Google OAuth credentials (Step 1-3 above)
2. ✅ Restart backend server to load credentials
3. ✅ Test with "Sign in with Google" button
4. ✅ Verify user profile/dashboard loads correctly

**Once configured, your app will support both email/password AND Gmail login!** 🎉
