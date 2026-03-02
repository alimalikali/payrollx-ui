/**
 * Leave Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';

// Types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName?: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  isPaid: boolean;
  startDate: string;
  endDate: string;
  totalDays: number;
  days?: number;
  isHalfDay: boolean;
  halfDayType?: 'first_half' | 'second_half';
  reason: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  type?: string;
  approvedBy?: string;
  approvedByEmail?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string;
  daysPerYear: number;
  isPaid: boolean;
  isCarryForward: boolean;
  maxCarryForwardDays: number;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  allocatedDays: number;
  usedDays: number;
  carriedForwardDays: number;
  remainingDays: number;
}

export interface LeaveFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  status?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
}

// API functions
const leaveApi = {
  getAll: (filters: LeaveFilters) =>
    apiGet<LeaveRequest[]>('/leaves', filters as Record<string, unknown>),

  getById: (id: string) => apiGet<LeaveRequest>(`/leaves/${id}`),

  create: (data: {
    employeeId?: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    isHalfDay?: boolean;
    halfDayType?: string;
    attachmentUrl?: string;
  }) => apiPost<LeaveRequest>('/leaves', data),

  approve: (id: string) => apiPost<LeaveRequest>(`/leaves/${id}/approve`),

  reject: (id: string, reason: string) =>
    apiPost<LeaveRequest>(`/leaves/${id}/reject`, { reason }),

  cancel: (id: string) => apiPost<LeaveRequest>(`/leaves/${id}/cancel`),

  getTypes: () => apiGet<LeaveType[]>('/leaves/types'),

  getBalance: (employeeId: string, year?: number) =>
    apiGet<LeaveBalance[]>(`/leaves/balance/${employeeId}`, { year }),

  allocate: (data: {
    employeeId: string;
    leaveTypeId: string;
    year?: number;
    allocatedDays: number;
    carriedForwardDays?: number;
  }) => apiPost<LeaveBalance[]>('/leaves/allocate', data),

  getPendingCount: () => apiGet<{ count: number }>('/leaves/pending-count'),
};

// Hooks
export const useLeaves = (filters: LeaveFilters = {}) => {
  return useQuery({
    queryKey: ['leaves', filters],
    queryFn: () => leaveApi.getAll(filters),
    staleTime: 30 * 1000,
  });
};

export const useLeaveRequest = (id: string) => {
  return useQuery({
    queryKey: ['leave', id],
    queryFn: () => leaveApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveCount'] });
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveCount'] });
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leaveApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveCount'] });
    },
  });
};

export const useCancelLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
    },
  });
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: leaveApi.getTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLeaveBalance = (employeeId: string, year?: number) => {
  return useQuery({
    queryKey: ['leaveBalance', employeeId, year],
    queryFn: () => leaveApi.getBalance(employeeId, year),
    enabled: !!employeeId,
    staleTime: 60 * 1000,
  });
};

export const useAllocateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.allocate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
    },
  });
};

export const usePendingLeaveCount = () => {
  return useQuery({
    queryKey: ['pendingLeaveCount'],
    queryFn: leaveApi.getPendingCount,
    staleTime: 30 * 1000,
  });
};
