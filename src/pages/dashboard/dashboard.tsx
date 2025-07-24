import { MainLayout } from "@/components/MainLayout";
// NEW IMPORTS FROM MyDocuments
import createApiCall, { GET, POST } from "@/components/api/api";
import { PdfViewer } from "@/components/common/PdfViewer";
import DocumentCard from "@/components/documents/DocumentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Ensure this path is correct
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
import { cn } from "@/lib/utils";
import { FilePlus, UploadCloud, BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Modified DashboardCard component
function DashboardCard({
  icon: Icon,
  title,
  buttonText, // Removed subtitle
  onClick,
}: {
  icon: any;
  title: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center py-6 px-4", // Smaller padding
        "border border-gray-200 rounded-xl text-center",
        "bg-white shadow-sm hover:shadow-md transition-all duration-200 ease-in-out",
        "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center space-y-2 p-0">
        {" "}
        {/* Reduced space-y */}
        <Icon className="size-10 text-purple-600" /> {/* Smaller icon size */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>{" "}
          {/* Smaller title size */}
          {/* Removed subtitle paragraph */}
        </div>
        <Button
          className="mt-3 text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200" // Smaller button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  // START: Logic from MyDocuments (unchanged)
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
  >({});
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

        const res = await fetchCombinedSummary({
          headers: { Authorization: `Bearer ${appData.token}` },
        });

        if (!Array.isArray(res)) {
          throw new Error("Unexpected API shape: response is not an array.");
        }
        res.forEach((item: any) => {
          if (
            typeof item.template_id === "undefined" ||
            typeof item.template_name === "undefined" ||
            typeof item.total_files === "undefined"
          ) {
            console.warn(
              "API response item does not match DocumentSummary type:",
              item
            );
          }
        });

        setSummaries(res as DocumentSummary[]);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Failed to load document summaries";
        setError(msg);
        toast.error(`Error loading documents: ${msg}`);
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
      setPdfUrlToView("");
      setPdfModalTitle(title);
      setIsPdfModalOpen(true);

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
          setIsPdfModalOpen(false);
          return;
        }
      } else {
        toast.error("Authentication data not found. Please log in.");
        setIsPdfModalOpen(false);
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
      setIsPdfModalOpen(false);
    }
  };
  // END: Logic from MyDocuments

  return (
    <MainLayout title="Dashboard">
      <div className="container mx-auto p-4">
        {" "}
        {/* Added padding to the overall container */}
        <div className="flex flex-col gap-2">
          {" "}
          {/* Overall container for sections, added gap */}
          {/* Section Title for Quick Actions */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          {/* Top Row: Quick Action Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {" "}
            {/* Adjusted gap and added sm:grid-cols-2 for smaller screens */}
            <DashboardCard
              icon={FilePlus}
              title="Create Template" // Shortened title
              buttonText="Create" // Shortened button text
              onClick={() => navigate("/templates/create")}
            />
            <DashboardCard
              icon={UploadCloud}
              title="Upload File" // Shortened title
              buttonText="Upload" // Shortened button text
              onClick={() => navigate("/document/upload")}
            />
            <DashboardCard
              icon={BarChart2}
              title="View Analytics" // Shortened title
              buttonText="View" // Shortened button text
              onClick={() => navigate("/stats")}
            />
          </div>
          {/* Section Title for Document Overview */}
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
            Templates{" "}
          </h2>
          {/* Bottom Section: Document Cards (from MyDocuments) */}
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
            {" "}
            {/* Adjusted gap and columns */}
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
      </div>

      {/* Template Data Modal (unchanged) */}
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

      {/* PDF Viewer Modal (unchanged) */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
          <DialogHeader className="p-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-purple-700">
              <span className="text-purple-400">{pdfModalTitle}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Viewing the document. You can zoom and pan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full overflow-auto p-2">
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
}
