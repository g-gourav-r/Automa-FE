import createApiCall, { POST } from "@/components/api/api";
import { UploadWizard } from "@/components/common/UploadWizard";
import React from "react";
import { toast } from "sonner";

// Assuming sonner is installed for toasts

// Type definition for Template (re-defined or imported from a common place)
type Template = {
  template_id: string | number;
  template_name: string;
  description?: string;
  template_data?: Record<string, string>;
};

const stepsForSingleUpload = [
  "Select Template",
  "Confirm Details",
  "Upload A File",
  "Complete",
];

const UploadSingle: React.FC = () => {
  // Assuming createApiCall correctly creates a function that accepts
  // an object with headers, urlParameters, and body.
  const uploadSingleFile = createApiCall(
    "documents/extract/{template_id}",
    POST
  );

  // This is the specific upload logic for UploadSingle, passed to UploadWizard
  const handleSingleFileUpload = async (
    files: File[],
    template: Template | null
  ) => {
    // 1. Validate inputs (these toasts are for immediate user feedback before API call)
    if (!template || !template.template_id) {
      toast.error(
        "Template not selected or template ID is missing. Please select a template."
      );
      throw new Error("Template validation failed."); // Throw error to prevent UploadWizard from showing success
    }

    if (files.length === 0) {
      toast.error(
        "No file selected for upload. Please select a file to proceed."
      );
      throw new Error("No file selected."); // Throw error to prevent UploadWizard from showing success
    }

    try {
      // 2. Parse appData and get the token
      const appDataString = localStorage.getItem("appData");
      let token = "";
      if (appDataString) {
        try {
          const appData = JSON.parse(appDataString);
          token = appData.token;
        } catch (parseError) {
          console.error(
            "Failed to parse appData from localStorage:",
            parseError
          );
          toast.error("Authentication data is corrupted. Please log in again.");
          throw new Error("Authentication data corrupted."); // Propagate error
        }
      } else {
        toast.error("Authentication data not found. Please log in.");
        throw new Error("Authentication data not found."); // Propagate error
      }

      // 3. Create FormData object and append the file
      const formData = new FormData();
      formData.append("file", files[0]); // 'file' is the field name expected by the backend

      // 4. Construct API call payload
      const payload = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        pathVariables: {
          template_id: template.template_id, // This will replace {template_id} in the URL
        },
        body: formData, // The FormData object itself
      };

      // 5. Execute the API call
      console.log("Calling uploadSingleFile with payload:", payload);
      await uploadSingleFile(payload);

      // --- Show success toast only here after successful API call ---
      toast.success(
        `File "${files[0].name}" uploaded and processed successfully!`
      );
      // No need to explicitly return a success value, just don't throw.
    } catch (error) {
      console.error("Upload failed in handleSingleFileUpload:", error);
      // --- Show failure toast only here when API call fails ---
      toast.error(
        `Failed to process file: ${
          error instanceof Error && error.message
            ? error.message
            : "An unexpected error occurred. Please try again."
        }`
      );
      // --- IMPORTANT: Re-throw the error so UploadWizard's catch block is triggered ---
      // This allows UploadWizard to correctly set its uploadSuccess state to false
      // and display the "Process Failed!" UI on the last step.
      throw error;
    }
  };

  return (
    <UploadWizard
      title="Single File Upload" // Specific title for this use case
      steps={stepsForSingleUpload} // Specific steps for this use case
      maxFiles={1} // Restrict to a single file
      onUpload={handleSingleFileUpload} // Pass the specific upload handler
    />
  );
};

export default UploadSingle;
