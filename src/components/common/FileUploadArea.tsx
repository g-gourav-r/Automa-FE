import { Button } from "@/components/ui/button";
import { FileUp, Upload, X } from "lucide-react";
import { useCallback, useState, useRef } from "react";
// Import useRef
import { toast } from "sonner";

type FileUploadAreaProps = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isUploading: boolean;
  onUpload: () => void;
  maxFiles?: number;
};

export function FileUploadArea({
  files,
  setFiles,
  isUploading,
  onUpload,
  maxFiles = 5,
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const totalFiles = files.length + droppedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(
          `You can upload a maximum of ${maxFiles} ${
            maxFiles === 1 ? "file" : "files"
          }.${
            maxFiles === 1
              ? " Use Bulk upload to upload more than one file."
              : ""
          }`
        );
        return;
      }
      setFiles((prev) => [...prev, ...droppedFiles]);
    },
    [files, setFiles, maxFiles]
  );

  const handleBrowseClick = (e?: React.MouseEvent) => {
    // Make event optional for consistent calling
    if (e) {
      e.stopPropagation(); // Stop propagation for the button click
    }
    if (files.length >= maxFiles) {
      toast.error(
        `You can upload a maximum of ${maxFiles} ${
          maxFiles === 1 ? "file" : "files"
        }.${
          maxFiles === 1 ? " Use Bulk upload to upload more than one file." : ""
        }`
      );
      return;
    }
    fileInputRef.current?.click(); // Use the ref to trigger click
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalFiles = files.length + selectedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(`You can upload a maximum of ${maxFiles} files.`);
        // Don't return here if you want to clear the input even if maxFiles is exceeded
        // If you want to keep the selected files in the input until the user takes action,
        // then keep the return here.
      } else {
        setFiles((prev) => [...prev, ...selectedFiles]);
      }

      // 💡 Crucial fix: Clear the input's value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
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
        onClick={() => handleBrowseClick()} // Call without event for div click
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleBrowseClick();
        }}
      >
        <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">
          Drag and drop your files here
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse from your computer
        </p>
        <Button
          variant="outline"
          onClick={handleBrowseClick} // Keep this as is, the event will be passed
          disabled={isUploading}
        >
          Browse Files
        </Button>
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
          ref={fileInputRef} // Assign the ref here
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Selected Files</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between border border-purple-200 rounded-md px-3 py-2 bg-purple-50"
              >
                <span className="text-gray-800 text-sm truncate max-w-[70%]">
                  {file.name}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-500 transition"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isUploading}
              aria-disabled={isUploading}
              onClick={onUpload}
            >
              {isUploading ? (
                "Processing…"
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
    </div>
  );
}
