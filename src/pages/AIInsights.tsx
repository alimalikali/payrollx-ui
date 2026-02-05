import { useMemo, useState } from "react";
import { AlertTriangle, TrendingUp, Lightbulb, Play } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { ChartCard } from "@/components/ChartCard";
import {
  useAIAlerts,
  useDetectSalaryAnomalies,
  useEmployees,
  usePayrollForecast,
  useRunFraudDetection,
  useSalaryRecommendation,
  useUpdateAlertStatus,
} from "@/hooks";

export default function AIInsights() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);

  const alertsQuery = useAIAlerts({ page: 1, limit: 50 });
  const forecastQuery = usePayrollForecast(6);
  const employeesQuery = useEmployees({ page: 1, limit: 50 });

  const runFraudDetection = useRunFraudDetection();
  const detectAnomalies = useDetectSalaryAnomalies();
  const updateAlertStatus = useUpdateAlertStatus();

  const employees = employeesQuery.data?.data || [];
  const selectedRecommendation = useSalaryRecommendation(selectedEmployeeId || "");

  const alerts = alertsQuery.data?.data || [];
  const forecasts = forecastQuery.data?.data?.forecasts || [];

  const chartData = forecasts.map((row) => ({
    period: row.period,
    gross: Number((row.projectedGrossSalary / 1000000).toFixed(2)),
    net: Number((row.projectedNetSalary / 1000000).toFixed(2)),
  }));

  const unresolvedAlerts = useMemo(
    () => alerts.filter((alert) => ["new", "acknowledged", "investigating"].includes(alert.status)),
    [alerts]
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
            <p className="text-muted-foreground mt-1">Fraud detection, anomaly analysis, and salary intelligence</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => runFraudDetection.mutate()} disabled={runFraudDetection.isPending}>
              <Play className="h-4 w-4 mr-2" />
              {runFraudDetection.isPending ? "Running..." : "Run Fraud Detection"}
            </Button>
            <Button variant="outline" onClick={() => detectAnomalies.mutate()} disabled={detectAnomalies.isPending}>
              {detectAnomalies.isPending ? "Detecting..." : "Detect Salary Anomalies"}
            </Button>
          </div>
        </div>

        <ChartCard title="Payroll Forecast" subtitle="Projected gross and net payroll (in millions)">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <Tooltip formatter={(value: number) => [`PKR ${value}M`, ""]} />
                <Line type="monotone" dataKey="gross" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="net" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Alerts</h3>
              <p className="text-sm text-muted-foreground">{unresolvedAlerts.length} unresolved alerts</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated hover:bg-elevated">
                  <TableHead>Severity</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} className="hover:bg-elevated transition-colors">
                    <TableCell>
                      <StatusBadge variant={alert.severity === "critical" || alert.severity === "high" ? "danger" : alert.severity === "medium" ? "warning" : "info"}>
                        {alert.severity}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{alert.title}</TableCell>
                    <TableCell className="text-muted-foreground">{alert.employeeName || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge variant={alert.status === "resolved" ? "success" : "warning"}>{alert.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {alert.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAlertStatus.mutate({ id: alert.id, data: { status: "resolved" } })}
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Salary Recommendation" subtitle="Select an employee to fetch recommendation">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {employees.slice(0, 8).map((employee) => (
                  <Button
                    key={employee.id}
                    size="sm"
                    variant={selectedEmployeeId === employee.id ? "default" : "outline"}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                  >
                    {(employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim()) || "Unknown"}
                  </Button>
                ))}
              </div>

              {selectedRecommendation.data?.data ? (
                <div className="text-sm space-y-2">
                  <p className="font-medium">Suggested salary: PKR {selectedRecommendation.data.data.recommendation.optimal.toLocaleString()}</p>
                  <p className="text-muted-foreground">Current salary: PKR {selectedRecommendation.data.data.currentSalary.toLocaleString()}</p>
                  <p className="text-muted-foreground">Confidence: {selectedRecommendation.data.data.confidenceScore}%</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Pick an employee to load recommendation.</p>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Anomaly Snapshot" subtitle="Latest anomaly run output">
            {detectAnomalies.data?.data ? (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-warning" />Total anomalies: {detectAnomalies.data.data.totalAnomalies}</p>
                <p className="text-muted-foreground">Types: {Object.keys(detectAnomalies.data.data.byType).join(", ") || "-"}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2"><Lightbulb className="h-4 w-4" />Run anomaly detection to see results.</p>
            )}
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}
