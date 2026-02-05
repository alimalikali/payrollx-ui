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
import { AttendanceHeatmap } from "@/components/AttendanceHeatmap";
import { ChartCard } from "@/components/ChartCard";
import { format } from "date-fns";
import { useAttendance, useCheckIn, useCheckOut, useDailyStats } from "@/hooks";

const mapStatus = (status: string): "present" | "absent" | "late" | "leave" | "weekend" | "holiday" => {
  if (status === "on_leave" || status === "half_day") return "leave";
  if (status === "holiday") return "holiday";
  if (status === "weekend") return "weekend";
  if (status === "absent") return "absent";
  if (status === "late") return "late";
  return "present";
};

export default function Attendance() {
  const attendanceQuery = useAttendance({ limit: 100, page: 1 });
  const dailyStatsQuery = useDailyStats();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const records = attendanceQuery.data?.data || [];
  const dailyStats = dailyStatsQuery.data?.data;
  const today = format(new Date(), "yyyy-MM-dd");

  const heatmapData = records.slice(0, 31).map((record) => ({
    date: record.date,
    status: mapStatus(record.status),
  }));

  const todayRecords = records.filter((r) => r.date === today);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">Track and manage employee attendance</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => checkIn.mutate({})} disabled={checkIn.isPending}>
              {checkIn.isPending ? "Checking in..." : "Check In"}
            </Button>
            <Button variant="outline" onClick={() => checkOut.mutate({})} disabled={checkOut.isPending}>
              {checkOut.isPending ? "Checking out..." : "Check Out"}
            </Button>
          </div>
        </div>

        {dailyStats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <ChartCard title="Total" subtitle="Employees">{dailyStats.totalEmployees}</ChartCard>
            <ChartCard title="Present" subtitle="Today">{dailyStats.present}</ChartCard>
            <ChartCard title="Absent" subtitle="Today">{dailyStats.absent}</ChartCard>
            <ChartCard title="Late" subtitle="Today">{dailyStats.late}</ChartCard>
            <ChartCard title="Rate" subtitle="Attendance">{dailyStats.attendanceRate}%</ChartCard>
          </div>
        )}

        <ChartCard title="Attendance Overview" subtitle="Latest attendance heatmap">
          <AttendanceHeatmap data={heatmapData} size="lg" />
        </ChartCard>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Today's Attendance Log</h3>
            <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated hover:bg-elevated">
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-elevated transition-colors">
                    <TableCell className="font-medium text-foreground">{record.employeeName || record.employeeCode || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{record.checkIn || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{record.checkOut || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{Number(record.workingHours || record.hoursWorked || 0).toFixed(1)}h</TableCell>
                    <TableCell>
                      <StatusBadge variant={record.status === "absent" ? "danger" : record.status === "late" ? "warning" : "success"}>
                        {record.status.replace("_", " ")}
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
