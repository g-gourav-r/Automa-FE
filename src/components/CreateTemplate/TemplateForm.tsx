import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { FormEvent } from "react";

interface Props {
  templateName: string;
  setTemplateName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  error: string | null;
  setError: (val: string | null) => void;
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const TemplateForm = ({
  templateName,
  setTemplateName,
  description,
  setDescription,
  pdfFile,
  setPdfFile,
  error,
  setError,
  loading,
  onSubmit,
}: Props) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type !== "application/pdf") {
      setError("Only PDF files allowed.");
      setPdfFile(null);
    } else {
      setPdfFile(selectedFile);
      setError(null);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const words = e.target.value.trim().split(/\s+/);
    if (words.length <= 300) setDescription(e.target.value);
  };

  const removeFile = () => setPdfFile(null);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-gray-700 text-sm">Template Name *</Label>
        <Input
          className="rounded-md text-gray-800"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          disabled={loading}
          placeholder="Enter a name for the template"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 text-sm">Upload PDF *</Label>
        {!pdfFile ? (
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="cursor-pointer text-gray-700"
          />
        ) : (
          <div className="flex items-center justify-between border border-purple-200 rounded-md px-3 py-2 bg-purple-50">
            <span className="text-gray-800 text-sm truncate max-w-[80%]">
              {pdfFile.name}
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="text-gray-500 hover:text-red-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 text-sm">Description *</Label>
        <Textarea
          className="rounded-md text-gray-800"
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
          disabled={loading}
          placeholder="Describe what the uploaded PDF contains to improve extraction accuracy in max 300 words"
        />
        <p className="text-xs text-gray-500">
          {description.trim().split(/\s+/).length}/300 words
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 transition text-white"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <span className="w-4 h-4 border-2 border-t-gray-300 border-purple-800 rounded-full animate-spin"></span>
            <span>Processing…</span>
          </span>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Create Template
          </>
        )}
      </Button>
    </form>
  );
};
