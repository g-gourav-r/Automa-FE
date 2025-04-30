import { useLocation, useNavigate } from "react-router-dom";
import DocumentPreview from "@/components/DocumentPreview";
import DocumentSummary from "@/components/DocumentSummary";
import { DashboardLayout } from "@/layout/DashboardLayout";
import { useEffect } from "react";
import { toast } from "sonner";

const InvoiceParser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiResponse, file } = location.state || {};

  useEffect(() => {
    if (!apiResponse || !file) {
      toast.error("No document data found. Please upload a file first.");
      navigate("/upload");
    }
  }, [apiResponse, file, navigate]);

  if (!apiResponse || !file) {
    return null; // Optionally show a loader or redirect notice while navigating
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border">
        {/* Left summary panel */}
        <aside className="w-96 bg-gray-50 border-r overflow-y-auto p-4">
          <h2 className="text-lg font-semibold mb-4">Document Summary</h2>
          <DocumentSummary apiResponse={apiResponse} />
        </aside>

        {/* PDF preview panel */}
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">Document Preview</h2>
          <div className="border rounded-lg shadow p-4 bg-gray-100">
            <DocumentPreview file={file} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceParser;
