import { useState, ChangeEvent, FormEvent } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from "react-toastify";
import createApiCall, { POST } from "@/components/api/api";
import { ArrowLeft, Upload, Save, ListChecks } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useNavigate } from "react-router-dom";

interface ApiResponseData {
  template_data: {
    pages: Array<{
      page: number;
      ai_extraction?: {
        key_values: Array<{ key: string; value: string }>;
      };
      ai_annotated_image: string;
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
  const [apiResponseData, setApiResponseData] = useState<ApiResponseData | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [showFieldSelection, setShowFieldSelection] = useState<boolean>(false);

  const navigate = useNavigate();

  const createTemplate = createApiCall("template/create-template/", POST);
  const saveTemplate = createApiCall("template/save-template/", POST);
  const saveTemplateContent = createApiCall("template/add-extraction-result/", POST);

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

    const token = localStorage.getItem("token") || "";
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
      console.log("Extraction result response:", response);
      return response;
    } catch (err) {
      console.error("Error saving extraction result:", err);
      toast.error("Failed to save extraction result.");
      return null;
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !description) {
      toast.error("Template Name and Description cannot be empty.");
      return;
    }

    console.log("Selected items to save:", selectedItems);

    const token = localStorage.getItem("token") || "";
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

      await handleSaveContent(templateId, selectedItems);

      setTimeout(() => {
        toast.info("Navigating to upload page...");
        navigate("/upload");
      }, 3000);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ToastContainer position="top-right" autoClose={3000} />

        <header className="flex h-16 items-center gap-3 border-b border-gray-100 px-6 bg-white shadow-sm">
          <SidebarTrigger className="text-purple-600 hover:text-purple-700 transition" />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-2xl font-semibold text-gray-900">Create Template</h1>
        </header>

        {!showFieldSelection ? (
          <main className="flex flex-col items-center py-8 bg-gray-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="w-full space-y-6 px-6">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="templateName" className="pb-5">
                    Template Name
                  </Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pdfFile" className="pb-5">
                    Upload PDF
                  </Label>
                  <Input
                    id="pdfFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="pb-5">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {error && <div className="text-red-600">{error}</div>}

                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? "Processing..." : "Create Template"}
                </Button>
              </form>
            </div>
          </main>
        ) : (
          <main className="flex flex-col py-8 bg-gray-50 min-h-[calc(100vh-4rem)] overflow-y-auto px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <ListChecks className="w-5 h-5 mr-2 text-purple-600" /> Document Summary
              </h2>
              <Button variant="outline" onClick={() => setShowFieldSelection(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </div>

            {apiResponseData?.template_data.pages?.map((page, pageIndex) => (
              <div key={pageIndex} className="flex flex-col lg:flex-row gap-6 mb-10">
                <div className="w-full lg:w-1/3 h-[70vh] overflow-auto bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6">
                  <h3 className="text-lg font-semibold text-purple-700">File Information</h3>
                  <div>
                    <Label>File Name</Label>
                    <Input value={`Page ${page.page}`} readOnly />
                  </div>

                  <h3 className="text-lg font-semibold text-purple-700 mt-4">Extracted Fields</h3>
                  <div className="space-y-4">
                    {page.ai_extraction?.key_values.map(({ key, value }, idx) => (
                      <div key={`${key}-${idx}`} className="space-y-1">
                        <Label className="text-gray-700">{key}</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`checkbox-${key}-${idx}`}
                            checked={selectedItems[key] === value}
                            className="form-checkbox h-5 w-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500 checked:bg-purple-500 checked:border-purple-500"
                            onChange={(e) => handleCheckboxChange(key, value, e.target.checked)}
                          />
                          <Input value={value} readOnly className="bg-purple-50 focus-visible:ring-purple-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-2/3 flex flex-col gap-4">
                  <div className="border border-gray-300 h-[70vh] rounded-xl overflow-auto shadow">
                    <TransformWrapper
                      initialScale={1}
                      wheel={{ step: 0.1 }}
                      doubleClick={{ mode: "reset" }}
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                          <div className="flex space-x-2 p-2 bg-gray-100 border-b border-gray-300">
                            <button onClick={() => zoomIn()} className="text-purple-600 font-medium">
                              +
                            </button>
                            <button onClick={() => zoomOut()} className="text-purple-600 font-medium">
                              −
                            </button>
                            <button onClick={() => resetTransform()} className="text-purple-600 font-medium">
                              Reset
                            </button>
                          </div>
                          <TransformComponent>
                            <img
                              src={page.ai_annotated_image}
                              alt={`Annotated page ${page.page}`}
                              className="w-full h-auto cursor-grab"
                            />
                          </TransformComponent>
                        </>
                      )}
                    </TransformWrapper>
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={handleSaveTemplate}
              disabled={!Object.keys(selectedItems).length || saving}
              className="mt-6 bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Template"}
            </Button>
          </main>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
