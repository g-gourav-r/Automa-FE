import { MainLayout } from "@/components/MainLayout";
import createApiCall, { GET } from "@/components/api/api";
import { PdfViewer } from "@/components/common/PdfViewer";
import { Button } from "@/components/ui/button";
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

type Template = {
  template_id: string | number;
  template_name: string;
  description?: string;
  template_data?: Record<string, any>;
  original_file_gcs_link?: string;
  annotated_file_gcs_link?: string;
};

const ListTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [isTemplateDataModalOpen, setIsTemplateDataModalOpen] = useState(false);
  const [selectedTemplateData, setSelectedTemplateData] = useState({});
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrlToView, setPdfUrlToView] = useState("");
  const [pdfModalTitle, setPdfModalTitle] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const listTemplatesAPI = createApiCall("document-templates", GET);
        const appDataString = localStorage.getItem("appData") || "";
        if (!appDataString)
          throw new Error("No appData found in localStorage.");
        const appData = JSON.parse(appDataString);
        const token = appData.token;
        if (!token) throw new Error("Authentication token not found.");

        const response = await listTemplatesAPI({
          headers: { Authorization: `Bearer ${token}` },
        });
        setTemplates(response);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        setError(
          `Failed to load templates: ${
            typeof err === "object" && err !== null && "message" in err
              ? (err as { message?: string }).message
              : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleViewTemplateData = (data: Record<string, any>, name: string) => {
    setSelectedTemplateData(data);
    setSelectedTemplateName(name);
    setIsTemplateDataModalOpen(true);
  };

  const handleViewPdf = (url: string, title: string) => {
    setPdfUrlToView(url);
    setPdfModalTitle(title);
    setIsPdfModalOpen(true);
  };

  if (loading) {
    return (
      <MainLayout title="Templates">
        <div className="flex justify-center items-center h-48">
          <p>Loading templates...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Templates">
        <div className="flex justify-center items-center h-48 text-red-500">
          <p>{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Templates">
      <div className="container mx-auto">
        {templates.length === 0 ? (
          <p>No templates found.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Template Data</TableHead>
                  <TableHead>Original File</TableHead>
                  <TableHead>Annotated File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.template_id}>
                    <TableCell className="font-medium">
                      {template.template_id}
                    </TableCell>
                    <TableCell>{template.template_name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      {Object.keys(template.template_data || {}).length > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewTemplateData(
                              template.template_data || {},
                              template.template_name
                            )
                          }
                        >
                          View
                        </Button>
                      ) : (
                        "No Data"
                      )}
                    </TableCell>
                    <TableCell>
                      {template.original_file_gcs_link ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewPdf(
                              template.original_file_gcs_link!,
                              template.template_name
                            )
                          }
                        >
                          View
                        </Button>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {template.annotated_file_gcs_link ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewPdf(
                              template.annotated_file_gcs_link!,
                              `Annotated File: ${template.template_name}`
                            )
                          }
                        >
                          View
                        </Button>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Template Data Modal */}
      <Dialog
        open={isTemplateDataModalOpen}
        onOpenChange={setIsTemplateDataModalOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-purple-50">
          <DialogHeader>
            <DialogTitle>
              Template Data for "
              <span className="text-purple-500">{selectedTemplateName}</span>"
            </DialogTitle>
            <DialogDescription>
              Details of the fields extracted by this template.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {Object.keys(selectedTemplateData).length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Value/Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(selectedTemplateData).map(
                      ([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell className="break-all">
                            {JSON.stringify(value)}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p>This template has no defined data fields.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Modal */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-5xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              <span className="text-purple-400">{pdfModalTitle}</span>
            </DialogTitle>
            <DialogDescription>
              Viewing the document. You can zoom and pan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full h-[calc(90vh-140px)]">
            {pdfUrlToView ? (
              <PdfViewer pdfUrl={pdfUrlToView} />
            ) : (
              <p className="text-center text-red-500">No PDF URL provided.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ListTemplates;
