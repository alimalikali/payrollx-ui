import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeeProfile from "./EmployeeProfile";

const mockNavigate = vi.fn();
const mockUseCurrentUser = vi.fn();
const mockUseEmployee = vi.fn();
const mockUseMyEmployee = vi.fn();
const mockUseAttendance = vi.fn();
const mockUseLeaveTypes = vi.fn();
const mockUseLeaveBalance = vi.fn();
const mockUseUpdateEmployee = vi.fn();
const mockUseUpdateMyProfileImage = vi.fn();
const mockUseUploadProfilePhoto = vi.fn();
const mockUseDeleteEmployee = vi.fn();
const mockUseCheckIn = vi.fn();
const mockUseCheckOut = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks", () => ({
  toast: vi.fn(),
  useCurrentUser: () => mockUseCurrentUser(),
  useEmployee: (...args: unknown[]) => mockUseEmployee(...args),
  useMyEmployee: (...args: unknown[]) => mockUseMyEmployee(...args),
  useAttendance: (...args: unknown[]) => mockUseAttendance(...args),
  useLeaveTypes: () => mockUseLeaveTypes(),
  useLeaveBalance: (...args: unknown[]) => mockUseLeaveBalance(...args),
  useUpdateEmployee: () => mockUseUpdateEmployee(),
  useUpdateMyProfileImage: () => mockUseUpdateMyProfileImage(),
  useUploadProfilePhoto: () => mockUseUploadProfilePhoto(),
  useDeleteEmployee: () => mockUseDeleteEmployee(),
  useCheckIn: () => mockUseCheckIn(),
  useCheckOut: () => mockUseCheckOut(),
}));

describe("EmployeeProfile", () => {
  beforeEach(() => {
    const mutationStub = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };

    mockUseCurrentUser.mockReturnValue({
      data: {
        id: "user-1",
        role: "employee",
        employee: { id: "emp-1" },
      },
    });
    mockUseEmployee.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });
    mockUseMyEmployee.mockReturnValue({
      data: {
        data: {
          id: "emp-1",
          userId: "user-1",
          firstName: "Jane",
          lastName: "Doe",
          name: "Jane Doe",
          employeeId: "EMP0001",
          email: "jane@payrollx.com",
          departmentName: "Engineering",
          designation: "Developer",
          status: "active",
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseAttendance.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseLeaveTypes.mockReturnValue({
      data: {
        data: [
          { id: "annual", name: "Annual Leave", code: "AL" },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseLeaveBalance.mockReturnValue({
      data: {
        data: [
          {
            leaveTypeId: "annual",
            leaveTypeName: "Annual Leave",
            leaveTypeCode: "AL",
            allocatedDays: 10,
            usedDays: 5,
            carriedForwardDays: 0,
            remainingDays: 5,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseUpdateEmployee.mockReturnValue(mutationStub);
    mockUseUpdateMyProfileImage.mockReturnValue(mutationStub);
    mockUseUploadProfilePhoto.mockReturnValue(mutationStub);
    mockUseDeleteEmployee.mockReturnValue(mutationStub);
    mockUseCheckIn.mockReturnValue(mutationStub);
    mockUseCheckOut.mockReturnValue(mutationStub);
  });

  it("shows leave balance cards on the employee profile", () => {
    render(<EmployeeProfile />);

    expect(screen.getByText("Leave Balance")).toBeInTheDocument();
    expect(screen.getByText("Annual Leave")).toBeInTheDocument();
    expect(screen.getByText(/Allocated 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Used 5/i)).toBeInTheDocument();
  });
});
