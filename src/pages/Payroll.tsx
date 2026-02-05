import { Play, DollarSign, Minus, FileText, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
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
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSelectedMonth } from "@/store/slices/payrollSlice";

export default function Payroll() {
  const dispatch = useAppDispatch();
  const { records, selectedMonth } = useAppSelector((state) => state.payroll);

  const monthRecords = records.filter((r) => r.month === selectedMonth);

  // Calculate totals
  const totals = monthRecords.reduce(
    (acc, r) => ({
      gross: acc.gross + r.basic + r.allowances,
      deductions: acc.deductions + r.deductions,
      tax: acc.tax + r.tax,
      net: acc.net + r.netPay,
    }),
    { gross: 0, deductions: 0, tax: 0, net: 0 }
  );

  const statusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "info";
      case "pending":
        return "warning";
      case "on-hold":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
            <p className="text-muted-foreground mt-1">
              Process and manage monthly payroll
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedMonth}
              onValueChange={(value) => dispatch(setSelectedMonth(value))}
            >
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
                <SelectItem value="2024-09">September 2024</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Run Payroll
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Gross"
            value={`${(totals.gross / 1000000).toFixed(2)}M`}
            prefix="PKR"
            icon={DollarSign}
          />
          <KPICard
            title="Total Deductions"
            value={`${(totals.deductions / 1000).toFixed(0)}K`}
            prefix="PKR"
            icon={Minus}
          />
          <KPICard
            title="Total Tax"
            value={`${(totals.tax / 1000).toFixed(0)}K`}
            prefix="PKR"
            icon={FileText}
          />
          <KPICard
            title="Net Payable"
            value={`${(totals.net / 1000000).toFixed(2)}M`}
            prefix="PKR"
            icon={Wallet}
          />
        </div>

        {/* Payroll Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated hover:bg-elevated">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Employee
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Basic
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Allowances
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Deductions
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Tax
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Net Pay
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-elevated transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      {record.employeeName}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      PKR {record.basic.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      PKR {record.allowances.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-danger-foreground">
                      -PKR {record.deductions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-danger-foreground">
                      -PKR {record.tax.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      PKR {record.netPay.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={statusVariant(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </StatusBadge>
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
