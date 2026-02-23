import { Users, UserCheck, CalendarClock, AlertTriangle, Brain, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ChartCard } from "@/components/ChartCard";
import { KPICard } from "@/components/KPICard";
import { useHrDashboard } from "@/hooks";

export default function HrDashboard() {
  const dashboardQuery = useHrDashboard();
  const data = dashboardQuery.data?.data;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
          <p className="text-muted-foreground mt-1">Workforce operations and AI summary.</p>
        </div>

        {dashboardQuery.isLoading && <p className="text-sm text-muted-foreground">Loading dashboard...</p>}
        {dashboardQuery.isError && <p className="text-sm text-danger">Unable to load HR dashboard.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Employees" value={data?.kpis.totalEmployees || 0} icon={Users} />
          <KPICard title="Active Employees" value={data?.kpis.activeEmployees || 0} icon={UserCheck} />
          <KPICard title="Attendance Rate" value={`${data?.kpis.attendanceRate || 0}%`} icon={CalendarClock} />
          <KPICard title="Pending Leaves" value={data?.kpis.pendingLeaves || 0} icon={CalendarClock} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="AI Alerts" subtitle="Organization-wide alerts">
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-danger" />New alerts: {data?.ai.newAlerts || 0}</p>
              <p className="flex items-center gap-2"><Brain className="h-4 w-4 text-warning" />High-risk alerts: {data?.ai.highRiskAlerts || 0}</p>
              <p className="flex items-center gap-2"><Brain className="h-4 w-4 text-info" />Salary anomalies: {data?.ai.salaryAnomalies || 0}</p>
            </div>
          </ChartCard>

          <ChartCard title="Payroll Snapshot" subtitle="Latest payroll run">
            {data?.payroll ? (
              <div className="space-y-2 text-sm">
                <p>Status: <span className="font-medium">{data.payroll.status}</span></p>
                <p>Period: <span className="font-medium">{data.payroll.month}/{data.payroll.year}</span></p>
                <p>Employees: <span className="font-medium">{data.payroll.totalEmployees}</span></p>
                <p>Net Salary: <span className="font-medium">PKR {data.payroll.totalNetSalary.toLocaleString()}</span></p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payroll run found yet.</p>
            )}
          </ChartCard>

          <ChartCard title="Current Month Projection" subtitle="AI payroll estimate">
            <p className="text-2xl font-bold text-primary flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              PKR {(data?.ai.currentMonthNetSalaryProjection || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Based on generated payslips for the current month.</p>
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}
