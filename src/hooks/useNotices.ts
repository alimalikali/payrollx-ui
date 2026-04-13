import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'policy' | 'event' | 'holiday' | 'payroll';
  isPinned: boolean;
  expiresAt: string | null;
  createdBy: string;
  createdByName: string | null;
  createdByEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeFilters {
  page?: number;
  limit?: number;
  priority?: string;
  category?: string;
  search?: string;
  pinnedOnly?: boolean;
}

export interface CreateNoticeData {
  title: string;
  content: string;
  priority?: string;
  category?: string;
  isPinned?: boolean;
  expiresAt?: string | null;
}

const noticeApi = {
  getAll: (filters: NoticeFilters = {}) =>
    apiGet<Notice[]>('/notices', filters as Record<string, unknown>),
  getById: (id: string) => apiGet<Notice>(`/notices/${id}`),
  create: (data: CreateNoticeData) => apiPost<Notice>('/notices', data),
  update: (id: string, data: Partial<CreateNoticeData>) => apiPut<Notice>(`/notices/${id}`, data),
  delete: (id: string) => apiDelete(`/notices/${id}`),
};

export const useNotices = (filters: NoticeFilters = {}) => {
  return useQuery({
    queryKey: ['notices', filters],
    queryFn: () => noticeApi.getAll(filters),
    staleTime: 30 * 1000,
  });
};

export const useNotice = (id: string) => {
  return useQuery({
    queryKey: ['notices', id],
    queryFn: () => noticeApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoticeData) => noticeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateNoticeData> }) =>
      noticeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => noticeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};
