import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Leaves from "./Leaves";

const mockUseCurrentUser = vi.fn();
const mockUseMyEmployee = vi.fn();
const mockUseLeaves = vi.fn();
const mockUseLeaveTypes = vi.fn();
const mockUseEmployees = vi.fn();
const mockUseLeaveBalance = vi.fn();
const mockUseCreateLeave = vi.fn();
const mockUseApproveLeave = vi.fn();
const mockUseRejectLeave = vi.fn();
const mockUseCancelLeave = vi.fn();
const mockUseAllocateLeave = vi.fn();

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
  useMyEmployee: (...args: unknown[]) => mockUseMyEmployee(...args),
  useLeaves: (...args: unknown[]) => mockUseLeaves(...args),
  useLeaveTypes: () => mockUseLeaveTypes(),
  useEmployees: (...args: unknown[]) => mockUseEmployees(...args),
  useLeaveBalance: (...args: unknown[]) => mockUseLeaveBalance(...args),
  useCreateLeave: () => mockUseCreateLeave(),
  useApproveLeave: () => mockUseApproveLeave(),
  useRejectLeave: () => mockUseRejectLeave(),
  useCancelLeave: () => mockUseCancelLeave(),
  useAllocateLeave: () => mockUseAllocateLeave(),
}));

describe("Leaves page", () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        role: "employee",
        email: "ahmad.khan@payrollx.com",
      },
    });
    mockUseMyEmployee.mockReturnValue({
      data: {
        data: {
          id: "emp-1",
        },
      },
    });
    mockUseLeaves.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });
    mockUseLeaveTypes.mockReturnValue({
      data: {
        data: [
          {
            id: "annual",
            name: "Annual Leave",
            code: "AL",
          },
        ],
      },
    });
    mockUseEmployees.mockReturnValue({ data: { data: [] } });
    mockUseLeaveBalance.mockReturnValue({
      data: {
        data: [
          {
            leaveTypeId: "annual",
            leaveTypeName: "Annual Leave",
            remainingDays: 5,
          },
        ],
      },
      isError: false,
    });
    const mutationStub = { mutate: vi.fn(), isPending: false };
    mockUseCreateLeave.mockReturnValue(mutationStub);
    mockUseApproveLeave.mockReturnValue(mutationStub);
    mockUseRejectLeave.mockReturnValue(mutationStub);
    mockUseCancelLeave.mockReturnValue(mutationStub);
    mockUseAllocateLeave.mockReturnValue(mutationStub);
  });

  it("shows employee leave balance using the my-profile fallback id", () => {
    render(<Leaves />);

    expect(mockUseMyEmployee).toHaveBeenCalledWith(true);
    expect(mockUseLeaveBalance).toHaveBeenCalledWith("emp-1", new Date().getFullYear());
    expect(screen.getByText("Annual Leave")).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it("shows zero-balance cards when active leave types exist but no balance rows are returned", () => {
    mockUseLeaveBalance.mockReturnValueOnce({
      data: {
        data: [],
      },
      isLoading: false,
      isError: false,
    });

    render(<Leaves />);

    expect(screen.getByText("Annual Leave")).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});
