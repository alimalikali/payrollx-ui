import { fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Attendance from "./Attendance";

const mockUseCurrentUser = vi.fn();
const mockUseAttendance = vi.fn();
const mockUseDailyStats = vi.fn();
const mockUseEmployees = vi.fn();
const mockUseCheckIn = vi.fn();
const mockUseCheckOut = vi.fn();
const mockToast = vi.fn();

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/StatusBadge", () => ({
  StatusBadge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/AttendanceHeatmap", () => ({
  AttendanceHeatmap: () => <div>Attendance Heatmap</div>,
}));

vi.mock("@/components/ChartCard", () => ({
  ChartCard: ({ title, children }: { title: string; children: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
  TableHead: ({ children }: { children: ReactNode }) => <th>{children}</th>,
  TableCell: ({ children, colSpan }: { children: ReactNode; colSpan?: number }) => <td colSpan={colSpan}>{children}</td>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <select
      data-testid="mock-select"
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => <option value={value}>{children}</option>,
}));

vi.mock("@/hooks", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
  useCurrentUser: () => mockUseCurrentUser(),
  useAttendance: (...args: unknown[]) => mockUseAttendance(...args),
  useDailyStats: (...args: unknown[]) => mockUseDailyStats(...args),
  useEmployees: (...args: unknown[]) => mockUseEmployees(...args),
  useCheckIn: () => mockUseCheckIn(),
  useCheckOut: () => mockUseCheckOut(),
}));

describe("Attendance page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDailyStats.mockReturnValue({ data: undefined, isLoading: false, isError: false });
    mockUseEmployees.mockReturnValue({ data: { data: [] }, isLoading: false, isError: false });
    mockUseCheckIn.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mockUseCheckOut.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it("shows previous attendance history for employees", () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        role: "employee",
      },
    });
    mockUseAttendance.mockImplementation((filters?: { date?: string }) => {
      if (filters?.date) {
        return {
          data: {
            data: [{
              id: "today-att-1",
              date: filters.date,
              checkIn: "09:00",
              checkOut: "17:00",
              workingHours: 8,
              status: "present",
            }],
          },
          refetch: vi.fn(),
        };
      }

      return {
        data: {
          data: [
            {
              id: "att-1",
              date: "2026-03-02",
              checkIn: "09:05",
              checkOut: "17:10",
              workingHours: 8,
              status: "late",
            },
          ],
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      };
    });

    render(<Attendance />);

    expect(screen.getByText("Attendance History")).toBeInTheDocument();
    expect(screen.getByText("2026-03-02")).toBeInTheDocument();
    expect(screen.getByText("09:05")).toBeInTheDocument();
    expect(screen.getByText("17:10")).toBeInTheDocument();
    expect(screen.getByText("late")).toBeInTheDocument();
  });

  it("passes the selected employee filter for hr attendance history", () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        role: "hr",
      },
    });
    mockUseAttendance.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseEmployees.mockReturnValue({
      data: {
        data: [
          {
            id: "emp-1",
            firstName: "Jane",
            lastName: "Doe",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<Attendance />);

    const selects = screen.getAllByTestId("mock-select");
    fireEvent.change(selects[0], { target: { value: "emp-1" } });

    expect(
      mockUseAttendance.mock.calls.some(
        ([filters]) => filters && typeof filters === "object" && "employeeId" in filters && filters.employeeId === "emp-1"
      )
    ).toBe(true);
  });

  it("shows an empty state when no attendance records exist", () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        role: "employee",
      },
    });
    mockUseAttendance.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<Attendance />);

    expect(screen.getByText("No attendance records found.")).toBeInTheDocument();
  });
});
