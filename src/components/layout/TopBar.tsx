import { Search, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks";
import { useAIAlerts } from "@/hooks/useAI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  showSearch?: boolean;
}

const alertFilters = { page: 1, limit: 5, status: "new" } as const;

export function TopBar({ showSearch = true }: TopBarProps) {
  const navigate = useNavigate();
  const userQuery = useCurrentUser();
  const logout = useLogout();
  const user = userQuery.data;
  const alertsQuery = useAIAlerts(alertFilters);
  const alerts = alertsQuery.data?.data || [];
  const totalAlerts = alertsQuery.data?.meta?.total ?? alerts.length;

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-danger/15 text-danger";
      case "high":
        return "bg-warning/15 text-warning";
      case "medium":
        return "bg-info/15 text-info";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
      {/* Search */}
      {showSearch ? (
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-background border-border"
          />
        </div>
      ) : (
        <div />
      )}

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {totalAlerts > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center">
                  {totalAlerts > 9 ? "9+" : totalAlerts}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alertsQuery.isLoading ? (
              <DropdownMenuItem disabled>Loading notifications...</DropdownMenuItem>
            ) : alertsQuery.isError ? (
              <DropdownMenuItem disabled>Unable to load notifications.</DropdownMenuItem>
            ) : alerts.length === 0 ? (
              <DropdownMenuItem disabled>No new notifications.</DropdownMenuItem>
            ) : (
              alerts.map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className="flex flex-col items-start gap-1"
                  onClick={() => navigate("/ai-insights")}
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${getSeverityClasses(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{alert.title}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">{alert.description}</span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/ai-insights")}>
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <div className="h-8 w-8 rounded-full bg-primary-dim flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.employee?.firstName || user?.email?.split("@")[0] || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/employees")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger"
              onClick={() =>
                logout.mutate(undefined, {
                  onSettled: () => navigate("/login", { replace: true }),
                })
              }
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
