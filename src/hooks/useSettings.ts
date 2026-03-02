import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';

export interface SystemSettings {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  currency?: string;
  timezone?: string;
  payrollProcessingDay?: number;
  [key: string]: unknown;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  description?: string;
  isOptional: boolean;
}

const settingsApi = {
  getSettings: () => apiGet<SystemSettings>('/settings'),
  updateSettings: (data: Partial<SystemSettings>) => apiPut<SystemSettings>('/settings', data),
  getHolidays: (year?: number) => apiGet<PublicHoliday[]>('/settings/holidays', { year }),
  addHoliday: (data: { name: string; date: string; description?: string; isOptional?: boolean }) =>
    apiPost<PublicHoliday>('/settings/holidays', data),
  deleteHoliday: (id: string) => apiDelete<null>(`/settings/holidays/${id}`),
};

export const useSettings = (enabled = true) => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const usePublicHolidays = (year?: number, enabled = true) => {
  return useQuery({
    queryKey: ['publicHolidays', year],
    queryFn: () => settingsApi.getHolidays(year),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useAddHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.addHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicHolidays'] });
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicHolidays'] });
    },
  });
};
