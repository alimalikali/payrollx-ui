import { render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";

const mockUseCurrentUser = vi.fn();
const mockUseLogout = vi.fn();
const mockUseNotifications = vi.fn();
const mockUseMarkNotificationRead = vi.fn();
const mockUseMarkAllNotificationsRead = vi.fn();

vi.mock("@/hooks", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
  useLogout: () => mockUseLogout(),
  useNotifications: () => mockUseNotifications(),
  useMarkNotificationRead: () => mockUseMarkNotificationRead(),
  useMarkAllNotificationsRead: () => mockUseMarkAllNotificationsRead(),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock("@/components/AvatarInitials", () => ({
  AvatarInitials: ({ name, imageUrl }: { name: string; imageUrl?: string | null }) => (
    <div data-testid="topbar-avatar" data-name={name} data-image-url={imageUrl || ""} />
  ),
}));

describe("TopBar", () => {
  beforeEach(() => {
    mockUseLogout.mockReturnValue({ mutate: vi.fn() });
    mockUseNotifications.mockReturnValue({ data: { data: [], meta: { total: 0 } }, isLoading: false, isError: false });
    mockUseMarkNotificationRead.mockReturnValue({ mutate: vi.fn() });
    mockUseMarkAllNotificationsRead.mockReturnValue({ mutate: vi.fn() });
  });

  it("renders the employee profile image in the account menu trigger", () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        role: "employee",
        email: "jane@payrollx.com",
        employee: {
          id: "emp-1",
          firstName: "Jane",
          lastName: "Doe",
          profileImage: "/uploads/profiles/jane.png",
        },
      },
    });

    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );

    expect(screen.getByTestId("topbar-avatar")).toHaveAttribute("data-name", "Jane Doe");
    expect(screen.getByTestId("topbar-avatar")).toHaveAttribute("data-image-url", "/uploads/profiles/jane.png");
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("renders cancelled leave notifications in the dropdown", async () => {
    mockUseCurrentUser.mockReturnValue({
      data: {
        role: "hr",
        email: "hr@payrollx.com",
        employee: null,
      },
    });
    mockUseNotifications.mockReturnValue({
      data: {
        data: [{
          id: "notification-1",
          type: "leave_request_cancelled",
          title: "Leave request cancelled",
          message: "Jane Doe's Annual Leave request was cancelled.",
          isRead: false,
          createdAt: "2026-03-02T08:00:00.000Z",
        }],
        meta: { total: 1 },
      },
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );

    expect(screen.getByText("Leave request cancelled")).toBeInTheDocument();
    expect(screen.getByText("leave request cancelled")).toBeInTheDocument();
  });
});
