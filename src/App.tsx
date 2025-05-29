import AppRoutes from "@/Routes/Routes";
import { Toaster } from "./components/ui/sonner";

function App() {
  return(
  <>
    <AppRoutes />;
    <Toaster position="top-right" />
  </>)
}

export default App;