/**
 * AI Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '../lib/api';

// Types
export interface AIAlert {
  id: string;
  alertType: 'fraud_detection' | 'salary_anomaly' | 'attendance_anomaly' | 'payroll_forecast' | 'salary_recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  employeeId?: string;
  employeeName?: string;
  employeeCode?: string;
  title: string;
  description: string;
  details: Record<string, unknown>;
  confidenceScore: number;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface FraudDetectionResult {
  totalAlerts: number;
  critical: number;
  high: number;
  medium: number;
  alerts: AIAlert[];
}

export interface SalaryDistribution {
  department: string;
  employeeCount: number;
  minSalary: number;
  avgSalary: number;
  maxSalary: number;
  medianSalary: number;
}

export interface PayrollForecast {
  success: boolean;
  summary?: {
    forecastPeriod: string;
    totalProjectedCost: number;
    averageMonthlyProjection: number;
    growthRate: string;
    employeeGrowthRate: string;
  };
  forecasts?: Array<{
    month: number;
    year: number;
    period: string;
    projectedEmployees: number;
    projectedGrossSalary: number;
    projectedDeductions: number;
    projectedNetSalary: number;
    confidenceLevel: number;
  }>;
  historicalData?: Array<{
    period: string;
    grossSalary: number;
    employeeCount: number;
  }>;
}

export interface SalaryRecommendation {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  yearsOfService: string;
  currentSalary: number;
  currentPosition: string;
  marketData: {
    minimum: number;
    median: number;
    maximum: number;
  };
  recommendation: {
    minimum: number;
    optimal: number;
    maximum: number;
    suggestedIncrease: number | null;
  };
  analysis: string[];
  confidenceScore: number;
}

export interface ChatMessage {
  sessionId: string;
  message: string;
  data?: unknown;
  intent: string;
  confidence: number;
  suggestions: string[];
  responseTime: number;
}

// API functions
const aiApi = {
  getDashboardStats: () => apiGet<{
    fraudDetection: Record<string, number>;
    salaryAnomalies: { total: number; highSeverity: number };
    alerts: { new_alerts: number; investigating: number; last_7_days: number };
  }>('/ai/dashboard'),

  getAlerts: (filters: { page?: number; limit?: number; type?: string; severity?: string; status?: string }) =>
    apiGet<AIAlert[]>('/ai/alerts', filters),

  updateAlertStatus: (id: string, data: { status: string; resolutionNotes?: string }) =>
    apiPatch<AIAlert>(`/ai/alerts/${id}`, data),

  runFraudDetection: () => apiPost<FraudDetectionResult>('/ai/fraud-detection/run'),

  getFraudStats: () => apiGet<Record<string, number>>('/ai/fraud-detection/stats'),

  detectSalaryAnomalies: () => apiPost<{
    totalAnomalies: number;
    byType: Record<string, number>;
    alerts: AIAlert[];
  }>('/ai/salary-anomaly/detect'),

  getSalaryDistribution: () => apiGet<SalaryDistribution[]>('/ai/salary-anomaly/distribution'),

  generateForecast: (months?: number) =>
    apiGet<PayrollForecast>('/ai/forecast', { months }),

  getBudgetComparison: (year?: number) =>
    apiGet<Array<{
      month: number;
      actualGross: number;
      budgetedGross: number;
      variance: number;
      variancePercent: string;
    }>>('/ai/forecast/budget-comparison', { year }),

  getSalaryRecommendation: (employeeId: string) =>
    apiGet<SalaryRecommendation>(`/ai/salary-recommendations/${employeeId}`),

  getBulkRecommendations: (departmentId?: string) =>
    apiGet<{
      summary: {
        totalEmployees: number;
        totalCurrentCost: number;
        totalRecommendedCost: number;
        additionalBudgetNeeded: number;
        underpaidCount: number;
        belowMarketCount: number;
        competitiveCount: number;
        aboveMarketCount: number;
      };
      recommendations: Array<{
        employeeId: string;
        name: string;
        designation: string;
        department: string;
        currentSalary: number;
        recommendedSalary: number;
        status: string;
        priority: string;
      }>;
    }>('/ai/salary-recommendations', { departmentId }),

  sendChatMessage: (data: { sessionId?: string; message: string }) =>
    apiPost<ChatMessage>('/ai/chatbot', data),

  getChatHistory: (sessionId: string) =>
    apiGet<Array<{ role: string; content: string; timestamp: string }>>(`/ai/chatbot/history/${sessionId}`),
};

// Hooks
export const useAIDashboardStats = () => {
  return useQuery({
    queryKey: ['aiDashboard'],
    queryFn: aiApi.getDashboardStats,
    staleTime: 60 * 1000,
  });
};

export const useAIAlerts = (filters: { page?: number; limit?: number; type?: string; severity?: string; status?: string } = {}) => {
  return useQuery({
    queryKey: ['aiAlerts', filters],
    queryFn: () => aiApi.getAlerts(filters),
    staleTime: 30 * 1000,
  });
};

export const useUpdateAlertStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; resolutionNotes?: string } }) =>
      aiApi.updateAlertStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['aiDashboard'] });
    },
  });
};

export const useRunFraudDetection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiApi.runFraudDetection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['fraudStats'] });
      queryClient.invalidateQueries({ queryKey: ['aiDashboard'] });
    },
  });
};

export const useFraudStats = () => {
  return useQuery({
    queryKey: ['fraudStats'],
    queryFn: aiApi.getFraudStats,
    staleTime: 60 * 1000,
  });
};

export const useDetectSalaryAnomalies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiApi.detectSalaryAnomalies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['aiDashboard'] });
    },
  });
};

export const useSalaryDistribution = () => {
  return useQuery({
    queryKey: ['salaryDistribution'],
    queryFn: aiApi.getSalaryDistribution,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePayrollForecast = (months?: number) => {
  return useQuery({
    queryKey: ['payrollForecast', months],
    queryFn: () => aiApi.generateForecast(months),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBudgetComparison = (year?: number) => {
  return useQuery({
    queryKey: ['budgetComparison', year],
    queryFn: () => aiApi.getBudgetComparison(year),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSalaryRecommendation = (employeeId: string) => {
  return useQuery({
    queryKey: ['salaryRecommendation', employeeId],
    queryFn: () => aiApi.getSalaryRecommendation(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBulkSalaryRecommendations = (departmentId?: string) => {
  return useQuery({
    queryKey: ['bulkSalaryRecommendations', departmentId],
    queryFn: () => aiApi.getBulkRecommendations(departmentId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: aiApi.sendChatMessage,
  });
};

export const useChatHistory = (sessionId: string) => {
  return useQuery({
    queryKey: ['chatHistory', sessionId],
    queryFn: () => aiApi.getChatHistory(sessionId),
    enabled: !!sessionId,
  });
};
