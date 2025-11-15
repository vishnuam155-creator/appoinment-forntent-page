import apiClient from '@/config/api';
import type {
  VoiceRequest,
  VoiceResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
  VoiceAssistantRequest,
  VoiceAssistantResponse,
  VoicebotRequest,
  VoicebotResponse,
  VoicebotSession,
} from '@/types/api';

/**
 * Voice API Service
 *
 * Handles all API calls related to voice functionality including:
 * - Speech-to-Text (STT)
 * - Text-to-Speech (TTS)
 * - Voice Assistant
 * - Voicebot
 */

// ========== Voice (Speech-to-Text) ==========

/**
 * Convert speech to text
 * @param request - The voice request containing audio data
 * @returns Promise with transcribed text
 */
export const speechToText = async (request: VoiceRequest): Promise<VoiceResponse> => {
  const formData = new FormData();

  if (request.audio_data) {
    formData.append('audio', request.audio_data);
  }
  if (request.audio_url) {
    formData.append('audio_url', request.audio_url);
  }
  if (request.language) {
    formData.append('language', request.language);
  }
  if (request.format) {
    formData.append('format', request.format);
  }

  const response = await apiClient.post<VoiceResponse>('/api/voice/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Convert text to speech
 * @param request - The text-to-speech request
 * @returns Promise with audio URL or data
 */
export const textToSpeech = async (
  request: TextToSpeechRequest
): Promise<TextToSpeechResponse> => {
  const response = await apiClient.post<TextToSpeechResponse>('/api/voice/tts/', request);
  return response.data;
};

/**
 * Get supported languages for voice recognition
 * @returns Promise with array of language codes
 */
export const getSupportedLanguages = async (): Promise<string[]> => {
  const response = await apiClient.get<{ languages: string[] }>('/api/voice/languages/');
  return response.data.languages;
};

/**
 * Get available TTS voices
 * @returns Promise with array of voice options
 */
export const getAvailableVoices = async (): Promise<
  Array<{ id: string; name: string; language: string }>
> => {
  const response = await apiClient.get<{ voices: Array<{ id: string; name: string; language: string }> }>(
    '/api/voice/voices/'
  );
  return response.data.voices;
};

// ========== Voice Assistant ==========

/**
 * Send request to voice assistant
 * @param request - Voice assistant request with audio or text
 * @returns Promise with voice assistant response
 */
export const sendVoiceAssistantRequest = async (
  request: VoiceAssistantRequest
): Promise<VoiceAssistantResponse> => {
  const formData = new FormData();

  if (request.audio_data) {
    formData.append('audio', request.audio_data);
  }
  if (request.text) {
    formData.append('text', request.text);
  }
  if (request.conversation_id) {
    formData.append('conversation_id', request.conversation_id);
  }
  if (request.context) {
    formData.append('context', JSON.stringify(request.context));
  }

  const response = await apiClient.post<VoiceAssistantResponse>(
    '/api/voice-assistant/',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Start a new voice assistant session
 * @returns Promise with session ID
 */
export const startVoiceAssistantSession = async (): Promise<{ session_id: string }> => {
  const response = await apiClient.post<{ session_id: string }>(
    '/api/voice-assistant/start/'
  );
  return response.data;
};

/**
 * End a voice assistant session
 * @param sessionId - The session ID to end
 * @returns Promise with success status
 */
export const endVoiceAssistantSession = async (sessionId: string): Promise<void> => {
  await apiClient.post('/api/voice-assistant/end/', { session_id: sessionId });
};

// ========== Voicebot ==========

/**
 * Interact with voicebot
 * @param request - Voicebot request
 * @returns Promise with voicebot response
 */
export const sendVoicebotRequest = async (
  request: VoicebotRequest
): Promise<VoicebotResponse> => {
  const formData = new FormData();

  if (request.session_id) {
    formData.append('session_id', request.session_id);
  }
  if (request.audio_data) {
    formData.append('audio', request.audio_data);
  }
  if (request.text) {
    formData.append('text', request.text);
  }
  if (request.action) {
    formData.append('action', request.action);
  }

  const response = await apiClient.post<VoicebotResponse>('/voicebot/api/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get voicebot session details
 * @param sessionId - The session ID
 * @returns Promise with session details
 */
export const getVoicebotSession = async (sessionId: string): Promise<VoicebotSession> => {
  const response = await apiClient.get<VoicebotSession>(`/voicebot/session/${sessionId}/`);
  return response.data;
};

/**
 * Start a new voicebot session
 * @returns Promise with new session details
 */
export const startVoicebotSession = async (): Promise<VoicebotSession> => {
  const response = await apiClient.post<VoicebotSession>('/voicebot/start/');
  return response.data;
};

/**
 * End a voicebot session
 * @param sessionId - The session ID to end
 * @returns Promise with success status
 */
export const endVoicebotSession = async (sessionId: string): Promise<void> => {
  await apiClient.post('/voicebot/end/', { session_id: sessionId });
};

export default {
  speechToText,
  textToSpeech,
  getSupportedLanguages,
  getAvailableVoices,
  sendVoiceAssistantRequest,
  startVoiceAssistantSession,
  endVoiceAssistantSession,
  sendVoicebotRequest,
  getVoicebotSession,
  startVoicebotSession,
  endVoicebotSession,
};
