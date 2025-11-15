import apiClient from '@/config/api';
import type { ChatRequest, ChatResponse, ChatMessage, ApiResponse } from '@/types/api';

/**
 * Chatbot API Service
 *
 * Handles all API calls related to chatbot functionality
 */

/**
 * Send a message to the chatbot
 * @param request - The chat request containing message and optional context
 * @returns Promise with the chatbot response
 */
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  console.log('Sending to chatbot API:', request);
  const response = await apiClient.post<ChatResponse>('/api/chatbot/', request);
  console.log('Raw axios response:', response);
  console.log('Response data:', response.data);
  console.log('Response status:', response.status);
  return response.data;
};

/**
 * Get chat history for a conversation
 * @param conversationId - The ID of the conversation
 * @returns Promise with array of chat messages
 */
export const getChatHistory = async (conversationId: string): Promise<ChatMessage[]> => {
  const response = await apiClient.get<ApiResponse<ChatMessage[]>>(
    `/api/chatbot/history/${conversationId}/`
  );
  return response.data.data;
};

/**
 * Start a new conversation
 * @param initialMessage - Optional initial message
 * @returns Promise with the new conversation ID and response
 */
export const startConversation = async (
  initialMessage?: string
): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>('/api/chatbot/start/', {
    message: initialMessage || 'Hello',
  });
  return response.data;
};

/**
 * End a conversation
 * @param conversationId - The ID of the conversation to end
 * @returns Promise with success status
 */
export const endConversation = async (conversationId: string): Promise<void> => {
  await apiClient.post(`/api/chatbot/end/`, { conversation_id: conversationId });
};

/**
 * Clear chat history for a conversation
 * @param conversationId - The ID of the conversation
 * @returns Promise with success status
 */
export const clearChatHistory = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/api/chatbot/history/${conversationId}/`);
};

/**
 * Get conversation suggestions
 * @param conversationId - The ID of the conversation
 * @returns Promise with array of suggested responses
 */
export const getChatSuggestions = async (conversationId: string): Promise<string[]> => {
  const response = await apiClient.get<ApiResponse<string[]>>(
    `/api/chatbot/suggestions/${conversationId}/`
  );
  return response.data.data;
};

export default {
  sendChatMessage,
  getChatHistory,
  startConversation,
  endConversation,
  clearChatHistory,
  getChatSuggestions,
};
