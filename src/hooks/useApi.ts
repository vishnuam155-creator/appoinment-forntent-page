import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type {
  ChatRequest,
  ChatResponse,
  VoiceRequest,
  VoiceResponse,
  VoiceAssistantRequest,
  VoiceAssistantResponse,
  VoicebotRequest,
  VoicebotResponse,
  HealthCheckResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
} from '@/types/api';
import * as chatbotApi from '@/services/api/chatbot';
import * as voiceApi from '@/services/api/voice';
import * as healthApi from '@/services/api/health';
import * as adminApi from '@/services/api/admin';

/**
 * Custom React Query Hooks for API calls
 *
 * These hooks provide a convenient way to use the API services with TanStack Query,
 * handling caching, loading states, and error states automatically.
 */

// ========== Health Check Hooks ==========

export const useHealthCheck = (options?: UseQueryOptions<HealthCheckResponse>) => {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: healthApi.checkHealth,
    ...options,
  });
};

export const useApiDocs = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['api-docs'],
    queryFn: healthApi.getApiDocs,
    ...options,
  });
};

// ========== Chatbot Hooks ==========

export const useSendChatMessage = (
  options?: UseMutationOptions<ChatResponse, Error, ChatRequest>
) => {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: chatbotApi.sendChatMessage,
    ...options,
  });
};

export const useChatHistory = (conversationId: string, options?: UseQueryOptions<any[]>) => {
  return useQuery({
    queryKey: ['chat-history', conversationId],
    queryFn: () => chatbotApi.getChatHistory(conversationId),
    enabled: !!conversationId,
    ...options,
  });
};

export const useStartConversation = (
  options?: UseMutationOptions<ChatResponse, Error, string | undefined>
) => {
  return useMutation<ChatResponse, Error, string | undefined>({
    mutationFn: chatbotApi.startConversation,
    ...options,
  });
};

export const useEndConversation = (
  options?: UseMutationOptions<void, Error, string>
) => {
  return useMutation<void, Error, string>({
    mutationFn: chatbotApi.endConversation,
    ...options,
  });
};

export const useClearChatHistory = (
  options?: UseMutationOptions<void, Error, string>
) => {
  return useMutation<void, Error, string>({
    mutationFn: chatbotApi.clearChatHistory,
    ...options,
  });
};

// ========== Voice Hooks ==========

export const useSpeechToText = (
  options?: UseMutationOptions<VoiceResponse, Error, VoiceRequest>
) => {
  return useMutation<VoiceResponse, Error, VoiceRequest>({
    mutationFn: voiceApi.speechToText,
    ...options,
  });
};

export const useTextToSpeech = (
  options?: UseMutationOptions<TextToSpeechResponse, Error, TextToSpeechRequest>
) => {
  return useMutation<TextToSpeechResponse, Error, TextToSpeechRequest>({
    mutationFn: voiceApi.textToSpeech,
    ...options,
  });
};

export const useSupportedLanguages = (options?: UseQueryOptions<string[]>) => {
  return useQuery<string[]>({
    queryKey: ['voice-languages'],
    queryFn: voiceApi.getSupportedLanguages,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    ...options,
  });
};

export const useAvailableVoices = (
  options?: UseQueryOptions<Array<{ id: string; name: string; language: string }>>
) => {
  return useQuery<Array<{ id: string; name: string; language: string }>>({
    queryKey: ['voice-options'],
    queryFn: voiceApi.getAvailableVoices,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    ...options,
  });
};

// ========== Voice Assistant Hooks ==========

export const useVoiceAssistant = (
  options?: UseMutationOptions<VoiceAssistantResponse, Error, VoiceAssistantRequest>
) => {
  return useMutation<VoiceAssistantResponse, Error, VoiceAssistantRequest>({
    mutationFn: voiceApi.sendVoiceAssistantRequest,
    ...options,
  });
};

export const useStartVoiceAssistantSession = (
  options?: UseMutationOptions<{ session_id: string }, Error, void>
) => {
  return useMutation<{ session_id: string }, Error, void>({
    mutationFn: voiceApi.startVoiceAssistantSession,
    ...options,
  });
};

export const useEndVoiceAssistantSession = (
  options?: UseMutationOptions<void, Error, string>
) => {
  return useMutation<void, Error, string>({
    mutationFn: voiceApi.endVoiceAssistantSession,
    ...options,
  });
};

// ========== Voicebot Hooks ==========

export const useVoicebot = (
  options?: UseMutationOptions<VoicebotResponse, Error, VoicebotRequest>
) => {
  return useMutation<VoicebotResponse, Error, VoicebotRequest>({
    mutationFn: voiceApi.sendVoicebotRequest,
    ...options,
  });
};

export const useVoicebotSession = (sessionId: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['voicebot-session', sessionId],
    queryFn: () => voiceApi.getVoicebotSession(sessionId),
    enabled: !!sessionId,
    ...options,
  });
};

export const useStartVoicebotSession = (
  options?: UseMutationOptions<any, Error, void>
) => {
  return useMutation({
    mutationFn: voiceApi.startVoicebotSession,
    ...options,
  });
};

export const useEndVoicebotSession = (
  options?: UseMutationOptions<void, Error, string>
) => {
  return useMutation<void, Error, string>({
    mutationFn: voiceApi.endVoicebotSession,
    ...options,
  });
};

// ========== Admin Hooks ==========

export const useAdminLogin = (
  options?: UseMutationOptions<AdminLoginResponse, Error, AdminLoginRequest>
) => {
  return useMutation<AdminLoginResponse, Error, AdminLoginRequest>({
    mutationFn: adminApi.adminLogin,
    ...options,
  });
};

export const useAdminLogout = (
  options?: UseMutationOptions<void, Error, void>
) => {
  return useMutation<void, Error, void>({
    mutationFn: adminApi.adminLogout,
    ...options,
  });
};

export const useCurrentUser = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: adminApi.getCurrentUser,
    ...options,
  });
};

export const useAllUsers = (options?: UseQueryOptions<any[]>) => {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: adminApi.getAllUsers,
    ...options,
  });
};

export const useAdminPanelData = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['admin-panel'],
    queryFn: adminApi.getAdminPanelData,
    ...options,
  });
};
