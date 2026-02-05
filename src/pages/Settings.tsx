import { useEffect, useState } from "react";
import { Building, CalendarPlus, Save, Trash2 } from "lucide-react";
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
  useAddHoliday,
  useDeleteHoliday,
  usePublicHolidays,
  useSettings,
  useTaxSlabs,
  useUpdateSettings,
} from "@/hooks";

export default function Settings() {
  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();
  const holidaysQuery = usePublicHolidays(new Date().getFullYear());
  const addHoliday = useAddHoliday();
  const deleteHoliday = useDeleteHoliday();
  const taxSlabsQuery = useTaxSlabs("filer");

  const settings = settingsQuery.data?.data || {};
  const holidays = holidaysQuery.data?.data || [];
  const taxSlabs = taxSlabsQuery.data?.data?.slabs || [];

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");

  useEffect(() => {
    setCompanyName(String(settings.companyName || settings.company_name || "PayrollX"));
    setCompanyEmail(String(settings.companyEmail || settings.company_email || ""));
    setCompanyPhone(String(settings.companyPhone || settings.company_phone || ""));
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings.mutate({ companyName, companyEmail, companyPhone });
  };

  const handleAddHoliday = () => {
    if (!newHolidayName || !newHolidayDate) return;
    addHoliday.mutate(
      { name: newHolidayName, date: newHolidayDate },
      {
        onSuccess: () => {
          setNewHolidayName("");
          setNewHolidayDate("");
        },
      }
    );
  };

  return (
    <AppShell showSearch={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage company settings and payroll configuration</p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="company" className="gap-2"><Building className="h-4 w-4" />Company</TabsTrigger>
            <TabsTrigger value="holidays" className="gap-2"><CalendarPlus className="h-4 w-4" />Holidays</TabsTrigger>
            <TabsTrigger value="tax" className="gap-2">Tax Slabs</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="bg-background" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateSettings.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Add Public Holiday</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Holiday name" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} />
                <Input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} />
                <Button onClick={handleAddHoliday} disabled={addHoliday.isPending}>Add Holiday</Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-elevated hover:bg-elevated">
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays.map((holiday) => (
                      <TableRow key={holiday.id} className="hover:bg-elevated transition-colors">
                        <TableCell className="font-medium text-foreground">{holiday.name}</TableCell>
                        <TableCell className="text-muted-foreground">{holiday.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => deleteHoliday.mutate(holiday.id)}>
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tax">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Filer Tax Slabs</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-elevated hover:bg-elevated">
                      <TableHead>Income From (PKR)</TableHead>
                      <TableHead>Income To (PKR)</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Fixed Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxSlabs.map((slab, index) => (
                      <TableRow key={`${slab.minIncome}-${index}`} className="hover:bg-elevated transition-colors">
                        <TableCell>{Number(slab.minIncome).toLocaleString()}</TableCell>
                        <TableCell>{typeof slab.maxIncome === "number" ? slab.maxIncome.toLocaleString() : "Above"}</TableCell>
                        <TableCell>{slab.rate}</TableCell>
                        <TableCell>{Number(slab.fixedAmount).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
