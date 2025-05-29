import React, { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import createApiCall, { POST } from "@/components/api/api";
import {
  ArrowLeft,
  Upload,
  Save,
  ListChecks,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { BadgeCheck } from "@/components/animatedIcons/BadgeCheck";

interface ApiResponseData {
  template_data: {
    pages: Array<{
      page: number;
      ai_extraction?: {
        key_values: Array<{ key: string; value: string }>;
      };
      ai_annotated_image_url: string;
    }>;
  };
  template_id?: string | number;
}

export default function Dashboard() {
  const [templateName, setTemplateName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponseData, setApiResponseData] =
    useState<ApiResponseData | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>(
    {}
  );
  const [showFieldSelection, setShowFieldSelection] = useState<boolean>(false);
  const [templateProcessed, setTemplateProcessed] = useState<boolean>(false);

  const navigate = useNavigate();

  const createTemplate = createApiCall("template/create-template/", POST);
  const saveTemplate = createApiCall("template/save-template/", POST);
  const saveTemplateContent = createApiCall(
    "template/add-extraction-result/",
    POST
  );

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!pdfFile) {
      setError("Please select a PDF to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("template_name", templateName);
    formData.append("template_description", description);

    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    const token = appData.token || null;

    setLoading(true);
    try {
      const resp = await createTemplate({
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setApiResponseData(resp);
      setShowFieldSelection(true);
    } catch (err) {
      toast.error("Error creating template.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (
    templateId: string | number,
    parsedData: Record<string, string>,
    sourceFileName: string | null = null
  ) => {
    const token = localStorage.getItem("token") || "";

    try {
      const payload = {
        template_id: templateId,
        source_file_name: sourceFileName,
        parsed_data: parsedData,
      };

      const response = await saveTemplateContent({
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      toast.success("Extraction result saved successfully!");
      return response;
    } catch (err) {
      console.error("Error saving extraction result:", err);
      toast.error("Failed to save extraction result.");
      return null;
    }
  };

  const handleSaveTemplate = async () => {
    console.log(templateName);
    console.log(description);
    if (!templateName || !description) {
      toast.error("Template Name and Description cannot be empty.");
      return;
    }

    console.log("Selected items to save:", selectedItems);

    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    const token = appData.token || null;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("template_name", templateName);
      formData.append("description", description);
      formData.append("template_data", JSON.stringify(selectedItems));
      formData.append("extraction_method", "ai_extraction");

      const response = await saveTemplate({
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const templateId = response.template_id;
      if (!templateId) throw new Error("Template ID missing in response");

      toast.success("Template saved successfully!");
      toast.info("Uploading template data...");
      setTemplateProcessed(true);

      await handleSaveContent(templateId, selectedItems);

      const timeoutRef = { current: null as NodeJS.Timeout | null };

      toast("Navigating to upload page in 10 seconds...", {
        action: {
          label: "Cancel",
          onClick: () => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
              toast("Navigation cancelled.");
            }
          },
        },
      });

      timeoutRef.current = setTimeout(() => {
        navigate("/templates/upload");
      }, 10000);

      setSelectedItems({});
    } catch (err) {
      console.error("Failed to save template:", err);
      toast.error("Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxChange = (
    key: string,
    value: string,
    checked: boolean
  ) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (checked) updated[key] = value;
      else delete updated[key];
      return updated;
    });
  };
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const words = e.target.value.trim().split(/\s+/);
    if (words.length <= 300) {
      setDescription(e.target.value);
    } else {
      setDescription(words.slice(0, 300).join(" "));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        setPdfFile(null);
        return;
      }
      setPdfFile(selectedFile);
      setError("");
    }
  };

  const removeFile = () => {
    setPdfFile(null);
  };

  const allKeyValues = apiResponseData?.template_data.pages.flatMap(
    (page) => page.ai_extraction?.key_values || []
  );

  return (
    <MainLayout title="Create Template">
      {!showFieldSelection ? (
        <main className="flex flex-col items-center py-8 min-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="w-full space-y-8 px-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="templateName"
                  className="block pb-5 font-semibold text-gray-700"
                >
                  Template Name
                </Label>
                <Input
                  id="templateName"
                  type="text"
                  placeholder="Enter template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  required
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div>
                <Label
                  htmlFor="pdfFile"
                  className="block pb-5 font-semibold text-gray-700 flex items-center gap-2"
                >
                  Upload PDF
                </Label>

                {!pdfFile ? (
                  <Input
                    id="pdfFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    className="w-full"
                    placeholder="Add a PDF file"
                  />
                ) : (
                  <div className="flex items-center justify-between border rounded px-3 py-2">
                    <span className="truncate">{pdfFile.name}</span>
                    <button
                      type="button"
                      onClick={removeFile}
                      aria-label="Remove file"
                      className="text-purple-600 hover:text-red-600 transition"
                      disabled={loading}
                    >
                      {loading ? "" : <X className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                <p className="mt-1 text-xs text-gray-500">
                  Only PDF files are accepted. Max one file.
                </p>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="block pb-5 font-semibold text-gray-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Add a description about the template which will be used to better analyse the content added and extract the results"
                  value={description}
                  onChange={handleDescriptionChange}
                  rows={4}
                  required
                  className="w-full"
                  disabled={loading}
                />

                <p className="mt-1 text-xs text-gray-500">
                  {description.trim().split(/\s+/).filter(Boolean).length} / 300
                  words
                </p>
              </div>

              {error && <div className="text-red-600 font-medium">{error}</div>}

              <Button
                type="submit"
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                <Upload className="w-5 h-5" />
                {loading ? "Processing..." : "Create Template"}
              </Button>
            </form>
          </div>
        </main>
      ) : (
        <main className="flex flex-col py-8  min-h-[calc(100vh-4rem)] overflow-y-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <ListChecks className="w-5 h-5 mr-2 text-purple-600" /> Review
              Document Summary
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowFieldSelection(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            <div className="w-full lg:w-1/3 h-[70vh] overflow-auto bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-purple-700">
                File Information
              </h3>
              <div>
                <Label className="pb-3">Template Name</Label>
                <Input value={templateName} readOnly />
              </div>

              <h3 className="text-lg font-semibold text-purple-700 mt-4 mb-1">
                Extracted Fields
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select the fields to include in the template.
              </p>

              <div className="space-y-4">
                {(allKeyValues ?? []).map(({ key, value }, idx) => (
                  <div key={`${key}-${idx}`} className="space-y-1">
                    <Label className="text-gray-700">{key}</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`checkbox-${key}-${idx}`}
                        checked={selectedItems[key] === value}
                        className="form-checkbox h-5 w-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500 checked:bg-purple-500 checked:border-purple-500"
                        onChange={(e) =>
                          handleCheckboxChange(key, value, e.target.checked)
                        }
                      />
                      <Input
                        value={value}
                        readOnly
                        className="bg-purple-50 focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              <div className="border border-gray-300 h-[70vh] rounded-xl overflow-auto shadow relative">
                <TransformWrapper
                  initialScale={1}
                  wheel={{ step: 0.1 }}
                  doubleClick={{ mode: "reset" }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      {/* Controls */}
                      <div className="flex items-center space-x-2 p-2 border-b sticky top-0 bg-white border-gray-200 z-10">
                        <button
                          onClick={() => zoomIn()}
                          className="text-purple-600 hover:text-purple-800 transition"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => zoomOut()}
                          className="text-purple-600 hover:text-purple-800 transition"
                        >
                          <ZoomOut className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => resetTransform()}
                          className="text-purple-600 hover:text-purple-800 transition"
                        >
                          <RefreshCcw className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Viewport */}
                      <TransformComponent>
                        <div className="flex flex-col items-center w-full">
                          {apiResponseData?.template_data.pages.map(
                            (page, idx) => (
                              <img
                                key={idx}
                                src={page.ai_annotated_image_url}
                                alt={`Page ${page.page}`}
                                className="max-w-full h-auto mb-4"
                              />
                            )
                          )}
                        </div>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveTemplate}
            disabled={!Object.keys(selectedItems).length || saving}
            className="mt-6 bg-purple-600 hover:bg-purple-700 w-auto self-start"
          >
            <Save className="w-4 h-4 mr-2" />{" "}
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </main>
      )}
      {templateProcessed && (
        <div className="fixed inset-0 bg-[rgba(147,51,234,0.15)] flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center m-5 sm:m-0">
            <div>
              <BadgeCheck
                width={40}
                height={40}
                stroke="#1FD655"
                strokeWidth={3}
              />
            </div>
            <h2 className="text-xl font-semibold mb-4">Template Saved</h2>

            <Button
              onClick={() => navigate("/")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
