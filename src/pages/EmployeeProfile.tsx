import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Building, Briefcase } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/AvatarInitials";
import { StatusBadge } from "@/components/StatusBadge";
import { KPICard } from "@/components/KPICard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAttendance, useEmployee } from "@/hooks";

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeIdentifier = id ? decodeURIComponent(id) : "";

  const employeeQuery = useEmployee(employeeIdentifier);
  const employee = employeeQuery.data?.data;
  const attendanceQuery = useAttendance(
    { employeeId: employee?.id, limit: 10, page: 1 },
    Boolean(employee?.id)
  );

  const attendanceRecords = useMemo(
    () => attendanceQuery.data?.data ?? [],
    [attendanceQuery.data?.data]
  );

  const attendanceStats = useMemo(() => {
    return attendanceRecords.reduce(
      (acc, item) => {
        if (item.status === "present" || item.status === "late") acc.present += 1;
        if (item.status === "absent") acc.absent += 1;
        if (item.status === "on_leave" || item.status === "half_day") acc.leave += 1;
        acc.hours += Number(item.workingHours || item.hoursWorked || 0);
        return acc;
      },
      { present: 0, absent: 0, leave: 0, hours: 0 }
    );
  }, [attendanceRecords]);

  const fullName = employee?.name || `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim();
  const profileStatus = typeof employee?.status === "string" ? employee.status : "inactive";

  return (
    <AppShell>
      <div className="space-y-6">
        <Button variant="ghost" className="w-fit" onClick={() => navigate("/hr/employees") }>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to employees
        </Button>

        {employeeQuery.isLoading && <p className="text-sm text-muted-foreground">Loading employee...</p>}
        {employeeQuery.isError && <p className="text-sm text-danger">Unable to load employee profile.</p>}
        {!employeeQuery.isLoading && !employeeQuery.isError && !employee && (
          <p className="text-sm text-muted-foreground">Employee profile not found.</p>
        )}

        {employee && (
          <>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <AvatarInitials name={fullName || "Unknown"} size="lg" />
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{fullName || "Unknown"}</h1>
                    <p className="text-muted-foreground font-mono">{employee.employeeId || employee.code || "N/A"}</p>
                  </div>
                </div>
                <StatusBadge variant={profileStatus === "active" ? "success" : "neutral"}>
                  {profileStatus.replace("_", " ")}
                </StatusBadge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{employee.email || "-"}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{employee.phone || "-"}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4" />{employee.departmentName || employee.department || "-"}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" />{employee.designation || "-"}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Present Days" value={attendanceStats.present} />
              <KPICard title="Absent Days" value={attendanceStats.absent} />
              <KPICard title="Leave Days" value={attendanceStats.leave} />
              <KPICard title="Hours Worked" value={attendanceStats.hours.toFixed(1)} />
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Recent Attendance</h3>
              </div>
              <div className="overflow-x-auto">
                {attendanceQuery.isLoading && (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Loading attendance...</p>
                )}
                {attendanceQuery.isError && (
                  <p className="px-4 py-3 text-sm text-danger">Unable to load attendance records.</p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow className="bg-elevated hover:bg-elevated">
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record, index) => {
                      const safeStatus = record?.status || "present";
                      return (
                        <TableRow key={record?.id || `${record?.date || "row"}-${index}`} className="hover:bg-elevated transition-colors">
                          <TableCell>{record?.date || "-"}</TableCell>
                          <TableCell>{record?.checkIn || "-"}</TableCell>
                          <TableCell>{record?.checkOut || "-"}</TableCell>
                          <TableCell>{Number(record?.workingHours || record?.hoursWorked || 0).toFixed(1)}</TableCell>
                          <TableCell>
                            <StatusBadge variant={safeStatus === "absent" ? "danger" : safeStatus === "late" ? "warning" : "success"}>
                              {safeStatus.replace("_", " ")}
                            </StatusBadge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!attendanceQuery.isLoading && !attendanceQuery.isError && attendanceRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                          No attendance records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
