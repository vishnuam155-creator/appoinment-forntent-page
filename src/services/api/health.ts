import apiClient from '@/config/api';
import type { HealthCheckResponse, ApiDocumentation } from '@/types/api';

/**
 * Health and Documentation API Service
 *
 * Handles health checks and API documentation endpoints
 */

/**
 * Check API health status
 * @returns Promise with health check response
 */
export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/api/health/');
  return response.data;
};

/**
 * Get API documentation
 * @returns Promise with API documentation
 */
export const getApiDocs = async (): Promise<ApiDocumentation> => {
  const response = await apiClient.get<ApiDocumentation>('/api/docs/');
  return response.data;
};

/**
 * Ping the server to check connectivity
 * @returns Promise with boolean indicating if server is reachable
 */
export const pingServer = async (): Promise<boolean> => {
  try {
    await apiClient.get('/api/health/');
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  checkHealth,
  getApiDocs,
  pingServer,
};
