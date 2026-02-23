import { Clock, Calendar, FileText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ChartCard } from "@/components/ChartCard";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { useEmployeeDashboard } from "@/hooks";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const dashboardQuery = useEmployeeDashboard();
  const data = dashboardQuery.data?.data;

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
