import { Button } from "@/components/ui/button";
// Make sure this import is present
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ---------- Types ---------- */
export type DocumentSummary = {
  template_id: string | number;
  template_name: string;
  total_files: number;
  submitted_files: number;
  processing_files: number;
  completed_files: number;
  failed_files: number;
  // --- NEW: Add these fields to DocumentSummary ---
  template_data?: Record<string, any>;
  original_file_gcs_link?: string;
  annotated_file_gcs_link?: string;
};

type DocumentCardProps = {
  summary: DocumentSummary;
  onViewOriginalPdf: (url: string, title: string) => Promise<void>;
  onViewAnnotatedPdf: (url: string, title: string) => Promise<void>;
  onViewTemplateData: (data: Record<string, any>, name: string) => void;
};

/* ---------- <DocumentCard/> ---------- */
const DocumentCard = ({
  summary,
  onViewOriginalPdf,
  onViewAnnotatedPdf,
  onViewTemplateData,
}: DocumentCardProps) => {
  const {
    template_id,
    template_name,
    total_files,
    submitted_files,
    processing_files,
    completed_files,
    failed_files,
    // --- NEW: Destructure the added fields from summary ---
    template_data,
    original_file_gcs_link,
    annotated_file_gcs_link,
  } = summary;

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-purple-500 flex justify-between items-center">
          <span>{template_name}</span>
          <span className="text-xs text-muted-foreground">
            id&nbsp;:&nbsp;{template_id}
          </span>
        </CardTitle>

        <CardDescription>Document Processing Summary</CardDescription>
      </CardHeader>

      <CardContent className="px-2 ">
        <div className="grid gap-3 text-sm border border-purple-200 rounded p-2 mb-4 bg-purple-50">
          <p>
            <strong className="text-purple-700">Total Files:</strong>{" "}
            {total_files}
          </p>
          <p>
            <strong className="text-purple-700">Submitted:</strong>{" "}
            {submitted_files}
          </p>
          <p>
            <strong className="text-purple-700">Processing:</strong>{" "}
            {processing_files}
          </p>
          <p>
            <strong className="text-purple-700">Completed:</strong>{" "}
            {completed_files}
          </p>
          <p>
            <strong className="text-purple-700">Failed:</strong> {failed_files}
          </p>
        </div>

        {/* Action Buttons for Template Data and Files */}
        {/* THIS IS THE KEY PART WHERE THE BUTTONS ARE RENDERED */}
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          {/* View Template Data Button */}
          {template_data && Object.keys(template_data).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewTemplateData(template_data, template_name)}
            >
              View Template Data
            </Button>
          )}

          {/* View Original File Button */}
          {original_file_gcs_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onViewOriginalPdf(
                  original_file_gcs_link,
                  `Original: ${template_name}`
                )
              }
            >
              View Original
            </Button>
          )}

          {/* View Annotated File Button */}
          {annotated_file_gcs_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onViewAnnotatedPdf(
                  annotated_file_gcs_link,
                  `Annotated: ${template_name}`
                )
              }
            >
              View Annotated
            </Button>
          )}
        </div>

        {/* The "View Upload" link has been replaced by the more specific buttons above */}
        {/*
        <div className="mt-4 text-right">
          <a
            href="#" // Replace with actual link
            className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors duration-200"
          >
            View Upload &rarr;
          </a>
        </div>
        */}
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
