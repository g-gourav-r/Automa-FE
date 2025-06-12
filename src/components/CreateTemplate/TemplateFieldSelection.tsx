import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Props {
  keyValues: Array<{ key: string; value: string }>;
  selectedItems: Record<string, string>;
  onChange: (key: string, value: string, checked: boolean) => void;
}

export const TemplateFieldSelection = ({
  keyValues,
  selectedItems,
  onChange,
}: Props) => {
  const [selectAll, setSelectAll] = useState(false);

  // Update selectAll state if all individual checkboxes are selected
  useEffect(() => {
    const allSelected =
      keyValues.length > 0 &&
      keyValues.every(({ key, value }) => selectedItems[key] === value);
    setSelectAll(allSelected);
  }, [keyValues, selectedItems]);

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    keyValues.forEach(({ key, value }) => onChange(key, value, checked));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAllChange}
          className="accent-purple-600"
        />
        <Label className="font-semibold text-purple-600">Select All</Label>
      </div>

      {keyValues.map(({ key, value }, idx) => (
        <div key={`${key}-${idx}`}>
          <Label>{key}</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedItems[key] === value}
              onChange={(e) => onChange(key, value, e.target.checked)}
              className="accent-purple-600"
            />
            <Input value={value} readOnly className="bg-gray-50" />
          </div>
        </div>
      ))}
    </div>
  );
};
