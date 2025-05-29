import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { UserProvider } from "@/contexts/UserContext";

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
    console.log(decodedToken.exp);
    console.log(currentTime);

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

  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};

export default ProtectedRoute;
