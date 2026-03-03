import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '../lib/api';

export interface Notification {
  id: string;
  type:
    | 'leave_request_submitted'
    | 'leave_request_approved'
    | 'leave_request_rejected'
    | 'leave_request_cancelled'
    | 'salary_credited'
    | 'company_notice';
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

const notificationsApi = {
  getAll: (filters: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    apiGet<Notification[]>('/notifications', filters as Record<string, unknown>),

  markAsRead: (id: string) => apiPatch(`/notifications/${id}/read`),

  markAllAsRead: () => apiPost('/notifications/read-all'),
};

export const useNotifications = (
  filters: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationsApi.getAll(filters),
    enabled,
    staleTime: 0,
    refetchInterval: enabled ? 5 * 1000 : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
