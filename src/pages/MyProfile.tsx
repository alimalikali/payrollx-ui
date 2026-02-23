import { AppShell } from "@/components/layout/AppShell";
import { useCurrentUser, useEmployee } from "@/hooks";
import { AvatarInitials } from "@/components/AvatarInitials";
import { StatusBadge } from "@/components/StatusBadge";

export default function MyProfile() {
  const currentUserQuery = useCurrentUser();
  const employeeId = currentUserQuery.data?.employee?.id || "";
  const employeeQuery = useEmployee(employeeId);
  const employee = employeeQuery.data?.data;
  const fullName = employee?.name || `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Your employment and contact information.</p>
        </div>

        {employeeQuery.isLoading && <p className="text-sm text-muted-foreground">Loading profile...</p>}
        {employeeQuery.isError && <p className="text-sm text-danger">Unable to load your profile.</p>}

        {employee && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AvatarInitials name={fullName || "Unknown"} size="lg" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{fullName || "Unknown"}</h2>
                  <p className="text-sm text-muted-foreground font-mono">{employee.employeeId}</p>
                </div>
              </div>
              <StatusBadge variant={employee.status === "active" ? "success" : "warning"}>
                {employee.status?.replace("_", " ")}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{employee.email || "-"}</span></div>
              <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{employee.phone || "-"}</span></div>
              <div><span className="text-muted-foreground">Department:</span> <span className="font-medium">{employee.departmentName || "-"}</span></div>
              <div><span className="text-muted-foreground">Designation:</span> <span className="font-medium">{employee.designation || "-"}</span></div>
              <div><span className="text-muted-foreground">Joining Date:</span> <span className="font-medium">{employee.joiningDate || "-"}</span></div>
              <div><span className="text-muted-foreground">Employment Type:</span> <span className="font-medium">{employee.employmentType || "-"}</span></div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
