import { useMemo, useState } from "react";
import { Plus, Check, X } from "lucide-react";
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
  useApproveLeave,
  useCreateLeave,
  useCurrentUser,
  useEmployees,
  useLeaveBalance,
  useLeaves,
  useLeaveTypes,
  useRejectLeave,
} from "@/hooks";

const statusVariant = (status: string) => {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "danger";
  return "neutral";
};

export default function Leaves() {
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const userQuery = useCurrentUser();
  const leavesQuery = useLeaves({ limit: 50, page: 1 });
  const leaveTypesQuery = useLeaveTypes();
  const createLeave = useCreateLeave();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const currentUser = userQuery.data;
  const isHR = currentUser?.role === "hr" || currentUser?.role === "admin";
  const employeesQuery = useEmployees({ limit: 100, page: 1 }, isHR);
  const selectedEmployeeId = employeeId || currentUser?.employee?.id;

  const leaveBalanceQuery = useLeaveBalance(selectedEmployeeId || "", new Date().getFullYear());

  const requests = leavesQuery.data?.data || [];
  const leaveTypes = leaveTypesQuery.data?.data || [];
  const leaveBalance = leaveBalanceQuery.data?.data || [];
  const employees = employeesQuery.data?.data || [];

  const pendingRequests = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);

  const handleSubmit = () => {
    if (!leaveTypeId || !startDate || !endDate || !reason) return;

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

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leaves</h1>
            <p className="text-muted-foreground mt-1">Manage leave requests and balances</p>
          </div>

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
                {isHR && (
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

        {isHR && pendingRequests.length > 0 && (
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
                      onClick={() => rejectLeave.mutate({ id: request.id, reason: "Rejected by reviewer" })}
                      className="text-danger border-danger hover:bg-danger-dim"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
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
