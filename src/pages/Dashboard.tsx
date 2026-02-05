import { Users, DollarSign, Bell, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { AttendanceHeatmap } from "@/components/AttendanceHeatmap";
import { useAppSelector } from "@/store/hooks";
import { dashboardKPIs, payrollForecast } from "@/data/mockData";

export default function Dashboard() {
  const { records } = useAppSelector((state) => state.attendance);

  // Get unique dates for heatmap (just use first employee for dashboard overview)
  const heatmapData = records
    .filter((r) => r.employeeId === "1")
    .map((r) => ({
      date: r.date,
      status: r.status,
    }));

  // Transform forecast data for chart
  const chartData = payrollForecast.map((item) => ({
    month: item.month,
    actual: item.actual ? item.actual / 1000000 : null,
    forecast: item.forecast ? item.forecast / 1000000 : null,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your payroll system.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Employees"
            value={dashboardKPIs.totalEmployees.value}
            trend={dashboardKPIs.totalEmployees.trend}
            trendUp={dashboardKPIs.totalEmployees.trendUp}
            icon={Users}
          />
          <KPICard
            title="Payroll Cost"
            value={dashboardKPIs.payrollCost.value}
            trend={dashboardKPIs.payrollCost.trend}
            trendUp={dashboardKPIs.payrollCost.trendUp}
            icon={DollarSign}
            prefix="PKR"
          />
          <KPICard
            title="Active Alerts"
            value={dashboardKPIs.activeAlerts.value}
            trend={dashboardKPIs.activeAlerts.trend}
            trendUp={false}
            icon={Bell}
          />
          <KPICard
            title="Attendance Rate"
            value={dashboardKPIs.attendanceRate.value}
            trend={dashboardKPIs.attendanceRate.trend}
            trendUp={false}
            icon={BarChart2}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Payroll Trend Chart */}
          <ChartCard
            title="Payroll Trend"
            subtitle="Last 6 months + 3 month forecast"
            className="lg:col-span-3"
          >
            <div className="h-[300px] lg:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`PKR ${value}M`, ""]}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2 }}
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
                    name="Forecast"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-chart-1" />
                <span className="text-sm text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-chart-2 border-dashed" style={{ borderTopWidth: 2, borderStyle: 'dashed' }} />
                <span className="text-sm text-muted-foreground">Forecast</span>
              </div>
            </div>
          </ChartCard>

          {/* Attendance Heatmap */}
          <ChartCard
            title="This Month's Attendance"
            subtitle="Overview of daily attendance"
            className="lg:col-span-2"
          >
            <AttendanceHeatmap data={heatmapData} size="sm" />
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}
