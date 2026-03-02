import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks";

export default function Login() {
  const navigate = useNavigate();
  const login = useLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const apiError = login.error as AxiosError<{ error?: { message?: string } }>;
  const errorMessage =
    apiError?.response?.data?.error?.message || "Unable to sign in. Please check your credentials.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (response) => {
          const role = response.data.user.role;
          const mustChangePassword = response.data.user?.mustChangePassword;
          const redirectPath = mustChangePassword
            ? "/settings"
            : role === "employee"
            ? "/employee/dashboard"
            : "/hr/dashboard";
          navigate(redirectPath, { replace: true });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">PayrollX</h1>
          <p className="text-muted-foreground mt-2">Enterprise Payroll Management</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {login.isError && <p className="text-sm text-danger">{errorMessage}</p>}

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">© 2026 PayrollX. All rights reserved.</p>
      </div>
    </div>
  );
}
