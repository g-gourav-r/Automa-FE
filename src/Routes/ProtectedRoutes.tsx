import createApiCall, { POST } from "@/components/api/api";
import { UserProvider } from "@/contexts/UserContext";
import { jwtDecode } from "jwt-decode";
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner"; // Use sonner consistently
import LoadingSpinner from "@/components/loader/loader"; // Assuming this path is correct

type JwtPayload = {
  exp: number;
  [key: string]: any;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // More descriptive state
  const refreshTokenAPI = createApiCall("auth/refresh", POST);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true); // Ensure loading is true at the start of checks
      const appDataRaw = localStorage.getItem("appData");

      if (!appDataRaw) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const appData = JSON.parse(appDataRaw);
      let accessToken = appData.token;
      const refreshToken = appData.refreshToken;

      if (!accessToken || !refreshToken) { // Must have both tokens
        setIsAuthenticated(false);
        setLoading(false);
        localStorage.removeItem("appData"); // Clear incomplete data
        return;
      }

      try {
        const decodedAccessToken: JwtPayload = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedAccessToken.exp < currentTime) {
          // Access token expired, attempt to refresh silently
          console.log("Access token expired. Attempting to refresh...");
          try {
            const refreshResponse = await refreshTokenAPI({
              headers: { Authorization: `Bearer ${refreshToken}` },
            });

            // Update local storage with new tokens
            appData.token = refreshResponse.access_token; // Backend returns access_token
            // If backend also rotates refresh token:
            if (refreshResponse.refresh_token) {
              appData.refreshToken = refreshResponse.refresh_token;
            }
            localStorage.setItem("appData", JSON.stringify(appData));

            setIsAuthenticated(true); // Successfully refreshed
            console.log("Tokens refreshed successfully.");

          } catch (refreshErr: unknown) {
            // Refresh token itself failed or expired
            console.error("Refresh token failed:", refreshErr);
            localStorage.removeItem("appData"); // Clear all tokens
            toast.error("Your session has expired. Please log in again.", { duration: 3000 });
            setIsAuthenticated(false); // Mark as not authenticated
          }
        } else {
          // Access token is still valid
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Error decoding access token (e.g., malformed token)
        console.error("Access token decode error or initial validation failed:", error);
        localStorage.removeItem("appData"); // Clear potentially bad tokens
        toast.error("Invalid session data. Please log in again.", { duration: 3000 });
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth(); // Call the async function
  }, [refreshTokenAPI]); // Dependency array: re-run if refreshTokenAPI changes (though it shouldn't often)

  // Only one check for loading, which returns the LoadingSpinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated after checks, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If authenticated, render children within UserProvider
  return <UserProvider>{children}</UserProvider>;
};

export default ProtectedRoute;