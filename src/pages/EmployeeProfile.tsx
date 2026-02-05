import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, Hash, Building, Briefcase } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarInitials } from "@/components/AvatarInitials";
import { StatusBadge } from "@/components/StatusBadge";
import { AttendanceHeatmap } from "@/components/AttendanceHeatmap";
import { KPICard } from "@/components/KPICard";
import { useAppSelector } from "@/store/hooks";
import { format } from "date-fns";
import { Users, Clock, DollarSign, Calendar as CalendarIcon } from "lucide-react";

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees } = useAppSelector((state) => state.employees);
  const { records } = useAppSelector((state) => state.attendance);

  const employee = employees.find((e) => e.id === id);

  if (!employee) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground">Employee not found</h2>
          <Button className="mt-4" onClick={() => navigate("/employees")}>
            Back to Employees
          </Button>
        </div>
      </AppShell>
    );
  }

  const employeeAttendance = records
    .filter((r) => r.employeeId === employee.id)
    .map((r) => ({ date: r.date, status: r.status }));

  const presentDays = employeeAttendance.filter((a) => a.status === "present").length;
  const lateDays = employeeAttendance.filter((a) => a.status === "late").length;
  const absentDays = employeeAttendance.filter((a) => a.status === "absent").length;

  const totalSalary =
    employee.salary.basic +
    employee.salary.hra +
    employee.salary.transport +
    employee.salary.medical +
    employee.salary.overtime;

  return (
    <AppShell showSearch={false}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/employees")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>

        {/* Header Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <AvatarInitials name={employee.name} size="xl" />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{employee.name}</h1>
                <StatusBadge variant={employee.status === "active" ? "success" : "neutral"}>
                  {employee.status === "active" ? "Active" : "Inactive"}
                </StatusBadge>
              </div>
              <p className="text-lg text-muted-foreground">{employee.designation}</p>
              <p className="text-muted-foreground">{employee.department} Department</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {format(new Date(employee.joinedDate), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-mono">{employee.code}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="salary">Salary Structure</TabsTrigger>
            <TabsTrigger value="leaves">Leave Balance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Present Days"
                value={presentDays}
                icon={Users}
              />
              <KPICard
                title="Late Days"
                value={lateDays}
                icon={Clock}
              />
              <KPICard
                title="Total Salary"
                value={`${(totalSalary / 1000).toFixed(0)}K`}
                prefix="PKR"
                icon={DollarSign}
              />
              <KPICard
                title="Leave Balance"
                value={employee.leaveBalance.annual + employee.leaveBalance.sick + employee.leaveBalance.casual}
                icon={CalendarIcon}
              />
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Attendance</h3>
              <AttendanceHeatmap data={employeeAttendance} size="md" />
            </div>
          </TabsContent>

          {/* Salary Tab */}
          <TabsContent value="salary">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Salary Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-medium text-foreground">
                    PKR {employee.salary.basic.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">House Rent Allowance (HRA)</span>
                  <span className="font-medium text-foreground">
                    PKR {employee.salary.hra.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Transport Allowance</span>
                  <span className="font-medium text-foreground">
                    PKR {employee.salary.transport.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Medical Allowance</span>
                  <span className="font-medium text-foreground">
                    PKR {employee.salary.medical.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Overtime</span>
                  <span className="font-medium text-foreground">
                    PKR {employee.salary.overtime.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-elevated rounded-lg px-4 -mx-4">
                  <span className="font-semibold text-foreground">Gross Salary</span>
                  <span className="font-bold text-primary">
                    PKR {totalSalary.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value="leaves">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Annual Leave</h4>
                  <StatusBadge variant="info">Available</StatusBadge>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {employee.leaveBalance.annual}
                  <span className="text-sm font-normal text-muted-foreground ml-2">days</span>
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Sick Leave</h4>
                  <StatusBadge variant="warning">Available</StatusBadge>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {employee.leaveBalance.sick}
                  <span className="text-sm font-normal text-muted-foreground ml-2">days</span>
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Casual Leave</h4>
                  <StatusBadge variant="success">Available</StatusBadge>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {employee.leaveBalance.casual}
                  <span className="text-sm font-normal text-muted-foreground ml-2">days</span>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
