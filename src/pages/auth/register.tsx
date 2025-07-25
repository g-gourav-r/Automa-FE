import createApiCall, { POST } from "@/components/api/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Mail,
  Lock,
  User,
  Building,
  AlertCircle,
  Phone,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState(""); // Still disabled as per original
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for repeat password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for repeat password toggle
  const [apiResponse, setApiResponse] = useState(null);
  const [signUpCompleted, setSignUpCompleted] = useState(false);
  const signUpApi = createApiCall("auth/signup", POST);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // --- Validation Logic ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      toast.error("Passwords do not match.");
      return;
    }

    // Regex to check for exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setError(
        "Phone number must be exactly 10 digits and contain only numbers."
      );
      setIsLoading(false);
      toast.error("Invalid phone number format.");
      return;
    }
    // --- End Validation Logic ---

    signUpApi({
      body: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phone,
        password: password,
        company_id: null,
      },
    })
      .then((response) => {
        setApiResponse(response.message);
        setSignUpCompleted(true);
      })
      .catch((err) => {
        console.error(err);
        setError(
          err.detail ||
            "An error occurred during registration. Please try again."
        );
        setIsLoading(false);
        toast.error("Registration failed.");
      });
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
      description="Start automating your document processing"
    >
      {signUpCompleted ? (
        <div>
          <hr className="mb-4" />
          <p className="text-center">{apiResponse}</p>

          <Button
            variant="outline"
            onClick={() => navigate("/auth/login")}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white hover:text-white"
          >
            Sign in
          </Button>
        </div>
      ) : (
        // This is the corrected syntax for the else branch
        <>
          {" "}
          {/* Using a Fragment here to wrap the multiple elements */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="first-name"
                      placeholder="First Name"
                      className="pl-10"
                      required
                      disabled={isLoading}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="last-name"
                      placeholder="Last Name"
                      className="pl-10"
                      required
                      disabled={isLoading}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email ID"
                    className="pl-10"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    className="pl-10"
                    required
                    disabled={isLoading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10} // Restrict input to 10 characters
                  />
                </div>
              </div>

              {/* Password with show/hide */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    required
                    placeholder="Password"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Repeat Password with show/hide */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    placeholder="Repeat Password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Company Name with Tooltip */}
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          id="company"
                          placeholder="Company Name"
                          className="pl-10"
                          disabled
                          title="This field is disabled in demo mode."
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                    </TooltipTrigger>
                    {/* Note: In a real app, TooltipContent would appear on hover. Here, it's just shown for structure. */}
                    <TooltipContent>
                      This field is unavailable in demo mode.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm flex items-center border border-red-200">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Terms */}
              <div className="text-xs text-gray-500">
                By clicking Create account, you agree to our{" "}
                <a
                  href="/terms"
                  className="text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In */}
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/auth/login")} // Simulate navigation
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
