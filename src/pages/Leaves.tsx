import { Plus, Check, X } from "lucide-react";
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
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setApplyModalOpen, updateLeaveStatus } from "@/store/slices/leavesSlice";
import { format } from "date-fns";

export default function Leaves() {
  const dispatch = useAppDispatch();
  const { requests, isApplyModalOpen } = useAppSelector((state) => state.leaves);
  const { employees } = useAppSelector((state) => state.employees);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const myRequests = requests;

  // Get current employee's leave balance (use first employee for demo)
  const currentEmployee = employees[0];

  const statusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "neutral";
    }
  };

  const typeVariant = (type: string) => {
    switch (type) {
      case "annual":
        return "info";
      case "sick":
        return "warning";
      case "casual":
        return "success";
      case "unpaid":
        return "neutral";
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
            <h1 className="text-2xl font-bold text-foreground">Leaves</h1>
            <p className="text-muted-foreground mt-1">
              Manage leave requests and balances
            </p>
          </div>
          <Dialog open={isApplyModalOpen} onOpenChange={(open) => dispatch(setApplyModalOpen(open))}>
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
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Enter reason for leave..." />
                </div>
                <Button className="w-full">Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Annual Leave</h4>
              <StatusBadge variant="info">Balance</StatusBadge>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {currentEmployee?.leaveBalance.annual || 0}
              <span className="text-sm font-normal text-muted-foreground ml-2">days remaining</span>
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Sick Leave</h4>
              <StatusBadge variant="warning">Balance</StatusBadge>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {currentEmployee?.leaveBalance.sick || 0}
              <span className="text-sm font-normal text-muted-foreground ml-2">days remaining</span>
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Casual Leave</h4>
              <StatusBadge variant="success">Balance</StatusBadge>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {currentEmployee?.leaveBalance.casual || 0}
              <span className="text-sm font-normal text-muted-foreground ml-2">days remaining</span>
            </p>
          </div>
        </div>

        {/* Pending Approvals (HR/Admin View) */}
        {pendingRequests.length > 0 && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-warning-dim">
              <h3 className="text-lg font-semibold text-warning-foreground">
                Pending Approvals ({pendingRequests.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-foreground">{request.employeeName}</span>
                      <StatusBadge variant={typeVariant(request.type)}>
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.startDate), "MMM d")} -{" "}
                      {format(new Date(request.endDate), "MMM d, yyyy")} ({request.days} days)
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dispatch(updateLeaveStatus({ id: request.id, status: "approved" }))}
                      className="text-success border-success hover:bg-success-dim"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dispatch(updateLeaveStatus({ id: request.id, status: "rejected" }))}
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

        {/* My Leave Requests */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Leave History</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated hover:bg-elevated">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Employee
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Duration
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Days
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-elevated transition-colors">
                    <TableCell className="font-medium text-foreground">
                      {request.employeeName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={typeVariant(request.type)}>
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(request.startDate), "MMM d")} -{" "}
                      {format(new Date(request.endDate), "MMM d")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{request.days}</TableCell>
                    <TableCell>
                      <StatusBadge variant={statusVariant(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
