# Production Deployment Checklist

When you're ready to deploy, update these configurations:

## Environment Variables for Production

```env
# backend/.env (Production)
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=use_a_strong_random_string_here
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-domain.com
```

## Google Cloud Console Updates

1. Add production redirect URLs:
   ```
   https://your-domain.com/api/auth/google/callback
   https://your-domain.com
   ```

2. Remove development URLs:
   ```
   http://localhost:5000/api/auth/google/callback
   http://localhost:5174
   ```

## CORS Configuration

Update `backend/server.js` CORS origin for production:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,  // This will use https://your-domain.com
  credentials: true
}));
```

## Session Cookie Settings

For HTTPS (production), update `backend/server.js`:

```javascript
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true, 
    sameSite: 'lax', 
    secure: true,  // ← Only HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 
  }
}));
```

## Database

- Move from MongoDB Atlas free tier for production
- Use VPC/Private endpoint for security
- Enable IP whitelist

## Security

- Never commit .env with real secrets
- Use environment variables from hosting platform
- Enable HTTPS
- Set strong JWT_SECRET (min 32 characters)

---

That's it! Keep all development .env values where they are for local testing.
