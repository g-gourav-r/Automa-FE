import { UserProvider } from "@/contexts/UserContext";
import { jwtDecode } from "jwt-decode";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

type JwtPayload = {
  exp: number;
  [key: string]: any;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const appData = JSON.parse(localStorage.getItem("appData") || "{}");
  const token = appData.token || null;

  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  try {
    const decodedToken: JwtPayload = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("appData");
      toast.error("Your session has expired.", {
        autoClose: 3000,
      });

      setTimeout(() => {
        return <Navigate to="/session-expired" />;
      }, 3000);

      return null;
    }
  } catch (error) {
    return <Navigate to="/auth/login" />;
  }

  return <UserProvider>{children}</UserProvider>;
};

export default ProtectedRoute;
