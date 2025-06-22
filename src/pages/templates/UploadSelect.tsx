import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, FolderUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UploadSelect() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Upload Files">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <Card role="button" onClick={() => navigate("/document/upload/single")}>
          <CardContent className="p-6 flex flex-col items-center">
            <FileUp />
            <h2 className="text-xl text-purple-500 font-semibold mb-4">
              Single File Upload
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              Upload and parse one document at a time.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 transition text-white">
              Go to Single Upload
            </Button>
          </CardContent>
        </Card>

        <Card role="button" onClick={() => navigate("/document/upload/bulk")}>
          <CardContent className="p-6 flex flex-col items-center">
            <FolderUp />
            <h2 className="text-xl text-purple-500 font-semibold mb-4">
              Bulk File Upload
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              Upload and process multiple documents together.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 transition text-white">
              Go to Bulk Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
