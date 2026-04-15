import { useMemo, useState } from "react";
import {
  ShieldAlert,
  Search,
  Users,
  CheckCircle,
  Play,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertDetailModal } from "@/components/AlertDetailModal";
import {
  useAIAlerts,
  useRunFraudDetection,
  useUpdateAlertStatus,
  useFraudStats,
  useEmployeeRiskScores,
  type AIAlert,
} from "@/hooks";

// ── helpers ────────────────────────────────────────────────────────────────

function severityVariant(s: string) {
  if (s === "critical" || s === "high") return "danger" as const;
  if (s === "medium") return "warning" as const;
  return "info" as const;
}

function statusVariant(s: string) {
  if (s === "resolved") return "success" as const;
  if (s === "dismissed") return "neutral" as const;
  if (s === "investigating") return "primary" as const;
  if (s === "acknowledged") return "info" as const;
  return "warning" as const;
}

function riskTierVariant(tier: string) {
  if (tier === "critical") return "danger" as const;
  if (tier === "high") return "warning" as const;
  if (tier === "medium") return "info" as const;
  return "success" as const;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ALGORITHM_COVERAGE = [
  { name: "Duplicate Bank Account", category: "Identity", threshold: "Shared account number", severity: "Critical" },
  { name: "Salary Spike", category: "Compensation", threshold: ">50% increase", severity: "High" },
  { name: "Ghost Employee", category: "Attendance", threshold: "0 attendance >60 days", severity: "Critical" },
  { name: "Excessive Overtime", category: "Time & Labor", threshold: ">80 hrs/month", severity: "Medium" },
  { name: "Duplicate Payment", category: "Payroll", threshold: "2+ payslips same month", severity: "Critical" },
  { name: "Round-Trip Salary", category: "Compensation", threshold: "+15% then reverted", severity: "High" },
  { name: "Payroll on Full-Leave Month", category: "Leave", threshold: "Salary paid on full-leave month", severity: "High" },
  { name: "Suspicious Hire + Payroll", category: "Onboarding", threshold: "Hired ≤14 days + payslip", severity: "Critical" },
  { name: "Sick Leave Abuse", category: "Leave", threshold: "Z-score > 3.0 vs dept", severity: "Medium" },
  { name: "Overtime on Absent Days", category: "Time & Labor", threshold: "OT hours on absent/half-day", severity: "Medium" },
];

const PIE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f59e0b", "#6366f1",
];

// ── component ──────────────────────────────────────────────────────────────

export default function FraudDetection() {
  const [selectedAlert, setSelectedAlert] = useState<AIAlert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter state
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");

  // Pagination
  const [alertPage, setAlertPage] = useState(1);
  const PAGE_SIZE = 20;

  // Data fetching
  const alertsQuery = useAIAlerts({ limit: 200 });
  const fraudStatsQuery = useFraudStats();
  const riskQuery = useEmployeeRiskScores();
  const runFraudDetection = useRunFraudDetection();
  const updateAlertStatus = useUpdateAlertStatus();

  const allAlerts: AIAlert[] = alertsQuery.data?.data ?? [];
  const fraudStats = fraudStatsQuery.data?.data;
  const riskData = riskQuery.data?.data;

  // ── derived data ──────────────────────────────────────────────────────────

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(a => {
      if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterType !== "all" && a.alertType !== filterType) return false;
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        if (
          !a.title.toLowerCase().includes(q) &&
          !(a.employeeName || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [allAlerts, filterSeverity, filterStatus, filterType, filterSearch]);

  const paginatedAlerts = useMemo(() => {
    const start = (alertPage - 1) * PAGE_SIZE;
    return filteredAlerts.slice(start, start + PAGE_SIZE);
  }, [filteredAlerts, alertPage]);

  const totalAlertPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));

  // Pie chart data: group by title prefix (algorithm name)
  const pieData = useMemo(() => {
    const fraudAlerts = allAlerts.filter(a => a.alertType === "fraud_detection");
    const map = new Map<string, number>();
    for (const a of fraudAlerts) {
      map.set(a.title, (map.get(a.title) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allAlerts]);

  // Risk tier counts for the distribution bars
  const tierCounts = useMemo(() => {
    if (!riskData?.scores) return { critical: 0, high: 0, medium: 0, low: 0 };
    const c = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const s of riskData.scores) c[s.riskTier]++;
    return c;
  }, [riskData]);

  const totalRisk = tierCounts.critical + tierCounts.high + tierCounts.medium + tierCounts.low;

  // KPI data
  const criticalCount = allAlerts.filter(
    a => a.severity === "critical" && ["new", "acknowledged", "investigating"].includes(a.status)
  ).length;
  const investigatingCount = allAlerts.filter(a => a.status === "investigating").length;
  const atRiskCount = riskData?.summary.totalAtRisk ?? 0;
  const resolvedCount = Number(fraudStats?.resolved ?? 0);

  // Active investigations for investigations tab
  const inFlightAlerts = useMemo(
    () => allAlerts.filter(a => ["new", "acknowledged", "investigating"].includes(a.status)),
    [allAlerts]
  );
  const recentlyClosed = useMemo(
    () =>
      allAlerts.filter(a => {
        if (!["resolved", "dismissed"].includes(a.status)) return false;
        if (!a.resolvedAt) return false;
        const age = Date.now() - new Date(a.resolvedAt).getTime();
        return age < 7 * 24 * 3600 * 1000;
      }),
    [allAlerts]
  );

  const openModal = (alert: AIAlert) => {
    setSelectedAlert(alert);
    setModalOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-7 w-7 text-danger" />
              Fraud Detection Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time payroll fraud monitoring · 10 detection algorithms active
            </p>
          </div>
          <Button
            onClick={() => runFraudDetection.mutate()}
            disabled={runFraudDetection.isPending}
            className="shrink-0"
          >
            <Play className="h-4 w-4 mr-2" />
            {runFraudDetection.isPending ? "Running scan..." : "Run Fraud Detection"}
          </Button>
        </div>

        {/* ── KPI Strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Critical Alerts"
            value={criticalCount}
            icon={ShieldAlert}
          />
          <KPICard
            title="Active Investigations"
            value={investigatingCount}
            icon={Search}
          />
          <KPICard
            title="Employees at Risk"
            value={atRiskCount}
            icon={Users}
          />
          <KPICard
            title="Resolved (30 days)"
            value={resolvedCount}
            icon={CheckCircle}
          />
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts {filteredAlerts.length > 0 && `(${filteredAlerts.length})`}
            </TabsTrigger>
            <TabsTrigger value="risk">Employee Risk</TabsTrigger>
            <TabsTrigger value="investigations">Investigations</TabsTrigger>
          </TabsList>

          {/* ════════════ TAB: OVERVIEW ════════════ */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pie chart */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Alerts by Fraud Type
                </h3>
                {pieData.length > 0 ? (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number, name: string) => [v, name]}
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        />
                        <Legend
                          formatter={v => (
                            <span className="text-xs text-muted-foreground">{v}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[260px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ShieldCheck className="h-10 w-10 text-success-foreground opacity-50" />
                    <p className="text-sm">No fraud alerts detected yet.</p>
                    <p className="text-xs">Run a scan to populate this chart.</p>
                  </div>
                )}
              </div>

              {/* Risk tier distribution */}
              <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Employee Risk Tier Distribution
                </h3>
                {[
                  { tier: "Critical", count: tierCounts.critical, color: "bg-danger" },
                  { tier: "High", count: tierCounts.high, color: "bg-warning" },
                  { tier: "Medium", count: tierCounts.medium, color: "bg-info" },
                  { tier: "Low", count: tierCounts.low, color: "bg-success" },
                ].map(({ tier, count, color }) => (
                  <div key={tier} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{tier} Risk</span>
                      <span className="font-medium text-foreground">{count} employees</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: totalRisk > 0 ? `${(count / totalRisk) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
                {totalRisk === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Run a fraud scan to see risk distribution.
                  </p>
                )}
              </div>
            </div>

            {/* Algorithm coverage table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Detection Algorithm Coverage
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All 10 algorithms running on every scan
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-elevated hover:bg-elevated">
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Threshold / Logic</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ALGORITHM_COVERAGE.map((algo, idx) => (
                      <TableRow key={algo.name} className="hover:bg-elevated transition-colors">
                        <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                        <TableCell className="font-medium text-foreground text-sm">{algo.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{algo.category}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{algo.threshold}</TableCell>
                        <TableCell>
                          <StatusBadge
                            variant={
                              algo.severity === "Critical"
                                ? "danger"
                                : algo.severity === "High"
                                ? "warning"
                                : "info"
                            }
                          >
                            {algo.severity}
                          </StatusBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ════════════ TAB: ALERTS ════════════ */}
          <TabsContent value="alerts" className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search employee or alert..."
                value={filterSearch}
                onChange={e => { setFilterSearch(e.target.value); setAlertPage(1); }}
                className="w-48 h-9 text-sm"
              />
              <Select value={filterSeverity} onValueChange={v => { setFilterSeverity(v); setAlertPage(1); }}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setAlertPage(1); }}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={v => { setFilterType(v); setAlertPage(1); }}>
                <SelectTrigger className="w-44 h-9 text-sm">
                  <SelectValue placeholder="Alert Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fraud_detection">Fraud Detection</SelectItem>
                  <SelectItem value="salary_anomaly">Salary Anomaly</SelectItem>
                  <SelectItem value="attendance_anomaly">Attendance</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {filteredAlerts.length} results
              </span>
            </div>

            {/* Alerts table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-elevated hover:bg-elevated">
                      <TableHead className="w-24">Severity</TableHead>
                      <TableHead>Alert</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead className="w-24">Confidence</TableHead>
                      <TableHead className="w-24">Detected</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                      <TableHead className="text-right w-40">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAlerts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                          No alerts match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                    {paginatedAlerts.map(alert => (
                      <TableRow
                        key={alert.id}
                        className="hover:bg-elevated transition-colors cursor-pointer"
                        onClick={() => openModal(alert)}
                      >
                        <TableCell>
                          <StatusBadge variant={severityVariant(alert.severity)}>
                            {alert.severity}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground text-sm">
                          {alert.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {alert.employeeName || <span className="italic">N/A</span>}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {alert.confidenceScore}%
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {relativeTime(alert.createdAt)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge variant={statusVariant(alert.status)}>
                            {alert.status}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex justify-end gap-1"
                            onClick={e => e.stopPropagation()}
                          >
                            {alert.status === "new" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 px-2"
                                disabled={updateAlertStatus.isPending}
                                onClick={() =>
                                  updateAlertStatus.mutate({
                                    id: alert.id,
                                    data: { status: "acknowledged" },
                                  })
                                }
                              >
                                Acknowledge
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                              onClick={() => openModal(alert)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalAlertPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
                  <span>
                    Page {alertPage} of {totalAlertPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={alertPage === 1}
                      onClick={() => setAlertPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={alertPage === totalAlertPages}
                      onClick={() => setAlertPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ════════════ TAB: EMPLOYEE RISK ════════════ */}
          <TabsContent value="risk" className="space-y-4">
            {riskData?.scores && riskData.scores.length > 0 ? (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Employee Risk Leaderboard
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Composite score from all active fraud alerts · weighted by severity and recency
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Avg score: <span className="font-medium text-foreground">{riskData.summary.avgRiskScore}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-elevated hover:bg-elevated">
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead className="w-48">Risk Score</TableHead>
                        <TableHead className="w-24">Tier</TableHead>
                        <TableHead className="w-24">Alerts</TableHead>
                        <TableHead className="w-20 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskData.scores.map((emp, idx) => (
                        <TableRow key={emp.employeeId} className="hover:bg-elevated transition-colors">
                          <TableCell className="text-muted-foreground font-medium">
                            #{idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground text-sm">
                              {emp.employeeName}
                            </div>
                            <div className="text-xs text-muted-foreground">{emp.employeeCode}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {emp.departmentName}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {emp.designation}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    emp.riskTier === "critical"
                                      ? "bg-danger"
                                      : emp.riskTier === "high"
                                      ? "bg-warning"
                                      : emp.riskTier === "medium"
                                      ? "bg-info"
                                      : "bg-success"
                                  }`}
                                  style={{ width: `${emp.riskScore}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-foreground w-8 text-right">
                                {emp.riskScore}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge variant={riskTierVariant(emp.riskTier)}>
                              {emp.riskTier}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-danger-foreground font-medium">
                                {emp.criticalCount}
                              </span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-warning-foreground font-medium">
                                {emp.highCount}
                              </span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-info-foreground font-medium">
                                {emp.mediumCount}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                              onClick={() => {
                                const firstAlert = allAlerts.find(
                                  a => a.employeeId === emp.employeeId
                                );
                                if (firstAlert) openModal(firstAlert);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-16 flex flex-col items-center gap-3 text-center">
                <ShieldCheck className="h-16 w-16 text-success-foreground opacity-40" />
                <p className="text-lg font-semibold text-foreground">All Clear</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  No employees have active fraud alerts. Run a fraud detection scan to calculate risk scores.
                </p>
              </div>
            )}
          </TabsContent>

          {/* ════════════ TAB: INVESTIGATIONS ════════════ */}
          <TabsContent value="investigations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Column 1: New */}
              <KanbanColumn
                title="New"
                count={inFlightAlerts.filter(a => a.status === "new").length}
                color="text-warning-foreground"
                alerts={inFlightAlerts.filter(a => a.status === "new")}
                onCardClick={openModal}
              />

              {/* Column 2: Acknowledged + Investigating */}
              <KanbanColumn
                title="In Progress"
                count={inFlightAlerts.filter(a => ["acknowledged", "investigating"].includes(a.status)).length}
                color="text-primary"
                alerts={inFlightAlerts.filter(a => ["acknowledged", "investigating"].includes(a.status))}
                onCardClick={openModal}
              />

              {/* Column 3: Recently closed */}
              <KanbanColumn
                title="Recently Closed"
                count={recentlyClosed.length}
                color="text-success-foreground"
                alerts={recentlyClosed}
                onCardClick={openModal}
                muted
              />
            </div>
            {inFlightAlerts.length === 0 && recentlyClosed.length === 0 && (
              <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center gap-3 text-center mt-4">
                <CheckCircle className="h-12 w-12 text-success-foreground opacity-40" />
                <p className="text-base font-semibold text-foreground">No open investigations</p>
                <p className="text-sm text-muted-foreground">
                  All alerts are resolved or no scan has been run yet.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Alert detail modal */}
      <AlertDetailModal
        alert={selectedAlert}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppShell>
  );
}

// ── Kanban Column ───────────────────────────────────────────────────────────

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  alerts: AIAlert[];
  onCardClick: (alert: AIAlert) => void;
  muted?: boolean;
}

function KanbanColumn({ title, count, color, alerts, onCardClick, muted }: KanbanColumnProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <span className={`text-sm font-semibold ${color}`}>{title}</span>
        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="p-2 space-y-2 min-h-[120px]">
        {alerts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No alerts here</p>
        )}
        {alerts.map(alert => (
          <button
            key={alert.id}
            className={`w-full text-left rounded-lg border border-border p-3 space-y-1.5 transition-colors ${
              muted ? "hover:bg-muted/50 opacity-70" : "hover:bg-elevated"
            }`}
            onClick={() => onCardClick(alert)}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                {alert.title}
              </span>
              <StatusBadge
                variant={
                  alert.severity === "critical" || alert.severity === "high"
                    ? "danger"
                    : alert.severity === "medium"
                    ? "warning"
                    : "info"
                }
              >
                {alert.severity}
              </StatusBadge>
            </div>
            {alert.employeeName && (
              <p className="text-xs text-muted-foreground">{alert.employeeName}</p>
            )}
            <div className="flex items-center justify-between">
              <StatusBadge
                variant={
                  alert.status === "resolved"
                    ? "success"
                    : alert.status === "dismissed"
                    ? "neutral"
                    : alert.status === "investigating"
                    ? "primary"
                    : alert.status === "acknowledged"
                    ? "info"
                    : "warning"
                }
              >
                {alert.status}
              </StatusBadge>
              <span className="text-xs text-muted-foreground">
                {relativeTime(alert.createdAt)}
              </span>
            </div>
            {alert.resolutionNotes && (
              <p className="text-xs text-muted-foreground italic truncate">
                "{alert.resolutionNotes}"
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
