/**
 * Employee Hooks
 * Handles employee data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';

// Types
export interface Employee {
  id: string;
  employeeId: string;
  code?: string;
  userId?: string;
  userRole?: string;
  loginCredentials?: {
    email: string;
    temporaryPassword: string;
  };
  firstName: string;
  lastName: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  cnic?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: string;
  address?: string;
  residentialAddress?: string;
  city?: string;
  nationality?: string;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
  department?: string;
  designation?: string;
  jobTitle?: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  joiningDate: string;
  probationPeriodMonths?: number;
  workLocation?: string;
  endDate?: string;
  reportingTo?: string;
  managerName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingCode?: string;
  bankBranch?: string;
  ntnNumber?: string;
  taxIdentifier?: string;
  taxInformation?: string;
  legalIdType?: 'cnic' | 'passport' | 'national_id' | 'other';
  legalIdNumber?: string;
  paymentMethod?: 'bank_transfer' | 'check';
  taxFilingStatus: 'filer' | 'non_filer';
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  profileImage?: string;
  basicSalary?: number;
  grossSalary?: number;
  bonus?: number;
  overtimeRate?: number;
  providentFundEmployee?: number;
  providentFundEmployer?: number;
  basicInfo?: {
    fullName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    maritalStatus?: string;
    nationality?: string;
    profileImage?: string;
    residentialAddress?: string;
  };
  jobDetails?: {
    employeeId: string;
    departmentId?: string;
    departmentName?: string;
    jobTitle?: string;
    employmentType?: string;
    joiningDate?: string;
    probationPeriodMonths?: number;
    workLocation?: string;
    reportingManagerId?: string;
    reportingManagerName?: string;
  };
  salaryDetails?: {
    basicSalary?: number;
    allowances?: {
      hra?: number;
      travel?: number;
      medical?: number;
      utility?: number;
      other?: number;
    };
    bonus?: number;
    overtimeRate?: number;
    taxInformation?: string;
    providentFundEmployee?: number;
    providentFundEmployer?: number;
    bankAccountNumber?: string;
    bankName?: string;
    bankRoutingCode?: string;
    paymentMethod?: 'bank_transfer' | 'check';
  };
  legalInfo?: {
    legalIdType?: 'cnic' | 'passport' | 'national_id' | 'other';
    legalIdNumber?: string;
    taxIdentifier?: string;
  };
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
  basicInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    nationality: string;
    profileImage: string;
    residentialAddress: string;
  };
  jobDetails: {
    departmentId: string;
    jobTitle: string;
    employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
    joiningDate: string;
    probationPeriodMonths: number;
    workLocation: string;
    reportingManagerId: string;
  };
  salaryDetails: {
    basicSalary: number;
    allowances: {
      hra: number;
      travel: number;
      medical: number;
      utility: number;
      other: number;
    };
    bonus: number;
    overtimeRate: number;
    taxInformation: string;
    providentFundEmployee: number;
    providentFundEmployer: number;
    bankAccountNumber: string;
    bankName: string;
    bankRoutingCode: string;
    paymentMethod: 'bank_transfer' | 'check';
  };
  legalInfo: {
    legalIdType: 'cnic' | 'passport' | 'national_id' | 'other';
    legalIdNumber: string;
    taxIdentifier: string;
  };
  firstName?: string;
  lastName?: string;
  email?: string;
  joiningDate?: string;
  departmentId?: string;
  designation?: string;
  basicSalary?: number;
  [key: string]: unknown;
}

export interface CreateEmployeeResponse extends Employee {
  loginCredentials?: {
    email: string;
    temporaryPassword: string;
  };
}

export interface UploadProfilePhotoPayload {
  fileName: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  data: string;
}

export interface UploadProfilePhotoResponse {
  fileKey: string;
  url: string;
}

export interface EmployeeAttendanceLeaveSummary {
  leaveBalance: {
    total: number;
    sickLeave: number;
    casualLeave: number;
    paidLeave: number;
    items: Array<{
      code: string;
      name: string;
      remainingDays: number;
    }>;
  };
  attendanceRecords: Array<{
    id: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    workingHours: number;
    overtimeHours: number;
    status: string;
    notes?: string;
  }>;
  overtimeHours: number;
  month: number;
  year: number;
}

// API functions
const employeeApi = {
  getAll: (filters: EmployeeFilters) =>
    apiGet<Employee[]>('/employees', filters as Record<string, unknown>),

  getById: (id: string) => apiGet<Employee>(`/employees/${id}`),

  getMyProfile: () => apiGet<Employee>('/employees/me'),

  create: (data: CreateEmployeeData) => apiPost<CreateEmployeeResponse>('/employees', data),

  update: (id: string, data: Partial<CreateEmployeeData>) =>
    apiPut<Employee>(`/employees/${id}`, data),

  delete: (id: string) => apiDelete(`/employees/${id}`),

  uploadProfilePhoto: (data: UploadProfilePhotoPayload) =>
    apiPost<UploadProfilePhotoResponse>('/uploads/profile-photo', data),

  getAttendanceLeaveSummary: (id: string, params?: { month?: number; year?: number; limit?: number }) =>
    apiGet<EmployeeAttendanceLeaveSummary>(`/employees/${id}/attendance-leave-summary`, params as Record<string, unknown>),

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
export const useEmployees = (filters: EmployeeFilters = {}, enabled = true) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeApi.getAll(filters),
    staleTime: 30 * 1000,
    enabled,
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getById(id),
    enabled: !!id,
  });
};

export const useMyEmployee = (enabled = true) => {
  return useQuery({
    queryKey: ['employee', 'me'],
    queryFn: employeeApi.getMyProfile,
    enabled,
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

export const useUploadProfilePhoto = () => {
  return useMutation({
    mutationFn: employeeApi.uploadProfilePhoto,
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

export const useEmployeeAttendanceLeaveSummary = (
  employeeId: string,
  params?: { month?: number; year?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: ['employeeAttendanceLeaveSummary', employeeId, params],
    queryFn: () => employeeApi.getAttendanceLeaveSummary(employeeId, params),
    enabled: !!employeeId && enabled,
    staleTime: 30 * 1000,
  });
};

export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['employeeStats'],
    queryFn: employeeApi.getStats,
    staleTime: 60 * 1000,
  });
};

export const useEmployeesByDepartment = (enabled = true) => {
  return useQuery({
    queryKey: ['employeesByDepartment'],
    queryFn: employeeApi.getByDepartment,
    staleTime: 60 * 1000,
    enabled,
  });
};
