import createApiCall, { POST } from "@/components/api/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
// Explicitly import React if not already
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginUser = createApiCall("auth/login", POST);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser({
        body: {
          email,
          password,
        },
      });
      toast.success("Successfully logged in!");
      const appData = JSON.parse(localStorage.getItem("appData") || "{}");
      appData.token = response.access_token;
      appData.refreshToken = response.refresh_token;
      localStorage.setItem("appData", JSON.stringify(appData));
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === "object" && "detail" in err) {
        setError((err as { detail?: string }).detail || "Login failed.");
      } else {
        setError("Login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        <div className="flex items-center justify-center">
          <img
            src="/optiextract_logo.png"
            alt="OptiExtract Logo"
            width={32}
            height={32}
            className="h-8 w-8 mr-1"
          />
          Opti<span className="text-purple-600">Extract</span>
        </div>
      }
      description="Intelligent document processing platform"
    >
      {/* Background logo div - ensure z-index is correct for layering */}
      <div
        className="absolute inset-0 bg-no-repeat bg-right-bottom opacity-20"
        style={{
          backgroundImage: 'url("/optiextract_logo.png")',
          filter: "blur(3px)", // Adjust the blur value as needed
          backgroundSize: "200px", // Adjust the size of the logo as needed
          zIndex: -1, // Ensure the logo is behind other content, if AuthLayout has a z-index
        }}
      ></div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="pl-10"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-xs text-purple-600 hover:text-purple-700 hover:underline cursor-not-allowed"
                      disabled
                    >
                      Forgot password?
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    This feature is unavailable in demo mode.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Don't have an account?
            </span>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-full" disabled>
                Create Account
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              This feature is unavailable in demo mode.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </AuthLayout>
  );
}
