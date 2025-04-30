import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, Upload } from "lucide-react";
import { toast } from "sonner";

export default function FileUpload() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 🟣 Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  // 🟣 File Browse Handler
  const handleBrowseClick = () => {
    document.getElementById("file-upload")?.click();
  };

  // 🟣 File Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  // 🟣 Upload Handler
  const handleUpload = () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    fetch(
      "https://invoice-parser-image-669034154292.asia-south1.run.app/api/parse_invoice/",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Upload failed");
        }
        return response.json();
      })
      .then((data) => {
        toast.success(`${files.length} file uploaded and parsed successfully`);
        navigate("/review/", {
          state: {
            apiResponse: data,
            file: files[0],
          },
        });
      })
      .catch((error) => {
        toast.error("Upload failed: " + error.message);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
        </div>

        {/* Upload Area */}
        <Card>
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                Drag and drop your files here
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse from your computer
              </p>
              <Button variant="outline" onClick={handleBrowseClick}>
                Browse Files
              </Button>

              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Selected Files</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-4">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>

                {/* Upload Button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isUploading}
                    onClick={handleUpload}
                  >
                    {isUploading ? (
                      "Processing..."
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Process {files.length}{" "}
                        {files.length === 1 ? "file" : "files"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
