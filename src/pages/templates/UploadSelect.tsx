import { MainLayout } from "@/components/MainLayout";
import { ParsedDataModal } from "@/components/ParsedDataModal";
import createApiCall, { GET, POST } from "@/components/api/api";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { FileUp, Loader2, Upload, CheckCircle, FolderUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Template = {
  template_id: string | number;
  template_name: string;
};

type TemplateContentType = {
  template_id: number;
  template_format: Record<string, string>;
};

export default function UploadSelect() {
  const navigate = useNavigate();

  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [templateContent, setTemplateContent] =
    useState<TemplateContentType | null>(null);
  const [loadingTemplateContent, setLoadingTemplateContent] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, string> | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // API calls
  const listTemplates = createApiCall("document-templates", GET);
  const getTemplateContent = createApiCall(
    "template/get-template/{template_id}",
    GET
  );
  const uploadTemplateContent = createApiCall(
    "template/{template_id}/upload",
    POST
  );
  const bulkUploadTemplateContent = createApiCall(
    "template/{template_id}/bulk-upload",
    POST
  );

  // Get token utility
  const getToken = () => {
    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    return appData.token || null;
  };

  // Fetch template list
  useEffect(() => {
    const token = getToken();
    setLoadingTemplates(true);

    listTemplates({ headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res && Array.isArray(res)) setTemplates(res);
      })
      .catch(() => {
        toast.error("Failed to load templates.");
      })
      .finally(() => {
        setLoadingTemplates(false);
      });
  }, []);

  // Handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleBrowseClick = () => {
    document.getElementById("file-upload")?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const fetchTemplateContent = (templateId: string | number) => {
    const token = getToken();
    if (!templateId) {
      toast.error("Please select a template.");
      return;
    }

    setLoadingTemplateContent(true);

    getTemplateContent({
      pathVariables: { template_id: String(templateId) },
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setShowUploadArea(true);
        setTemplateContent(data);
      })
      .catch((error) => {
        console.error("Error fetching template content:", error);
        toast.error("Failed to fetch template content.");
      })
      .finally(() => {
        setLoadingTemplateContent(false);
      });
  };

  const handleUpload = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template before uploading.");
      return;
    }
    if (files.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    const token = getToken();
    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) =>
      formData.append(files.length === 1 ? "file" : "files", file)
    );

    const apiCall =
      files.length === 1 ? uploadTemplateContent : bulkUploadTemplateContent;

    apiCall({
      pathVariables: { template_id: String(selectedTemplate.template_id) },
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        toast.success("Upload successful!");
        if (files.length === 1) {
          setParsedData(res.parsed_data);
          setModalOpen(true);
          toast.custom(() => (
            <div className="flex items-center gap-3 rounded-lg border border-purple-500 bg-purple-50 text-purple-800 p-4 shadow-lg">
              <CheckCircle className="text-green-600" />
              <span>
                Files have been uploaded and will be parsed. You can check the
                real-time status of the upload here:{" "}
                <button
                  onClick={() => navigate("/templates/processing-status")}
                  className="text-purple-700 underline font-medium ml-1"
                >
                  File Status
                </button>
              </span>
            </div>
          ));
        }
        setFiles([]);
      })
      .catch((err) => {
        console.error("Upload error:", err);
        toast.error(err?.detail || "Failed to upload file(s).");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <MainLayout title="Upload Files">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <Card
          role="button"
          onClick={() => navigate("/templates/upload/single")}
        >
          <CardContent className="p-6 flex flex-col items-center">
            <FileUp />
            <h2 className="text-xl text-purple-500 font-semibold mb-4">
              Single File Upload
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              Upload and parse one document at a time.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 transition text-white">
              Go to Single Upload
            </Button>
          </CardContent>
        </Card>

        <Card role="button" onClick={() => navigate("/templates/upload/bulk")}>
          <CardContent className="p-6 flex flex-col items-center">
            <FolderUp />
            <h2 className="text-xl text-purple-500 font-semibold mb-4">
              Bulk File Upload
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              Upload and process multiple documents together.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 transition text-white">
              Go to Bulk Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
