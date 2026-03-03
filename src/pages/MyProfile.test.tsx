import { fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MyProfile from "./MyProfile";

const mockUseCurrentUser = vi.fn();
const mockUseEmployee = vi.fn();
const mockUsePayslips = vi.fn();
const mockUseSalaryHistory = vi.fn();
const mockDownloadPayslipPdf = vi.fn();

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/AvatarInitials", () => ({
  AvatarInitials: ({ name, imageUrl }: { name: string; imageUrl?: string | null }) => (
    <div data-testid="avatar">
      {name}
      {imageUrl ? `:${imageUrl}` : ""}
    </div>
  ),
}));

vi.mock("@/components/StatusBadge", () => ({
  StatusBadge: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
  TableHead: ({ children }: { children: ReactNode }) => <th>{children}</th>,
  TableCell: ({ children }: { children: ReactNode }) => <td>{children}</td>,
}));

vi.mock("@/hooks", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
  useEmployee: (...args: unknown[]) => mockUseEmployee(...args),
  usePayslips: (...args: unknown[]) => mockUsePayslips(...args),
  useSalaryHistory: (...args: unknown[]) => mockUseSalaryHistory(...args),
}));

vi.mock("@/lib/payslip", async () => {
  const actual = await vi.importActual<typeof import("@/lib/payslip")>("@/lib/payslip");
  return {
    ...actual,
    downloadPayslipPdf: (...args: unknown[]) => mockDownloadPayslipPdf(...args),
  };
});

describe("MyProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCurrentUser.mockReturnValue({
      data: {
        role: "employee",
        employee: { id: "emp-1" },
      },
      isLoading: false,
    });
    mockUseEmployee.mockReturnValue({
      data: {
        data: {
          id: "emp-1",
          firstName: "Jane",
          lastName: "Doe",
          employeeId: "EMP-001",
          designation: "Frontend Engineer",
          departmentName: "Engineering",
          joiningDate: "2024-01-15",
          email: "jane@example.com",
          phone: "0300-1111111",
          profileImage: "/uploads/profiles/jane.png",
        },
      },
      isLoading: false,
      isError: false,
    });
    mockUsePayslips.mockReturnValue({
      data: {
        data: [
          {
            id: "pay-1",
            employeeId: "emp-1",
            employeeCode: "EMP-001",
            employeeName: "Jane Doe",
            department: "Engineering",
            designation: "Frontend Engineer",
            payrollRunId: "run-1",
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            workingDays: 22,
            presentDays: 21,
            absentDays: 1,
            leaveDays: 0,
            overtimeHours: 2,
            earnings: {
              basicSalary: 80000,
              housingAllowance: 12000,
              transportAllowance: 5000,
              medicalAllowance: 3000,
              utilityAllowance: 2000,
              otherAllowances: 1500,
              overtimePay: 2500,
              bonus: 4000,
            },
            grossSalary: 110000,
            deductions: {
              incomeTax: 6000,
              eobiContribution: 800,
              sessiContribution: 500,
              loanDeduction: 1200,
              otherDeductions: 700,
            },
            totalDeductions: 9200,
            netSalary: 100800,
            taxableIncome: 90000,
            taxSlab: "11%",
            isFiler: true,
            status: "paid",
            bankName: "ABC Bank",
            bankAccountNumber: "1234",
            paidAt: "2026-03-01T00:00:00.000Z",
            createdAt: "2026-03-01T00:00:00.000Z",
          },
          {
            id: "pay-2",
            employeeId: "emp-1",
            employeeCode: "EMP-001",
            employeeName: "Jane Doe",
            department: "Engineering",
            designation: "Frontend Engineer",
            payrollRunId: "run-2",
            month: 1,
            year: 2026,
            workingDays: 22,
            presentDays: 20,
            absentDays: 2,
            leaveDays: 0,
            overtimeHours: 1,
            earnings: {
              basicSalary: 80000,
              housingAllowance: 12000,
              transportAllowance: 5000,
              medicalAllowance: 3000,
              utilityAllowance: 2000,
              otherAllowances: 1000,
              overtimePay: 1000,
              bonus: 0,
            },
            grossSalary: 103000,
            deductions: {
              incomeTax: 5500,
              eobiContribution: 800,
              sessiContribution: 500,
              loanDeduction: 1200,
              otherDeductions: 500,
            },
            totalDeductions: 8500,
            netSalary: 94500,
            taxableIncome: 88000,
            taxSlab: "11%",
            isFiler: true,
            status: "approved",
            bankName: "ABC Bank",
            bankAccountNumber: "1234",
            paidAt: "2026-02-01T00:00:00.000Z",
            createdAt: "2026-02-01T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseSalaryHistory.mockReturnValue({
      data: {
        data: [
          {
            id: "salary-1",
            employeeId: "emp-1",
            month: 3,
            year: 2026,
            grossSalary: 110000,
            totalDeductions: 9200,
            netSalary: 100800,
            status: "paid",
            createdAt: "2026-03-01T00:00:00.000Z",
          },
          {
            id: "salary-2",
            employeeId: "emp-1",
            month: 2,
            year: 2026,
            grossSalary: 103000,
            totalDeductions: 8500,
            netSalary: 94500,
            status: "approved",
            createdAt: "2026-02-01T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
  });

  it("renders only the requested HR-managed sections", () => {
    render(<MyProfile />);

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Salary Overview")).toBeInTheDocument();
    expect(screen.getByText("Payslip Section")).toBeInTheDocument();
    expect(screen.queryByText("Attendance")).not.toBeInTheDocument();
    expect(screen.queryByText("Leave Balance")).not.toBeInTheDocument();
  });

  it("shows personal, salary, and annual summary values", () => {
    render(<MyProfile />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("EMP-001")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getAllByText("PKR 110,000").length).toBeGreaterThan(0);
    expect(screen.getByText("PKR 213,000")).toBeInTheDocument();
    expect(screen.getByText("PKR 17,700")).toBeInTheDocument();
    expect(screen.getByText("PKR 195,300")).toBeInTheDocument();
    expect(screen.getByText("PKR 11,500")).toBeInTheDocument();
  });

  it("downloads the current month payslip from the profile page", () => {
    render(<MyProfile />);

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    expect(mockDownloadPayslipPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pay-1",
      })
    );
  });

  it("shows payroll empty states when no salary data exists", () => {
    mockUsePayslips.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });
    mockUseSalaryHistory.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });

    render(<MyProfile />);

    expect(screen.getByText("No salary record available yet.")).toBeInTheDocument();
    expect(screen.getByText("No payslip available yet.")).toBeInTheDocument();
  });
});
