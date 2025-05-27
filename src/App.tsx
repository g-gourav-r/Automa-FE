import AppRoutes from "@/Routes/Routes";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, setLoading } from "@/redux/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(login({ token }));
    }
    dispatch(setLoading(false));  // done loading
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;