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
import {
  useAIDashboardStats,
  useAttendance,
  useDailyStats,
  usePayrollForecast,
} from "@/hooks";

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
  const attendanceQuery = useAttendance({ limit: 100, page: 1 });
  const dailyStatsQuery = useDailyStats();
  const aiDashboardQuery = useAIDashboardStats();
  const forecastQuery = usePayrollForecast(6);

  const attendanceRecords = attendanceQuery.data?.data || [];
  const dailyStats = dailyStatsQuery.data?.data;
  const aiStats = aiDashboardQuery.data?.data;
  const forecastRows = forecastQuery.data?.data?.forecasts || [];

  const heatmapData = attendanceRecords.slice(0, 31).map((record) => ({
    date: record.date,
    status: mapHeatmapStatus(record.status),
  }));

  const chartData = forecastRows.map((item) => ({
    month: item.period,
    projected: Number((item.projectedGrossSalary / 1000000).toFixed(2)),
    net: Number((item.projectedNetSalary / 1000000).toFixed(2)),
  }));

  const totalEmployees = dailyStats?.totalEmployees || 0;
  const payrollCost = forecastRows[0]?.projectedGrossSalary || 0;
  const attendanceRate = dailyStats?.attendanceRate || 0;
  const activeAlerts = aiStats?.alerts?.new_alerts || 0;

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
          dailyStatsQuery.isLoading ||
          aiDashboardQuery.isLoading) && (
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
            value={activeAlerts}
            icon={Bell}
            trend={"Live"}
          />
          <KPICard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={BarChart2}
            trend={"Today"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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

          <ChartCard
            title="Attendance Heatmap"
            subtitle="Latest attendance entries"
            className="lg:col-span-2"
          >
            <AttendanceHeatmap data={heatmapData} size="sm" />
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}
