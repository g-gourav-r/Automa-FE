import createApiCall, { GET } from "@/components/api/api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  company_id: number;
  company_name: string;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    const token = appData.token;

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (token) {
      const getProfile = createApiCall("users/me", GET);
      getProfile({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          setUser(response);
          localStorage.setItem("userProfile", JSON.stringify(response)); // cache it
        })
        .catch((error) => {
          console.error("Failed to fetch user data", error);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
