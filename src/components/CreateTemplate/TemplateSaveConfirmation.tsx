import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TemplateSaveConfirmationProps {
  template_name: string;
}

export const TemplateSaveConfirmation = ({
  template_name,
}: TemplateSaveConfirmationProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-full bg-purple-50 border border-purple-300 rounded-xl p-5 text-center space-y-4">
        <h2 className="text-2xl font-semibold text-purple-700">
          Process Complete!
        </h2>
        <p className="text-gray-600">
          Your Template <span className="text-purple-600">{template_name}</span>{" "}
          have been successfully processed.
        </p>
        <Button
          onClick={() => {
            navigate("/document/upload");
          }}
          className="mt-4 px-6 py-2.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Start Uploading
        </Button>
      </div>
    </div>
  );
};
