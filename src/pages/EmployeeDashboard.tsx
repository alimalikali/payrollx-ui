import { Calendar, CheckCircle2, Clock, FileText, ReceiptText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ChartCard } from "@/components/ChartCard";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { downloadPayslipPdf, formatPayrollStatusLabel, formatPayslipMonth } from "@/lib/payslip";
import { useCurrentUser, useEmployeeDashboard, useMarkNotificationRead, useNotifications, usePayslips } from "@/hooks";

const notificationFilters = { page: 1, limit: 5 } as const;

const getNotificationVariant = (type: string) => {
  if (type === "salary_credited") return "success" as const;
  if (type === "leave_request_approved") return "info" as const;
  if (type === "company_notice") return "warning" as const;
  return "neutral" as const;
};

const getPayrollStatusVariant = (status?: string | null) => {
  switch (status) {
    case "paid":
      return "success" as const;
    case "approved":
      return "info" as const;
    case "cancelled":
      return "danger" as const;
    case "generated":
    default:
      return "warning" as const;
  }
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUser();
  const dashboardQuery = useEmployeeDashboard();
  const markNotificationRead = useMarkNotificationRead();
  const notificationsQuery = useNotifications(notificationFilters, true);
  const employeeId = currentUserQuery.data?.employee?.id;
  const latestPayslipQuery = usePayslips({ employeeId, page: 1, limit: 1 });
  const data = dashboardQuery.data?.data;
  const notifications = notificationsQuery.data?.data || [];
  const latestDownloadablePayslip = latestPayslipQuery.data?.data?.[0];
  const attendanceStats = data?.monthSummary;
  const leaveBalances = data?.leaveBalances ?? [];
  const availableLeaveTypes = leaveBalances.filter((item) => Number(item.remainingDays) > 0);

  const handleNotificationClick = (notificationId: string, entityType?: string) => {
    markNotificationRead.mutate(notificationId);

    if (entityType === "payslip") {
      navigate("/employee/payslips");
      return;
    }

    if (entityType === "leave_request") {
      navigate("/employee/leaves");
      return;
    }

    navigate("/employee/dashboard");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your attendance, leaves, payslips, and personal insights.</p>
        </div>

        {dashboardQuery.isLoading && <p className="text-sm text-muted-foreground">Loading dashboard...</p>}
        {dashboardQuery.isError && <p className="text-sm text-danger">Unable to load employee dashboard.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Today Status" value={String(data?.today.status || "-").replace("_", " ")} icon={Clock} />
          <KPICard title="Present Days" value={data?.monthSummary.presentDays || 0} icon={Calendar} />
          <KPICard title="Pending Leaves" value={data?.pendingLeaves || 0} icon={Calendar} />
          <KPICard title="Latest Net Salary" value={(data?.latestPayslip?.netSalary || 0).toLocaleString()} prefix="PKR" icon={FileText} />
        </div>

        <ChartCard title="Quick Actions" subtitle="Common tasks you can complete right away">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button variant="outline" className="justify-start" onClick={() => navigate("/employee/leaves")}>
              <Calendar className="h-4 w-4" />
              Apply Leave
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              disabled={!latestDownloadablePayslip}
              onClick={() => latestDownloadablePayslip && downloadPayslipPdf(latestDownloadablePayslip)}
            >
              <ReceiptText className="h-4 w-4" />
              Download Latest Payslip
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate("/employee/attendance")}>
              <CheckCircle2 className="h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Attendance Summary" subtitle="Current month overview">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Present Days</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{attendanceStats?.presentDays || 0}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Absent Days</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{attendanceStats?.absentDays || 0}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Late Days</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{attendanceStats?.lateDays || 0}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Total Hours</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{attendanceStats?.totalHours || 0}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md border border-border p-3 text-sm">
              <span className="text-muted-foreground">Today Status</span>
              <StatusBadge variant={data?.today.status === "present" ? "success" : data?.today.status === "late" ? "warning" : "neutral"}>
                {String(data?.today.status || "-").replace(/_/g, " ")}
              </StatusBadge>
            </div>
          </ChartCard>

          <ChartCard title="Leave Summary" subtitle="Your balances and requests">
            <div className="rounded-md border border-border p-3">
              <p className="text-muted-foreground text-sm">Pending Leaves</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{data?.pendingLeaves || 0}</p>
            </div>
            <div className="mt-4 space-y-2">
              {leaveBalances.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave balances available.</p>
              ) : (
                leaveBalances.map((balance) => (
                  <div key={balance.leaveTypeId} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                    <span className="text-foreground">{balance.leaveTypeName}</span>
                    <span className="font-medium text-foreground">{balance.remainingDays} days</span>
                  </div>
                ))
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Leave types with balance available: {availableLeaveTypes.length}
            </p>
          </ChartCard>

          <ChartCard title="Salary Summary" subtitle="Latest payroll snapshot">
            {!data?.latestPayslip ? (
              <p className="text-sm text-muted-foreground">No salary data available yet.</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium text-foreground">
                    {formatPayslipMonth(data.latestPayslip.month, data.latestPayslip.year)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gross Salary</span>
                  <span className="font-medium text-foreground">PKR {data.latestPayslip.grossSalary.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Deductions</span>
                  <span className="font-medium text-foreground">PKR {data.latestPayslip.totalDeductions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Net Salary</span>
                  <span className="font-semibold text-foreground">PKR {data.latestPayslip.netSalary.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge variant={getPayrollStatusVariant(data.latestPayslip.status)}>
                    {formatPayrollStatusLabel(data.latestPayslip.status)}
                  </StatusBadge>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/employee/payslips")}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Payslips
                </Button>
              </div>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Recent Notifications" subtitle="Salary, leave, and company updates">
          {notificationsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          ) : notificationsQuery.isError ? (
            <p className="text-sm text-danger">Unable to load notifications.</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className="flex w-full items-start justify-between gap-4 rounded-md border border-border p-3 text-left transition-colors hover:bg-muted/40"
                  onClick={() => handleNotificationClick(notification.id, notification.entityType)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={getNotificationVariant(notification.type)}>
                        {notification.type.replace(/_/g, " ")}
                      </StatusBadge>
                      {!notification.isRead && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Today Attendance" subtitle={data?.today.date || ""}>
            <div className="text-sm space-y-2">
              <p>Check in: <span className="font-medium">{data?.today.checkIn || "-"}</span></p>
              <p>Check out: <span className="font-medium">{data?.today.checkOut || "-"}</span></p>
              <p>Working hours: <span className="font-medium">{data?.today.workingHours || 0}</span></p>
            </div>
          </ChartCard>

          <ChartCard title="Personal AI Insights" subtitle="Actionable guidance for you">
            <div className="space-y-3">
              {(data?.aiInsights.insights || []).slice(0, 3).map((insight, idx) => (
                <div key={`${insight.type}-${idx}`} className="rounded-md border border-border p-3">
                  <p className="text-sm font-semibold">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              ))}
              {(data?.aiInsights.insights || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No insights at the moment.</p>
              )}
              <Button size="sm" variant="outline" onClick={() => navigate("/employee/ai-insights")}>
                <Sparkles className="h-4 w-4 mr-2" />
                View All AI Insights
              </Button>
            </div>
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}
