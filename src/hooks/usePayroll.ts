/**
 * Payroll Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';

// Types
export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  periodStart: string;
  periodEnd: string;
  status: 'draft' | 'processing' | 'completed' | 'approved' | 'paid' | 'cancelled';
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalTax: number;
  totalNetSalary: number;
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeCode: string;
  employeeName?: string;
  department?: string;
  designation?: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  earnings: {
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    medicalAllowance: number;
    utilityAllowance: number;
    otherAllowances: number;
    overtimePay: number;
    bonus: number;
  };
  grossSalary: number;
  deductions: {
    incomeTax: number;
    eobiContribution: number;
    sessiContribution: number;
    loanDeduction: number;
    otherDeductions: number;
  };
  totalDeductions: number;
  netSalary: number;
  taxableIncome: number;
  taxSlab: string;
  isFiler: boolean;
  status: 'generated' | 'approved' | 'paid' | 'cancelled';
  bankName?: string;
  bankAccountNumber?: string;
  paidAt?: string;
  createdAt: string;
}

export interface TaxCalculation {
  incomeTax: number;
  taxSlab: string;
  effectiveTaxRate: string;
  eobi: number;
  sessi: number;
  loanDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  employerContributions: {
    eobi: number;
    sessi: number;
  };
}

export interface TaxSlab {
  minIncome: number;
  maxIncome: number | string;
  rate: string;
  fixedAmount: number;
}

// API functions
const payrollApi = {
  getRuns: (filters: { page?: number; limit?: number; year?: number; status?: string }) =>
    apiGet<PayrollRun[]>('/payroll/runs', filters),

  getRunById: (id: string) => apiGet<PayrollRun>(`/payroll/runs/${id}`),

  createRun: (data: { month: number; year: number }) =>
    apiPost<PayrollRun>('/payroll/runs', data),

  processRun: (id: string) => apiPost<PayrollRun>(`/payroll/runs/${id}/process`),

  approveRun: (id: string) => apiPost<PayrollRun>(`/payroll/runs/${id}/approve`),

  getPayslips: (filters: { payrollRunId?: string; employeeId?: string; page?: number; limit?: number }) =>
    apiGet<Payslip[]>('/payroll/payslips', filters),

  getPayslipById: (id: string) => apiGet<Payslip>(`/payroll/payslips/${id}`),

  calculateTax: (data: { grossSalary: number; isFiler?: boolean }) =>
    apiPost<TaxCalculation>('/payroll/calculate-tax', data),

  getTaxSlabs: (type?: 'filer' | 'non_filer') =>
    apiGet<{ type: string; slabs: TaxSlab[] }>('/payroll/tax-slabs', { type }),
};

// Hooks
export const usePayrollRuns = (filters: { page?: number; limit?: number; year?: number; status?: string } = {}) => {
  return useQuery({
    queryKey: ['payrollRuns', filters],
    queryFn: () => payrollApi.getRuns(filters),
    staleTime: 30 * 1000,
  });
};

export const usePayrollRun = (id: string) => {
  return useQuery({
    queryKey: ['payrollRun', id],
    queryFn: () => payrollApi.getRunById(id),
    enabled: !!id,
  });
};

export const useCreatePayrollRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payrollApi.createRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
    },
  });
};

export const useProcessPayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payrollApi.processRun,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      queryClient.invalidateQueries({ queryKey: ['payrollRun', id] });
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    },
  });
};

export const useApprovePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payrollApi.approveRun,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      queryClient.invalidateQueries({ queryKey: ['payrollRun', id] });
    },
  });
};

export const usePayslips = (filters: { payrollRunId?: string; employeeId?: string; page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['payslips', filters],
    queryFn: () => payrollApi.getPayslips(filters),
    staleTime: 30 * 1000,
  });
};

export const usePayslip = (id: string) => {
  return useQuery({
    queryKey: ['payslip', id],
    queryFn: () => payrollApi.getPayslipById(id),
    enabled: !!id,
  });
};

export const useCalculateTax = () => {
  return useMutation({
    mutationFn: payrollApi.calculateTax,
  });
};

export const useTaxSlabs = (type?: 'filer' | 'non_filer') => {
  return useQuery({
    queryKey: ['taxSlabs', type],
    queryFn: () => payrollApi.getTaxSlabs(type),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
