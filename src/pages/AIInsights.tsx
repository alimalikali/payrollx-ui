import { AlertTriangle, TrendingUp, Lightbulb, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveTab, markAlertReviewed, markAnomalyReviewed } from "@/store/slices/aiInsightsSlice";
import { cn } from "@/lib/utils";

export default function AIInsights() {
  const dispatch = useAppDispatch();
  const { fraudAlerts, salaryAnomalies, recommendations, forecast, activeTab } =
    useAppSelector((state) => state.aiInsights);

  const tabs = [
    { id: "all" as const, label: "All Insights" },
    { id: "fraud" as const, label: "Fraud Alerts" },
    { id: "anomalies" as const, label: "Salary Anomalies" },
    { id: "recommendations" as const, label: "Recommendations" },
  ];

  const severityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "neutral";
    }
  };

  // Transform forecast data for chart
  const chartData = forecast.map((item) => ({
    month: item.month.split(" ")[0],
    actual: item.actual ? item.actual / 1000000 : null,
    forecast: item.forecast ? item.forecast / 1000000 : null,
  }));

  const showFraud = activeTab === "all" || activeTab === "fraud";
  const showAnomalies = activeTab === "all" || activeTab === "anomalies";
  const showRecommendations = activeTab === "all" || activeTab === "recommendations";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered fraud detection, anomaly analysis, and recommendations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border-hover"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Fraud Alerts */}
        {showFraud && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Fraud Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  {fraudAlerts.filter((a) => !a.reviewed).length} unreviewed alerts
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-elevated hover:bg-elevated">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Severity
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Alert
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Employee
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Time
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fraudAlerts.map((alert) => (
                    <TableRow
                      key={alert.id}
                      className={cn(
                        "hover:bg-elevated transition-colors",
                        alert.reviewed && "opacity-60"
                      )}
                    >
                      <TableCell>
                        <StatusBadge variant={severityVariant(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {alert.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {alert.employeeName}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {alert.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {alert.timestamp}
                      </TableCell>
                      <TableCell>
                        {alert.reviewed ? (
                          <span className="flex items-center gap-1 text-success-foreground text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Reviewed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dispatch(markAlertReviewed(alert.id))}
                          >
                            Mark Reviewed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Salary Anomalies */}
        {showAnomalies && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-warning" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Salary Anomalies</h3>
                <p className="text-sm text-muted-foreground">
                  {salaryAnomalies.filter((a) => !a.reviewed).length} unreviewed anomalies
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-elevated hover:bg-elevated">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Severity
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Issue
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Employee
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryAnomalies.map((anomaly) => (
                    <TableRow
                      key={anomaly.id}
                      className={cn(
                        "hover:bg-elevated transition-colors",
                        anomaly.reviewed && "opacity-60"
                      )}
                    >
                      <TableCell>
                        <StatusBadge variant={severityVariant(anomaly.severity)}>
                          {anomaly.severity.toUpperCase()}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {anomaly.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {anomaly.employeeName}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {anomaly.description}
                      </TableCell>
                      <TableCell>
                        {anomaly.reviewed ? (
                          <span className="flex items-center gap-1 text-success-foreground text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Reviewed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dispatch(markAnomalyReviewed(anomaly.id))}
                          >
                            Mark Reviewed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Payroll Forecast Chart */}
        {(activeTab === "all" || activeTab === "recommendations") && (
          <ChartCard
            title="Payroll Forecast"
            subtitle="Historical data + 3-month prediction"
            action={
              <StatusBadge variant="success">High Confidence</StatusBadge>
            }
          >
            <div className="h-[300px]">
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
                  <Legend />
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
          </ChartCard>
        )}

        {/* Salary Recommendations */}
        {showRecommendations && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="h-5 w-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">
                Salary Recommendations
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-card border border-border rounded-lg p-5 hover:border-border-hover transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">{rec.employeeName}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Score:</span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          rec.score >= 85
                            ? "text-success-foreground"
                            : rec.score >= 70
                            ? "text-warning-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {rec.score}/100
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge variant="primary">{rec.recommendation}</StatusBadge>
                    </div>
                    <p className="text-sm text-foreground">
                      Suggested: <span className="font-medium">{rec.suggestedRange} raise</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {rec.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
