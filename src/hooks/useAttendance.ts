/**
 * Attendance Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';

// Types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
  overtimeHours?: number;
  status: 'present' | 'absent' | 'half_day' | 'late' | 'on_leave' | 'holiday' | 'weekend';
  notes?: string;
}

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  date?: string;
}

export interface AttendanceSummary {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  totalHours: number;
  overtimeHours: number;
}

export interface DailyStats {
  date: string;
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  attendanceRate: number;
}

// API functions
const attendanceApi = {
  getAll: (filters: AttendanceFilters) =>
    apiGet<AttendanceRecord[]>('/attendance', filters as Record<string, unknown>),

  getById: (id: string) => apiGet<AttendanceRecord>(`/attendance/${id}`),

  checkIn: (data: { employeeId?: string; checkInLocation?: string }) =>
    apiPost<AttendanceRecord>('/attendance/check-in', data),

  checkOut: (data: { employeeId?: string; checkOutLocation?: string }) =>
    apiPost<AttendanceRecord>('/attendance/check-out', data),

  mark: (data: {
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    notes?: string;
  }) => apiPost<AttendanceRecord>('/attendance/mark', data),

  bulkMark: (records: Array<{
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
  }>) => apiPost<AttendanceRecord[]>('/attendance/bulk', { records }),

  getSummary: (employeeId: string, month?: number, year?: number) =>
    apiGet<AttendanceSummary>(`/attendance/summary/${employeeId}`, { month, year }),

  getDailyStats: (date?: string) =>
    apiGet<DailyStats>('/attendance/daily-stats', { date }),
};

// Hooks
export const useAttendance = (filters: AttendanceFilters = {}, enabled = true) => {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceApi.getAll(filters),
    staleTime: 30 * 1000,
    enabled,
  });
};

export const useAttendanceRecord = (id: string) => {
  return useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceApi.getById(id),
    enabled: !!id,
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.mark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
    },
  });
};

export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.bulkMark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
    },
  });
};

export const useAttendanceSummary = (employeeId: string, month?: number, year?: number) => {
  return useQuery({
    queryKey: ['attendanceSummary', employeeId, month, year],
    queryFn: () => attendanceApi.getSummary(employeeId, month, year),
    enabled: !!employeeId,
    staleTime: 60 * 1000,
  });
};

export const useDailyStats = (date?: string, enabled = true) => {
  return useQuery({
    queryKey: ['dailyStats', date],
    queryFn: () => attendanceApi.getDailyStats(date),
    staleTime: 60 * 1000,
    enabled,
  });
};
