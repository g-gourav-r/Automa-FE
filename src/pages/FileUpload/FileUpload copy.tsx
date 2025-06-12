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
import { FileUp, Loader2, Upload, CheckCircle } from "lucide-react";
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

export default function FileUpload() {
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-100">
          <div className="flex items-center gap-2 px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-6" />
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </header>

        <div className="space-y-6 p-5">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                if (showUploadArea) setShowUploadArea(false);
                else navigate(-1);
              }}
            >
              Back
            </Button>

            <Button
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!selectedTemplate || loadingTemplateContent}
              onClick={() =>
                selectedTemplate &&
                fetchTemplateContent(selectedTemplate.template_id)
              }
            >
              {loadingTemplateContent && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Next
            </Button>
          </div>

          {!showUploadArea && (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <p>
                  Select a template to parse your documents. If you don't have
                  one, please create it first.
                </p>

                {loadingTemplates ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
                    <span>Loading templates…</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      const template = templates.find(
                        (t) => String(t.template_id) === value
                      );
                      if (template) setSelectedTemplate(template);
                    }}
                    value={
                      selectedTemplate
                        ? String(selectedTemplate.template_id)
                        : ""
                    }
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem
                          key={template.template_id}
                          value={String(template.template_id)}
                          disabled={loadingTemplateContent}
                        >
                          {template.template_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
          )}
          {showUploadArea && templateContent && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Template Details</h2>
                <table className="w-full border border-gray-300 rounded-md">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(templateContent.template_format).map(
                        (key) => (
                          <th
                            key={key}
                            className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700"
                          >
                            {key}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.values(templateContent.template_format).map(
                        (value, idx) => (
                          <td
                            key={idx}
                            className="border border-gray-300 px-4 py-2 text-sm text-gray-800"
                          >
                            {value}
                          </td>
                        )
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="File upload area: drag and drop files here or click to browse"
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                      isDragging
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-300"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleBrowseClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleBrowseClick();
                    }}
                  >
                    <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">
                      Drag and drop your files here
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse from your computer
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleBrowseClick}
                      disabled={isUploading}
                    >
                      Browse Files
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      aria-hidden="true"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">
                        Selected Files
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                          >
                            <span className="text-sm truncate flex-1">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-4">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={isUploading}
                          aria-disabled={isUploading}
                          onClick={handleUpload}
                        >
                          {isUploading ? (
                            "Processing…"
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Process {files.length}{" "}
                              {files.length === 1 ? "file" : "files"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {parsedData && (
            <ParsedDataModal
              parsedData={parsedData}
              open={modalOpen}
              onClose={() => setModalOpen(false)}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
