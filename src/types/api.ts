/**
 * API Type Definitions
 *
 * This file contains TypeScript type definitions for all API requests and responses.
 */

// ========== Common Types ==========

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ========== Health Check Types ==========

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  services?: Record<string, 'up' | 'down'>;
}

// ========== Chatbot Types ==========

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  message_id?: string;
  timestamp?: string;
  suggestions?: string[];
  metadata?: Record<string, any>;
}

// ========== Voice Types ==========

export interface VoiceRequest {
  audio_data?: Blob | File;
  audio_url?: string;
  language?: string;
  format?: 'wav' | 'mp3' | 'webm' | 'ogg';
}

export interface VoiceResponse {
  text: string;
  confidence?: number;
  language?: string;
  duration?: number;
  audio_id?: string;
}

export interface TextToSpeechRequest {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
  format?: 'wav' | 'mp3' | 'webm' | 'ogg';
}

export interface TextToSpeechResponse {
  audio_url: string;
  audio_data?: string; // base64 encoded audio
  duration?: number;
  format?: string;
}

// ========== Voice Assistant Types ==========

export interface VoiceAssistantRequest {
  audio_data?: Blob | File;
  text?: string;
  conversation_id?: string;
  context?: Record<string, any>;
}

export interface VoiceAssistantResponse {
  text_response: string;
  audio_response?: string; // URL or base64
  conversation_id: string;
  transcript?: string; // What the user said
  confidence?: number;
  actions?: AssistantAction[];
}

export interface AssistantAction {
  type: string;
  parameters?: Record<string, any>;
  result?: any;
}

// ========== Admin Types ==========

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    role: string;
  };
  expires_at?: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  created_at?: string;
  last_login?: string;
}

// ========== Voicebot Types ==========

export interface VoicebotSession {
  session_id: string;
  status: 'active' | 'inactive' | 'completed';
  started_at: string;
  ended_at?: string;
  messages?: ChatMessage[];
}

export interface VoicebotRequest {
  session_id?: string;
  audio_data?: Blob | File;
  text?: string;
  action?: 'start' | 'continue' | 'end';
}

export interface VoicebotResponse {
  session_id: string;
  response: string;
  audio_url?: string;
  status: 'active' | 'inactive' | 'completed';
  next_action?: string;
}

// ========== Documentation Types ==========

export interface ApiDocumentation {
  title: string;
  version: string;
  description?: string;
  endpoints: ApiEndpoint[];
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description?: string;
  parameters?: ApiParameter[];
  responses?: Record<number, string>;
}

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  default?: any;
}
