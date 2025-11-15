import apiClient from '@/config/api';
import { setAuthToken } from '@/config/api';
import type { AdminLoginRequest, AdminLoginResponse, User } from '@/types/api';

/**
 * Admin API Service
 *
 * Handles all admin-related API calls including authentication and user management
 */

/**
 * Admin login
 * @param credentials - Login credentials (username and password)
 * @returns Promise with login response including token
 */
export const adminLogin = async (
  credentials: AdminLoginRequest
): Promise<AdminLoginResponse> => {
  const response = await apiClient.post<AdminLoginResponse>('/admin/login/', credentials);

  // Store the authentication token
  if (response.data.token) {
    setAuthToken(response.data.token);
  }

  return response.data;
};

/**
 * Admin logout
 * @returns Promise with success status
 */
export const adminLogout = async (): Promise<void> => {
  try {
    await apiClient.post('/admin/logout/');
  } finally {
    // Clear token even if request fails
    setAuthToken(null);
  }
};

/**
 * Get current admin user info
 * @returns Promise with user information
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/admin/me/');
  return response.data;
};

/**
 * Get all users (admin only)
 * @returns Promise with array of users
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<{ users: User[] }>('/admin/users/');
  return response.data.users;
};

/**
 * Get user by ID (admin only)
 * @param userId - The ID of the user
 * @returns Promise with user information
 */
export const getUserById = async (userId: string): Promise<User> => {
  const response = await apiClient.get<User>(`/admin/users/${userId}/`);
  return response.data;
};

/**
 * Update user (admin only)
 * @param userId - The ID of the user to update
 * @param userData - The user data to update
 * @returns Promise with updated user information
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await apiClient.patch<User>(`/admin/users/${userId}/`, userData);
  return response.data;
};

/**
 * Delete user (admin only)
 * @param userId - The ID of the user to delete
 * @returns Promise with success status
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}/`);
};

/**
 * Access admin panel data
 * @returns Promise with admin panel data
 */
export const getAdminPanelData = async (): Promise<any> => {
  const response = await apiClient.get('/admin-panel/');
  return response.data;
};

export default {
  adminLogin,
  adminLogout,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAdminPanelData,
};
