import { Download } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AvatarInitials } from "@/components/AvatarInitials";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payslip, useCurrentUser, useEmployee, usePayslips, useSalaryHistory } from "@/hooks";
import {
  comparePayslipsByPeriodDesc,
  downloadPayslipPdf,
  formatPayrollStatusLabel,
  formatPayslipMonth,
} from "@/lib/payslip";

const formatCurrency = (value?: number | null) => `PKR ${Number(value || 0).toLocaleString()}`;

const formatDate = (value?: string | null) => {
  if (!value) return "Not provided";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDisplayValue = (value?: string | null) => {
  if (!value) return "Not provided";

  return value;
};

const getPayrollStatusVariant = (status?: string | null) => {
  switch (status) {
    case "paid":
      return "success" as const;
    case "approved":
      return "info" as const;
    case "cancelled":
      return "danger" as const;
    case "generated":
    default:
      return "warning" as const;
  }
};

const getFullName = (employee?: {
  fullName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}) => {
  if (!employee) return "Unknown";

  return (
    employee.fullName ||
    employee.name ||
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Unknown"
  );
};

const getAnnualSummaryFromPayslips = (payslips: Payslip[]) => {
  return payslips.reduce(
    (summary, payslip) => ({
      grossSalary: summary.grossSalary + Number(payslip.grossSalary || 0),
      totalDeductions: summary.totalDeductions + Number(payslip.totalDeductions || 0),
      netSalary: summary.netSalary + Number(payslip.netSalary || 0),
      processedMonths: summary.processedMonths + (payslip.status === "paid" || payslip.status === "approved" ? 1 : 0),
    }),
    {
      grossSalary: 0,
      totalDeductions: 0,
      netSalary: 0,
      processedMonths: 0,
    }
  );
};

export default function MyProfile() {
  const currentUserQuery = useCurrentUser();
  const employeeId = currentUserQuery.data?.employee?.id || "";
  const employeeQuery = useEmployee(employeeId);
  const payslipsQuery = usePayslips({ page: 1, limit: 12, employeeId: employeeId || undefined });
  const salaryHistoryQuery = useSalaryHistory({ employeeId, months: 12 }, !!employeeId);

  const employee = employeeQuery.data?.data;
  const fullName = getFullName(employee);
  const payslips = [...(payslipsQuery.data?.data || [])].sort(comparePayslipsByPeriodDesc);
  const latestPayslip = payslips[0];
  const today = new Date();
  const currentMonthPayslip = payslips.find(
    (payslip) => payslip.month === today.getMonth() + 1 && payslip.year === today.getFullYear()
  );
  const featuredPayslip = currentMonthPayslip || latestPayslip;
  const previousPayslips = payslips.filter((payslip) => payslip.id !== featuredPayslip?.id).slice(0, 11);
  const salaryHistory = salaryHistoryQuery.data?.data || [];
  const annualSalarySummary = salaryHistory.length
    ? salaryHistory.reduce(
        (summary, item) => ({
          grossSalary: summary.grossSalary + Number(item.grossSalary || 0),
          totalDeductions: summary.totalDeductions + Number(item.totalDeductions || 0),
          netSalary: summary.netSalary + Number(item.netSalary || 0),
          processedMonths: summary.processedMonths + (item.status === "paid" || item.status === "approved" ? 1 : 0),
        }),
        {
          grossSalary: 0,
          totalDeductions: 0,
          netSalary: 0,
          processedMonths: 0,
        }
      )
    : getAnnualSummaryFromPayslips(payslips);
  const annualTaxDeducted = payslips.reduce(
    (total, payslip) => total + Number(payslip.deductions?.incomeTax || 0),
    0
  );
  const allowances = latestPayslip
    ? [
        ["House Rent", latestPayslip.earnings.housingAllowance],
        ["Medical", latestPayslip.earnings.medicalAllowance],
        ["Transport", latestPayslip.earnings.transportAllowance],
        ["Utility", latestPayslip.earnings.utilityAllowance],
        ["Other", latestPayslip.earnings.otherAllowances],
        ["Overtime", latestPayslip.earnings.overtimePay],
        ["Bonus", latestPayslip.earnings.bonus],
      ]
    : [];
  const deductions = latestPayslip
    ? [
        ["Tax", latestPayslip.deductions.incomeTax],
        ["Loan", latestPayslip.deductions.loanDeduction],
        ["EOBI", latestPayslip.deductions.eobiContribution],
        ["SESSI", latestPayslip.deductions.sessiContribution],
        ["Other", latestPayslip.deductions.otherDeductions],
      ]
    : [];
  const isLoading =
    currentUserQuery.isLoading || employeeQuery.isLoading || payslipsQuery.isLoading || salaryHistoryQuery.isLoading;
  const hasError = employeeQuery.isError || payslipsQuery.isError || salaryHistoryQuery.isError;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="mt-1 text-muted-foreground">HR-managed personal, salary, and payslip information.</p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading profile...</p>}
        {hasError && <p className="text-sm text-danger">Unable to load salary and profile information.</p>}

        {!isLoading && !hasError && employee && (
          <>
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Personal Information
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Employee Profile</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Only the values maintained by HR are shown here.
                  </p>
                </div>
                <AvatarInitials
                  name={fullName}
                  imageUrl={employee.profileImage}
                  size="xl"
                  className="border border-border"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Employee Name</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{fullName}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Employee ID</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{getDisplayValue(employee.employeeId)}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Designation</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{getDisplayValue(employee.designation)}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Department</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{getDisplayValue(employee.departmentName)}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Joining Date</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{formatDate(employee.joiningDate)}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Contact Information</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{getDisplayValue(employee.email)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{getDisplayValue(employee.phone)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Salary Overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Current Salary Breakdown</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  These values come from the latest payroll record prepared by HR.
                </p>
              </div>

              {!latestPayslip ? (
                <p className="text-sm text-muted-foreground">No salary record available yet.</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-background/70 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Current Month Salary
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {formatCurrency(latestPayslip.grossSalary)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/70 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Basic Salary
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {formatCurrency(latestPayslip.earnings.basicSalary)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/70 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Net Salary
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {formatCurrency(latestPayslip.netSalary)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/70 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Last Payment Date
                      </p>
                      <p className="mt-2 text-base font-semibold text-foreground">{formatDate(latestPayslip.paidAt)}</p>
                      <div className="mt-2">
                        <StatusBadge variant={getPayrollStatusVariant(latestPayslip.status)}>
                          {formatPayrollStatusLabel(latestPayslip.status)}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-background/70 p-4">
                      <h3 className="text-base font-semibold text-foreground">Allowances</h3>
                      <div className="mt-4 space-y-3 text-sm">
                        {allowances.map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium text-foreground">{formatCurrency(Number(value))}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background/70 p-4">
                      <h3 className="text-base font-semibold text-foreground">Deductions</h3>
                      <div className="mt-4 space-y-3 text-sm">
                        {deductions.map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium text-foreground">{formatCurrency(Number(value))}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                          <span className="font-medium text-foreground">Total Deductions</span>
                          <span className="font-semibold text-foreground">
                            {formatCurrency(latestPayslip.totalDeductions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Payslip Section
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Salary Documents</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Download your current payslip and review payroll summaries prepared by HR.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-border bg-background/70 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {currentMonthPayslip ? "Current Month Payslip Download (PDF)" : "Latest Payslip Download (PDF)"}
                      </h3>
                      {featuredPayslip ? (
                        <>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {formatPayslipMonth(featuredPayslip.month, featuredPayslip.year)}
                          </p>
                          <p className="mt-3 text-2xl font-semibold text-foreground">
                            {formatCurrency(featuredPayslip.netSalary)}
                          </p>
                          <div className="mt-3">
                            <StatusBadge variant={getPayrollStatusVariant(featuredPayslip.status)}>
                              {formatPayrollStatusLabel(featuredPayslip.status)}
                            </StatusBadge>
                          </div>
                          {!currentMonthPayslip && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              Current month payslip is not available yet. Downloading the latest available payslip instead.
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">No payslip available yet.</p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="sm:self-start"
                      disabled={!featuredPayslip}
                      onClick={() => featuredPayslip && downloadPayslipPdf(featuredPayslip)}
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-5">
                  <h3 className="text-base font-semibold text-foreground">Tax Deduction Summary</h3>
                  {!latestPayslip ? (
                    <p className="mt-2 text-sm text-muted-foreground">No payslip data available yet.</p>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          Current Month Tax
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {formatCurrency(latestPayslip.deductions.incomeTax)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          Annual Tax Deducted
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(annualTaxDeducted)}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          Current Tax Slab
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{getDisplayValue(latestPayslip.taxSlab)}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          Filer Status
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {latestPayslip.isFiler ? "Filer" : "Non-Filer"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background/70 p-5">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-foreground">Previous Payslips History</h3>
                  <p className="text-sm text-muted-foreground">Latest payroll documents maintained by HR.</p>
                </div>

                {previousPayslips.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payslips available yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousPayslips.map((payslip) => (
                        <TableRow key={payslip.id}>
                          <TableCell className="font-medium text-foreground">
                            {formatPayslipMonth(payslip.month, payslip.year)}
                          </TableCell>
                          <TableCell>{formatCurrency(payslip.grossSalary)}</TableCell>
                          <TableCell>{formatCurrency(payslip.netSalary)}</TableCell>
                          <TableCell>
                            <StatusBadge variant={getPayrollStatusVariant(payslip.status)}>
                              {formatPayrollStatusLabel(payslip.status)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>{formatDate(payslip.paidAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => downloadPayslipPdf(payslip)}>
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-base font-semibold text-foreground">Annual Salary Summary</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Total Gross Salary
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatCurrency(annualSalarySummary.grossSalary)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Total Deductions
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatCurrency(annualSalarySummary.totalDeductions)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Total Net Salary
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatCurrency(annualSalarySummary.netSalary)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Months Paid / Processed
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {annualSalarySummary.processedMonths} / {salaryHistory.length || payslips.length}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
