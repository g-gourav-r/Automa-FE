import createApiCall, { POST } from "@/components/api/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isForgotPasswordSession, setForgotPasswordSession] = useState(false);
  const navigate = useNavigate();

  // API call functions
  const loginUser = createApiCall("auth/login", POST);
  const forgotPasswordApi = createApiCall("auth/forgot-password", POST); // Renamed for clarity

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      const response = await loginUser({
        body: {
          email,
          password,
        },
        isAuthEndpoint: true,
      });
      toast.success("Successfully logged in!");
      const appData = JSON.parse(localStorage.getItem("appData") || "{}");
      appData.token = response.access_token;
      appData.refreshToken = response.refresh_token;
      localStorage.setItem("appData", JSON.stringify(appData));
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error("Login Error:", err);
      if (err && typeof err === "object" && "detail" in err) {
        setError((err as { detail?: string }).detail || "Login failed. Please try again.");
      } else {
        setError("An unexpected error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      // The backend should return a generic success message even if the email doesn't exist
      await forgotPasswordApi({
        body: {
          email,
        },
      });
      toast.success("If an account with that email exists, a password reset link has been sent to your inbox.");
      // Optionally, switch back to login mode after successful request
      setForgotPasswordSession(false);
      setEmail(""); // Clear email field after sending reset link
    } catch (err: unknown) {
      console.error("Forgot Password Error:", err);
      // Backend might return specific errors, or we can just show a generic message
      if (err && typeof err === "object" && "detail" in err) {
        setError((err as { detail?: string }).detail || "Failed to send reset link. Please try again.");
      } else {
        setError("An unexpected error occurred while requesting password reset.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which submit handler to use based on the session state
  const currentSubmitHandler = isForgotPasswordSession ? handleForgotPasswordSubmit : handleLoginSubmit;


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
      {/* Background logo div*/}
      <div
        className="absolute inset-0 bg-no-repeat bg-right-bottom opacity-20"
        style={{
          backgroundImage: 'url("/optiextract_logo.png")',
          filter: "blur(3px)",
          backgroundSize: "200px",
          zIndex: -1,
        }}
      ></div>

      <div className="grid gap-6">
        {/* Use currentSubmitHandler dynamically */}
        <form onSubmit={currentSubmitHandler} className="space-y-4">
          {isForgotPasswordSession && (
            <p className="text-sm text-center text-muted-foreground">
              Enter your email and we will send you a password reset link if the email exists.
            </p>
          )}

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Email ID"
                className="pl-10"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Conditionally render password field and forgot password link for login session */}
          {!isForgotPasswordSession && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  required
                  placeholder="Password"
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

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="text-xs text-purple-600 hover:text-purple-700 hover:underline"
                  onClick={() => {
                    setForgotPasswordSession(true);
                    setError(""); // Clear error when switching modes
                    setPassword(""); // Clear password field
                  }}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}

          {/* "Back to login" button for forgot password session */}
          {isForgotPasswordSession && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-xs text-purple-600 hover:text-purple-700 hover:underline"
                onClick={() => {
                  setForgotPasswordSession(false);
                  setError(""); // Clear error when switching modes
                  setEmail(""); // Clear email field
                }}
                disabled={isLoading}
              >
                Back to login
              </button>
            </div>
          )}

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
            {isLoading
              ? (isForgotPasswordSession ? "Sending link..." : "Signing in...")
              : (isForgotPasswordSession ? "Send Reset Link" : "Sign in")}
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

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/auth/register")}
          disabled={isLoading} // Disable registration button during loading
        >
          Create Account
        </Button>
      </div>
    </AuthLayout>
  );
}