import { useState } from "react";

export const useTemplateState = () => {
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});

  return {
    templateName, setTemplateName,
    description, setDescription,
    pdfFile, setPdfFile,
    error, setError,
    selectedItems, setSelectedItems
  };
};
