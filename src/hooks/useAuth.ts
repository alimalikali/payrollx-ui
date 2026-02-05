/**
 * Auth Hook
 * Handles authentication state and operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiGet, setAccessToken, ApiResponse } from '../lib/api';

// Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
  isActive: boolean;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: string;
}

// Auth API functions
const authApi = {
  login: (credentials: LoginCredentials) =>
    apiPost<AuthResponse>('/auth/login', credentials),

  logout: () => apiPost('/auth/logout'),

  getMe: () => apiGet<User>('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiPost('/auth/change-password', data),

  register: (data: { email: string; password: string; role?: string }) =>
    apiPost('/auth/register', data),
};

// Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setAccessToken(response.data.accessToken);
      queryClient.setQueryData(['user'], response.data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

// Auth utility hook
export const useAuth = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isHR: user?.role === 'hr' || user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
