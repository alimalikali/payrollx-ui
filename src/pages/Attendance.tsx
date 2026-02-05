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
import { StatusBadge } from "@/components/StatusBadge";
import { AttendanceHeatmap } from "@/components/AttendanceHeatmap";
import { ChartCard } from "@/components/ChartCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setViewMode } from "@/store/slices/attendanceSlice";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Attendance() {
  const dispatch = useAppDispatch();
  const { records, viewMode } = useAppSelector((state) => state.attendance);
  const { employees } = useAppSelector((state) => state.employees);

  // Get all unique dates for heatmap (aggregate across all employees)
  const aggregatedData = records
    .filter((r) => r.employeeId === "1") // Use first employee for main heatmap
    .map((r) => ({
      date: r.date,
      status: r.status,
    }));

  // Get today's attendance log
  const today = format(new Date(), "yyyy-MM-dd");
  const todayRecords = records
    .filter((r) => r.date === today)
    .map((r) => {
      const employee = employees.find((e) => e.id === r.employeeId);
      return { ...r, employeeName: employee?.name || "Unknown" };
    });

  const statusVariant = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "absent":
        return "danger";
      case "leave":
        return "info";
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
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage employee attendance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-card border border-border rounded-lg p-1">
              {(["daily", "weekly", "monthly"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => dispatch(setViewMode(mode))}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                    viewMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Select defaultValue="2024-11">
              <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
                <SelectItem value="2024-09">September 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Attendance Heatmap */}
        <ChartCard
          title="Attendance Overview"
          subtitle="Visual representation of monthly attendance"
        >
          <AttendanceHeatmap data={aggregatedData} size="lg" />
        </ChartCard>

        {/* Today's Attendance Log */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Today's Attendance Log
            </h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated hover:bg-elevated">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Employee
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Check In
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Check Out
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hours Worked
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-elevated transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      {record.employeeName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.checkIn || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.checkOut || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.hoursWorked > 0 ? `${record.hoursWorked.toFixed(1)}h` : "-"}
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
