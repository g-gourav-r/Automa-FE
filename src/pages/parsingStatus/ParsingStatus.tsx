import createApiCall, { GET } from "@/components/api/api";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type FileProcessingStatusType = {
  id: number;
  task_id: string;
  file_name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function ParsingStatus() {
  // API call setup
  const listStatus = createApiCall("template/file-processing-statuses/", GET);

  // State for results and loading
  const [results, setResults] = useState<FileProcessingStatusType[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Get token utility
  const getToken = () => {
    const appData = JSON.parse(localStorage.getItem("appData") || "{}");
    return appData.token || null;
  };

  // Fetch initial template statuses
  useEffect(() => {
    const token = getToken();
    setLoadingTemplates(true);

    listStatus({ headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res && Array.isArray(res)) setResults(res);
      })
      .catch(() => {
        toast.error("Failed to load templates.");
      })
      .finally(() => {
        setLoadingTemplates(false);
      });
  }, []);

  // Setup WebSocket connection for live updates
  useEffect(() => {
    const ws = new WebSocket(
      "ws://invoice-parser-image-669034154292.asia-south1.run.app/ws/status"
    ); // Update this URL

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setResults((prevResults) => {
          const index = prevResults.findIndex(
            (item) => item.task_id === data.task_id
          );

          if (index !== -1) {
            const updated = [...prevResults];
            updated[index] = {
              ...updated[index],
              status: data.status,
              updated_at: data.updated_at || new Date().toISOString(),
            };
            return updated;
          } else {
            // Add new if not found
            // Ensure data matches type or filter fields as needed
            return [...prevResults, data];
          }
        });
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  // Sort results by created_at descending
  const sortedResults = [...results].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Helper: get Tailwind color for status blinker
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-400";
      case "failed":
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <>
      {/* Blinking animation CSS */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .blinker {
          animation: blink 1.5s linear infinite;
        }
      `}</style>

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-6" />
              <h1 className="text-xl font-semibold text-gray-900">
                Parsing Status
              </h1>
            </div>
          </header>

          <div className="space-y-6 p-5">
            {loadingTemplates ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin mr-2" />
                <span>Loading statuses...</span>
              </div>
            ) : sortedResults.length === 0 ? (
              <p>No file processing statuses found.</p>
            ) : (
              <div className="overflow-auto rounded-lg border border-gray-200">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">File Name</th>
                      <th className="border p-2 text-left">Status</th>
                      <th className="border p-2 text-left">Created At</th>
                      <th className="border p-2 text-left">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map(
                      ({ id, file_name, status, created_at, updated_at }) => (
                        <tr key={id} className="even:bg-gray-50">
                          <td className="border p-2">{file_name}</td>
                          <td className="border p-2 flex items-center gap-2">
                            <span
                              className={`blinker w-3 h-3 rounded-full ${getStatusColor(
                                status
                              )}`}
                            />
                            {status}
                          </td>
                          <td className="border p-2">
                            {new Date(created_at).toLocaleString()}
                          </td>
                          <td className="border p-2">
                            {new Date(updated_at).toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
