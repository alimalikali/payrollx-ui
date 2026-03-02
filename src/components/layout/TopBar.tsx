import { Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useCurrentUser,
  useLogout,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks";
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

const notificationFilters = { page: 1, limit: 10 } as const;

export function TopBar({ showSearch = true }: TopBarProps) {
  const navigate = useNavigate();
  const userQuery = useCurrentUser();
  const logout = useLogout();
  const user = userQuery.data;
  const isEmployee = user?.role === "employee";
  const notificationsQuery = useNotifications(notificationFilters, !!user && !isEmployee);
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const notifications = notificationsQuery.data?.data || [];
  const totalNotifications = notificationsQuery.data?.meta?.total ?? notifications.length;
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const dashboardPath = isEmployee ? "/employee/dashboard" : "/hr/dashboard";
  const leavesPath = isEmployee ? "/employee/leaves" : "/hr/leaves";
  const profilePath = isEmployee
    ? "/employee/profile"
    : user?.employee?.id
    ? `/hr/employees/${encodeURIComponent(user.employee.id)}`
    : "/hr/employees";
  const settingsPath = isEmployee ? "/settings" : "/hr/settings";

  const getTypeClasses = (type: string) => {
    if (type === "leave_request_submitted") return "bg-warning/15 text-warning";
    if (type === "leave_request_approved") return "bg-success/15 text-success";
    if (type === "leave_request_rejected") return "bg-danger/15 text-danger";
    if (type === "leave_request_cancelled") return "bg-muted text-muted-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
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

      <div className="flex items-center gap-4">
        {!isEmployee && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {totalNotifications > 0 && unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => markAllNotificationsRead.mutate()}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notificationsQuery.isLoading ? (
                <DropdownMenuItem disabled>Loading notifications...</DropdownMenuItem>
              ) : notificationsQuery.isError ? (
                <DropdownMenuItem disabled>Unable to load notifications.</DropdownMenuItem>
              ) : notifications.length === 0 ? (
                <DropdownMenuItem disabled>No notifications.</DropdownMenuItem>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1"
                    onClick={() => {
                      if (!notification.isRead) {
                        markNotificationRead.mutate(notification.id);
                      }
                      navigate(leavesPath);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${getTypeClasses(notification.type)}`}>
                        {notification.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">{notification.message}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(leavesPath)}>
                Open leave management
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
            <DropdownMenuItem onClick={() => navigate(profilePath)}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(settingsPath)}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger"
              onClick={() =>
                logout.mutate(undefined, {
                  onSettled: () => navigate("/login", { replace: true, state: { from: dashboardPath } }),
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
