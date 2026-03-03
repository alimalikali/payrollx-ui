import { fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Employees from "./Employees";

const mockNavigate = vi.fn();
const mockUseEmployees = vi.fn();
const mockUseEmployeesByDepartment = vi.fn();
const mockUseCreateEmployee = vi.fn();
const mockUseUploadProfilePhoto = vi.fn();

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

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder || "value"}</span>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
  TableHead: ({ children }: { children: ReactNode }) => <th>{children}</th>,
  TableCell: ({ children }: { children: ReactNode }) => <td>{children}</td>,
}));

vi.mock("@/components/StatusBadge", () => ({
  StatusBadge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/AvatarInitials", () => ({
  AvatarInitials: ({ name }: { name: string }) => <div>{name}</div>,
}));

vi.mock("@/components/Pagination", () => ({
  Pagination: () => <div>Pagination</div>,
}));

vi.mock("@/hooks", () => ({
  toast: vi.fn(),
  useEmployees: (...args: unknown[]) => mockUseEmployees(...args),
  useEmployeesByDepartment: () => mockUseEmployeesByDepartment(),
  useCreateEmployee: () => mockUseCreateEmployee(),
  useUploadProfilePhoto: () => mockUseUploadProfilePhoto(),
}));

describe("Employees", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseEmployees.mockReturnValue({
      data: { data: [], meta: { total: 0, totalPages: 1 } },
      isLoading: false,
      isError: false,
    });
    mockUseEmployeesByDepartment.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });
    mockUseCreateEmployee.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockUseUploadProfilePhoto.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  it("removes the attendance step and keeps Username on the legal step", () => {
    render(<Employees />);

    expect(screen.queryByRole("button", { name: /4\. attendance & leave/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /4\. legal & id/i }));

    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.queryByText("Tax Identifier")).not.toBeInTheDocument();
  });
});
