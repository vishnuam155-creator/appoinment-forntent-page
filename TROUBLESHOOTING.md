# Backend Connection Troubleshooting

## Current Error

```
Not Found: /,http://127.0.0.1:8000/api/chatbot/
```

This error shows a malformed URL with a comma, indicating the axios baseURL is not being properly loaded.

## Solution Steps

### 1. **RESTART THE DEV SERVER** (Most Important!)

Vite requires a restart to load `.env.local` changes:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Verify Environment Variable is Loaded

After restarting, open the browser console (F12) and you should see:

```
API Base URL: http://127.0.0.1:8000
```

If you see `undefined` or the wrong URL, check the next steps.

### 3. Verify .env.local File Exists

```bash
cat .env.local
```

Should output:
```
# Backend API Base URL
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Check Backend Server is Running

Make sure your Django/FastAPI backend is running:

```bash
curl http://127.0.0.1:8000/api/health/
```

### 5. Check Browser Console

When you send a message, you should see in the console:

```
API Base URL: http://127.0.0.1:8000
Making request to: http://127.0.0.1:8000/api/chatbot/
Request config: { baseURL: "http://127.0.0.1:8000", url: "/api/chatbot/" }
```

## Common Issues

### Issue: Environment variable is `undefined`

**Cause:** Dev server wasn't restarted after creating `.env.local`

**Solution:**
```bash
# Stop dev server with Ctrl+C, then:
npm run dev
```

### Issue: CORS errors in browser console

**Cause:** Backend not allowing frontend origin

**Solution:** Add CORS configuration to your backend:

**Django:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

**FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Backend returns 404

**Cause:** API endpoints don't exist or are configured differently

**Solution:** Check your backend URLs match:
- `/api/chatbot/` - POST endpoint for chat messages
- `/api/voice/` - POST endpoint for speech-to-text
- `/api/voice-assistant/` - POST endpoint for voice assistant
- `/api/health/` - GET endpoint for health check

## Testing Connection

### Quick Test in Browser Console

```javascript
// Open browser console (F12) and run:
fetch('http://127.0.0.1:8000/api/health/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Test with curl

```bash
# Test health endpoint
curl http://127.0.0.1:8000/api/health/

# Test chatbot endpoint
curl -X POST http://127.0.0.1:8000/api/chatbot/ \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

## Expected Request Flow

1. User types message in frontend
2. Frontend calls `sendChatMessage({ message: "hello" })`
3. Axios makes POST to `http://127.0.0.1:8000/api/chatbot/`
4. Backend processes and returns JSON response
5. Frontend displays the response

## Still Not Working?

Check these in order:

1. ✅ .env.local file exists with correct content
2. ✅ Dev server was restarted after creating .env.local
3. ✅ Backend server is running on port 8000
4. ✅ Backend has CORS configured
5. ✅ Browser console shows correct API Base URL
6. ✅ Network tab shows request going to correct URL
7. ✅ Backend logs show incoming requests

If all checks pass but still failing, share:
- Browser console output
- Network tab request details
- Backend server logs
