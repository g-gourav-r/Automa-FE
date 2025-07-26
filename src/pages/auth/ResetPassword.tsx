import createApiCall, { POST } from "@/components/api/api"; // Changed GET to POST
import { AuthLayout } from "@/components/auth/AuthLayout";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, EyeOff, Eye, AlertCircle } from "lucide-react"; // Added AlertCircle
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() { // Renamed component
  const [isLoading, setIsLoading] = useState(false); // Changed default to false, as form is shown
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null); // State to store the token from URL
  const [newPassword, setNewPassword] = useState(""); // Renamed for clarity
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // Renamed for clarity
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const navigate = useNavigate();

  // API call for resetting password (it's a POST request)
  const resetPasswordApi = createApiCall("auth/reset-password", POST);

  useEffect(() => {
    const url = new URL(window.location.href);
    const urlToken = url.searchParams.get("token");

    if (urlToken) {
      setToken(urlToken);
      // We don't verify the token immediately here.
      // The backend's POST /auth/reset-password endpoint will validate the token
      // when the user submits the new password.
    } else {
      setError("Missing password reset token in the URL. Please use the link from your email.");
    }
  }, []); // Run only once on component mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    if (!token) {
      setError("No reset token found. Please use the link from your email.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPasswordApi({
        body: {
          token: token,
          new_password: newPassword,
        },
      });
      // Assuming your backend returns a success message object: { message: "..." }
      toast.success(response.message || "Your password has been successfully reset!");
      setTimeout(() => navigate("/auth/login"), 2000); // Redirect after a short delay
    } catch (err: unknown) {
      console.error("Password Reset Error:", err);
      if (err && typeof err === "object" && "detail" in err) {
        // Display specific error detail from backend if available
        setError((err as { detail?: string }).detail || "Failed to reset password. Please try again.");
      } else {
        setError("An unexpected error occurred during password reset.");
      }
      toast.error("Failed to reset password.");
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
      description="Reset Your Password" // Changed description
    >
      {/* Background logo div */}
      <div
        className="absolute inset-0 bg-no-repeat bg-right-bottom opacity-20"
        style={{
          backgroundImage: 'url("/optiextract_logo.png")',
          filter: "blur(3px)",
          backgroundSize: "200px",
          zIndex: -1,
        }}
      ></div>

      {/* Main content for password reset */}
      <div className="grid gap-6">
        {!token ? (
          <div className="text-center text-red-500 font-medium">
            <p className="mb-4">
              <AlertCircle className="inline-block mr-2 h-5 w-5" />
              {error || "No password reset token found in the URL."}
            </p>
            <p className="text-sm text-gray-600">
              Please ensure you are using the complete link provided in your email.
            </p>
            <Button
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate("/auth/login")}
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Enter your new password below.
            </p>

            {/* New Password with show/hide */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  required
                  placeholder="New Password"
                  disabled={isLoading}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8} // HTML5 validation for minimum length
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  tabIndex={-1} // Prevent button from getting focus on tab
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password with show/hide */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                  value={confirmNewPassword}
                  placeholder="Confirm New Password"
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  minLength={8} // HTML5 validation
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  tabIndex={-1}
                >
                  {showConfirmNewPassword ? (
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
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/auth/login")}
              disabled={isLoading} // Disable registration button during loading
            >
              Login
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}