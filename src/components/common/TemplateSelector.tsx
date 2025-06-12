import createApiCall, { GET } from "@/components/api/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Template = {
  template_id: string | number;
  template_name: string;
};

type TemplateSelectorProps = {
  onSelectTemplate: (template: Template) => void;
  selectedTemplateId?: string | number;
  disabled?: boolean;
};

export function TemplateSelector({
  onSelectTemplate,
  selectedTemplateId,
  disabled,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const listTemplates = createApiCall("document-templates", GET);

  const getToken = () => {
    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    return appData.token || null;
  };

  useEffect(() => {
    const token = getToken();
    setLoading(true);

    listTemplates({ headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res && Array.isArray(res)) setTemplates(res);
      })
      .catch(() => {
        toast.error("Failed to load templates.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
        <span>Loading templates…</span>
      </div>
    );
  }

  return (
    <Select
      onValueChange={(value) => {
        const template = templates.find((t) => String(t.template_id) === value);
        if (template) onSelectTemplate(template);
      }}
      value={selectedTemplateId ? String(selectedTemplateId) : ""}
      disabled={disabled}
    >
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select Template" />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template) => (
          <SelectItem
            key={template.template_id}
            value={String(template.template_id)}
          >
            {template.template_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
