// src/pages/Dashboard.tsx

import { useState } from "react";

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
import { Card, CardContent } from "@/components/ui/card";

import createApiCall, { POST } from "@/components/api/api";

interface TemplateData {
  pages?: {
    page: number;
    annotated_image: string;
    key_values: Record<string, string>;
  }[];
  [key: string]: any; // Allow other dynamic properties
}

interface ApiResponse {
  message: string;
  template_data: TemplateData;
}

export default function Dashboard() {

  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponseData, setApiResponseData] = useState<ApiResponse | null>(null);

  // prepare the API call function
  const createTemplate = createApiCall("template/create-template/", POST);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setApiResponseData(null); // Clear previous response

    if (!pdfFile) {
      setError("Please select a PDF to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("template_name", templateName);
    formData.append("template_description", description);

    const token = localStorage.getItem("token") || "";
    console.log(token);

    setLoading(true);
    try {
      const resp: ApiResponse = await createTemplate({
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      console.log("Template created:", resp);
      setApiResponseData(resp);
    } catch (err: any) {
      console.error("Error creating template:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-3 px-6 bg-white shadow-sm border-b border-gray-200">
          <SidebarTrigger className="-ml-1 text-gray-600 hover:text-purple-600 transition-colors" />
          <Separator orientation="vertical" className="mr-4 h-6 border-gray-300" />
          <h1 className="text-2xl font-semibold text-gray-900 select-none">
            Dashboard
          </h1>
        </header>

        <main className="flex flex-1 flex-col items-center justify-start p-8 bg-gray-100 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-3xl space-y-8">
            <Card className="rounded-3xl shadow-xl border border-gray-200 bg-white overflow-hidden">
              <CardContent className="p-10">
                <h2 className="text-3xl font-extrabold mb-6 text-purple-600 tracking-wide">
                  Create a New Template
                </h2>

                <form onSubmit={handleFormSubmit} className="space-y-7">
                  {/* ... your form fields ... */}
                  <div>
                    <Label
                      htmlFor="templateName"
                      className="block mb-2 text-lg font-medium text-gray-800"
                    >
                      Template Name
                    </Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter a unique template name"
                      required
                      className="text-lg placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="block mb-2 text-lg font-medium text-gray-800"
                    >
                      Description
                    </Label>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                      Please provide a brief description of the document you are
                      uploading. This helps us understand the document type
                      (e.g., “Invoice from Supplier XYZ”, “Customer Receipt”,
                      “Bank Statement”) and the information it contains. This is
                      essential for accurate processing.
                    </p>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your document here..."
                      required
                      rows={5}
                      className="text-base placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="pdfFile"
                      className="block mb-2 text-lg font-medium text-gray-800"
                    >
                      Upload PDF
                    </Label>
                    <Input
                      id="pdfFile"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPdfFile(file);
                      }}
                      required
                      className="text-base"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 text-lg font-semibold transition ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-400"
                    }`}
                  >
                    {loading
                      ? "Uploading…"
                      : "Start Analysing & Create Template"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {apiResponseData && (
              <Card className="rounded-3xl shadow-xl border border-gray-200 bg-white overflow-hidden">
                <CardContent className="p-10">
                  <h3 className="text-2xl font-bold mb-4 text-purple-600 tracking-wide">
                    Template Processing Result
                  </h3>
                  <p className="mb-4 text-gray-800">
                    {apiResponseData.message}
                  </p>

                  {apiResponseData.template_data && apiResponseData.template_data.pages && (
                    <div>
                      <h4 className="text-xl font-semibold mb-2 text-purple-500">
                        Extracted Data:
                      </h4>
                      {apiResponseData.template_data.pages.map((pageData) => (
                        <div key={pageData.page} className="mb-6 p-4 border border-gray-300 rounded-md">
                          <h5 className="text-lg font-semibold mb-2 text-gray-700">
                            Page {pageData.page}
                          </h5>
                          <p className="mb-2 text-gray-600">
                            Annotated Image: {pageData.annotated_image}
                          </p>
                          <h6 className="text-md font-semibold mb-1 text-purple-400">
                            Key Values:
                          </h6>
                          <div className="ml-4">
                            {Object.entries(pageData.key_values).map(([key, value]) => (
                              <p key={key} className="text-gray-600">
                                <span className="font-semibold">{key}:</span> {value}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {apiResponseData.template_data && !apiResponseData.template_data.pages && (
                    <div>
                      <h4 className="text-xl font-semibold mb-2 text-purple-500">
                        Template Data:
                      </h4>
                      <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                        {JSON.stringify(apiResponseData.template_data, null, 2)}
                      </pre>
                      <p className="text-sm text-gray-500 mt-2">
                        (Data structure might vary based on the processed template)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}