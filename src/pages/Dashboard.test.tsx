import { fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Dashboard from "./Dashboard";

const mockUseCurrentUser = vi.fn();
const mockUseAttendance = vi.fn();
const mockUseDailyStats = vi.fn();
const mockUseAIDashboardStats = vi.fn();
const mockUsePayrollForecast = vi.fn();
const mockUseNotifications = vi.fn();
const mockUseLeaves = vi.fn();
const mockUseApproveLeave = vi.fn();
const mockUseRejectLeave = vi.fn();
const mockUseCancelLeave = vi.fn();
const mockUseMarkNotificationRead = vi.fn();
const approveMutate = vi.fn();
const rejectMutate = vi.fn();
const cancelMutate = vi.fn();
const markReadMutate = vi.fn();

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/KPICard", () => ({
  KPICard: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("@/components/ChartCard", () => ({
  ChartCard: ({ title, children }: { title: string; children: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/components/AttendanceHeatmap", () => ({
  AttendanceHeatmap: () => <div>Attendance Heatmap</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
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
  LineChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
  useAttendance: () => mockUseAttendance(),
  useDailyStats: () => mockUseDailyStats(),
  useAIDashboardStats: () => mockUseAIDashboardStats(),
  usePayrollForecast: () => mockUsePayrollForecast(),
  useNotifications: () => mockUseNotifications(),
  useLeaves: () => mockUseLeaves(),
  useApproveLeave: () => mockUseApproveLeave(),
  useRejectLeave: () => mockUseRejectLeave(),
  useCancelLeave: () => mockUseCancelLeave(),
  useMarkNotificationRead: () => mockUseMarkNotificationRead(),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAttendance.mockReturnValue({ data: { data: [] }, isLoading: false });
    mockUseDailyStats.mockReturnValue({ data: { data: { totalEmployees: 4, attendanceRate: 92 } }, isLoading: false });
    mockUseAIDashboardStats.mockReturnValue({ data: { data: { alerts: { new_alerts: 1 } } }, isLoading: false });
    mockUsePayrollForecast.mockReturnValue({ data: { data: { forecasts: [] } }, isLoading: false });
    mockUseNotifications.mockReturnValue({ data: { data: [], meta: { total: 0 } }, isLoading: false, isError: false });
    mockUseLeaves.mockReturnValue({ data: { data: [] }, isLoading: false });
    mockUseApproveLeave.mockReturnValue({ mutate: approveMutate, isPending: false });
    mockUseRejectLeave.mockReturnValue({ mutate: rejectMutate, isPending: false });
    mockUseCancelLeave.mockReturnValue({ mutate: cancelMutate, isPending: false });
    mockUseMarkNotificationRead.mockReturnValue({ mutate: markReadMutate });
  });

  it("shows actionable leave notifications on the hr dashboard", () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        id: "user-1",
        email: "hr@payrollx.com",
        role: "hr",
      },
    });
    mockUseNotifications.mockReturnValue({
      data: {
        data: [
          {
            id: "notification-1",
            type: "leave_request_submitted",
            title: "New leave request",
            message: "Jane Doe applied for Annual Leave (1 day).",
            entityId: "leave-1",
            isRead: false,
            createdAt: "2026-03-02T08:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseLeaves.mockReturnValue({
      data: {
        data: [
          {
            id: "leave-1",
            status: "pending",
          },
        ],
      },
      isLoading: false,
    });

    render(<Dashboard />);

    expect(screen.getByText("Recent Notifications")).toBeInTheDocument();
    expect(screen.getByText("New leave request")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe applied for Annual Leave (1 day).")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("approves a leave from the hr dashboard notification panel", () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        id: "user-1",
        email: "hr@payrollx.com",
        role: "hr",
      },
    });
    mockUseNotifications.mockReturnValue({
      data: {
        data: [
          {
            id: "notification-1",
            type: "leave_request_submitted",
            title: "New leave request",
            message: "Jane Doe applied for Annual Leave (1 day).",
            entityId: "leave-1",
            isRead: false,
            createdAt: "2026-03-02T08:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseLeaves.mockReturnValue({
      data: {
        data: [
          {
            id: "leave-1",
            status: "pending",
          },
        ],
      },
      isLoading: false,
    });

    render(<Dashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(approveMutate).toHaveBeenCalledWith(
      "leave-1",
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });

  it("hides processed leave notifications from the hr dashboard panel", () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        id: "user-1",
        email: "hr@payrollx.com",
        role: "hr",
      },
    });
    mockUseNotifications.mockReturnValue({
      data: {
        data: [
          {
            id: "notification-1",
            type: "leave_request_submitted",
            title: "New leave request",
            message: "Jane Doe applied for Annual Leave (1 day).",
            entityId: "leave-1",
            isRead: false,
            createdAt: "2026-03-02T08:00:00.000Z",
          },
          {
            id: "notification-2",
            type: "leave_request_approved",
            title: "Leave request approved",
            message: "Jane Doe's Annual Leave request was approved.",
            entityId: "leave-1",
            isRead: false,
            createdAt: "2026-03-02T09:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseLeaves.mockReturnValue({
      data: {
        data: [],
      },
      isLoading: false,
    });

    render(<Dashboard />);

    expect(screen.queryByText("New leave request")).not.toBeInTheDocument();
    expect(screen.queryByText("Leave request approved")).not.toBeInTheDocument();
    expect(screen.getByText("No pending leave request notifications.")).toBeInTheDocument();
    expect(markReadMutate).toHaveBeenCalledWith("notification-1");
  });

  it("does not show the notifications panel for employees", () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        id: "user-2",
        email: "employee@payrollx.com",
        role: "employee",
      },
    });

    render(<Dashboard />);

    expect(screen.queryByText("Recent Notifications")).not.toBeInTheDocument();
  });
});
