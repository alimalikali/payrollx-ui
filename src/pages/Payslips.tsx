import { Eye, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AvatarInitials } from "@/components/AvatarInitials";
import { useCurrentUser, usePayslip, usePayslips, useSalaryHistory } from "@/hooks";
import { downloadPayslipPdf, formatPayslipMonth } from "@/lib/payslip";

export default function Payslips() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);

  const userQuery = useCurrentUser();
  const employeeId = userQuery.data?.role === "employee" ? userQuery.data?.employee?.id : undefined;

  const payslipsQuery = usePayslips({ page: 1, limit: 100, employeeId });
  const payslips = payslipsQuery.data?.data || [];
  const payslipDetailQuery = usePayslip(selectedPayslipId || "");
  const salaryHistoryQuery = useSalaryHistory({ employeeId, months: 12 }, !!employeeId);
  const latestSalary = salaryHistoryQuery.data?.data?.[0];

  const filteredPayslips = useMemo(() => {
    return payslips.filter((payslip) => {
      const monthKey = `${payslip.year}-${String(payslip.month).padStart(2, "0")}`;
      const nameMatch = (payslip.employeeName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const monthMatch = selectedMonth === "all" || monthKey === selectedMonth;
      return nameMatch && monthMatch;
    });
  }, [payslips, searchQuery, selectedMonth]);

  const selectedPayslipFromList = filteredPayslips.find((p) => p.id === selectedPayslipId) || null;
  const selectedPayslip = payslipDetailQuery.data?.data || selectedPayslipFromList;

  const monthOptions = Array.from(
    new Set(payslips.map((p) => `${p.year}-${String(p.month).padStart(2, "0")}`))
  ).sort((a, b) => b.localeCompare(a));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payslips</h1>
            <p className="text-muted-foreground mt-1">View and download employee payslips</p>
          </div>
          {latestSalary && (
            <div className="text-sm text-muted-foreground">
              Latest Net Salary: <span className="font-semibold text-foreground">PKR {latestSalary.netSalary.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm bg-background"
          />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {monthOptions.map((monthKey) => {
                const [year, month] = monthKey.split("-");
                return (
                  <SelectItem key={monthKey} value={monthKey}>
                    {formatPayslipMonth(Number(month), Number(year))}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPayslips.map((payslip) => (
            <div key={payslip.id} className="bg-card border border-border rounded-lg p-5 hover:border-border-hover transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AvatarInitials name={payslip.employeeName || "Unknown"} size="sm" />
                  <div>
                    <h3 className="font-semibold text-foreground">{payslip.employeeName || "Unknown"}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{payslip.employeeCode || "N/A"}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{formatPayslipMonth(payslip.month, payslip.year)}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gross</span>
                  <span className="text-sm font-medium text-foreground">PKR {payslip.grossSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Net Pay</span>
                  <span className="text-sm font-bold text-primary">PKR {payslip.netSalary.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedPayslipId(payslip.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadPayslipPdf(payslip)}>
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslipId(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Payslip Details</DialogTitle>
            </DialogHeader>

            {payslipDetailQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Loading payslip details...</p>
            )}

            {!payslipDetailQuery.isLoading && selectedPayslip && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employee</p>
                    <p className="font-medium text-foreground">{selectedPayslip.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium text-foreground">{formatPayslipMonth(selectedPayslip.month, selectedPayslip.year)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Gross Salary</span><span>PKR {selectedPayslip.grossSalary.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Total Deductions</span><span>-PKR {selectedPayslip.totalDeductions.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Income Tax</span><span>-PKR {selectedPayslip.deductions.incomeTax.toLocaleString()}</span></div>
                  <div className="flex justify-between pt-2 border-t border-border font-semibold"><span>Net Salary</span><span>PKR {selectedPayslip.netSalary.toLocaleString()}</span></div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => downloadPayslipPdf(selectedPayslip)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
