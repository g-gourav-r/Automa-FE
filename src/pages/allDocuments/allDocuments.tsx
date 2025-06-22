import { MainLayout } from "@/components/MainLayout";
import createApiCall, { GET } from "@/components/api/api";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CollapsibleParsedDataTable } from "@/components/common/ParsedDataTable";
import { TemplateSelector } from "@/components/common/TemplateSelector";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Type definitions
type Template = {
  template_id: string | number;
  template_name: string;
};

type ExtractionResult = {
  result_id: number;
  template_id: number;
  source_file_name: string | null;
  parsed_data: Record<string, any>;
  created_at: string;
};

export default function AllDocuments() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [templateEntries, setTemplateEntries] = useState<ExtractionResult[]>(
    []
  );
  const [loadingTemplateEntries, setLoadingTemplateEntries] = useState(false);

  const breadcrumbSteps = ["Select Template", "View Entries"];
  const currentBreadcrumbStep =
    templateEntries.length > 0 ? "View Entries" : "Select Template";

  const getTemplateEntries = createApiCall(
    "document-templates/{template_id}/extractions",
    GET
  );

  const fetchTemplateEntries = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template to view entries.");
      return;
    }

    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    const token = appData.token;

    setLoadingTemplateEntries(true);
    setTemplateEntries([]);

    getTemplateEntries({
      pathVariables: { template_id: String(selectedTemplate.template_id) },
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        if (Array.isArray(data)) {
          setTemplateEntries(data);
          if (data.length === 0) {
            toast.info("No entries found for this template.");
          }
        } else {
          toast.error("Unexpected response format.");
        }
      })
      .catch((error) => {
        console.error("Error fetching entries:", error);
        toast.error("Failed to fetch entries.");
      })
      .finally(() => {
        setLoadingTemplateEntries(false);
      });
  };

  return (
    <MainLayout title="My Documents">
      <div className="mb-6 flex justify-between">
        <Breadcrumb
          steps={breadcrumbSteps}
          currentStep={currentBreadcrumbStep}
        />
        <div className="space-x-3">
          <Button
            onClick={() => setTemplateEntries([])}
            disabled={!selectedTemplate || loadingTemplateEntries}
            variant="outline"
          >
            {loadingTemplateEntries && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Back
          </Button>
          <Button
            onClick={fetchTemplateEntries}
            disabled={!selectedTemplate || loadingTemplateEntries}
            className="px-6 py-2.5 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            {loadingTemplateEntries && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            View Entries
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <TemplateSelector
          onSelectTemplate={(template) => {
            setSelectedTemplate(template);
            setTemplateEntries([]);
          }}
          selectedTemplateId={selectedTemplate?.template_id}
        />
      </div>

      <div>
        {templateEntries.length > 0 ? (
          <CollapsibleParsedDataTable entries={templateEntries} />
        ) : (
          <p className="text-muted-foreground text-sm">
            No entries to display.
          </p>
        )}
      </div>
    </MainLayout>
  );
}
