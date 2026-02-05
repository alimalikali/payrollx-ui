import { Eye, Download, X } from "lucide-react";
import { useState } from "react";
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
import { useAppSelector } from "@/store/hooks";
import { PayrollRecord } from "@/data/mockData";

export default function Payslips() {
  const { records } = useAppSelector((state) => state.payroll);
  const { employees } = useAppSelector((state) => state.employees);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2024-11");

  const filteredRecords = records.filter((r) => {
    const matchesMonth = r.month === selectedMonth;
    const matchesSearch = r.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesSearch;
  });

  const getEmployee = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId);
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split("-");
    const date = new Date(parseInt(year), parseInt(m) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payslips</h1>
            <p className="text-muted-foreground mt-1">
              View and download employee payslips
            </p>
          </div>
        </div>

        {/* Filters */}
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
              <SelectItem value="2024-11">November 2024</SelectItem>
              <SelectItem value="2024-10">October 2024</SelectItem>
              <SelectItem value="2024-09">September 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payslip Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((record) => {
            const employee = getEmployee(record.employeeId);
            return (
              <div
                key={record.id}
                className="bg-card border border-border rounded-lg p-5 hover:border-border-hover transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AvatarInitials name={record.employeeName} size="sm" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {record.employeeName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {employee?.code || "N/A"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatMonth(record.month)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gross</span>
                    <span className="text-sm font-medium text-foreground">
                      PKR {(record.basic + record.allowances).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Net Pay</span>
                    <span className="text-sm font-bold text-primary">
                      PKR {record.netPay.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedPayslip(record)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payslip Detail Modal */}
        <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Payslip Details</span>
              </DialogTitle>
            </DialogHeader>
            {selectedPayslip && (
              <div className="space-y-6">
                {/* Company Header */}
                <div className="text-center border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-primary">PayrollX</h2>
                  <p className="text-sm text-muted-foreground">
                    Enterprise Payroll Management
                  </p>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employee</p>
                    <p className="font-medium text-foreground">
                      {selectedPayslip.employeeName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium text-foreground">
                      {formatMonth(selectedPayslip.month)}
                    </p>
                  </div>
                </div>

                {/* Earnings */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Earnings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Basic Salary</span>
                      <span className="text-foreground">
                        PKR {selectedPayslip.basic.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allowances (HRA, Transport, Medical)</span>
                      <span className="text-foreground">
                        PKR {selectedPayslip.allowances.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border font-medium">
                      <span className="text-foreground">Gross Salary</span>
                      <span className="text-foreground">
                        PKR {(selectedPayslip.basic + selectedPayslip.allowances).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">EOBI / SESSI</span>
                      <span className="text-danger-foreground">
                        -PKR {selectedPayslip.deductions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Income Tax</span>
                      <span className="text-danger-foreground">
                        -PKR {selectedPayslip.tax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border font-medium">
                      <span className="text-foreground">Total Deductions</span>
                      <span className="text-danger-foreground">
                        -PKR {(selectedPayslip.deductions + selectedPayslip.tax).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-primary-dim rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary-text">Net Pay</span>
                    <span className="text-2xl font-bold text-primary">
                      PKR {selectedPayslip.netPay.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
