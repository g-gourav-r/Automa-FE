import { Toaster } from "./components/ui/sonner";
import AppRoutes from "@/Routes/Routes";

function App() {
  return (
    <>
      <AppRoutes />;
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
