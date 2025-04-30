import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const DocumentPreview = ({ file }: { file: File }) => {
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      // Cleanup object URL when component unmounts
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) {
    return <div>No document selected</div>;
  }

  return (
    <div className="h-[80vh] overflow-hidden">
      {fileUrl ? (
        <Worker
          workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
        >
          <Viewer fileUrl={fileUrl} />
        </Worker>
      ) : (
        <div>Loading preview…</div>
      )}
    </div>
  );
};

export default DocumentPreview;
