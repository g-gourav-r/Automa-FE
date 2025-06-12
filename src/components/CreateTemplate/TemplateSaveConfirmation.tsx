import { BadgeCheck } from "@/components/animatedIcons/BadgeCheck";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface TemplateSaveConfirmationProps {
  template_name: string;
}

export const TemplateSaveConfirmation = ({
  template_name,
}: TemplateSaveConfirmationProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white p-8 rounded-2xl text-center shadow-xl w-full max-w-sm border border-gray-200"
        >
          <div className="flex items-center justify-center mb-6">
            <BadgeCheck
              width={48}
              height={48}
              stroke="#1FD655"
              strokeWidth={3}
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Template Saved Successfully
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your template{" "}
            <span className="font-medium text-purple-600">{template_name}</span>{" "}
            has been saved and is now available.
          </p>
          <Button
            onClick={() => navigate("/templates/upload")}
            className="border border-purple-600 bg-purple-50 text-purple-600 hover:text-white hover:bg-purple-700 w-full my-2"
            size="lg"
          >
            Upload Files
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="border-purple-600 bg-purple-600 hover:bg-purple-700 my-2 w-full"
            size="lg"
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
