import { fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HrDashboard from "./HrDashboard";

const mockNavigate = vi.fn();
const mockUseHrDashboard = vi.fn();
const mockUseApproveLeave = vi.fn();
const mockUseRejectLeave = vi.fn();
const mockUseCreatePayrollRun = vi.fn();
const mockUseProcessPayroll = vi.fn();
const mockUseApprovePayroll = vi.fn();

const approveMutate = vi.fn();
const rejectMutate = vi.fn();
const createPayrollMutateAsync = vi.fn();
const processPayrollMutateAsync = vi.fn();
const approvePayrollMutateAsync = vi.fn();
const refetch = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ChartCard", () => ({
  ChartCard: ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {action}
      {children}
    </section>
  ),
}));

vi.mock("@/components/KPICard", () => ({
  KPICard: ({ title, value }: { title: string; value: string | number }) => (
    <div>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock("@/components/StatusBadge", () => ({
  StatusBadge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children }: { children: ReactNode }) => <label>{children}</label>,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  CartesianGrid: () => null,
  Cell: () => null,
  Pie: () => null,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

vi.mock("@/hooks", () => ({
  useHrDashboard: () => mockUseHrDashboard(),
  useApproveLeave: () => mockUseApproveLeave(),
  useRejectLeave: () => mockUseRejectLeave(),
  useCreatePayrollRun: () => mockUseCreatePayrollRun(),
  useProcessPayroll: () => mockUseProcessPayroll(),
  useApprovePayroll: () => mockUseApprovePayroll(),
}));

describe("HrDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseHrDashboard.mockReturnValue({
      data: {
        data: {
          kpis: {
            totalEmployees: 48,
            activeEmployees: 46,
            presentToday: 38,
            absentToday: 5,
            attendanceRate: 83,
            pendingLeaves: 4,
          },
          payroll: {
            id: "run-last",
            month: 2,
            year: 2026,
            status: "approved",
            totalEmployees: 44,
            totalGrossSalary: 2800000,
            totalNetSalary: 2520000,
          },
          ai: {
            newAlerts: 1,
            highRiskAlerts: 0,
            salaryAnomalies: 0,
            currentMonthNetSalaryProjection: 2500000,
          },
          attendanceSummary: {
            today: {
              present: 38,
              absent: 5,
              late: 3,
            },
            lateArrivalsCount: 12,
            monthlyTrend: [
              { label: "2026-03-01", present: 36, absent: 6, late: 2 },
              { label: "2026-03-02", present: 38, absent: 5, late: 3 },
            ],
            departmentWise: [
              { departmentId: "dep-1", departmentName: "Engineering", present: 15, absent: 2, late: 1 },
              { departmentId: "dep-2", departmentName: "HR", present: 6, absent: 1, late: 0 },
            ],
          },
          payrollSummary: {
            currentMonthTotalPayrollCost: 3000000,
            pendingSalaryProcessing: 8,
            totalSalaryCurrentMonth: 3000000,
            totalDeductions: 250000,
            totalBonuses: 80000,
            taxSummary: 150000,
            currentMonthPayroll: {
              id: "run-current",
              month: 3,
              year: 2026,
              status: "draft",
            },
          },
          leaveSummary: {
            pendingRequests: 4,
            approvedThisMonth: 9,
            distribution: [
              { leaveTypeId: "annual", leaveTypeName: "Annual Leave", count: 6 },
              { leaveTypeId: "sick", leaveTypeName: "Sick Leave", count: 3 },
            ],
          },
          pendingLeaveRequests: [
            {
              id: "leave-1",
              employeeId: "emp-1",
              employeeName: "Jane Doe",
              leaveTypeName: "Annual Leave",
              startDate: "2026-03-05",
              endDate: "2026-03-06",
              totalDays: 2,
              reason: "Family trip",
              status: "pending",
            },
          ],
          workforceAlerts: {
            newEmployeesThisMonth: 3,
            employeesOnProbation: 5,
            recentlyResignedEmployees: 1,
            contractExpiryAlerts: [
              {
                employeeId: "emp-3",
                employeeName: "Alex Smith",
                endDate: "2026-03-20",
              },
            ],
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch,
    });
    mockUseApproveLeave.mockReturnValue({ mutate: approveMutate, isPending: false });
    mockUseRejectLeave.mockReturnValue({ mutate: rejectMutate, isPending: false });
    mockUseCreatePayrollRun.mockReturnValue({ mutateAsync: createPayrollMutateAsync, isPending: false });
    mockUseProcessPayroll.mockReturnValue({ mutateAsync: processPayrollMutateAsync, isPending: false });
    mockUseApprovePayroll.mockReturnValue({ mutateAsync: approvePayrollMutateAsync, isPending: false });
  });

  it("renders the requested HR dashboard sections", () => {
    render(<HrDashboard />);

    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("Present Today")).toBeInTheDocument();
    expect(screen.getByText("Absent Today")).toBeInTheDocument();
    expect(screen.getByText("Pending Leave Requests")).toBeInTheDocument();
    expect(screen.getByText("This Month Total Payroll Cost")).toBeInTheDocument();
    expect(screen.getByText("Pending Salary Processing")).toBeInTheDocument();
    expect(screen.getByText("Today Attendance Summary")).toBeInTheDocument();
    expect(screen.getByText("Monthly Attendance Chart")).toBeInTheDocument();
    expect(screen.getByText("Department-wise Attendance")).toBeInTheDocument();
    expect(screen.getByText("Payroll Summary")).toBeInTheDocument();
    expect(screen.getByText("Leave Type Distribution")).toBeInTheDocument();
    expect(screen.getByText("Workforce Alerts")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("approves a pending leave request from the side panel", () => {
    render(<HrDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(approveMutate).toHaveBeenCalledWith(
      "leave-1",
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });

  it("rejects a pending leave request with a reason", () => {
    render(<HrDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    fireEvent.change(screen.getByPlaceholderText("Provide reason for rejection..."), {
      target: { value: "Project deadline conflict" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject Request" }));

    expect(rejectMutate).toHaveBeenCalledWith(
      {
        id: "leave-1",
        reason: "Project deadline conflict",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });

  it("processes the current month payroll when the run is still draft", async () => {
    processPayrollMutateAsync.mockResolvedValue({ data: { id: "run-current" } });

    render(<HrDashboard />);

    fireEvent.click(screen.getByRole("button", { name: /process payroll/i }));

    expect(processPayrollMutateAsync).toHaveBeenCalledWith("run-current");
  });
});
