import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ParsedDataModalProps = {
  parsedData: Record<string, string>;
  open: boolean;
  onClose: () => void;
};

export function ParsedDataModal({ parsedData, open, onClose }: ParsedDataModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Parsed Data</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-md">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(parsedData).map((key) => (
                  <th
                    key={key}
                    className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(parsedData).map((value, idx) => (
                  <td
                    key={idx}
                    className="border border-gray-300 px-4 py-2 text-sm text-gray-800"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
