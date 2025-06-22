import { MainLayout } from "@/components/MainLayout";
// Change POST to GET for the new endpoint, or import both if needed elsewhere
import createApiCall, { GET, POST } from "@/components/api/api";
import { PdfViewer } from "@/components/common/PdfViewer";
import DocumentCard from "@/components/documents/DocumentCard";
// DocumentCard is now updated
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Assuming you have sonner for toasts

// IMPORTANT: This type MUST precisely match the CombinedTemplateSummaryResponse Pydantic schema from your backend
export type DocumentSummary = {
  template_id: string | number; // Ensure this is consistent (int or string)
  template_name: string;
  description?: string;
  template_data: Record<string, any>; // From TemplateListResponse
  original_file_gcs_link?: string; // From TemplateListResponse
  annotated_file_gcs_link?: string; // From TemplateListResponse
  total_files: number; // From TemplateProcessingSummary
  submitted_files: number; // From TemplateProcessingSummary
  processing_files: number; // From TemplateProcessingSummary
  completed_files: number; // From TemplateProcessingSummary
  failed_files: number; // From TemplateProcessingSummary
};

const MyDocuments = () => {
  // Update the API endpoint and method to use the new combined GET endpoint
  const fetchCombinedSummary = createApiCall(
    "document-templates/dashboard-overview",
    GET
  );
  const getSignedUrlApi = createApiCall("document/signed-access-url", POST);

  const [summaries, setSummaries] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Template Data Modal
  const [isTemplateDataModalOpen, setIsTemplateDataModalOpen] = useState(false);
  const [selectedTemplateData, setSelectedTemplateData] = useState<
    Record<string, any>
  >({}); // More specific type
  const [selectedTemplateName, setSelectedTemplateName] = useState("");

  // State for PDF Viewer Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrlToView, setPdfUrlToView] = useState("");
  const [pdfModalTitle, setPdfModalTitle] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const appData = JSON.parse(localStorage.getItem("appData") || "{}");
        if (!appData.token) throw new Error("Please log in again.");

        // Call the new combined API endpoint
        const res = await fetchCombinedSummary({
          headers: { Authorization: `Bearer ${appData.token}` },
        });

        if (!Array.isArray(res)) {
          throw new Error("Unexpected API shape: response is not an array.");
        }
        // Validate each item in the array to ensure it matches DocumentSummary structure
        // This is a basic check; a more robust validation might use a library like Zod or Yup
        res.forEach((item: any) => {
          if (
            typeof item.template_id === "undefined" ||
            typeof item.template_name === "undefined" ||
            typeof item.total_files === "undefined"
            // Add checks for other required fields if necessary
          ) {
            console.warn(
              "API response item does not match DocumentSummary type:",
              item
            );
            // You might choose to filter out malformed items or throw an error
          }
        });

        setSummaries(res as DocumentSummary[]); // Cast after basic validation
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Failed to load document summaries";
        setError(msg);
        toast.error(`Error loading documents: ${msg}`); // Show toast on error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleViewTemplateData = (data: Record<string, any>, name: string) => {
    setSelectedTemplateData(data);
    setSelectedTemplateName(name);
    setIsTemplateDataModalOpen(true);
  };

  const handleViewPdf = async (url: string, title: string) => {
    try {
      setPdfUrlToView(""); // Clear previous URL
      setPdfModalTitle(title);
      setIsPdfModalOpen(true); // Open modal immediately

      const appDataString = localStorage.getItem("appData");
      let token = "";
      if (appDataString) {
        try {
          const appData = JSON.parse(appDataString);
          token = appData.token;
        } catch (parseError) {
          console.error(
            "Failed to parse appData from localStorage:",
            parseError
          );
          toast.error("Authentication data is corrupted. Please log in again.");
          setIsPdfModalOpen(false); // Close modal on auth error
          return;
        }
      } else {
        toast.error("Authentication data not found. Please log in.");
        setIsPdfModalOpen(false); // Close modal on auth error
        return;
      }

      const formData = new FormData();
      formData.append("file_path", url);
      const payload = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      };

      console.log("Calling getSignedUrlApi with payload:", payload);
      const response = await getSignedUrlApi(payload);

      if (response && response.signed_url) {
        setPdfUrlToView(response.signed_url);
      } else {
        throw new Error("Signed URL not found in API response.");
      }
    } catch (error) {
      console.error("Failed to get signed URL for PDF:", error);
      toast.error(
        `Failed to load PDF: ${
          error instanceof Error && error.message
            ? error.message
            : "An unexpected error occurred. Please try again."
        }`
      );
      setIsPdfModalOpen(false); // Close modal on any error during PDF loading
    }
  };

  return (
    <MainLayout title="Documents Overview">
      {" "}
      {/* Updated title for clarity */}
      <div className="container mx-auto p-4">
        {" "}
        {/* Added padding */}
        {loading && (
          <div className="flex justify-center items-center h-48">
            <p>Loading document overview…</p>
          </div>
        )}
        {error && (
          <div className="flex justify-center items-center h-48 text-red-500">
            <p>Error: {error}</p>
          </div>
        )}
        {!loading && !error && summaries.length === 0 && (
          <div className="flex justify-center items-center h-48">
            <p>No document templates with processing summaries available.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((s) => (
            <DocumentCard
              key={s.template_id}
              summary={s}
              onViewOriginalPdf={handleViewPdf}
              onViewAnnotatedPdf={handleViewPdf}
              onViewTemplateData={handleViewTemplateData}
            />
          ))}
        </div>
      </div>
      {/* Template Data Modal */}
      <Dialog
        open={isTemplateDataModalOpen}
        onOpenChange={setIsTemplateDataModalOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-purple-50 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-700">
              Template Data for "
              <span className="text-purple-500">{selectedTemplateName}</span>"
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Details of the fields extracted by this template.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {Object.keys(selectedTemplateData).length > 0 ? (
              <div className="rounded-md border border-purple-200">
                <Table>
                  <TableHeader className="bg-purple-100">
                    <TableRow>
                      <TableHead className="w-1/3 font-semibold text-purple-800">
                        Field Name
                      </TableHead>
                      <TableHead className="w-2/3 font-semibold text-purple-800">
                        Value/Type
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(selectedTemplateData).map(
                      ([key, value]) => (
                        <TableRow key={key} className="hover:bg-purple-50">
                          <TableCell className="font-medium text-gray-800">
                            {key}
                          </TableCell>
                          <TableCell className="break-all text-gray-700">
                            {JSON.stringify(value, null, 2)}{" "}
                            {/* Pretty print JSON */}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                This template has no defined data fields.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* PDF Viewer Modal */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
          {" "}
          {/* Added flex-col for better layout */}
          <DialogHeader className="p-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-purple-700">
              <span className="text-purple-400">{pdfModalTitle}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Viewing the document. You can zoom and pan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full overflow-auto p-2">
            {" "}
            {/* Added padding */}
            {pdfUrlToView ? (
              <PdfViewer pdfUrl={pdfUrlToView} />
            ) : (
              <p className="text-center text-gray-500 py-20">
                Loading PDF... If it takes too long or fails, check your network
                connection or the file's availability.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default MyDocuments;
