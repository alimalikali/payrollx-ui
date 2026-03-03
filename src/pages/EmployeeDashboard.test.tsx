import { fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeeDashboard from "./EmployeeDashboard";

const mockNavigate = vi.fn();
const mockUseCurrentUser = vi.fn();
const mockUseEmployeeDashboard = vi.fn();
const mockUseNotifications = vi.fn();
const mockUseMarkNotificationRead = vi.fn();
const mockUsePayslips = vi.fn();
const mockDownloadPayslipPdf = vi.fn();

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
  ChartCard: ({ title, children }: { title: string; children: ReactNode }) => (
    <section>
      <h2>{title}</h2>
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

vi.mock("@/hooks", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
  useEmployeeDashboard: () => mockUseEmployeeDashboard(),
  useNotifications: (...args: unknown[]) => mockUseNotifications(...args),
  useMarkNotificationRead: () => mockUseMarkNotificationRead(),
  usePayslips: (...args: unknown[]) => mockUsePayslips(...args),
}));

vi.mock("@/lib/payslip", async () => {
  const actual = await vi.importActual<typeof import("@/lib/payslip")>("@/lib/payslip");
  return {
    ...actual,
    downloadPayslipPdf: (...args: unknown[]) => mockDownloadPayslipPdf(...args),
  };
});

describe("EmployeeDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCurrentUser.mockReturnValue({
      data: { role: "employee", employee: { id: "emp-1" } },
      isLoading: false,
    });
    mockUseEmployeeDashboard.mockReturnValue({
      data: {
        data: {
          today: {
            date: "2026-03-03",
            status: "present",
            checkIn: "09:00",
            checkOut: "17:30",
            workingHours: 8.5,
          },
          monthSummary: {
            presentDays: 18,
            absentDays: 1,
            lateDays: 2,
            totalHours: 144,
          },
          leaveBalances: [
            { leaveTypeId: "1", leaveTypeName: "Annual Leave", remainingDays: 6 },
            { leaveTypeId: "2", leaveTypeName: "Sick Leave", remainingDays: 2 },
          ],
          pendingLeaves: 1,
          latestPayslip: {
            month: 3,
            year: 2026,
            grossSalary: 120000,
            totalDeductions: 10000,
            netSalary: 110000,
            status: "paid",
          },
          aiInsights: {
            insights: [
              { type: "salary_snapshot", severity: "info", title: "Salary Update", description: "Latest salary ready." },
            ],
            actions: [],
          },
        },
      },
      isLoading: false,
      isError: false,
    });
    mockUseNotifications.mockReturnValue({
      data: {
        data: [
          {
            id: "n1",
            type: "salary_credited",
            title: "Salary credited",
            message: "Your salary for March 2026 has been credited.",
            entityType: "payslip",
            entityId: "p1",
            isRead: false,
            createdAt: "2026-03-03T09:00:00.000Z",
          },
          {
            id: "n2",
            type: "company_notice",
            title: "Company notice",
            message: "Office will close early on Friday.",
            entityType: "notice",
            entityId: "notice-1",
            isRead: true,
            createdAt: "2026-03-02T09:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseMarkNotificationRead.mockReturnValue({ mutate: vi.fn() });
    mockUsePayslips.mockReturnValue({
      data: {
        data: [
          {
            id: "p1",
            employeeId: "emp-1",
            employeeCode: "EMP-1",
            employeeName: "Jane Doe",
            department: "Engineering",
            designation: "Engineer",
            payrollRunId: "r1",
            month: 3,
            year: 2026,
            workingDays: 22,
            presentDays: 20,
            absentDays: 1,
            leaveDays: 1,
            overtimeHours: 0,
            earnings: {
              basicSalary: 80000,
              housingAllowance: 12000,
              transportAllowance: 5000,
              medicalAllowance: 3000,
              utilityAllowance: 2000,
              otherAllowances: 1000,
              overtimePay: 0,
              bonus: 0,
            },
            grossSalary: 120000,
            deductions: {
              incomeTax: 6000,
              eobiContribution: 800,
              sessiContribution: 500,
              loanDeduction: 1200,
              otherDeductions: 1500,
            },
            totalDeductions: 10000,
            netSalary: 110000,
            taxableIncome: 90000,
            taxSlab: "11%",
            isFiler: true,
            status: "paid",
            paidAt: "2026-03-03T00:00:00.000Z",
            createdAt: "2026-03-03T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
  });

  it("shows quick actions, summaries, and notifications for employees", () => {
    render(<EmployeeDashboard />);

    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply leave/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download latest payslip/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark attendance/i })).toBeInTheDocument();
    expect(screen.getByText("Attendance Summary")).toBeInTheDocument();
    expect(screen.getByText("Leave Summary")).toBeInTheDocument();
    expect(screen.getByText("Salary Summary")).toBeInTheDocument();
    expect(screen.getByText("Recent Notifications")).toBeInTheDocument();
    expect(screen.getByText("Salary credited")).toBeInTheDocument();
    expect(screen.getByText("Company notice")).toBeInTheDocument();
  });

  it("downloads the latest payslip from quick actions", () => {
    render(<EmployeeDashboard />);

    fireEvent.click(screen.getByRole("button", { name: /download latest payslip/i }));

    expect(mockDownloadPayslipPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "p1",
      })
    );
  });

  it("navigates to leave and attendance pages from quick actions", () => {
    render(<EmployeeDashboard />);

    fireEvent.click(screen.getByRole("button", { name: /apply leave/i }));
    fireEvent.click(screen.getByRole("button", { name: /mark attendance/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/employee/leaves");
    expect(mockNavigate).toHaveBeenCalledWith("/employee/attendance");
  });

  it("shows notification empty state", () => {
    mockUseNotifications.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });

    render(<EmployeeDashboard />);

    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
  });
});
