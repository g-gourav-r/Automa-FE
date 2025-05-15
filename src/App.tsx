import AppRoutes from "@/Routes/Routes";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/redux/authSlice";


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      dispatch(login({ token }));
    }
  }, [dispatch]);

  return <AppRoutes />;
}

export default App
