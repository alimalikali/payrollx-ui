import { addDays, subDays, format, startOfMonth, eachDayOfInterval } from "date-fns";

// Types
export interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  designation: string;
  status: "active" | "inactive";
  joinedDate: string;
  salary: {
    basic: number;
    hra: number;
    transport: number;
    medical: number;
    overtime: number;
  };
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "present" | "absent" | "late" | "leave" | "weekend" | "holiday";
  hoursWorked: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "annual" | "sick" | "casual" | "unpaid";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basic: number;
  allowances: number;
  deductions: number;
  tax: number;
  netPay: number;
  status: "pending" | "processing" | "completed" | "on-hold";
}

export interface FraudAlert {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  employeeId: string;
  employeeName: string;
  description: string;
  timestamp: string;
  reviewed: boolean;
}

export interface SalaryAnomaly {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  employeeId: string;
  employeeName: string;
  description: string;
  timestamp: string;
  reviewed: boolean;
}

export interface SalaryRecommendation {
  id: string;
  employeeId: string;
  employeeName: string;
  score: number;
  recommendation: string;
  suggestedRange: string;
  rationale: string;
}

export interface PayrollForecast {
  month: string;
  actual?: number;
  forecast?: number;
}

// Mock Employees
export const employees: Employee[] = [
  {
    id: "1",
    code: "EMP-00001",
    name: "Zohaib Farhan",
    email: "zohaib.farhan@payrollx.com",
    phone: "0312-4567890",
    department: "Engineering",
    designation: "Senior Software Engineer",
    status: "active",
    joinedDate: "2022-03-15",
    salary: {
      basic: 120000,
      hra: 30000,
      transport: 10000,
      medical: 15000,
      overtime: 0,
    },
    leaveBalance: { annual: 12, sick: 8, casual: 5 },
  },
  {
    id: "2",
    code: "EMP-00002",
    name: "Fazal Abbas",
    email: "fazal.abbas@payrollx.com",
    phone: "0314-4079260",
    department: "Engineering",
    designation: "Frontend Developer",
    status: "active",
    joinedDate: "2023-01-10",
    salary: {
      basic: 80000,
      hra: 20000,
      transport: 8000,
      medical: 10000,
      overtime: 5000,
    },
    leaveBalance: { annual: 10, sick: 6, casual: 4 },
  },
  {
    id: "3",
    code: "EMP-00003",
    name: "Azma Munir",
    email: "azma.munir@payrollx.com",
    phone: "0321-9876543",
    department: "QA",
    designation: "QA Engineer",
    status: "active",
    joinedDate: "2023-06-01",
    salary: {
      basic: 70000,
      hra: 17500,
      transport: 7000,
      medical: 8000,
      overtime: 3000,
    },
    leaveBalance: { annual: 8, sick: 5, casual: 3 },
  },
  {
    id: "4",
    code: "EMP-00004",
    name: "Sara Ahmed",
    email: "sara.ahmed@payrollx.com",
    phone: "0333-1234567",
    department: "Human Resources",
    designation: "HR Manager",
    status: "active",
    joinedDate: "2021-08-20",
    salary: {
      basic: 100000,
      hra: 25000,
      transport: 10000,
      medical: 12000,
      overtime: 0,
    },
    leaveBalance: { annual: 15, sick: 10, casual: 6 },
  },
  {
    id: "5",
    code: "EMP-00005",
    name: "Ahmed Khan",
    email: "ahmed.khan@payrollx.com",
    phone: "0345-6789012",
    department: "Finance",
    designation: "Financial Analyst",
    status: "active",
    joinedDate: "2022-11-05",
    salary: {
      basic: 90000,
      hra: 22500,
      transport: 9000,
      medical: 11000,
      overtime: 2000,
    },
    leaveBalance: { annual: 11, sick: 7, casual: 4 },
  },
];

// Generate attendance for current month
const generateAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const monthStart = startOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: today });

  employees.forEach((emp) => {
    days.forEach((day) => {
      const dayOfWeek = day.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const random = Math.random();

      let status: AttendanceRecord["status"];
      let checkIn: string | null = null;
      let checkOut: string | null = null;
      let hoursWorked = 0;

      if (isWeekend) {
        status = "weekend";
      } else if (random > 0.95) {
        status = "leave";
      } else if (random > 0.9) {
        status = "absent";
      } else if (random > 0.8) {
        status = "late";
        checkIn = "10:15 AM";
        checkOut = "07:30 PM";
        hoursWorked = 9.25;
      } else {
        status = "present";
        checkIn = "09:00 AM";
        checkOut = "06:15 PM";
        hoursWorked = 9.25;
      }

      records.push({
        id: `${emp.id}-${format(day, "yyyy-MM-dd")}`,
        employeeId: emp.id,
        date: format(day, "yyyy-MM-dd"),
        checkIn,
        checkOut,
        status,
        hoursWorked,
      });
    });
  });

  return records;
};

export const attendanceRecords = generateAttendance();

// Leave Requests
export const leaveRequests: LeaveRequest[] = [
  {
    id: "LR-001",
    employeeId: "2",
    employeeName: "Fazal Abbas",
    type: "annual",
    startDate: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    days: 3,
    reason: "Family vacation",
    status: "pending",
    appliedOn: format(subDays(new Date(), 2), "yyyy-MM-dd"),
  },
  {
    id: "LR-002",
    employeeId: "3",
    employeeName: "Azma Munir",
    type: "sick",
    startDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    days: 2,
    reason: "Medical appointment and recovery",
    status: "pending",
    appliedOn: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "LR-003",
    employeeId: "1",
    employeeName: "Zohaib Farhan",
    type: "casual",
    startDate: format(subDays(new Date(), 10), "yyyy-MM-dd"),
    endDate: format(subDays(new Date(), 10), "yyyy-MM-dd"),
    days: 1,
    reason: "Personal errand",
    status: "approved",
    appliedOn: format(subDays(new Date(), 15), "yyyy-MM-dd"),
  },
];

// Payroll Records
export const payrollRecords: PayrollRecord[] = [
  // November 2024
  ...employees.map((emp) => {
    const gross = emp.salary.basic + emp.salary.hra + emp.salary.transport + emp.salary.medical + emp.salary.overtime;
    const deductions = Math.round(gross * 0.05);
    const tax = Math.round(gross * 0.08);
    return {
      id: `PAY-${emp.id}-2024-11`,
      employeeId: emp.id,
      employeeName: emp.name,
      month: "2024-11",
      basic: emp.salary.basic,
      allowances: emp.salary.hra + emp.salary.transport + emp.salary.medical + emp.salary.overtime,
      deductions,
      tax,
      netPay: gross - deductions - tax,
      status: "completed" as const,
    };
  }),
  // October 2024
  ...employees.map((emp) => {
    const gross = emp.salary.basic + emp.salary.hra + emp.salary.transport + emp.salary.medical + emp.salary.overtime;
    const deductions = Math.round(gross * 0.05);
    const tax = Math.round(gross * 0.08);
    return {
      id: `PAY-${emp.id}-2024-10`,
      employeeId: emp.id,
      employeeName: emp.name,
      month: "2024-10",
      basic: emp.salary.basic,
      allowances: emp.salary.hra + emp.salary.transport + emp.salary.medical + emp.salary.overtime,
      deductions,
      tax,
      netPay: gross - deductions - tax,
      status: "completed" as const,
    };
  }),
];

// AI Insights - Fraud Alerts
export const fraudAlerts: FraudAlert[] = [
  {
    id: "FA-001",
    severity: "high",
    title: "Proxy Attendance Suspected",
    employeeId: "5",
    employeeName: "Ahmed Khan",
    description: "Check-in detected from same IP address as another employee within 10 minutes. Possible buddy punching.",
    timestamp: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm"),
    reviewed: false,
  },
  {
    id: "FA-002",
    severity: "medium",
    title: "Unusual Overtime Pattern",
    employeeId: "2",
    employeeName: "Fazal Abbas",
    description: "Overtime claims increased by 150% compared to department average over the last 3 months.",
    timestamp: format(subDays(new Date(), 3), "yyyy-MM-dd HH:mm"),
    reviewed: false,
  },
  {
    id: "FA-003",
    severity: "low",
    title: "Location Mismatch",
    employeeId: "1",
    employeeName: "Zohaib Farhan",
    description: "Check-in location differs from usual office location. May require verification.",
    timestamp: format(subDays(new Date(), 5), "yyyy-MM-dd HH:mm"),
    reviewed: true,
  },
  {
    id: "FA-004",
    severity: "high",
    title: "Duplicate Expense Claims",
    employeeId: "4",
    employeeName: "Sara Ahmed",
    description: "Similar expense entries detected across multiple pay periods totaling PKR 45,000.",
    timestamp: format(subDays(new Date(), 2), "yyyy-MM-dd HH:mm"),
    reviewed: false,
  },
  {
    id: "FA-005",
    severity: "medium",
    title: "Late Night Access",
    employeeId: "3",
    employeeName: "Azma Munir",
    description: "System access logged at 2:30 AM on multiple occasions without approved overtime.",
    timestamp: format(subDays(new Date(), 4), "yyyy-MM-dd HH:mm"),
    reviewed: false,
  },
];

// AI Insights - Salary Anomalies
export const salaryAnomalies: SalaryAnomaly[] = [
  {
    id: "SA-001",
    severity: "high",
    title: "Sudden Salary Increase",
    employeeId: "4",
    employeeName: "Sara Ahmed",
    description: "Net pay increased by 35% from last month without documented promotion or bonus approval.",
    timestamp: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm"),
    reviewed: false,
  },
  {
    id: "SA-002",
    severity: "medium",
    title: "Deduction Discrepancy",
    employeeId: "2",
    employeeName: "Fazal Abbas",
    description: "Tax deduction lower than expected based on salary bracket. Difference of PKR 8,500.",
    timestamp: format(subDays(new Date(), 2), "yyyy-MM-dd HH:mm"),
    reviewed: false,
  },
  {
    id: "SA-003",
    severity: "low",
    title: "Overtime Calculation",
    employeeId: "3",
    employeeName: "Azma Munir",
    description: "Overtime hours don't match attendance records. 5 hours unaccounted.",
    timestamp: format(subDays(new Date(), 3), "yyyy-MM-dd HH:mm"),
    reviewed: true,
  },
  {
    id: "SA-004",
    severity: "medium",
    title: "Allowance Irregularity",
    employeeId: "5",
    employeeName: "Ahmed Khan",
    description: "Medical allowance exceeds policy limit by PKR 5,000 for 3 consecutive months.",
    timestamp: format(subDays(new Date(), 4), "yyyy-MM-dd HH:mm"),
    reviewed: false,
  },
];

// AI Insights - Salary Recommendations
export const salaryRecommendations: SalaryRecommendation[] = [
  {
    id: "SR-001",
    employeeId: "1",
    employeeName: "Zohaib Farhan",
    score: 92,
    recommendation: "Annual Increment",
    suggestedRange: "10-15%",
    rationale: "Consistently high performance scores (avg 4.5/5) over 18 months. Zero unplanned absences. Led 3 successful project deliveries. Current salary 8% below market rate for similar roles.",
  },
  {
    id: "SR-002",
    employeeId: "2",
    employeeName: "Fazal Abbas",
    score: 87,
    recommendation: "Annual Increment",
    suggestedRange: "8-12%",
    rationale: "Attendance rate of 94% over 12 months with low variation. Completed all assigned tasks on time. Strong team collaboration feedback.",
  },
  {
    id: "SR-003",
    employeeId: "3",
    employeeName: "Azma Munir",
    score: 78,
    recommendation: "Performance Review",
    suggestedRange: "5-8%",
    rationale: "Good technical skills but attendance needs improvement. Consider performance improvement plan before salary adjustment.",
  },
];

// Payroll Forecast Data
export const payrollForecast: PayrollForecast[] = [
  { month: "Jun 2024", actual: 3800000 },
  { month: "Jul 2024", actual: 3850000 },
  { month: "Aug 2024", actual: 3920000 },
  { month: "Sep 2024", actual: 4050000 },
  { month: "Oct 2024", actual: 4120000 },
  { month: "Nov 2024", actual: 4200000 },
  { month: "Dec 2024", forecast: 4350000 },
  { month: "Jan 2025", forecast: 4420000 },
  { month: "Feb 2025", forecast: 4500000 },
];

// Dashboard KPIs
export const dashboardKPIs = {
  totalEmployees: { value: 52, trend: "+3", trendUp: true, label: "this month" },
  payrollCost: { value: "4.2M", trend: "+5.2%", trendUp: true, label: "PKR" },
  activeAlerts: { value: 7, trend: "3 new", trendUp: false, label: "" },
  attendanceRate: { value: "94.2%", trend: "-0.8%", trendUp: false, label: "" },
};

// Departments
export const departments = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "QA",
];
