import { useNavigate } from "react-router-dom";
import {
  User, Clock, CalendarDays, TrendingUp, AlertCircle,
  CheckCircle2, XCircle, Banknote, Calendar, Zap, ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeAIInsights } from "@/hooks";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function statusColor(status: string) {
  switch (status) {
    case "present": return "text-success bg-success/10";
    case "late": return "text-warning bg-warning/10";
    case "absent": return "text-danger bg-danger/10";
    case "on_leave": return "text-primary bg-primary/10";
    default: return "text-muted-foreground bg-muted";
  }
}

function severityBadge(severity: string) {
  switch (severity) {
    case "critical": return "bg-danger/10 text-danger border-danger/20";
    case "high": return "bg-warning/10 text-warning border-warning/20";
    case "medium": return "bg-primary/10 text-primary border-primary/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

function Stat({ label, value, sub, icon: Icon, highlight }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border border-border bg-surface p-4 flex items-start gap-3",
      highlight && "border-primary/30 bg-primary/5"
    )}>
      <div className={cn(
        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
        highlight ? "bg-primary/15 text-primary" : "bg-elevated text-muted-foreground"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function EmployeeAIInsights() {
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useEmployeeAIInsights();
  const data = response?.data;

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError || !data) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <XCircle className="h-10 w-10 text-danger" />
          <p className="text-sm text-muted-foreground">Unable to load AI Insights. Please try again later.</p>
        </div>
      </AppShell>
    );
  }

  const { profile, monthSummary, leaveBalances, pendingLeaves, latestPayslip, aiInsights } = data;
  const today = data.today ?? { date: "", status: "absent", checkIn: null, checkOut: null, workingHours: 0 };
  const presentRate = monthSummary.presentDays + monthSummary.absentDays > 0
    ? Math.round((monthSummary.presentDays / (monthSummary.presentDays + monthSummary.absentDays)) * 100)
    : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My AI Insights</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Personalized analysis based on your attendance, leaves, and payroll data.
            </p>
          </div>
          {profile && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.designation} · {profile.departmentName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Today's Status Banner */}
        <div className={cn(
          "rounded-xl border px-5 py-4 flex items-center justify-between gap-4",
          today.status === "present" ? "border-success/30 bg-success/5" :
          today.status === "late" ? "border-warning/30 bg-warning/5" :
          "border-border bg-surface"
        )}>
          <div className="flex items-center gap-3">
            <Clock className={cn(
              "h-5 w-5",
              today.status === "present" ? "text-success" :
              today.status === "late" ? "text-warning" : "text-muted-foreground"
            )} />
            <div>
              <p className="text-sm font-medium text-foreground">
                Today — {today.date}
              </p>
              <p className="text-xs text-muted-foreground">
                {today.checkIn ? `Checked in at ${today.checkIn}` : "No check-in recorded"}
                {today.checkOut ? ` · Checked out at ${today.checkOut}` : ""}
                {today.workingHours > 0 ? ` · ${today.workingHours.toFixed(1)}h worked` : ""}
              </p>
            </div>
          </div>
          <span className={cn(
            "text-xs font-semibold px-3 py-1 rounded-full capitalize",
            statusColor(today.status)
          )}>
            {today.status.replace("_", " ")}
          </span>
        </div>

        {/* Month Summary Stats */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            This Month's Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Present Days" value={monthSummary.presentDays} icon={CheckCircle2} highlight />
            <Stat label="Absent Days" value={monthSummary.absentDays} icon={XCircle} />
            <Stat label="Late Arrivals" value={monthSummary.lateDays} icon={AlertCircle} />
            <Stat
              label="Working Hours"
              value={`${monthSummary.totalHours.toFixed(0)}h`}
              sub={`${presentRate}% attendance rate`}
              icon={TrendingUp}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Leave Balances */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Leave Balances</h2>
              {pendingLeaves > 0 && (
                <Badge variant="outline" className="text-xs text-warning border-warning/30 bg-warning/10">
                  {pendingLeaves} pending
                </Badge>
              )}
            </div>
            {leaveBalances.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave data available.</p>
            ) : (
              <div className="space-y-3">
                {leaveBalances.map((lb) => {
                  const total = 14; // standard allocation ceiling for display
                  const pct = Math.min(100, Math.round((lb.remainingDays / total) * 100));
                  return (
                    <div key={lb.leaveTypeId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">{lb.leaveTypeName}</span>
                        <span className={cn(
                          "text-xs font-semibold",
                          lb.remainingDays <= 2 ? "text-danger" :
                          lb.remainingDays <= 5 ? "text-warning" : "text-success"
                        )}>
                          {lb.remainingDays} days left
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/employee/leaves")}
            >
              View Leave Details <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {/* Latest Payslip */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Latest Payslip</h2>
              {latestPayslip && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize",
                    latestPayslip.status === "paid"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {latestPayslip.status}
                </Badge>
              )}
            </div>
            {!latestPayslip ? (
              <p className="text-sm text-muted-foreground">No payslips generated yet.</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground -mt-2">
                  {MONTH_NAMES[latestPayslip.month]} {latestPayslip.year}
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Gross Salary", value: latestPayslip.grossSalary, icon: Banknote, positive: true },
                    { label: "Deductions", value: latestPayslip.totalDeductions, icon: TrendingUp, positive: false },
                    { label: "Net Salary", value: latestPayslip.netSalary, icon: CheckCircle2, positive: true },
                  ].map(({ label, value, icon: Icon, positive }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        label === "Net Salary" ? "text-success" :
                        label === "Deductions" ? "text-danger" : "text-foreground"
                      )}>
                        PKR {value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/employee/payslips")}
            >
              View All Payslips <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights.insights.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">AI Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiInsights.insights.map((insight, i) => (
                <div
                  key={`${insight.type}-${i}`}
                  className={cn(
                    "rounded-lg border p-3 space-y-1",
                    severityBadge(insight.severity)
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">{insight.title}</p>
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize",
                      severityBadge(insight.severity)
                    )}>
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {aiInsights.actions.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiInsights.actions.map((action, i) => (
                <Button
                  key={`${action.type}-${i}`}
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(action.path)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
