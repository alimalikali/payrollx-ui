import { Building, Users, Cog, Save } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarInitials } from "@/components/AvatarInitials";

const users = [
  { id: "1", name: "Admin User", email: "admin@payrollx.com", role: "Admin", status: "active" },
  { id: "2", name: "Sara Ahmed", email: "sara@payrollx.com", role: "HR Manager", status: "active" },
  { id: "3", name: "Zohaib Farhan", email: "zohaib@payrollx.com", role: "Employee", status: "active" },
];

const taxSlabs = [
  { from: 0, to: 600000, rate: "0%" },
  { from: 600001, to: 1200000, rate: "2.5%" },
  { from: 1200001, to: 2400000, rate: "12.5%" },
  { from: 2400001, to: 3600000, rate: "22.5%" },
  { from: 3600001, to: 6000000, rate: "27.5%" },
  { from: 6000001, to: null, rate: "35%" },
];

export default function Settings() {
  return (
    <AppShell showSearch={false}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your company settings and configurations
          </p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="company" className="gap-2">
              <Building className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Cog className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="PayrollX Technologies" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input defaultValue="PKR-2024-12345" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue="info@payrollx.com" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue="+92 42 1234567" className="bg-background" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input
                    defaultValue="123 Business Park, Gulberg III, Lahore, Pakistan"
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  User Management
                </h3>
                <Button size="sm">Add User</Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-elevated hover:bg-elevated">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        User
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Role
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-elevated transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <AvatarInitials name={user.name} size="sm" />
                            <div>
                              <p className="font-medium text-foreground">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select defaultValue={user.role.toLowerCase().replace(" ", "-")}>
                            <SelectTrigger className="w-32 h-8 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="hr-manager">HR Manager</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            variant={user.status === "active" ? "success" : "neutral"}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* System Configuration */}
          <TabsContent value="system" className="space-y-6">
            {/* Tax Slabs */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                  Tax Slab Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pakistan Income Tax Slabs (FY 2024-25)
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-elevated hover:bg-elevated">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Income From (PKR)
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Income To (PKR)
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tax Rate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxSlabs.map((slab, index) => (
                      <TableRow key={index} className="hover:bg-elevated transition-colors">
                        <TableCell className="text-foreground">
                          {slab.from.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {slab.to ? slab.to.toLocaleString() : "Above"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge variant="primary">{slab.rate}</StatusBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Other Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Payroll Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Working Days</Label>
                  <Select defaultValue="mon-sat">
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mon-fri">Monday - Friday</SelectItem>
                      <SelectItem value="mon-sat">Monday - Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Overtime Threshold (hours/day)</Label>
                  <Input type="number" defaultValue="8" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>EOBI Rate (%)</Label>
                  <Input type="number" defaultValue="5" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>SESSI Rate (%)</Label>
                  <Input type="number" defaultValue="0.5" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Grace Period (minutes)</Label>
                  <Input type="number" defaultValue="15" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="pkr">
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pkr">PKR - Pakistani Rupee</SelectItem>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
