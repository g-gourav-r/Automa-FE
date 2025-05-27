import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import createApiCall, { GET, POST } from "@/components/api/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ParsedDataModal } from "@/components/ParsedDataModal";

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
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [templateContent, setTemplateContent] = useState<TemplateContentType | null>(null);
  const [loadingTemplateContent, setLoadingTemplateContent] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, string> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const listTemplates = createApiCall("template/list-templates/", GET);
  const getTemplateContent = createApiCall(
    "template/get-template/{template_id}",
    GET
  );
  const uploadTemplateContent = createApiCall(
    "template/{template_id}/upload",
    POST
  );

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    setLoadingTemplates(true);

    listTemplates({
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res && Array.isArray(res)) {
          setTemplates(res);
        }
      })
      .catch(() => {
        toast.error("Failed to load templates");
      })
      .finally(() => {
        setLoadingTemplates(false);
      });
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const fetchTemplateContent = (templateId: string | number) => {
    const token = localStorage.getItem("token") || "";
    if (
      templateId === null ||
      templateId === undefined ||
      (typeof templateId === "string" && templateId.trim() === "")
    ) {
      toast.error("Please select a template");
      return;
    }

    setLoadingTemplateContent(true);

    getTemplateContent({
      pathVariables: { template_id: String(templateId) },
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

  const handleBrowseClick = () => {
    document.getElementById("file-upload")?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
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

    const token = localStorage.getItem("token") || "";

    const formData = new FormData();
    formData.append("file", files[0]);

    setIsUploading(true);

    uploadTemplateContent({
      pathVariables: { template_id: String(selectedTemplate.template_id) },
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        toast.success("File uploaded and processed successfully!");
        console.log("Upload response:", res);
        setParsedData(res.parsed_data);
        setModalOpen(true);
        setFiles([]);
      })
      .catch((err) => {
        console.error("Upload error:", err);
        toast.error(err?.detail || "Failed to upload file.");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-gray-100">
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
                if (showUploadArea) {
                  setShowUploadArea(false);
                } else {
                  navigate(-1);
                }
              }}
            >
              Back
            </Button>

            <Button
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!selectedTemplate || loadingTemplateContent}
              onClick={() => {
                if (selectedTemplate) {
                  fetchTemplateContent(selectedTemplate.template_id);
                }
              }}
            >
              {loadingTemplateContent ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Next
            </Button>
          </div>

          {!showUploadArea && (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <p>
                  Select a template to parse your documents. If you don't have one,
                  please create it first.
                </p>

                {loadingTemplates ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
                    <span>Loading templates...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      const template = templates.find(
                        (t) => String(t.template_id) === value
                      );
                      if (template) setSelectedTemplate(template);
                    }}
                    value={selectedTemplate ? String(selectedTemplate.template_id) : ""}
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
                      {Object.keys(templateContent.template_format).map((key) => (
                        <th
                          key={key}
                          className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.values(templateContent.template_format).map((value, idx) => (
                        <td
                          key={idx}
                          className="border border-gray-300 px-4 py-2 text-sm text-gray-800"
                        >
                          {value}
                        </td>
                      ))}
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
                      isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleBrowseClick}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleBrowseClick();
                      }
                    }}
                  >
                    <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Drag and drop your files here</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse from your computer
                    </p>
                    <Button variant="outline" onClick={handleBrowseClick}>
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
                      <h4 className="text-sm font-medium mb-3">Selected Files</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                          >
                            <span className="text-sm truncate flex-1">{file.name}</span>
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
                          onClick={handleUpload}
                        >
                          {isUploading ? (
                            "Processing..."
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Process {files.length} {files.length === 1 ? "file" : "files"}
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
