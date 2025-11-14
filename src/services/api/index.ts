/**
 * API Services Index
 *
 * Central export point for all API services
 */

export * from './chatbot';
export * from './voice';
export * from './health';
export * from './admin';

// Re-export the API client and configuration helpers
export { default as apiClient, setAuthToken, getAuthToken } from '@/config/api';

// Import defaults for convenience
import chatbotService from './chatbot';
import voiceService from './voice';
import healthService from './health';
import adminService from './admin';

export const api = {
  chatbot: chatbotService,
  voice: voiceService,
  health: healthService,
  admin: adminService,
};

export default api;
