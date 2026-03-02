import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  ProtectedRoute,
  RedirectIfAuthenticated,
  RoleHomeRedirect,
} from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import Payslips from "./pages/Payslips";
import AIInsights from "./pages/AIInsights";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import HrDashboard from "./pages/HrDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeAIInsights from "./pages/EmployeeAIInsights";
import MyProfile from "./pages/MyProfile";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <Login />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleHomeRedirect />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hr/dashboard"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <HrDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/employees"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/employees/:id"
              element={
                <ProtectedRoute>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <ProtectedRoute>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/attendance"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/leaves"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaves"
              element={
                <ProtectedRoute>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/payroll"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/payslips"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <Payslips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payslips"
              element={
                <ProtectedRoute>
                  <Payslips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/ai-insights"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <AIInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-insights"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <AIInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/settings"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/attendance"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/leaves"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/payslips"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <Payslips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/ai-insights"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeAIInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <MyProfile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
