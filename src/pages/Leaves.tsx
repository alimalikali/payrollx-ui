import { useMemo, useState } from "react";
import { Ban, Check, Plus, SlidersHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import {
  useAllocateLeave,
  useApproveLeave,
  useCancelLeave,
  useCreateLeave,
  useCurrentUser,
  useEmployees,
  useLeaveBalance,
  useLeaves,
  useLeaveTypes,
  useMyEmployee,
  useRejectLeave,
} from "@/hooks";
import { isHR } from "@/lib/permissions";

const statusVariant = (status: string) => {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "danger";
  if (status === "cancelled") return "neutral";
  return "neutral";
};

export default function Leaves() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateEmployeeId, setAllocateEmployeeId] = useState("");
  const [allocateLeaveTypeId, setAllocateLeaveTypeId] = useState("");
  const [allocatedDays, setAllocatedDays] = useState("");
  const [carryForwardDays, setCarryForwardDays] = useState("0");
  const [allocateYear, setAllocateYear] = useState(String(new Date().getFullYear()));
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const userQuery = useCurrentUser();
  const currentUser = userQuery.data;
  const isHRUser = isHR(currentUser);
  const isEmployeeUser = currentUser?.role === "employee";
  const myEmployeeQuery = useMyEmployee(isEmployeeUser);
  const currentEmployeeId = currentUser?.employee?.id || myEmployeeQuery.data?.data?.id || "";

  const leavesQuery = useLeaves({
    limit: 50,
    page: 1,
    employeeId: !isHRUser && currentEmployeeId ? currentEmployeeId : undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const leaveTypesQuery = useLeaveTypes();
  const employeesQuery = useEmployees({ limit: 100, page: 1 }, isHRUser);
  const createLeave = useCreateLeave();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const cancelLeave = useCancelLeave();
  const allocateLeave = useAllocateLeave();

  const selectedEmployeeId = isHRUser ? employeeId : currentEmployeeId;
  const leaveBalanceQuery = useLeaveBalance(
    selectedEmployeeId || "",
    new Date().getFullYear()
  );

  const requests = useMemo(() => leavesQuery.data?.data ?? [], [leavesQuery.data]);
  const leaveTypes = useMemo(() => leaveTypesQuery.data?.data ?? [], [leaveTypesQuery.data]);
  const leaveBalance = useMemo(() => leaveBalanceQuery.data?.data ?? [], [leaveBalanceQuery.data]);
  const employees = useMemo(() => employeesQuery.data?.data ?? [], [employeesQuery.data]);
  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests]
  );

  const canCancelRequest = (request: { employeeId: string; status: string }) => {
    const isOwner = request.employeeId === currentEmployeeId;
    return (isOwner || isHRUser) && ["pending", "approved"].includes(request.status);
  };

  const handleSubmit = () => {
    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return;
    }
    if (isHRUser && !selectedEmployeeId) {
      return;
    }

    createLeave.mutate(
      {
        leaveTypeId,
        startDate,
        endDate,
        reason,
        employeeId: selectedEmployeeId,
      },
      {
        onSuccess: () => {
          setApplyModalOpen(false);
          setLeaveTypeId("");
          setStartDate("");
          setEndDate("");
          setReason("");
        },
      }
    );
  };

  const openRejectDialog = (id: string) => {
    setRejectRequestId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectRequestId || !rejectReason.trim()) {
      return;
    }

    rejectLeave.mutate(
      { id: rejectRequestId, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectRequestId("");
          setRejectReason("");
        },
      }
    );
  };

  const handleAllocateSubmit = () => {
    const parsedYear = parseInt(allocateYear, 10);
    const parsedAllocatedDays = parseFloat(allocatedDays);
    const parsedCarryForward = parseFloat(carryForwardDays || "0");

    if (!allocateEmployeeId || !allocateLeaveTypeId) {
      return;
    }
    if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedAllocatedDays)) {
      return;
    }

    allocateLeave.mutate(
      {
        employeeId: allocateEmployeeId,
        leaveTypeId: allocateLeaveTypeId,
        year: parsedYear,
        allocatedDays: parsedAllocatedDays,
        carriedForwardDays: Number.isFinite(parsedCarryForward) ? parsedCarryForward : 0,
      },
      {
        onSuccess: () => {
          setAllocateModalOpen(false);
          setAllocateEmployeeId("");
          setAllocateLeaveTypeId("");
          setAllocatedDays("");
          setCarryForwardDays("0");
          setAllocateYear(String(new Date().getFullYear()));
        },
      }
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leaves</h1>
            <p className="text-muted-foreground mt-1">Manage leave requests and balances</p>
          </div>

          <div className="flex gap-2">
            {isHRUser && (
              <Dialog open={isAllocateModalOpen} onOpenChange={setAllocateModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Allocate Leave
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Allocate Leave Balance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Employee</Label>
                      <Select value={allocateEmployeeId} onValueChange={setAllocateEmployeeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {(employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim()) || "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Leave Type</Label>
                      <Select value={allocateLeaveTypeId} onValueChange={setAllocateLeaveTypeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input type="number" value={allocateYear} onChange={(e) => setAllocateYear(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Allocated</Label>
                        <Input type="number" step="0.5" value={allocatedDays} onChange={(e) => setAllocatedDays(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Carry Fwd</Label>
                        <Input type="number" step="0.5" value={carryForwardDays} onChange={(e) => setCarryForwardDays(e.target.value)} />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleAllocateSubmit} disabled={allocateLeave.isPending}>
                      {allocateLeave.isPending ? "Allocating..." : "Save Allocation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={isApplyModalOpen} onOpenChange={setApplyModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {isHRUser && (
                    <div className="space-y-2">
                      <Label>Employee</Label>
                      <Select value={employeeId} onValueChange={setEmployeeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {(employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim()) || "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Leave Type</Label>
                    <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for leave..." />
                  </div>

                  <Button className="w-full" onClick={handleSubmit} disabled={createLeave.isPending}>
                    {createLeave.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {leavesQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Loading leave requests...</p>
        )}

        {leavesQuery.isError && (
          <p className="text-sm text-danger">Unable to load leave requests.</p>
        )}

        {selectedEmployeeId && leaveBalanceQuery.isError && (
          <p className="text-sm text-danger">Unable to load leave balance.</p>
        )}

        {selectedEmployeeId && leaveBalanceQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Loading leave balance...</p>
        )}

        {selectedEmployeeId && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {leaveBalance.map((item) => (
              <div key={item.leaveTypeId} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">{item.leaveTypeName}</h4>
                  <StatusBadge variant="info">Balance</StatusBadge>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {item.remainingDays}
                  <span className="text-sm font-normal text-muted-foreground ml-2">days remaining</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {isHRUser && pendingRequests.length > 0 && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-warning-dim">
              <h3 className="text-lg font-semibold text-warning-foreground">Pending Approvals ({pendingRequests.length})</h3>
            </div>
            <div className="divide-y divide-border">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-foreground">{request.employeeName}</span>
                      <StatusBadge variant="info">{request.leaveTypeName || request.type}</StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d, yyyy")} ({request.totalDays || request.days} days)
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveLeave.mutate(request.id)}
                      className="text-success border-success hover:bg-success-dim"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRejectDialog(request.id)}
                      className="text-danger border-danger hover:bg-danger-dim"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelLeave.mutate(request.id)}
                      disabled={cancelLeave.isPending}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Leave History</h3>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated hover:bg-elevated">
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-elevated transition-colors">
                    <TableCell className="font-medium text-foreground">{request.employeeName}</TableCell>
                    <TableCell>
                      <StatusBadge variant="info">{request.leaveTypeName || request.type}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{request.totalDays || request.days}</TableCell>
                    <TableCell>
                      <StatusBadge variant={statusVariant(request.status)}>{request.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isHRUser && request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveLeave.mutate(request.id)}
                              className="text-success border-success hover:bg-success-dim"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRejectDialog(request.id)}
                              className="text-danger border-danger hover:bg-danger-dim"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {canCancelRequest(request) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelLeave.mutate(request.id)}
                            disabled={cancelLeave.isPending}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!leavesQuery.isLoading && requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                      No leave requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide reason for rejection..."
              />
            </div>
            <Button className="w-full" onClick={handleRejectSubmit} disabled={rejectLeave.isPending || !rejectReason.trim()}>
              {rejectLeave.isPending ? "Submitting..." : "Reject Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
