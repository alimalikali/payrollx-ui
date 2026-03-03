import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "./AppSidebar";

const mockUseCurrentUser = vi.fn();
const mockUseLogout = vi.fn();
const mockDispatch = vi.fn();
const mockSelector = vi.fn();

vi.mock("@/hooks", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
  useLogout: () => mockUseLogout(),
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockSelector(),
}));

describe("AppSidebar", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockUseLogout.mockReturnValue({ mutate: vi.fn() });
    mockSelector.mockReturnValue({ mobileMenuOpen: false });
  });

  it("shows privileged navigation items for admin users", () => {
    mockUseCurrentUser.mockReturnValue({
      data: { role: "admin", email: "admin@payrollx.com" },
    });

    render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>
    );

    expect(screen.getAllByText("Employees").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Payroll").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AI Insights").length).toBeGreaterThan(0);
  });

  it("hides privileged navigation items from employees", () => {
    mockUseCurrentUser.mockReturnValue({
      data: { role: "employee", email: "employee@payrollx.com" },
    });

    render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>
    );

    expect(screen.queryByText("Employees")).not.toBeInTheDocument();
    expect(screen.queryByText("Payroll")).not.toBeInTheDocument();
    expect(screen.queryByText("AI Insights")).not.toBeInTheDocument();
  });
});
