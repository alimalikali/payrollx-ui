/**
 * Employee Hooks
 * Handles employee data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

// Types
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cnic?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: string;
  address?: string;
  city?: string;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
  designation?: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  joiningDate: string;
  endDate?: string;
  reportingTo?: string;
  managerName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  ntnNumber?: string;
  taxFilingStatus: 'filer' | 'non_filer';
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  profileImage?: string;
  basicSalary?: number;
  grossSalary?: number;
  createdAt: string;
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  joiningDate: string;
  departmentId?: string;
  designation?: string;
  basicSalary?: number;
  [key: string]: unknown;
}

// API functions
const employeeApi = {
  getAll: (filters: EmployeeFilters) =>
    apiGet<Employee[]>('/employees', filters as Record<string, unknown>),

  getById: (id: string) => apiGet<Employee>(`/employees/${id}`),

  create: (data: CreateEmployeeData) => apiPost<Employee>('/employees', data),

  update: (id: string, data: Partial<CreateEmployeeData>) =>
    apiPut<Employee>(`/employees/${id}`, data),

  delete: (id: string) => apiDelete(`/employees/${id}`),

  getStats: () => apiGet<{
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    newHires: number;
  }>('/employees/stats'),

  getByDepartment: () => apiGet<{
    id: string;
    name: string;
    code: string;
    employeeCount: number;
  }[]>('/employees/by-department'),
};

// Hooks
export const useEmployees = (filters: EmployeeFilters = {}) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeApi.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employeeStats'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmployeeData> }) =>
      employeeApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employeeStats'] });
    },
  });
};

export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['employeeStats'],
    queryFn: employeeApi.getStats,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useEmployeesByDepartment = () => {
  return useQuery({
    queryKey: ['employeesByDepartment'],
    queryFn: employeeApi.getByDepartment,
    staleTime: 60 * 1000,
  });
};
