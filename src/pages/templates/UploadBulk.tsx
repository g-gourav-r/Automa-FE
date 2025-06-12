import { MainLayout } from "@/components/MainLayout";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { FileUploadArea } from "@/components/common/FileUploadArea";
import { TemplateSelector } from "@/components/common/TemplateSelector";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { toast } from "sonner";

type Template = {
  template_id: string | number;
  template_name: string;
  description?: string;
};

const steps = [
  "Select Template",
  "Confirm Details",
  "Upload Files",
  "Complete",
];

const UploadBulk: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const nextStep = () =>
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStepIndex((prev) => Math.max(prev - 1, 0));

  const getCurrentStep = () => steps[currentStepIndex];

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`${files.length} file(s) uploaded successfully.`);
      nextStep();
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout title="Bulk Upload">
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb steps={steps} currentStep={getCurrentStep()} />
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Back
          </Button>
          {/* Only show next button when not on last step */}
          {currentStepIndex < 3 && (
            <Button
              className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
              onClick={nextStep}
              disabled={
                (currentStepIndex === 0 && !selectedTemplate) ||
                (currentStepIndex === 2 && files.length === 0)
              }
            >
              {currentStepIndex === 2 ? "Upload & Next" : "Next"}
            </Button>
          )}
        </div>
      </div>

      {/* Step 1: Select Template */}
      {currentStepIndex === 0 && (
        <div className="space-y-4 flex space-x-4">
          <TemplateSelector
            onSelectTemplate={(template) => setSelectedTemplate(template)}
            selectedTemplateId={selectedTemplate?.template_id}
          />
          <Button
            className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
            onClick={nextStep}
          >
            Next
          </Button>
        </div>
      )}

      {/* Step 2: Confirm Details */}
      {currentStepIndex === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Confirm Selected Template</h2>
          {selectedTemplate ? (
            <div className="border rounded p-4 bg-green-50 space-y-1">
              <p className="font-medium">{selectedTemplate.template_name}</p>
              {selectedTemplate.description && (
                <p className="text-sm text-gray-600">
                  {selectedTemplate.description}
                </p>
              )}
              <p className="text-xs text-gray-500">
                ID: {selectedTemplate.template_id}
              </p>
            </div>
          ) : (
            <p>No template selected.</p>
          )}
        </div>
      )}

      {/* Step 3: Upload Files */}
      {currentStepIndex === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">
            Upload Files for {selectedTemplate?.template_name}
          </h2>
          <p className="text-gray-600 text-sm">
            Selected Template ID: {selectedTemplate?.template_id}
          </p>

          <FileUploadArea
            files={files}
            setFiles={setFiles}
            isUploading={isUploading}
            onUpload={handleUpload}
            maxFiles={10}
          />
        </div>
      )}

      {/* Step 4: Complete */}
      {currentStepIndex === 3 && (
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-medium text-green-600">
            Upload Complete!
          </h2>
          <p className="text-gray-600">
            Your files have been successfully uploaded.
          </p>
          <Button
            onClick={() => {
              setCurrentStepIndex(0);
              setSelectedTemplate(null);
              setFiles([]);
            }}
            className="mt-4"
          >
            Upload More
          </Button>
        </div>
      )}
    </MainLayout>
  );
};

export default UploadBulk;
