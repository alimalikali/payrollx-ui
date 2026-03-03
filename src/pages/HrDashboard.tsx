import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  PieChart as PieChartIcon,
  PlayCircle,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { ChartCard } from "@/components/ChartCard";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
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
  useApproveLeave,
  useApprovePayroll,
  useCreatePayrollRun,
  useHrDashboard,
  useProcessPayroll,
  useRejectLeave,
} from "@/hooks";

const LEAVE_CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const formatCurrency = (value: number) => `PKR ${value.toLocaleString()}`;

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const humanizeStatus = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getPayrollStatusVariant = (status?: string) => {
  if (status === "paid" || status === "approved") return "success";
  if (status === "completed") return "info";
  if (status === "processing") return "warning";
  if (status === "cancelled") return "danger";
  return "neutral";
};

const getPayrollAction = (status?: string | null) => {
  if (status === "completed") {
    return { label: "Approve Payroll", disabled: false };
  }
  if (status === "processing") {
    return { label: "Payroll Processing", disabled: true };
  }
  if (status === "approved" || status === "paid") {
    return { label: "Payroll Finalized", disabled: true };
  }
  return { label: "Process Payroll", disabled: false };
};

export default function HrDashboard() {
  const navigate = useNavigate();
  const dashboardQuery = useHrDashboard();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const createPayrollRun = useCreatePayrollRun();
  const processPayroll = useProcessPayroll();
  const approvePayroll = useApprovePayroll();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const data = dashboardQuery.data?.data;
  const currentMonthPayroll = data?.payrollSummary.currentMonthPayroll;
  const payrollAction = getPayrollAction(currentMonthPayroll?.status);
  const payrollActionPending =
    createPayrollRun.isPending ||
    processPayroll.isPending ||
    approvePayroll.isPending;

  const attendanceTrend = data?.attendanceSummary.monthlyTrend ?? [];
  const leaveDistribution = data?.leaveSummary.distribution ?? [];
  const pendingLeaveRequests = data?.pendingLeaveRequests ?? [];
  const contractExpiryAlerts = data?.workforceAlerts.contractExpiryAlerts ?? [];

  const openRejectDialog = (leaveId: string) => {
    setRejectRequestId(leaveId);
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
          setRejectDialogOpen(false);
          setRejectRequestId("");
          setRejectReason("");
          dashboardQuery.refetch();
        },
      }
    );
  };

  const handlePayrollAction = async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (currentMonthPayroll?.status === "completed") {
      await approvePayroll.mutateAsync(currentMonthPayroll.id);
      await dashboardQuery.refetch();
      return;
    }

    if (currentMonthPayroll?.status === "draft") {
      await processPayroll.mutateAsync(currentMonthPayroll.id);
      await dashboardQuery.refetch();
      return;
    }

    if (currentMonthPayroll?.status === "approved" || currentMonthPayroll?.status === "paid" || currentMonthPayroll?.status === "processing") {
      return;
    }

    const createdRun = await createPayrollRun.mutateAsync({
      month: currentMonth,
      year: currentYear,
    });
    await processPayroll.mutateAsync(createdRun.data.id);
    await dashboardQuery.refetch();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Workforce operations, payroll control, and leave approvals in one view.
          </p>
        </div>

        {dashboardQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        )}
        {dashboardQuery.isError && (
          <p className="text-sm text-danger">Unable to load HR dashboard.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <KPICard title="Total Employees" value={data?.kpis.totalEmployees || 0} icon={Users} />
          <KPICard title="Present Today" value={data?.kpis.presentToday || 0} icon={UserCheck} />
          <KPICard title="Absent Today" value={data?.kpis.absentToday || 0} icon={UserMinus} />
          <KPICard title="Pending Leave Requests" value={data?.leaveSummary.pendingRequests || 0} icon={Clock3} />
          <KPICard
            title="This Month Total Payroll Cost"
            value={(data?.payrollSummary.currentMonthTotalPayrollCost || 0).toLocaleString()}
            prefix="PKR"
            icon={DollarSign}
          />
          <KPICard title="Pending Salary Processing" value={data?.payrollSummary.pendingSalaryProcessing || 0} icon={AlertTriangle} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-8">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Today Attendance Summary" subtitle="Daily attendance snapshot">
                <div className="grid grid-cols-2 gap-3">
                  <SummaryMetric label="Present Today" value={data?.attendanceSummary.today.present || 0} />
                  <SummaryMetric label="Absent Today" value={data?.attendanceSummary.today.absent || 0} />
                  <SummaryMetric label="Late Today" value={data?.attendanceSummary.today.late || 0} />
                  <SummaryMetric label="Late Arrivals Count" value={data?.attendanceSummary.lateArrivalsCount || 0} helper="This month" />
                </div>
              </ChartCard>

              <ChartCard title="Department-wise Attendance" subtitle="Today by department">
                <div className="space-y-3">
                  {(data?.attendanceSummary.departmentWise || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No department attendance data available.</p>
                  ) : (
                    data?.attendanceSummary.departmentWise.map((department) => (
                      <div key={department.departmentId} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{department.departmentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {department.present} present, {department.absent} absent, {department.late} late
                          </p>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          <MiniStat label="Present" value={department.present} />
                          <MiniStat label="Absent" value={department.absent} />
                          <MiniStat label="Late" value={department.late} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ChartCard>
            </div>

            <ChartCard title="Monthly Attendance Chart" subtitle="Current month attendance trend">
              {attendanceTrend.length === 0 ? (
                <p className="text-sm text-muted-foreground">No monthly attendance trend available yet.</p>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="label"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={formatDateLabel}
                        tickLine={false}
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(label) => formatDateLabel(String(label))}
                      />
                      <Bar dataKey="present" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="late" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard
                title="Payroll Summary"
                subtitle="Current month salary totals"
                action={
                  <Button
                    size="sm"
                    onClick={handlePayrollAction}
                    disabled={payrollActionPending || payrollAction.disabled}
                  >
                    <PlayCircle className="h-4 w-4" />
                    {payrollActionPending ? "Working..." : payrollAction.label}
                  </Button>
                }
              >
                <div className="grid grid-cols-2 gap-3">
                  <SummaryMetric
                    label="Total Salary for Current Month"
                    value={formatCurrency(data?.payrollSummary.totalSalaryCurrentMonth || 0)}
                  />
                  <SummaryMetric
                    label="Total Deductions"
                    value={formatCurrency(data?.payrollSummary.totalDeductions || 0)}
                  />
                  <SummaryMetric
                    label="Total Bonuses"
                    value={formatCurrency(data?.payrollSummary.totalBonuses || 0)}
                  />
                  <SummaryMetric
                    label="Tax Summary"
                    value={formatCurrency(data?.payrollSummary.taxSummary || 0)}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-muted-foreground">Current payroll run:</span>
                  <StatusBadge variant={getPayrollStatusVariant(currentMonthPayroll?.status)}>
                    {currentMonthPayroll ? humanizeStatus(currentMonthPayroll.status) : "Not created"}
                  </StatusBadge>
                </div>
              </ChartCard>

              <ChartCard title="Leave Type Distribution" subtitle="Approved leaves this month">
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <SummaryMetric label="Pending Leave Requests" value={data?.leaveSummary.pendingRequests || 0} />
                  <SummaryMetric label="Approved Leaves (This Month)" value={data?.leaveSummary.approvedThisMonth || 0} />
                </div>
                {leaveDistribution.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approved leave activity this month.</p>
                ) : (
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leaveDistribution}
                          dataKey="count"
                          nameKey="leaveTypeName"
                          innerRadius={52}
                          outerRadius={84}
                          paddingAngle={3}
                        >
                          {leaveDistribution.map((item, index) => (
                            <Cell
                              key={item.leaveTypeId}
                              fill={LEAVE_CHART_COLORS[index % LEAVE_CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  {leaveDistribution.map((item, index) => (
                    <div key={item.leaveTypeId} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: LEAVE_CHART_COLORS[index % LEAVE_CHART_COLORS.length] }}
                        />
                        <span className="text-foreground">{item.leaveTypeName}</span>
                      </div>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>

          <div className="xl:col-span-4">
            <ChartCard title="Pending Leave Requests" subtitle="Approve or reject directly from the dashboard" className="h-full">
              <div className="space-y-3">
                {pendingLeaveRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending leave requests.</p>
                ) : (
                  pendingLeaveRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{request.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{request.leaveTypeName}</p>
                        </div>
                        <StatusBadge variant="warning">{humanizeStatus(request.status)}</StatusBadge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {formatDateLabel(request.startDate)} to {formatDateLabel(request.endDate)} • {request.totalDays} day(s)
                      </p>
                      <p className="mt-2 text-sm text-foreground">{request.reason}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            approveLeave.mutate(request.id, {
                              onSuccess: () => dashboardQuery.refetch(),
                            })
                          }
                          disabled={approveLeave.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectDialog(request.id)}
                          disabled={rejectLeave.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Workforce Alerts" subtitle="Headcount and contract watchlist">
            <div className="grid grid-cols-2 gap-3">
              <SummaryMetric label="New Employees (This Month)" value={data?.workforceAlerts.newEmployeesThisMonth || 0} />
              <SummaryMetric label="Employees on Probation" value={data?.workforceAlerts.employeesOnProbation || 0} />
              <SummaryMetric label="Recently Resigned Employees" value={data?.workforceAlerts.recentlyResignedEmployees || 0} />
              <SummaryMetric label="Contract Expiry Alerts" value={contractExpiryAlerts.length} />
            </div>
            <div className="mt-4 space-y-3">
              {contractExpiryAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contract expiry alerts in the next 30 days.</p>
              ) : (
                contractExpiryAlerts.map((alert) => (
                  <div key={alert.employeeId} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{alert.employeeName}</p>
                      <p className="text-xs text-muted-foreground">Contract ends {formatDateLabel(alert.endDate)}</p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                ))
              )}
            </div>
          </ChartCard>

          <ChartCard title="Quick Actions" subtitle="Common HR operations">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <QuickActionButton onClick={() => navigate("/hr/employees")} icon={<Users className="h-4 w-4" />}>
                Manage Employees
              </QuickActionButton>
              <QuickActionButton onClick={() => navigate("/hr/attendance")} icon={<TrendingUp className="h-4 w-4" />}>
                Review Attendance
              </QuickActionButton>
              <QuickActionButton onClick={() => navigate("/hr/leaves")} icon={<CheckCircle2 className="h-4 w-4" />}>
                Open Leaves
              </QuickActionButton>
              <QuickActionButton onClick={() => navigate("/hr/payroll")} icon={<FileText className="h-4 w-4" />}>
                Open Payroll
              </QuickActionButton>
              <QuickActionButton onClick={() => navigate("/hr/payslips")} icon={<DollarSign className="h-4 w-4" />}>
                Review Payslips
              </QuickActionButton>
              <QuickActionButton onClick={() => navigate("/hr/ai-insights")} icon={<PieChartIcon className="h-4 w-4" />}>
                AI Insights
              </QuickActionButton>
            </div>
          </ChartCard>
        </div>
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
            <Button
              className="w-full"
              onClick={handleRejectSubmit}
              disabled={rejectLeave.isPending || !rejectReason.trim()}
            >
              {rejectLeave.isPending ? "Submitting..." : "Reject Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function SummaryMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/40 px-2 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function QuickActionButton({
  children,
  icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <Button variant="outline" className="justify-start" {...props}>
      {icon}
      {children}
    </Button>
  );
}
