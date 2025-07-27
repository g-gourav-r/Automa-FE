import createApiCall, { GET } from "@/components/api/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useEffect, useState } from "react";
// Explicitly import React if not already
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const verifyEmailApi = createApiCall("auth/verify-email", GET);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      verifyEmailApi({
        urlParams: {
          token,
        },
      })
        .then(() => {
          toast.success("Email verified successfully!");
          setTimeout(() => navigate("/auth/login"), 1500);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Verification failed. Invalid or expired link.");
          setError("Invalid or expired link.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError("Missing token.");
      setIsLoading(false);
    }
  }, []);

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

      <div className="grid gap-6 text-center">
        {isLoading ? (
          <div>Please wait while we verify your email…</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <div>Email verified successfully! Redirecting…</div>
        )}
      </div>
    </AuthLayout>
  );
}
