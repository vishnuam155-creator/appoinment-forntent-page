# API Setup Documentation

This document explains how to use the API services in your frontend application.

## Table of Contents

1. [Configuration](#configuration)
2. [Available Endpoints](#available-endpoints)
3. [Usage Examples](#usage-examples)
4. [React Query Hooks](#react-query-hooks)
5. [Error Handling](#error-handling)
6. [TypeScript Types](#typescript-types)

## Configuration

### Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `VITE_API_BASE_URL` with your backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

### Base URLs

The following backend endpoints are available:

- `admin/` - Admin authentication and user management
- `api/docs/` - API documentation
- `api/health/` - Health check endpoint
- `api/chatbot/` - Chatbot interactions
- `api/voice/` - Speech-to-text processing
- `api/voice-assistant/` - Voice assistant functionality
- `voicebot/` - Voicebot sessions
- `admin-panel/` - Admin panel data

## Available Endpoints

### Health & Documentation

```typescript
import { checkHealth, getApiDocs, pingServer } from '@/services/api';

// Check API health
const health = await checkHealth();

// Get API documentation
const docs = await getApiDocs();

// Ping server (returns boolean)
const isOnline = await pingServer();
```

### Chatbot API

```typescript
import { sendChatMessage, getChatHistory, startConversation } from '@/services/api';

// Send a message
const response = await sendChatMessage({
  message: 'Hello!',
  conversation_id: 'conv-123',
  context: { user_id: 'user-456' }
});

// Get chat history
const history = await getChatHistory('conv-123');

// Start new conversation
const newConversation = await startConversation('Hello');
```

### Voice API

```typescript
import { speechToText, textToSpeech, getSupportedLanguages } from '@/services/api';

// Convert speech to text
const audioBlob = new Blob([audioData], { type: 'audio/wav' });
const transcript = await speechToText({
  audio_data: audioBlob,
  language: 'en',
  format: 'wav'
});

// Convert text to speech
const audio = await textToSpeech({
  text: 'Hello world',
  voice: 'en-US-1',
  language: 'en',
  speed: 1.0
});

// Get supported languages
const languages = await getSupportedLanguages();
```

### Voice Assistant API

```typescript
import { sendVoiceAssistantRequest, startVoiceAssistantSession } from '@/services/api';

// Start a session
const session = await startVoiceAssistantSession();

// Send voice request
const response = await sendVoiceAssistantRequest({
  audio_data: audioBlob,
  conversation_id: session.session_id,
  context: { user_preferences: {} }
});
```

### Voicebot API

```typescript
import { sendVoicebotRequest, startVoicebotSession } from '@/services/api';

// Start voicebot session
const session = await startVoicebotSession();

// Interact with voicebot
const response = await sendVoicebotRequest({
  session_id: session.session_id,
  audio_data: audioBlob,
  action: 'continue'
});
```

### Admin API

```typescript
import { adminLogin, getCurrentUser, getAllUsers } from '@/services/api';

// Admin login
const loginResponse = await adminLogin({
  username: 'admin',
  password: 'password123'
});

// Get current user
const user = await getCurrentUser();

// Get all users (admin only)
const users = await getAllUsers();
```

## Usage Examples

### Using Direct API Calls

```typescript
import { sendChatMessage } from '@/services/api/chatbot';

const handleSendMessage = async (message: string) => {
  try {
    const response = await sendChatMessage({
      message,
      conversation_id: conversationId
    });
    console.log('Bot response:', response.response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
```

## React Query Hooks

The project includes custom React Query hooks for easier state management:

### Chatbot Hooks

```typescript
import { useSendChatMessage, useChatHistory } from '@/hooks/useApi';

function ChatComponent() {
  // Mutation hook for sending messages
  const sendMessage = useSendChatMessage({
    onSuccess: (data) => {
      console.log('Message sent:', data);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  // Query hook for chat history
  const { data: history, isLoading } = useChatHistory(conversationId);

  const handleSend = (message: string) => {
    sendMessage.mutate({
      message,
      conversation_id: conversationId
    });
  };

  return (
    <div>
      {isLoading ? 'Loading...' : 'Ready'}
      <button onClick={() => handleSend('Hello')}>
        Send Message
      </button>
    </div>
  );
}
```

### Voice Assistant Hooks

```typescript
import { useVoiceAssistant, useStartVoiceAssistantSession } from '@/hooks/useApi';

function VoiceAssistantComponent() {
  const startSession = useStartVoiceAssistantSession({
    onSuccess: (data) => {
      console.log('Session started:', data.session_id);
    }
  });

  const voiceAssistant = useVoiceAssistant({
    onSuccess: (response) => {
      console.log('Response:', response.text_response);
      if (response.audio_response) {
        playAudio(response.audio_response);
      }
    }
  });

  const handleVoiceInput = (audioBlob: Blob) => {
    voiceAssistant.mutate({
      audio_data: audioBlob,
      conversation_id: sessionId
    });
  };

  return (
    <div>
      <button onClick={() => startSession.mutate()}>
        Start Session
      </button>
      {voiceAssistant.isPending && <div>Processing...</div>}
    </div>
  );
}
```

### Health Check Hook

```typescript
import { useHealthCheck } from '@/hooks/useApi';

function HealthStatus() {
  const { data, isLoading, error } = useHealthCheck({
    refetchInterval: 30000 // Check every 30 seconds
  });

  if (isLoading) return <div>Checking...</div>;
  if (error) return <div>API Offline</div>;

  return (
    <div>
      Status: {data?.status}
      <div>Version: {data?.version}</div>
    </div>
  );
}
```

## Error Handling

All API calls automatically handle common errors through axios interceptors:

- **401 Unauthorized**: Clears auth token and logs user out
- **403 Forbidden**: Logs insufficient permissions error
- **404 Not Found**: Logs resource not found error
- **500 Server Error**: Logs internal server error

You can also handle errors in your components:

```typescript
const mutation = useSendChatMessage({
  onError: (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      navigate('/login');
    } else {
      // Handle other errors
      toast.error('Failed to send message');
    }
  }
});
```

## TypeScript Types

All API request and response types are defined in `/src/types/api.ts`:

```typescript
import type {
  ChatRequest,
  ChatResponse,
  VoiceRequest,
  VoiceResponse,
  VoiceAssistantRequest,
  VoiceAssistantResponse,
  // ... and more
} from '@/types/api';
```

## Authentication

### Setting Auth Token

```typescript
import { setAuthToken } from '@/services/api';

// After successful login
setAuthToken(token);

// Clear token on logout
setAuthToken(null);
```

### Using Protected Endpoints

Once a token is set, all subsequent API calls will automatically include the Authorization header:

```typescript
// Login first
const response = await adminLogin({ username, password });
// Token is automatically stored

// Now all requests include the token
const users = await getAllUsers();
```

## File Structure

```
src/
├── config/
│   └── api.ts              # Axios configuration and interceptors
├── services/
│   └── api/
│       ├── index.ts        # Export all services
│       ├── chatbot.ts      # Chatbot API functions
│       ├── voice.ts        # Voice & Voice Assistant API functions
│       ├── health.ts       # Health check API functions
│       └── admin.ts        # Admin API functions
├── types/
│   └── api.ts              # TypeScript type definitions
└── hooks/
    └── useApi.ts           # React Query hooks
```

## Best Practices

1. **Use React Query Hooks**: Prefer using hooks over direct API calls for better caching and state management
2. **Handle Errors**: Always provide error handling in your components
3. **Type Safety**: Use the provided TypeScript types for better developer experience
4. **Environment Variables**: Never commit `.env.local` files with sensitive data
5. **Token Management**: Use the provided `setAuthToken` and `getAuthToken` helpers

## Testing API Connection

To test if your API is connected properly:

```typescript
import { pingServer } from '@/services/api';

const testConnection = async () => {
  const isOnline = await pingServer();
  console.log('API is', isOnline ? 'online' : 'offline');
};
```

## Need Help?

If you encounter any issues:

1. Check that `VITE_API_BASE_URL` is correctly set in `.env.local`
2. Verify your backend server is running
3. Check browser console for detailed error messages
4. Review the API documentation at `/api/docs/`
