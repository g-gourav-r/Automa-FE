import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

type ExtractionResult = {
  result_id: number;
  template_id: number;
  source_file_name: string | null;
  parsed_data: Record<string, any>;
  created_at: string;
};

type CollapsibleParsedDataTableProps = {
  entries: ExtractionResult[];
};

export function CollapsibleParsedDataTable({
  entries,
}: CollapsibleParsedDataTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<ExtractionResult | null>(
    null
  );

  if (!entries || entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No entries to display.</p>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar / Collapsible Entry List */}
      <Accordion type="single" collapsible className="w-72">
        {entries.map((entry) => (
          <AccordionItem
            value={`item-${entry.result_id}`}
            key={entry.result_id}
          >
            <AccordionTrigger>Entry {entry.result_id}</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm space-y-1 mb-3">
                <div>
                  <strong>Result ID:</strong> {entry.result_id}
                </div>
                <div>
                  <strong>Source File:</strong> {entry.source_file_name}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(entry)}
                className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 transition text-xs"
              >
                View Parsed Data
              </button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Parsed Data Table */}
      <div className="flex-1">
        {selectedEntry ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Parsed Data for Entry {selectedEntry.result_id}
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(selectedEntry.parsed_data).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {Object.values(selectedEntry.parsed_data).map(
                    (value, idx) => (
                      <TableCell key={idx}>{value ?? "-"}</TableCell>
                    )
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">Select an entry to view data.</p>
        )}
      </div>
    </div>
  );
}
