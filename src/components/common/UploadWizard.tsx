import { MainLayout } from "@/components/MainLayout";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { FileUploadArea } from "@/components/common/FileUploadArea";
import { TemplateSelector } from "@/components/common/TemplateSelector";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// toast import is commented out as it's not used here anymore for outcome messages
// import { toast } from "sonner";

// Type definition for Template
type Template = {
  template_id: string | number;
  template_name: string;
  description?: string;
  template_data?: Record<string, string>;
};

type UploadWizardProps = {
  title: string;
  steps: string[];
  maxFiles: number;
  // The onUpload prop is now called by the wizard's internal handler
  onUpload: (files: File[], template: Template | null) => Promise<void>;
};

export const UploadWizard: React.FC<UploadWizardProps> = ({
  title,
  steps,
  maxFiles,
  onUpload, // Destructure the onUpload prop here
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null); // State to track success/failure of the upload
  const navigate = useNavigate();

  const nextStep = () => {
    // Reset upload success status when navigating away from the completion step
    if (currentStepIndex === steps.length - 1) {
      setUploadSuccess(null);
    }
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => {
    // Reset upload success status when navigating away from the completion step
    if (currentStepIndex === steps.length - 1) {
      setUploadSuccess(null);
    }
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  // This internal function will now call the 'onUpload' prop provided by the parent
  const handleProcessAndUpload = async () => {
    if (files.length === 0) {
      // This pre-validation can stay here.
      // toast.error("Please select at least one file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null); // Reset success state before starting new upload
    try {
      await onUpload(files, selectedTemplate);
      setUploadSuccess(true); // Set success to true if onUpload completes without error
    } catch (error) {
      console.error("Processing failed in UploadWizard:", error);
      setUploadSuccess(false); // Set success to false if onUpload throws an error
    } finally {
      setIsUploading(false);
      nextStep(); // Always advance to the next step (completion screen)
    }
  };

  const getCurrentStepName = () => steps[currentStepIndex];

  return (
    <MainLayout title={title}>
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb steps={steps} currentStep={getCurrentStepName()} />
        <div className="space-x-2">
          <Button
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
            onClick={prevStep}
            variant="outline"
            // Disable Back button in the first and last step
            disabled={
              currentStepIndex === 0 || currentStepIndex === steps.length - 1
            }
          >
            Back
          </Button>
          {currentStepIndex < steps.length - 1 && (
            <Button
              className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
              onClick={
                currentStepIndex === 2 ? handleProcessAndUpload : nextStep
              }
              disabled={
                (currentStepIndex === 0 && !selectedTemplate) ||
                (currentStepIndex === 2 && files.length === 0) ||
                isUploading // Disable button while processing
              }
            >
              {currentStepIndex === 2
                ? isUploading // Show "Processing..." while uploading
                  ? "Processing…"
                  : "Process" // Default "Process"
                : "Next"}
            </Button>
          )}
          {/* Show a "Back to Dashboard" button on the completion step if successful, or "Process More" / "Retry" below*/}
          {currentStepIndex === steps.length - 1 && uploadSuccess && (
            <Button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
            >
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Step 0: Select Template */}
      {currentStepIndex === 0 && (
        <div className="flex flex-col space-y-6">
          <p className="text-gray-600">
            Choose a template from your list, or create a new one{" "}
            <a
              onClick={() => navigate("/templates/create")}
              className="text-purple-600 font-medium cursor-pointer hover:underline"
            >
              here
            </a>
            .
          </p>

          <div className="flex space-x-6 items-start">
            <TemplateSelector
              onSelectTemplate={(template) => setSelectedTemplate(template)}
              selectedTemplateId={selectedTemplate?.template_id}
            />
          </div>
        </div>
      )}

      {/* Step 1: Confirm Details */}
      {currentStepIndex === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Confirm Selected Template</h2>

          {selectedTemplate ? (
            <div className="border rounded-lg p-4 bg-purple-50">
              <div className="flex justify-between mb-2">
                <p className="font-medium text-purple-800">
                  {selectedTemplate.template_name}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {selectedTemplate.template_id}
                </p>
              </div>

              {selectedTemplate.description && (
                <p className="text-sm text-gray-600 py-3">
                  {selectedTemplate.description}
                </p>
              )}

              {/* Template Data */}
              {selectedTemplate.template_data && (
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-purple-400">Field</TableHead>
                        <TableHead className="text-purple-400">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(selectedTemplate.template_data).map(
                        ([key, value], index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{key}</TableCell>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No template selected.</p>
          )}
        </div>
      )}

      {/* Step 2: Upload Files */}
      {currentStepIndex === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">
            Upload File(s){" "}
            {selectedTemplate?.template_name
              ? `for ${selectedTemplate.template_name}`
              : ""}
          </h2>
          {selectedTemplate && (
            <p className="text-gray-600 text-sm">
              Selected Template ID: {selectedTemplate.template_id}
            </p>
          )}

          <FileUploadArea
            files={files}
            setFiles={setFiles}
            isUploading={isUploading}
            onUpload={handleProcessAndUpload} // FileUploadArea's internal button will trigger this
            maxFiles={maxFiles}
          />
          {/* This message is now only for immediate feedback on step 2, if needed */}
          {/* {hasUploadFailed && (
            <p className="text-red-600 text-sm text-center mt-2">
              Upload failed. Please try again.
            </p>
          )} */}
        </div>
      )}

      {/* Step 3: Completion / Failure */}
      {currentStepIndex === steps.length - 1 && (
        <div className="text-center space-y-4">
          {uploadSuccess ? (
            <>
              {" "}
              <div className="w-full h-full flex justify-center items-center">
                <div className="w-full bg-purple-50 border border-purple-300 rounded-xl p-5 text-center space-y-4">
                  <h2 className="text-2xl font-semibold text-purple-700">
                    Process Complete!
                  </h2>
                  <p className="text-gray-600">
                    Your file(s) have been successfully processed.
                  </p>
                  <Button
                    onClick={() => {
                      setCurrentStepIndex(0);
                      setSelectedTemplate(null);
                      setFiles([]);
                      setUploadSuccess(null); // Reset state for a new process
                    }}
                    className="mt-4 px-6 py-2.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                  >
                    Process More
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Applied the requested styling for the failure message
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-full bg-purple-50 border border-purple-300 rounded-xl p-5 text-center space-y-4">
                <h2 className="text-2xl font-semibold text-red-700">
                  Process Failed!
                </h2>
                <p className="text-gray-600">
                  There was an issue processing your file(s). Please try again.
                </p>
                <Button
                  onClick={() => {
                    setCurrentStepIndex(2); // Go back to the upload step to retry
                    setUploadSuccess(null); // Clear success/failure state
                  }}
                  className="mt-4 px-6 py-2.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};
