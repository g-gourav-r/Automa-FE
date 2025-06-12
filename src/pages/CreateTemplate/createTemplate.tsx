import { TemplateFieldSelection } from "@/components/CreateTemplate/TemplateFieldSelection";
import { TemplateForm } from "@/components/CreateTemplate/TemplateForm";
import { TemplateSaveConfirmation } from "@/components/CreateTemplate/TemplateSaveConfirmation";
import { MainLayout } from "@/components/MainLayout";
import createApiCall, { POST } from "@/components/api/api";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { PdfViewer } from "@/components/common/PdfViewer";
import { Button } from "@/components/ui/button";
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Interface representing a template data item.
 */
export interface TemplateDataItem {
  key: string;
  value: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

/**
 * Interface representing API response data for the template creation flow.
 */
export interface ApiResponseData {
  message: string;
  template_data: TemplateDataItem[];
  original_temp_pdf_gcs_link: string;
  annotated_temp_pdf_link: string;
  template_name: string;
  blobs: {
    original_file: string;
    annotated_file: string;
  };
}

/**
 * CreateTemplate Component — Main workflow for template creation and field mapping.
 */
export default function CreateTemplate() {
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalBLOB, setOriginalBLOB] = useState("");
  const [annotatedBLOB, setAnnotatedBLOB] = useState("");
  const [showFieldSelection, setShowFieldSelection] = useState(false);
  const [templateProcessed, setTemplateProcessed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Record<string, string>>(
    {}
  );

  const [apiResponseData, setApiResponseData] =
    useState<ApiResponseData | null>(null);

  const steps = ["Upload", "Verify", "Create"];
  const extractionMethod = "AI + OCR Based"; // Hardcoded for Automa V1.0

  const createTemplateApi = createApiCall(
    "document-templates/definitions/generate",
    POST
  );
  const saveTemplateApi = createApiCall("document-templates", POST);

  /**
   * Returns the current step label based on workflow flags.
   */
  const getCurrentStep = () => {
    if (templateProcessed) return "Create";
    if (showFieldSelection) return "Verify";
    return "Upload";
  };

  /**
   * Handles changes to template field selections.
   * @param key Field key
   * @param value Field value
   * @param checked Whether the field is selected
   */
  const handleFieldChange = (key: string, value: string, checked: boolean) => {
    setSelectedItems((prev) => {
      if (checked) {
        return { ...prev, [key]: value };
      } else {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      }
    });
  };

  /**
   * Handles form submission to generate template fields from PDF.
   */
  const handleCreateTemplate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!pdfFile || !templateName.trim() || !description.trim()) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("template_name", templateName);
      formData.append("template_description", description);

      const appData = JSON.parse(localStorage.getItem("appData") || "{}");
      setLoading(true);

      await createTemplateApi({
        headers: { Authorization: `Bearer ${appData.token}` },
        body: formData,
      })
        .then((res) => {
          setApiResponseData(res);
          setOriginalBLOB(res.blobs.original_file);
          setAnnotatedBLOB(res.blobs.annotated_file);
          setShowFieldSelection(true);
        })
        .catch((err) => {
          console.error("API error:", err);
          const message =
            typeof err === "string"
              ? err
              : err?.detail || err?.message || "Something went wrong";
          toast.error(message);
        });
    } catch (error: any) {
      toast.error(error?.message || "Failed to create template.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles final save of the template with selected fields.
   */
  const handleSaveTemplate = async () => {
    try {
      const formData = new FormData();
      formData.append("template_name", templateName);
      formData.append("description", description);
      formData.append("extraction_method", extractionMethod);
      formData.append("template_data", JSON.stringify(selectedItems));
      formData.append("file_name", pdfFile ? pdfFile.name : templateName);
      formData.append("original_pdf_temp_gcs_link", originalBLOB);
      formData.append("annotated_pdf_temp_gcs_link", annotatedBLOB);

      const appData = JSON.parse(localStorage.getItem("appData") || "{}");
      setSaving(true);

      await saveTemplateApi({
        headers: { Authorization: `Bearer ${appData.token}` },
        body: formData,
      })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.error("API error:", err);
          const message =
            typeof err === "string"
              ? err
              : err?.detail || err?.message || "Something went wrong";
          toast.error(message);
        });
    } catch (error: any) {
      toast.error(error?.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Create Template">
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb steps={steps} currentStep={getCurrentStep()} />
        {showFieldSelection && !templateProcessed && apiResponseData && (
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(true)}
              disabled={saving}
              className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Back
            </Button>
            <Button
              className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
              onClick={handleSaveTemplate}
              disabled={saving}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {!showFieldSelection && !templateProcessed && (
        <TemplateForm
          templateName={templateName}
          setTemplateName={setTemplateName}
          description={description}
          setDescription={setDescription}
          pdfFile={pdfFile}
          setPdfFile={setPdfFile}
          error={error}
          setError={setError}
          loading={loading}
          onSubmit={handleCreateTemplate}
        />
      )}

      {!saving ? (
        showFieldSelection &&
        !templateProcessed &&
        apiResponseData && (
          <div className="flex h-[90vh] bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 flex flex-col shadow border-gray-200 border rounded-lg mr-2 bg-white">
              <div className="p-3 border-b rounded-t-lg bg-purple-50 text-purple-500 font-semibold">
                Template Field Selection
              </div>
              <div className="flex-1 overflow-auto p-3">
                <TemplateFieldSelection
                  keyValues={apiResponseData.template_data.map(
                    ({ key, value }) => ({ key, value })
                  )}
                  selectedItems={selectedItems}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="w-2/3 flex flex-col shadow border-gray-200 border rounded-lg mr-2 bg-white">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-purple-50">
                <h2 className="text-purple-500 font-semibold">PDF Viewer</h2>
              </div>
              <div className="flex-1 overflow-hidden p-3">
                {apiResponseData.annotated_temp_pdf_link && (
                  <PdfViewer pdfUrl={apiResponseData.annotated_temp_pdf_link} />
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex h-[90vh] bg-gray-50 overflow-hidden">
          <div className="w-full inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
      )}
      {templateProcessed && (
        <TemplateSaveConfirmation template_name={templateName} />
      )}
    </MainLayout>
  );
}
