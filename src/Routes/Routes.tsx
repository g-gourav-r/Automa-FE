// Route protection wrapper
import ProtectedRoute from "@/Routes/ProtectedRoutes";
import InvoiceParser from "@/pages/InvoiceParser";
import SessionExpired from "@/pages/SessionExpired/SessionExpired";
import AllDocuments from "@/pages/allDocuments/allDocuments";
// Public pages
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import CreateTemplate from "@/pages/createTemplate/createTemplate";
// Protected pages
import Dashboard from "@/pages/dashboard/dashboard";
import FileUpload from "@/pages/fileUpload/FileUpload";
import ParsingStatus from "@/pages/parsingStatus/ParsingStatus";
import React from "react";
import { Routes, Route } from "react-router-dom";

const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/", element: <Dashboard /> },
  { path: "/templates/upload", element: <FileUpload /> },
  { path: "/review", element: <InvoiceParser /> },
  { path: "/templates/create", element: <CreateTemplate /> },
  { path: "/templates/review", element: <AllDocuments /> },
  { path: "/templates/processing-status", element: <ParsingStatus /> },
];

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

      {/* Generic public routes */}
      <Route path="/session-expired" element={<SessionExpired />} />

      {/* Protected Routes */}
      {protectedRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute>{element}</ProtectedRoute>}
        />
      ))}
    </Routes>
  );
}
