import createApiCall, { POST } from "@/components/api/api";
import { UserProvider } from "@/contexts/UserContext";
import { jwtDecode } from "jwt-decode";
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

type JwtPayload = {
  exp: number;
  [key: string]: any;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const refreshTokenAPI = createApiCall("auth/refresh", POST);

  useEffect(() => {
    const appDataRaw = localStorage.getItem("appData");
    if (!appDataRaw) {
      setTokenValid(false);
      setLoading(false);
      return;
    }

    const appData = JSON.parse(appDataRaw);
    const token = appData.token;

    if (!token) {
      setTokenValid(false);
      setLoading(false);
      return;
    }

    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken.exp < currentTime) {
        // Token expired — try refreshing
        refreshTokenAPI({
          headers: { Authorization: `Bearer ${appData.refreshToken}` },
        })
          .then((res) => {
            console.log("Refresh token acquired");
            appData.token = res.token;
            localStorage.setItem("appData", JSON.stringify(appData));
            setTokenValid(true);
            setLoading(false);
          })
          .catch((err) => {
            console.error("API error:", err);
            const message =
              typeof err === "string"
                ? err
                : err?.detail || err?.message || "Something went wrong";
            toast.error(message);
            localStorage.removeItem("appData");
            toast.error("Your session has expired.", { autoClose: 3000 });
            setTimeout(() => {
              setExpired(true);
            }, 3000);
          });
      } else {
        // Token still valid
        setTokenValid(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Token decode error", error);
      setTokenValid(false);
      setLoading(false);
    }
  }, [refreshTokenAPI]);

  if (expired) {
    return <Navigate to="/session-expired" />;
  }

  if (loading) {
    return null; // or a spinner/loading indicator
  }

  if (!tokenValid) {
    return <Navigate to="/auth/login" />;
  }

  return <UserProvider>{children}</UserProvider>;
};

export default ProtectedRoute;
