import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';

export interface HrDashboardData {
  kpis: {
    totalEmployees: number;
    activeEmployees: number;
    presentToday: number;
    absentToday: number;
    attendanceRate: number;
    pendingLeaves: number;
  };
  payroll: {
    id: string;
    month: number;
    year: number;
    status: string;
    totalEmployees: number;
    totalGrossSalary: number;
    totalNetSalary: number;
  } | null;
  ai: {
    newAlerts: number;
    highRiskAlerts: number;
    salaryAnomalies: number;
    currentMonthNetSalaryProjection: number;
  };
  attendanceSummary: {
    today: {
      present: number;
      absent: number;
      late: number;
    };
    lateArrivalsCount: number;
    monthlyTrend: Array<{
      label: string;
      present: number;
      absent: number;
      late: number;
    }>;
    departmentWise: Array<{
      departmentId: string;
      departmentName: string;
      present: number;
      absent: number;
      late: number;
    }>;
  };
  payrollSummary: {
    currentMonthTotalPayrollCost: number;
    pendingSalaryProcessing: number;
    totalSalaryCurrentMonth: number;
    totalDeductions: number;
    totalBonuses: number;
    taxSummary: number;
    currentMonthPayroll: {
      id: string;
      month: number;
      year: number;
      status: string;
    } | null;
  };
  leaveSummary: {
    pendingRequests: number;
    approvedThisMonth: number;
    distribution: Array<{
      leaveTypeId: string;
      leaveTypeName: string;
      count: number;
    }>;
  };
  pendingLeaveRequests: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: string;
  }>;
  workforceAlerts: {
    newEmployeesThisMonth: number;
    employeesOnProbation: number;
    recentlyResignedEmployees: number;
    contractExpiryAlerts: Array<{
      employeeId: string;
      employeeName: string;
      endDate: string;
    }>;
  };
}

export interface EmployeeDashboardData {
  profile: {
    id: string;
    employeeId: string;
    name: string;
    designation?: string;
    departmentName?: string;
  } | null;
  today: {
    date: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
    workingHours: number;
  };
  monthSummary: {
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
  };
  leaveBalances: Array<{
    leaveTypeId: string;
    leaveTypeName: string;
    remainingDays: number;
  }>;
  pendingLeaves: number;
  latestPayslip: {
    month: number;
    year: number;
    grossSalary: number;
    totalDeductions: number;
    netSalary: number;
    status: string;
  } | null;
  aiInsights: {
    insights: Array<{
      type: string;
      severity: string;
      title: string;
      description: string;
    }>;
    actions: Array<{
      type: string;
      label: string;
      path: string;
    }>;
  };
}

const dashboardApi = {
  getHrDashboard: () => apiGet<HrDashboardData>('/dashboard/hr'),
  getEmployeeDashboard: () => apiGet<EmployeeDashboardData>('/dashboard/employee'),
};

export const useHrDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'hr'],
    queryFn: dashboardApi.getHrDashboard,
    staleTime: 60 * 1000,
  });
};

export const useEmployeeDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'employee'],
    queryFn: dashboardApi.getEmployeeDashboard,
    staleTime: 60 * 1000,
  });
};
