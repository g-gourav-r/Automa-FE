import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/Routes/ProtectedRoutes";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard/dashboard";
import FileUpload from "@/pages/FileUpload";
import InvoiceParser from "@/pages/InvoiceParser";
import CreateTemplate from "@/pages/createTemplate/createTemplate";

export default function AppRoutes() {
  return (
    <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />
        <Route path="/upload" element={ <ProtectedRoute> <FileUpload /> </ProtectedRoute> } />
        <Route path="/review" element={ <ProtectedRoute> <InvoiceParser /> </ProtectedRoute> } />
        <Route path="/templates/create" element={ <ProtectedRoute> <CreateTemplate /> </ProtectedRoute>}/>
        
    </Routes>
  );
}

