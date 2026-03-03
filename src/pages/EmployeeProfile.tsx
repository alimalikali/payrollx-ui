import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import {
  ArrowLeft,
  Briefcase,
  Building,
  CalendarClock,
  Camera,
  Clock3,
  Mail,
  Pencil,
  Phone,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AvatarInitials } from "@/components/AvatarInitials";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
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
  useLeaveBalance,
  useLeaveTypes,
  useMyEmployee,
  useUpdateEmployee,
  useUpdateMyProfileImage,
  useUploadProfilePhoto,
} from "@/hooks";
import { formatDuration, getElapsedSeconds } from "@/lib/attendance";
import { buildLeaveBalanceCards } from "@/lib/leaveBalance";
import { isPrivileged } from "@/lib/permissions";

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

const getProfileStatusVariant = (status: string) => {
  if (status === "active") return "success";
  if (status === "on_leave") return "warning";
  if (status === "terminated") return "danger";
  return "neutral";
};

const getAttendanceStatusVariant = (status: string) => {
  if (status === "late") return "warning";
  if (status === "absent") return "danger";
  if (status === "on_leave" || status === "half_day") return "info";
  return "success";
};

const formatStatusLabel = (value: string) => value.replace(/_/g, " ");

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
  const [isUploadingImage, setUploadingImage] = useState(false);

  const userQuery = useCurrentUser();
  const isEmployeeUser = userQuery.data?.role === "employee";
  const canManage = isPrivileged(userQuery.data);
  const employeeQuery = useEmployee(routeEmployeeIdentifier);
  const myEmployeeQuery = useMyEmployee(!routeEmployeeIdentifier && isEmployeeUser);
  const employee = employeeQuery.data?.data || myEmployeeQuery.data?.data;
  const updateEmployee = useUpdateEmployee();
  const updateMyProfileImage = useUpdateMyProfileImage();
  const uploadProfilePhoto = useUploadProfilePhoto();
  const deleteEmployee = useDeleteEmployee();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const leaveTypesQuery = useLeaveTypes();
  const leaveBalanceQuery = useLeaveBalance(employee?.id || "", new Date().getFullYear());

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

  const leaveBalanceCards = useMemo(
    () => buildLeaveBalanceCards(leaveTypesQuery.data?.data ?? [], leaveBalanceQuery.data?.data ?? []),
    [leaveBalanceQuery.data?.data, leaveTypesQuery.data?.data]
  );

  const leaveTotals = useMemo(() => {
    return leaveBalanceCards.reduce(
      (acc, item) => {
        acc.allocated += Number(item.allocatedDays || 0);
        acc.used += Number(item.usedDays || 0);
        acc.remaining += Number(item.remainingDays || 0);
        return acc;
      },
      { allocated: 0, used: 0, remaining: 0 }
    );
  }, [leaveBalanceCards]);

  const today = format(new Date(), "yyyy-MM-dd");
  const isProfileLoading = routeEmployeeIdentifier ? employeeQuery.isLoading : myEmployeeQuery.isLoading;
  const isProfileError = routeEmployeeIdentifier ? employeeQuery.isError : myEmployeeQuery.isError;
  const isLeaveBalanceLoading = !isProfileLoading && (
    leaveTypesQuery.isLoading ||
    (Boolean(employee?.id) && leaveBalanceQuery.isLoading)
  );
  const isLeaveBalanceError = !isProfileLoading && (
    leaveTypesQuery.isError ||
    (Boolean(employee?.id) && leaveBalanceQuery.isError)
  );
  const isOwnProfile = Boolean(
    employee?.id &&
      (userQuery.data?.employee?.id === employee.id || userQuery.data?.id === employee.userId)
  );
  const canSelfTrackAttendance = userQuery.data?.role === "employee" && isOwnProfile;
  const canEditOwnPhoto = isEmployeeUser && isOwnProfile;
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
  const attendanceRate = attendanceRecords.length
    ? Math.round((attendanceStats.present / attendanceRecords.length) * 100)
    : 0;
  const recentAttendance = attendanceRecords.slice(0, 5);
  const currentShiftLabel = isShiftActive
    ? "Live shift"
    : hasCheckedOutToday
    ? "Completed today"
    : hasCheckedInToday
    ? "Awaiting checkout"
    : "Not started";
  const employeeIdentifier = employee?.employeeId || employee?.code || "N/A";
  const employeeDepartment = employee?.departmentName || employee?.department || "-";
  const employeeDesignation = employee?.designation || "-";
  const infoCards = [
    { label: "Work email", value: employee?.email || "-", icon: Mail },
    { label: "Phone", value: employee?.phone || "-", icon: Phone },
    { label: "Department", value: employeeDepartment, icon: Building },
    { label: "Designation", value: employeeDesignation, icon: Briefcase },
  ];
  const spotlightCards = [
    { label: "Employee ID", value: employeeIdentifier },
    { label: "Current shift", value: currentShiftLabel },
    { label: "Attendance rate", value: `${attendanceRate}%` },
    { label: "Leave remaining", value: `${leaveTotals.remaining}` },
  ];

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

  const handleProfilePhotoSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employee?.id) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Use JPEG, PNG, or WEBP.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be 2MB or less.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Unable to read file"));
        reader.readAsDataURL(file);
      });

      const uploadResponse = await uploadProfilePhoto.mutateAsync({
        fileName: file.name.replace(/\.[^/.]+$/, ""),
        contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
        data: base64,
      });

      if (canEditOwnPhoto) {
        await updateMyProfileImage.mutateAsync(uploadResponse.data.url);
      } else if (canManage) {
        await updateEmployee.mutateAsync({
          id: employee.id,
          data: { profileImage: uploadResponse.data.url },
        });
      }

      employeeQuery.refetch();
      myEmployeeQuery.refetch();
      toast({
        title: "Profile image updated",
        description: "The employee profile photo has been saved.",
      });
    } catch (error: unknown) {
      toast({
        title: "Image update failed",
        description: getApiErrorMessage(error, "Unable to update the profile image."),
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" className="w-fit" onClick={() => navigate(backPath)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {canManage ? "Back to employees" : "Back to dashboard"}
          </Button>
          {employee && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusBadge variant={getProfileStatusVariant(profileStatus)}>
                {formatStatusLabel(profileStatus)}
              </StatusBadge>
              <span>Profile overview</span>
            </div>
          )}
        </div>

        {isProfileLoading && <p className="text-sm text-muted-foreground">Loading employee...</p>}
        {isProfileError && <p className="text-sm text-danger">Unable to load employee profile.</p>}
        {!isProfileLoading && !isProfileError && !employee && (
          <p className="text-sm text-muted-foreground">Employee profile not found.</p>
        )}

        {employee && (
          <>
            <section className="relative overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-card via-card to-primary-dim/25 p-6 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary-dim/30 via-transparent to-info-dim/25" />
              <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                <div className="space-y-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="space-y-3">
                        <AvatarInitials
                          name={fullName || "Unknown"}
                          size="xl"
                          imageUrl={employee.profileImage}
                          className="h-24 w-24 border-4 border-background/70 shadow-lg"
                        />
                        {(canManage || canEditOwnPhoto) && (
                          <div>
                            <Label
                              htmlFor="profile-photo-upload"
                              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background"
                            >
                              <Camera className="h-3.5 w-3.5" />
                              {isUploadingImage ? "Uploading..." : "Change Photo"}
                            </Label>
                            <Input
                              id="profile-photo-upload"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleProfilePhotoSelect}
                              disabled={isUploadingImage || updateEmployee.isPending || updateMyProfileImage.isPending}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            Employee profile
                          </p>
                          <StatusBadge variant={getProfileStatusVariant(profileStatus)}>
                            {formatStatusLabel(profileStatus)}
                          </StatusBadge>
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {fullName || "Unknown"}
                          </h1>
                          <p className="mt-2 font-mono text-sm text-muted-foreground">
                            {employeeIdentifier}
                          </p>
                        </div>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                          Centralized view of the employee record, contact details, attendance pulse,
                          and leave position. The underlying employee data and profile fields remain unchanged.
                        </p>
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex flex-wrap gap-2">
                        <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-background/80">
                              <Pencil className="mr-2 h-4 w-4" />
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
                          className="border-danger text-danger hover:bg-danger-dim"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deleteEmployee.isPending ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {infoCards.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-border/80 bg-background/75 p-4 backdrop-blur"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-primary-dim p-2 text-primary">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {item.label}
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-foreground">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[24px] border border-border bg-background/85 p-5 backdrop-blur">
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-primary-dim/40 to-transparent" />
                  <div className="relative space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Profile controls
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-foreground">
                        Employee workspace
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Review the employee snapshot, monitor current availability, and launch
                        profile or attendance actions from one place.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {spotlightCards.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-border/70 bg-card px-4 py-3"
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-foreground">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {(canManage || canSelfTrackAttendance) && (
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Quick actions</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Attendance tools stay available without changing the profile structure.
                            </p>
                          </div>
                          <StatusBadge variant={isShiftActive ? "info" : "neutral"}>
                            {currentShiftLabel}
                          </StatusBadge>
                        </div>

                        {canSelfTrackAttendance ? (
                          <div className="mt-4 flex flex-wrap gap-2">
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
                        ) : (
                          <p className="mt-4 text-sm text-muted-foreground">
                            Attendance actions are available when the signed-in employee is viewing their own profile.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.95fr)]">
              <div className="rounded-[28px] border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Live attendance
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">Today's Attendance</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {format(new Date(), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                    <StatusBadge variant={isShiftActive ? "info" : "neutral"}>
                      {currentShiftLabel}
                    </StatusBadge>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{today}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Check In</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{todayRecord?.checkIn || "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Check Out</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{todayRecord?.checkOut || "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Working Timer</p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {formatDuration(liveWorkedSeconds)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border bg-gradient-to-br from-background to-primary-dim/10 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Attendance pulse</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Quick read on recent attendance movement across the last 30 tracked entries.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="primary">Rate {attendanceRate}%</StatusBadge>
                        <StatusBadge variant="info">{attendanceRecords.length} records</StatusBadge>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {recentAttendance.length > 0 ? (
                        recentAttendance.map((record) => (
                          <div
                            key={record.id || `${record.date}-${record.status}`}
                            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs"
                          >
                            <span className="font-medium text-foreground">{record.date}</span>
                            <span className="mx-2 text-muted-foreground">|</span>
                            <span className="text-muted-foreground">
                              {formatStatusLabel(record.status || "present")}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent attendance activity available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Employment summary
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">Role and Contact</h3>
                </div>

                <div className="space-y-4 p-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Full name</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{fullName || "Unknown"}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                      <div className="mt-2">
                        <StatusBadge variant={getProfileStatusVariant(profileStatus)}>
                          {formatStatusLabel(profileStatus)}
                        </StatusBadge>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{employeeDepartment}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Designation</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{employeeDesignation}</p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border bg-gradient-to-br from-background to-info-dim/10 p-5">
                    <p className="text-sm font-semibold text-foreground">Profile notes</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      This profile keeps the existing employee structure intact while surfacing
                      the same data in a denser, executive-style layout. Edit actions, photo updates,
                      leave balances, and attendance tracking continue to use the same underlying hooks.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Allocated leave</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{leaveTotals.allocated}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Used leave</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{leaveTotals.used}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Hours worked</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {attendanceStats.hours.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Performance snapshot
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">Attendance Metrics</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KPICard title="Present Days" value={attendanceStats.present} icon={UserCheck} />
                <KPICard title="Absent Days" value={attendanceStats.absent} icon={UserX} />
                <KPICard title="Leave Days" value={attendanceStats.leave} icon={CalendarClock} />
                <KPICard title="Hours Worked" value={attendanceStats.hours.toFixed(1)} icon={Clock3} />
              </div>
            </section>

            <section className="rounded-[28px] border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Leave intelligence
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">Leave Balance</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="info">{new Date().getFullYear()} cycle</StatusBadge>
                    <StatusBadge variant="primary">{leaveTotals.remaining} days remaining</StatusBadge>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Allocated</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{leaveTotals.allocated}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Used</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{leaveTotals.used}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Remaining</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{leaveTotals.remaining}</p>
                  </div>
                </div>

                {isLeaveBalanceLoading && (
                  <p className="text-sm text-muted-foreground">Loading leave balance...</p>
                )}
                {isLeaveBalanceError && (
                  <p className="text-sm text-danger">Unable to load leave balance.</p>
                )}
                {!isLeaveBalanceLoading && !isLeaveBalanceError && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {leaveBalanceCards.map((item) => (
                      <div
                        key={item.leaveTypeId}
                        className="rounded-[24px] border border-border bg-gradient-to-br from-background to-primary-dim/10 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{item.leaveTypeName}</h4>
                            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                              {item.leaveTypeCode || "Leave type"}
                            </p>
                          </div>
                          <StatusBadge variant="info">Balance</StatusBadge>
                        </div>
                        <p className="mt-5 text-3xl font-bold text-foreground">
                          {item.remainingDays}
                          <span className="ml-2 text-sm font-normal text-muted-foreground">days</span>
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Allocated {item.allocatedDays} | Used {item.usedDays}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Activity history
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">Recent Attendance</h3>
                  </div>
                  <StatusBadge variant="neutral">{attendanceRecords.length} rows</StatusBadge>
                </div>
              </div>

              <div className="overflow-x-auto">
                {attendanceQuery.isLoading && (
                  <p className="px-6 py-4 text-sm text-muted-foreground">Loading attendance...</p>
                )}
                {attendanceQuery.isError && (
                  <p className="px-6 py-4 text-sm text-danger">Unable to load attendance records.</p>
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
                        <TableRow
                          key={record?.id || `${record?.date || "row"}-${index}`}
                          className="hover:bg-elevated transition-colors"
                        >
                          <TableCell>{record?.date || "-"}</TableCell>
                          <TableCell>{record?.checkIn || "-"}</TableCell>
                          <TableCell>{record?.checkOut || "-"}</TableCell>
                          <TableCell>{Number(record?.workingHours || record?.hoursWorked || 0).toFixed(1)}</TableCell>
                          <TableCell>
                            <StatusBadge variant={getAttendanceStatusVariant(safeStatus)}>
                              {formatStatusLabel(safeStatus)}
                            </StatusBadge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!attendanceQuery.isLoading && !attendanceQuery.isError && attendanceRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                          No attendance records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
