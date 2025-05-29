import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import createApiCall, { GET } from "@/components/api/api";
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

// Define the type for a Template
type Template = {
  template_id: string | number;
  template_name: string;
};

// Define the type for an Extraction Result
type ExtractionResult = {
  result_id: number;
  template_id: number;
  source_file_name: string | null;
  parsed_data: Record<string, any>;
  created_at: string;
};

export default function AllDocuments() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [templateEntries, setTemplateEntries] = useState<ExtractionResult[]>([]);
  const [loadingTemplateEntries, setLoadingTemplateEntries] = useState(false);

  // API call definitions
  const listTemplates = createApiCall("template/list-templates/", GET);
  const getTemplateEntries = createApiCall("template/{template_id}/entries", GET);

  // Effect to load templates on component mount
  useEffect(() => {
    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    const token = appData.token || null;
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

  // Fetch Extraction Results
  const fetchTemplateEntries = (templateId: string | number) => {
    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    const token = appData.token || null;
    if (!templateId) {
      toast.error("Please select a template");
      return;
    }

    setLoadingTemplateEntries(true);
    getTemplateEntries({
      pathVariables: { template_id: String(templateId) },
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        if (Array.isArray(data)) {
          setTemplateEntries(data);
          setShowUploadArea(true);
        } else {
          toast.error("Unexpected response format.");
        }
      })
      .catch((error) => {
        console.error("Error fetching template entries:", error);
        toast.error("Failed to fetch template entries.");
      })
      .finally(() => {
        setLoadingTemplateEntries(false);
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
                if (showUploadArea) {
                  setShowUploadArea(false);
                  setTemplateEntries([]);
                } else {
                  navigate(-1);
                }
              }}
            >
              Back
            </Button>

            <Button
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!selectedTemplate || loadingTemplateEntries}
              onClick={() => {
                if (selectedTemplate) {
                  fetchTemplateEntries(selectedTemplate.template_id);
                }
              }}
            >
              {loadingTemplateEntries ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Next
            </Button>
          </div>

          {!showUploadArea && (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <p>Select a template to see its parsed document entries.</p>

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

          {/* Parsed Data Table */}
{showUploadArea && templateEntries.length > 0 && (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-4">Parsed Data Results</h2>
    <table className="w-full border border-gray-300 rounded-md">
      <thead>
        <tr className="bg-gray-100">
          {/* Use keys from the first entry’s parsed_data as table headers */}
          {Object.keys(templateEntries[0].parsed_data).map((key) => (
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
        {templateEntries.map((entry) => (
          <tr key={entry.result_id}>
            {/* Render each row with values from parsed_data */}
            {Object.values(entry.parsed_data).map((value, idx) => (
              <td
                key={idx}
                className="border border-gray-300 px-4 py-2 text-sm text-gray-800"
              >
                {String(value)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
