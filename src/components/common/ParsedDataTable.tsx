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

type ExtractionResult = {
  result_id: number;
  template_id: number;
  source_file_name: string | null;
  parsed_data: Record<string, any>;
  created_at: string;
};

type ParsedDataTableProps = {
  entries: ExtractionResult[];
};

export function CollapsibleParsedDataTable({ entries }: ParsedDataTableProps) {
  if (!entries || entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No entries to display.</p>
    );
  }

  // Extract unique parsed data keys from all entries
  const parsedDataKeys = Array.from(
    new Set(entries.flatMap((entry) => Object.keys(entry.parsed_data)))
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* Render parsed data keys first */}
          {parsedDataKeys.map((key) => (
            <TableHead key={key}>{key}</TableHead>
          ))}
          {/* Then the Meta data header */}
          <TableHead className="w-[250px]">Meta data</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.result_id}>
            {/* Render parsed data values first */}
            {parsedDataKeys.map((key) => (
              <TableCell key={key}>{entry.parsed_data[key] ?? "-"}</TableCell>
            ))}
            {/* Then the Meta data cell */}
            <TableCell>
              <Accordion type="single" collapsible>
                <AccordionItem value={`item-${entry.result_id}`}>
                  <AccordionTrigger>View</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>Result ID:</strong> {entry.result_id}
                      </div>
                      <div>
                        <strong>Source File:</strong>{" "}
                        {entry.source_file_name || "-"}
                      </div>
                      <div>
                        <strong>Created At:</strong>{" "}
                        {new Date(entry.created_at).toLocaleString()}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
