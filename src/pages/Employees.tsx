import { useState, type ChangeEvent } from "react";
import type { AxiosError } from "axios";
import { Search, Eye, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  toast,
  useCreateEmployee,
  useEmployees,
  useEmployeesByDepartment,
  useUploadProfilePhoto,
  type CreateEmployeeData,
} from "@/hooks";

type ApiErrorResponse = {
  error?: {
    message?: string;
    details?: Array<{ message?: string }>;
  };
};

type WizardStep = "basic" | "job" | "salary" | "attendance" | "legal";
const STEP_ORDER: WizardStep[] = ["basic", "job", "salary", "attendance", "legal"];
const STEP_LABELS: Record<WizardStep, string> = {
  basic: "Basic Info",
  job: "Job Details",
  salary: "Salary Details",
  attendance: "Attendance & Leave",
  legal: "Legal & ID",
};

const DEFAULT_FORM_DATA: CreateEmployeeData = {
  basicInfo: {
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    maritalStatus: "single",
    nationality: "",
    profileImage: "",
    residentialAddress: "",
  },
  jobDetails: {
    departmentId: "",
    jobTitle: "",
    employmentType: "full_time",
    joiningDate: "",
    probationPeriodMonths: 3,
    workLocation: "",
    reportingManagerId: "",
  },
  salaryDetails: {
    basicSalary: 0,
    allowances: {
      hra: 0,
      travel: 0,
      medical: 0,
      utility: 0,
      other: 0,
    },
    bonus: 0,
    overtimeRate: 0,
    taxInformation: "",
    providentFundEmployee: 0,
    providentFundEmployer: 0,
    bankAccountNumber: "",
    bankName: "",
    bankRoutingCode: "",
    paymentMethod: "bank_transfer",
  },
  legalInfo: {
    legalIdType: "cnic",
    legalIdNumber: "",
    taxIdentifier: "",
  },
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const apiError = axiosError.response?.data?.error;
  const detailMessage = apiError?.details?.find((detail) => detail?.message)?.message;
  return detailMessage || apiError?.message || fallback;
};

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

export default function Employees() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>("basic");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<CreateEmployeeData>(DEFAULT_FORM_DATA);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);

  const filters = {
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
    department: departmentFilter === "all" ? undefined : departmentFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const employeesQuery = useEmployees(filters);
  const departmentsQuery = useEmployeesByDepartment();
  const managersQuery = useEmployees({ page: 1, limit: 200, status: "active" }, isCreateModalOpen);
  const createEmployee = useCreateEmployee();
  const uploadProfilePhoto = useUploadProfilePhoto();

  const employees = Array.isArray(employeesQuery.data?.data) ? employeesQuery.data.data : [];
  const managers = Array.isArray(managersQuery.data?.data) ? managersQuery.data.data : [];
  const meta = employeesQuery.data?.meta;
  const departments = Array.isArray(departmentsQuery.data?.data) ? departmentsQuery.data.data : [];
  const totalPages = meta?.totalPages || 1;
  const currentStepIndex = STEP_ORDER.indexOf(step);

  const resetWizard = () => {
    setStep("basic");
    setCreatedCredentials(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const validateStep = (targetStep: WizardStep): string | null => {
    if (targetStep === "attendance") return null;

    if (targetStep === "basic") {
      const info = formData.basicInfo;
      if (!info.fullName.trim()) return "Full Name is required";
      if (!info.email.trim()) return "Email Address is required";
      if (!info.phone.trim()) return "Phone Number is required";
      if (!info.dateOfBirth) return "Date of Birth is required";
      if (!info.nationality.trim()) return "Nationality is required";
      if (!info.profileImage.trim()) return "Profile Photo is required";
      if (!info.residentialAddress.trim()) return "Residential Address is required";
    }

    if (targetStep === "job") {
      const info = formData.jobDetails;
      if (!info.departmentId) return "Department is required";
      if (!info.jobTitle.trim()) return "Job Title is required";
      if (!info.joiningDate) return "Date of Joining is required";
      if (!info.workLocation.trim()) return "Work Location is required";
      if (!info.reportingManagerId) return "Reporting Manager is required";
    }

    if (targetStep === "salary") {
      const info = formData.salaryDetails;
      if (!info.taxInformation.trim()) return "Tax Information is required";
      if (!info.bankAccountNumber.trim()) return "Bank Account Number is required";
      if (!info.bankName.trim()) return "Bank Name is required";
      if (!info.bankRoutingCode.trim()) return "IFSC / Routing Code is required";
    }

    if (targetStep === "legal") {
      const info = formData.legalInfo;
      if (!info.legalIdNumber.trim()) return "Legal ID Number is required";
      if (!info.taxIdentifier.trim()) return "Tax Identifier is required";
      if (info.legalIdType === "cnic" && !/^\d{5}-\d{7}-\d$/.test(info.legalIdNumber.trim())) {
        return "CNIC format must be XXXXX-XXXXXXX-X";
      }
    }

    return null;
  };

  const goNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      toast({ title: "Validation failed", description: validationError, variant: "destructive" });
      return;
    }
    const nextStep = STEP_ORDER[currentStepIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const goBack = () => {
    const previousStep = STEP_ORDER[Math.max(currentStepIndex - 1, 0)];
    setStep(previousStep);
  };

  const handleCreateEmployee = () => {
    for (const wizardStep of ["basic", "job", "salary", "legal"] as WizardStep[]) {
      const validationError = validateStep(wizardStep);
      if (validationError) {
        setStep(wizardStep);
        toast({ title: "Validation failed", description: validationError, variant: "destructive" });
        return;
      }
    }

    createEmployee.mutate(formData, {
      onSuccess: (response) => {
        setCreatedCredentials(response.data?.loginCredentials || null);
        setFormData(DEFAULT_FORM_DATA);
        setStep("basic");
      },
      onError: (error) => {
        toast({
          title: "Create employee failed",
          description: getApiErrorMessage(error, "Unable to create employee."),
          variant: "destructive",
        });
      },
    });
  };

  const handleProfilePhotoSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({ title: "Unsupported file type", description: "Use JPEG, PNG, or WEBP.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be 2MB or less.", variant: "destructive" });
      return;
    }

    try {
      const base64 = await toBase64(file);
      const response = await uploadProfilePhoto.mutateAsync({
        fileName: file.name.replace(/\.[^/.]+$/, ""),
        contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
        data: base64,
      });
      setFormData((prev) => ({
        ...prev,
        basicInfo: { ...prev.basicInfo, profileImage: response.data.url },
      }));
    } catch (error) {
      toast({
        title: "Upload failed",
        description: getApiErrorMessage(error, "Unable to upload photo."),
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage your workforce ({meta?.total || employees.length} total)</p>
          </div>
          <Dialog
            open={isCreateModalOpen}
            onOpenChange={(open) => {
              setCreateModalOpen(open);
              if (!open) resetWizard();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap gap-2">
                {STEP_ORDER.map((wizardStep, index) => (
                  <Button
                    key={wizardStep}
                    variant={wizardStep === step ? "default" : "outline"}
                    size="sm"
                    type="button"
                    onClick={() => setStep(wizardStep)}
                  >
                    {index + 1}. {STEP_LABELS[wizardStep]}
                  </Button>
                ))}
              </div>

              {step === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={formData.basicInfo.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, fullName: e.target.value } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input type="email" value={formData.basicInfo.email} onChange={(e) => setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, email: e.target.value } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input value={formData.basicInfo.phone} onChange={(e) => setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, phone: e.target.value } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={formData.basicInfo.dateOfBirth} onChange={(e) => setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, dateOfBirth: e.target.value } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={formData.basicInfo.gender} onValueChange={(value: "male" | "female" | "other") => setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, gender: value } }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Marital Status</Label>
                      <Select value={formData.basicInfo.maritalStatus} onValueChange={(value: "single" | "married" | "divorced" | "widowed") => setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, maritalStatus: value } }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nationality</Label>
                      <Input value={formData.basicInfo.nationality} onChange={(e) => setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, nationality: e.target.value } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Profile Photo</Label>
                      <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePhotoSelect} />
                      <p className="text-xs text-muted-foreground">{formData.basicInfo.profileImage || "Upload required"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Residential Address</Label>
                    <Textarea value={formData.basicInfo.residentialAddress} onChange={(e) => setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, residentialAddress: e.target.value } }))} />
                  </div>
                </div>
              )}

              {step === "job" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Employee ID is auto-generated on submit.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={formData.jobDetails.departmentId} onValueChange={(value) => setFormData((prev) => ({ ...prev, jobDetails: { ...prev.jobDetails, departmentId: value } }))}>
                        <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title / Designation</Label>
                      <Input value={formData.jobDetails.jobTitle} onChange={(e) => setFormData((prev) => ({ ...prev, jobDetails: { ...prev.jobDetails, jobTitle: e.target.value } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Employment Type</Label>
                      <Select value={formData.jobDetails.employmentType} onValueChange={(value: "full_time" | "part_time" | "contract" | "intern") => setFormData((prev) => ({ ...prev, jobDetails: { ...prev.jobDetails, employmentType: value } }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full-time</SelectItem>
                          <SelectItem value="part_time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Joining</Label>
                      <Input type="date" value={formData.jobDetails.joiningDate} onChange={(e) => setFormData((prev) => ({ ...prev, jobDetails: { ...prev.jobDetails, joiningDate: e.target.value } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Probation Period (Months)</Label>
                      <Input type="number" min={0} max={24} value={formData.jobDetails.probationPeriodMonths} onChange={(e) => setFormData((prev) => ({ ...prev, jobDetails: { ...prev.jobDetails, probationPeriodMonths: Number(e.target.value) || 0 } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Work Location</Label>
                      <Input value={formData.jobDetails.workLocation} onChange={(e) => setFormData((prev) => ({ ...prev, jobDetails: { ...prev.jobDetails, workLocation: e.target.value } }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Reporting Manager</Label>
                      <Select value={formData.jobDetails.reportingManagerId} onValueChange={(value) => setFormData((prev) => ({ ...prev, jobDetails: { ...prev.jobDetails, reportingManagerId: value } }))}>
                        <SelectTrigger><SelectValue placeholder="Reporting Manager" /></SelectTrigger>
                        <SelectContent>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>{manager.fullName || `${manager.firstName} ${manager.lastName}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {step === "salary" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Basic Salary</Label><Input type="number" value={formData.salaryDetails.basicSalary} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, basicSalary: Number(e.target.value) || 0 } }))} /></div>
                  <div className="space-y-2"><Label>Bonus</Label><Input type="number" value={formData.salaryDetails.bonus} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, bonus: Number(e.target.value) || 0 } }))} /></div>
                  <div className="space-y-2"><Label>HRA</Label><Input type="number" value={formData.salaryDetails.allowances.hra} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, allowances: { ...prev.salaryDetails.allowances, hra: Number(e.target.value) || 0 } } }))} /></div>
                  <div className="space-y-2"><Label>Travel</Label><Input type="number" value={formData.salaryDetails.allowances.travel} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, allowances: { ...prev.salaryDetails.allowances, travel: Number(e.target.value) || 0 } } }))} /></div>
                  <div className="space-y-2"><Label>Medical</Label><Input type="number" value={formData.salaryDetails.allowances.medical} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, allowances: { ...prev.salaryDetails.allowances, medical: Number(e.target.value) || 0 } } }))} /></div>
                  <div className="space-y-2"><Label>Overtime Rate</Label><Input type="number" value={formData.salaryDetails.overtimeRate} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, overtimeRate: Number(e.target.value) || 0 } }))} /></div>
                  <div className="space-y-2">
                    <Label>PF (Employee Deduction)</Label>
                    <Input type="number" value={formData.salaryDetails.providentFundEmployee} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, providentFundEmployee: Number(e.target.value) || 0 } }))} />
                    <p className="text-xs text-muted-foreground">This amount is deducted from employee salary.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>PF (Employer Contribution)</Label>
                    <Input type="number" value={formData.salaryDetails.providentFundEmployer} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, providentFundEmployer: Number(e.target.value) || 0 } }))} />
                    <p className="text-xs text-muted-foreground">This amount is paid by company, not deducted from employee salary.</p>
                  </div>
                  <div className="space-y-2"><Label>Bank Account</Label><Input value={formData.salaryDetails.bankAccountNumber} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, bankAccountNumber: e.target.value } }))} /></div>
                  <div className="space-y-2"><Label>Bank Name</Label><Input value={formData.salaryDetails.bankName} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, bankName: e.target.value } }))} /></div>
                  <div className="space-y-2"><Label>IFSC / Routing Code</Label><Input value={formData.salaryDetails.bankRoutingCode} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, bankRoutingCode: e.target.value } }))} /></div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={formData.salaryDetails.paymentMethod} onValueChange={(value: "bank_transfer" | "check") => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, paymentMethod: value } }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tax Information</Label>
                    <Textarea value={formData.salaryDetails.taxInformation} onChange={(e) => setFormData((prev) => ({ ...prev, salaryDetails: { ...prev.salaryDetails, taxInformation: e.target.value } }))} />
                  </div>
                </div>
              )}

              {step === "attendance" && (
                <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Attendance fields are computed after onboarding: Leave Balance, Sick Leave, Casual Leave, Paid Leave, Attendance Records, and Overtime Hours.
                </div>
              )}

              {step === "legal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Legal ID Type</Label>
                    <Select value={formData.legalInfo.legalIdType} onValueChange={(value: "cnic" | "passport" | "national_id" | "other") => setFormData((prev) => ({ ...prev, legalInfo: { ...prev.legalInfo, legalIdType: value } }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cnic">CNIC</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Legal ID Number</Label>
                    <Input value={formData.legalInfo.legalIdNumber} onChange={(e) => setFormData((prev) => ({ ...prev, legalInfo: { ...prev.legalInfo, legalIdNumber: e.target.value } }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tax Identifier</Label>
                    <Input value={formData.legalInfo.taxIdentifier} onChange={(e) => setFormData((prev) => ({ ...prev, legalInfo: { ...prev.legalInfo, taxIdentifier: e.target.value } }))} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <Button variant="outline" type="button" onClick={goBack} disabled={currentStepIndex === 0}>Back</Button>
                {step === "legal" ? (
                  <Button type="button" onClick={handleCreateEmployee} disabled={createEmployee.isPending}>
                    {createEmployee.isPending ? "Creating..." : "Create Employee"}
                  </Button>
                ) : (
                  <Button type="button" onClick={goNext}>Next</Button>
                )}
              </div>

              {createdCredentials && (
                <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm">
                  <p className="font-semibold text-foreground">Login account created</p>
                  <p className="text-muted-foreground mt-1">Email: <span className="font-mono text-foreground">{createdCredentials.email}</span></p>
                  <p className="text-muted-foreground">Temporary Password: <span className="font-mono text-foreground">{createdCredentials.temporaryPassword}</span></p>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
