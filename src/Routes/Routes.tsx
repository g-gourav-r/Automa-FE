import React from "react";
import { Routes, Route } from "react-router-dom";
import RootRedirect from "@/Routes/RootRedirect";


// Route protection wrapper
import ProtectedRoute from "@/Routes/ProtectedRoutes";

// Public pages
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";

// Protected pages
import Dashboard from "@/pages/dashboard/dashboard";
import FileUpload from "@/pages/fileUpload/FileUpload";
import InvoiceParser from "@/pages/InvoiceParser";
import CreateTemplate from "@/pages/createTemplate/createTemplate";
import AllDocuments from "@/pages/allDocuments/allDocuments";

/**
 * AppRoutes component
 * 
 * Defines the application's routing structure, including both public and protected routes.
 *
 * @returns {React.ReactElement} The route configuration for the app.
 */
export default function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Redirect from root to login */}
      
      <Route path="/" element={<RootRedirect />} />


      {/* Protected Routes (accessible only to authenticated users) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates/upload"
        element={
          <ProtectedRoute>
            <FileUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review"
        element={
          <ProtectedRoute>
            <InvoiceParser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates/create"
        element={
          <ProtectedRoute>
            <CreateTemplate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates/review"
        element={
          <ProtectedRoute>
            <AllDocuments />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
