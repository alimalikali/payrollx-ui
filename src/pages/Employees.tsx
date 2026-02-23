import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
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
import { AvatarInitials } from "@/components/AvatarInitials";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { useEmployees, useEmployeesByDepartment } from "@/hooks";

export default function Employees() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filters = {
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
    department: departmentFilter === "all" ? undefined : departmentFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const employeesQuery = useEmployees(filters);
  const departmentsQuery = useEmployeesByDepartment();

  const employees = Array.isArray(employeesQuery.data?.data) ? employeesQuery.data.data : [];
  const meta = employeesQuery.data?.meta;
  const departments = Array.isArray(departmentsQuery.data?.data) ? departmentsQuery.data.data : [];
  const totalPages = meta?.totalPages || 1;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage your workforce ({meta?.total || employees.length} total)</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or email..."
              value={searchQuery}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchQuery(e.target.value);
              }}
              className="pl-10 bg-background"
            />
          </div>

          <Select
            value={departmentFilter}
            onValueChange={(value) => {
              setCurrentPage(1);
              setDepartmentFilter(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-48 bg-background">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setCurrentPage(1);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-36 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(employeesQuery.isLoading || departmentsQuery.isLoading) && (
          <p className="text-sm text-muted-foreground">Loading employees...</p>
        )}

        {employeesQuery.isError && <p className="text-sm text-danger">Unable to load employees.</p>}

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated hover:bg-elevated">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employee</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Designation</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee, index) => {
                  const fullName = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
                  const status = typeof employee.status === "string" ? employee.status : "inactive";
                  const employeeRouteId = employee.id || employee.employeeId || employee.code;
                  const encodedRouteId = employeeRouteId ? encodeURIComponent(String(employeeRouteId)) : null;
                  const rowKey = employee.id || employee.employeeId || employee.code || `employee-${index}`;

                  return (
                    <TableRow key={rowKey} className="hover:bg-elevated transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarInitials name={fullName || "Unknown"} size="sm" />
                          <div>
                            <p className="font-medium text-foreground">{fullName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground font-mono">{employee.employeeId || employee.code || "N/A"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{employee.departmentName || employee.department || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{employee.designation || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge variant={status === "active" ? "success" : status === "on_leave" ? "warning" : "neutral"}>
                          {String(status).replace("_", " ")}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => encodedRouteId && navigate(`/hr/employees/${encodedRouteId}`)}
                          disabled={!encodedRouteId}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!employeesQuery.isLoading && employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
