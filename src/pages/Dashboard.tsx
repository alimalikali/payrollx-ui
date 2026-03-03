import { useEffect, useMemo, useState } from "react";
import { Users, DollarSign, Bell, BarChart2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { AttendanceHeatmap } from "@/components/AttendanceHeatmap";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAIDashboardStats,
  useApproveLeave,
  useAttendance,
  useCancelLeave,
  useCurrentUser,
  useDailyStats,
  useLeaves,
  useMarkNotificationRead,
  useNotifications,
  usePayrollForecast,
  useRejectLeave,
} from "@/hooks";
import { isPrivileged } from "@/lib/permissions";

const mapHeatmapStatus = (
  status: string,
): "present" | "absent" | "late" | "leave" | "weekend" | "holiday" => {
  if (status === "on_leave" || status === "half_day") return "leave";
  if (status === "holiday") return "holiday";
  if (status === "weekend") return "weekend";
  if (status === "absent") return "absent";
  if (status === "late") return "late";
  return "present";
};

export default function Dashboard() {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState("");
  const [rejectNotificationId, setRejectNotificationId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const userQuery = useCurrentUser();
  const isHRUser = isPrivileged(userQuery.data);

  const attendanceQuery = useAttendance({ limit: 100, page: 1 });
  const dailyStatsQuery = useDailyStats(undefined, isHRUser);
  const aiDashboardQuery = useAIDashboardStats(isHRUser);
  const forecastQuery = usePayrollForecast(6, isHRUser);
  const notificationsQuery = useNotifications({ page: 1, limit: 20, unreadOnly: true }, isHRUser);
  const pendingLeavesQuery = useLeaves({ page: 1, limit: 50, status: "pending" });
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const cancelLeave = useCancelLeave();
  const markNotificationRead = useMarkNotificationRead();

  const attendanceRecords = attendanceQuery.data?.data || [];
  const dailyStats = dailyStatsQuery.data?.data;
  const aiStats = aiDashboardQuery.data?.data;
  const forecastRows = forecastQuery.data?.data?.forecasts || [];
  const notifications = notificationsQuery.data?.data || [];
  const pendingLeaves = pendingLeavesQuery.data?.data || [];
  const pendingLeaveMap = useMemo(
    () => new Map(pendingLeaves.map((leave) => [leave.id, leave])),
    [pendingLeaves]
  );
  const actionableNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.type === "leave_request_submitted" &&
          !!notification.entityId &&
          pendingLeaveMap.has(notification.entityId)
      ),
    [notifications, pendingLeaveMap]
  );
  const staleNotificationIds = useMemo(
    () =>
      notifications
        .filter(
          (notification) =>
            notification.type === "leave_request_submitted" &&
            !!notification.entityId &&
            !pendingLeaveMap.has(notification.entityId)
        )
        .map((notification) => notification.id),
    [notifications, pendingLeaveMap]
  );

  const heatmapData = attendanceRecords.slice(0, 31).map((record) => ({
    date: record.date,
    status: mapHeatmapStatus(record.status),
  }));

  const chartData = forecastRows.map((item) => ({
    month: item.period,
    projected: Number((item.projectedGrossSalary / 1000000).toFixed(2)),
    net: Number((item.projectedNetSalary / 1000000).toFixed(2)),
  }));

  const totalEmployees = isHRUser ? dailyStats?.totalEmployees || 0 : 1;
  const payrollCost = forecastRows[0]?.projectedGrossSalary || 0;
  const attendanceRate = isHRUser ? dailyStats?.attendanceRate || 0 : 0;
  const activeAlerts = aiStats?.alerts?.new_alerts || 0;

  const markAsReadIfNeeded = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markNotificationRead.mutate(notificationId);
    }
  };

  useEffect(() => {
    staleNotificationIds.forEach((notificationId) => {
      markNotificationRead.mutate(notificationId);
    });
  }, [markNotificationRead.mutate, staleNotificationIds]);

  const openRejectDialog = (leaveId: string, notificationId: string) => {
    setRejectRequestId(leaveId);
    setRejectNotificationId(notificationId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectRequestId || !rejectReason.trim()) {
      return;
    }

    rejectLeave.mutate(
      { id: rejectRequestId, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          if (rejectNotificationId) {
            markNotificationRead.mutate(rejectNotificationId);
          }
          setRejectDialogOpen(false);
          setRejectRequestId("");
          setRejectNotificationId("");
          setRejectReason("");
        },
      }
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Live overview connected to PayrollX APIs.
          </p>
        </div>

        {(attendanceQuery.isLoading ||
          (isHRUser && dailyStatsQuery.isLoading) ||
          (isHRUser && aiDashboardQuery.isLoading)) && (
          <p className="text-sm text-muted-foreground">
            Loading dashboard data...
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Employees"
            value={totalEmployees}
            icon={Users}
          />
          <KPICard
            title="Payroll Cost"
            value={payrollCost.toLocaleString()}
            prefix="PKR"
            icon={DollarSign}
          />
          <KPICard
            title="Active Alerts"
            value={isHRUser ? activeAlerts : "-"}
            icon={Bell}
            trend={isHRUser ? "Live" : undefined}
          />
          <KPICard
            title="Attendance Rate"
            value={isHRUser ? `${attendanceRate}%` : "-"}
            icon={BarChart2}
            trend={isHRUser ? "Today" : undefined}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {isHRUser && (
            <ChartCard
              title="Payroll Forecast"
              subtitle="Projected gross and net payroll"
              className="lg:col-span-3"
            >
              <div className="h-[300px] lg:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `${value}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`PKR ${value}M`, ""]}
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      name="Gross"
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Net"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          <ChartCard
            title="Attendance Heatmap"
            subtitle="Latest attendance entries"
            className={isHRUser ? "lg:col-span-2" : "lg:col-span-5"}
          >
            <AttendanceHeatmap data={heatmapData} size="sm" />
          </ChartCard>
        </div>

        {isHRUser && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Recent Notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Leave requests and approval activity from employees.
              </p>
            </div>

            <div className="divide-y divide-border">
              {notificationsQuery.isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading notifications...</div>
              ) : notificationsQuery.isError ? (
                <div className="p-4 text-sm text-danger">Unable to load notifications.</div>
              ) : actionableNotifications.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No pending leave request notifications.</div>
              ) : (
                actionableNotifications.map((notification) => (
                  <div key={notification.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() =>
                          approveLeave.mutate(notification.entityId!, {
                            onSuccess: () => markAsReadIfNeeded(notification.id, notification.isRead),
                          })
                        }
                        disabled={approveLeave.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRejectDialog(notification.entityId!, notification.id)}
                        disabled={rejectLeave.isPending}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          cancelLeave.mutate(notification.entityId!, {
                            onSuccess: () => markAsReadIfNeeded(notification.id, notification.isRead),
                          })
                        }
                        disabled={cancelLeave.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Provide reason for rejection..."
              />
            </div>
            <Button className="w-full" onClick={handleRejectSubmit} disabled={rejectLeave.isPending || !rejectReason.trim()}>
              {rejectLeave.isPending ? "Submitting..." : "Reject Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
