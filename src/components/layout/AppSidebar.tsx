import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  CreditCard,
  FileText,
  Brain,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleMobileMenu, setMobileMenuOpen } from "@/store/slices/uiSlice";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Attendance", url: "/attendance", icon: Clock },
  { title: "Leaves", url: "/leaves", icon: Calendar },
  { title: "Payroll", url: "/payroll", icon: CreditCard },
  { title: "Payslips", url: "/payslips", icon: FileText },
  { title: "AI Insights", url: "/ai-insights", icon: Brain },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { mobileMenuOpen } = useAppSelector((state) => state.ui);

  const NavItem = ({ item }: { item: (typeof navItems)[0] }) => {
    const isActive = location.pathname === item.url;
    return (
      <RouterNavLink
        to={item.url}
        onClick={() => dispatch(setMobileMenuOpen(false))}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 mx-3 rounded-lg text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-primary-dim text-primary-text border-l-2 border-primary"
            : "text-muted-foreground hover:bg-elevated hover:text-foreground"
        )}
      >
        <item.icon className="h-[18px] w-[18px]" />
        <span>{item.title}</span>
      </RouterNavLink>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">PayrollX</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavItem key={item.url} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-2.5 mx-0 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-elevated hover:text-foreground transition-all duration-150">
          <LogOut className="h-[18px] w-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface border-b border-border h-14 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleMobileMenu())}
          className="text-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="ml-3 text-lg font-bold text-primary">PayrollX</h1>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => dispatch(setMobileMenuOpen(false))}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(setMobileMenuOpen(false))}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-surface border-r border-border flex-col min-h-screen fixed left-0 top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
