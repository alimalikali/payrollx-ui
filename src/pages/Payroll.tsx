import { useMemo, useState } from "react";
import { Play, DollarSign, Minus, FileText, Wallet, CheckCircle } from "lucide-react";
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
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { useApprovePayroll, useCreatePayrollRun, usePayrollRuns, useProcessPayroll } from "@/hooks";

const monthLabel = (month: number, year: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function Payroll() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const payrollRunsQuery = usePayrollRuns({ page: 1, limit: 20, year: selectedYear });
  const createRun = useCreatePayrollRun();
  const processRun = useProcessPayroll();
  const approveRun = useApprovePayroll();

  const runs = payrollRunsQuery.data?.data || [];
  const latestRun = runs[0];

  const totals = useMemo(() => {
    if (!latestRun) {
      return { gross: 0, deductions: 0, tax: 0, net: 0 };
    }

    return {
      gross: latestRun.totalGrossSalary,
      deductions: latestRun.totalDeductions,
      tax: latestRun.totalTax,
      net: latestRun.totalNetSalary,
    };
  }, [latestRun]);

  const handleCreateCurrentMonthRun = () => {
    const now = new Date();
    createRun.mutate({ month: now.getMonth() + 1, year: now.getFullYear() });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
            <p className="text-muted-foreground mt-1">Process and manage monthly payroll</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setSelectedYear((year) => year - 1)}>
              Previous Year
            </Button>
            <p className="text-sm text-muted-foreground">{selectedYear}</p>
            <Button variant="outline" onClick={() => setSelectedYear((year) => year + 1)}>
              Next Year
            </Button>
            <Button onClick={handleCreateCurrentMonthRun} disabled={createRun.isPending}>
              <Play className="h-4 w-4 mr-2" />
              {createRun.isPending ? "Creating..." : "Create Current Run"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Gross" value={`${(totals.gross / 1000000).toFixed(2)}M`} prefix="PKR" icon={DollarSign} />
          <KPICard title="Total Deductions" value={`${(totals.deductions / 1000).toFixed(0)}K`} prefix="PKR" icon={Minus} />
          <KPICard title="Total Tax" value={`${(totals.tax / 1000).toFixed(0)}K`} prefix="PKR" icon={FileText} />
          <KPICard title="Net Payable" value={`${(totals.net / 1000000).toFixed(2)}M`} prefix="PKR" icon={Wallet} />
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated hover:bg-elevated">
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Employees</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id} className="hover:bg-elevated transition-colors">
                    <TableCell className="font-medium text-foreground">{monthLabel(run.month, run.year)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={
                          run.status === "approved"
                            ? "success"
                            : run.status === "completed"
                            ? "info"
                            : run.status === "processing"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {run.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{run.totalEmployees || 0}</TableCell>
                    <TableCell className="text-right text-muted-foreground">PKR {run.totalGrossSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">PKR {run.totalNetSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {run.status === "draft" && (
                          <Button size="sm" variant="outline" onClick={() => processRun.mutate(run.id)}>
                            <Play className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        )}
                        {run.status === "completed" && (
                          <Button size="sm" variant="outline" onClick={() => approveRun.mutate(run.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
