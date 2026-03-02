import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building,
  CalendarClock,
  Clock3,
  Mail,
  Pencil,
  Phone,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
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
import {
  toast,
  useAttendance,
  useCheckIn,
  useCheckOut,
  useCurrentUser,
  useDeleteEmployee,
  useEmployee,
  useMyEmployee,
  useUpdateEmployee,
} from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isHR } from "@/lib/permissions";
import { formatDuration, getElapsedSeconds } from "@/lib/attendance";

type ApiErrorResponse = {
  error?: {
    message?: string;
    details?: Array<{
      message?: string;
    }>;
  };
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const apiError = axiosError.response?.data?.error;
  const detailMessage = apiError?.details?.find((detail) => detail?.message)?.message;
  return detailMessage || apiError?.message || fallback;
};

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeEmployeeIdentifier = id ? decodeURIComponent(id) : "";
  const [isEditOpen, setEditOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [status, setStatus] = useState("active");
  const [now, setNow] = useState(() => new Date());

  const userQuery = useCurrentUser();
  const isEmployeeUser = userQuery.data?.role === "employee";
  const canManage = isHR(userQuery.data);
  const employeeQuery = useEmployee(routeEmployeeIdentifier);
  const myEmployeeQuery = useMyEmployee(!routeEmployeeIdentifier && isEmployeeUser);
  const employee = employeeQuery.data?.data || myEmployeeQuery.data?.data;
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const attendanceFilters = isEmployeeUser
    ? { limit: 30, page: 1 }
    : { employeeId: employee?.id, limit: 30, page: 1 };
  const attendanceQuery = useAttendance(
    attendanceFilters,
    isEmployeeUser ? true : Boolean(employee?.id)
  );

  useEffect(() => {
    if (!employee) {
      return;
    }
    setFirstName(employee.firstName || "");
    setLastName(employee.lastName || "");
    setDesignation(employee.designation || "");
    setStatus(employee.status || "active");
  }, [employee]);

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

  const today = format(new Date(), "yyyy-MM-dd");
  const isProfileLoading = routeEmployeeIdentifier ? employeeQuery.isLoading : myEmployeeQuery.isLoading;
  const isProfileError = routeEmployeeIdentifier ? employeeQuery.isError : myEmployeeQuery.isError;
  const isOwnProfile = Boolean(
    employee?.id &&
      (userQuery.data?.employee?.id === employee.id || userQuery.data?.id === employee.userId)
  );
  const canSelfTrackAttendance = userQuery.data?.role === "employee" && isOwnProfile;
  const todayRecord = attendanceRecords.find((record) => record.date === today);
  const hasCheckedInToday = Boolean(todayRecord?.checkIn);
  const hasCheckedOutToday = Boolean(todayRecord?.checkOut);
  const isShiftActive = hasCheckedInToday && !hasCheckedOutToday;
  const liveWorkedSeconds = useMemo(() => {
    if (!todayRecord?.checkIn) {
      return 0;
    }
    return getElapsedSeconds(todayRecord.date, todayRecord.checkIn, todayRecord.checkOut, now);
  }, [todayRecord?.checkIn, todayRecord?.checkOut, todayRecord?.date, now]);

  useEffect(() => {
    if (!isShiftActive) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isShiftActive]);

  const fullName = employee?.name || `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim();
  const profileStatus = typeof employee?.status === "string" ? employee.status : "inactive";
  const backPath = canManage ? "/hr/employees" : "/employee/dashboard";

  const handleSave = () => {
    if (!employee?.id) {
      return;
    }
    updateEmployee.mutate(
      {
        id: employee.id,
        data: { firstName, lastName, designation, status },
      },
      {
        onSuccess: () => setEditOpen(false),
      }
    );
  };

  const handleDelete = () => {
    if (!employee?.id) {
      return;
    }
    deleteEmployee.mutate(employee.id, {
      onSuccess: () => navigate("/hr/employees"),
    });
  };

  const handleCheckIn = () => {
    checkIn.mutate({}, {
      onSuccess: () => {
        setNow(new Date());
        attendanceQuery.refetch();
        toast({
          title: "Checked in",
          description: "Your check-in time has been saved.",
        });
      },
      onError: (error: unknown) => {
        toast({
          title: "Check-in failed",
          description: getApiErrorMessage(error, "Unable to check in."),
          variant: "destructive",
        });
      },
    });
  };

  const handleCheckOut = () => {
    checkOut.mutate({}, {
      onSuccess: () => {
        setNow(new Date());
        attendanceQuery.refetch();
        toast({
          title: "Checked out",
          description: "Your check-out time has been saved.",
        });
      },
      onError: (error: unknown) => {
        toast({
          title: "Check-out failed",
          description: getApiErrorMessage(error, "Unable to check out."),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Button variant="ghost" className="w-fit" onClick={() => navigate(backPath)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {canManage ? "Back to employees" : "Back to dashboard"}
        </Button>

        {isProfileLoading && <p className="text-sm text-muted-foreground">Loading employee...</p>}
        {isProfileError && <p className="text-sm text-danger">Unable to load employee profile.</p>}
        {!isProfileLoading && !isProfileError && !employee && (
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

              {canManage && (
                <div className="mt-4 flex gap-2">
                  <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Designation</Label>
                          <Input value={designation} onChange={(e) => setDesignation(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="on_leave">On Leave</SelectItem>
                              <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={handleSave} disabled={updateEmployee.isPending}>
                          {updateEmployee.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteEmployee.isPending}
                    className="text-danger border-danger hover:bg-danger-dim"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteEmployee.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{employee.email || "-"}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{employee.phone || "-"}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4" />{employee.departmentName || employee.department || "-"}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" />{employee.designation || "-"}</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Today's Attendance</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
                </div>
                {canSelfTrackAttendance && (
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCheckIn} disabled={checkIn.isPending || hasCheckedInToday}>
                      {checkIn.isPending ? "Checking in..." : "Check In"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCheckOut}
                      disabled={checkOut.isPending || !isShiftActive}
                    >
                      {checkOut.isPending ? "Checking out..." : "Check Out"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                  <p className="mt-1 font-semibold text-foreground">{today}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Check In</p>
                  <p className="mt-1 font-semibold text-foreground">{todayRecord?.checkIn || "-"}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Check Out</p>
                  <p className="mt-1 font-semibold text-foreground">{todayRecord?.checkOut || "-"}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Working Timer</p>
                  <p className="mt-1 font-semibold text-foreground">{formatDuration(liveWorkedSeconds)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Present Days" value={attendanceStats.present} icon={UserCheck} />
              <KPICard title="Absent Days" value={attendanceStats.absent} icon={UserX} />
              <KPICard title="Leave Days" value={attendanceStats.leave} icon={CalendarClock} />
              <KPICard title="Hours Worked" value={attendanceStats.hours.toFixed(1)} icon={Clock3} />
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
