import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

// Define the structure for a Line Item
interface LineItem {
  Particulars: string;
  Qty: string;
  Rate: string;
  Amount: string;
  position?: { x: number; y: number; w: number; h: number };
}

interface Props {
  keyValues: Array<{ key: string; value: string }>;
  lineItems: LineItem[]; // New prop for line items
  selectedItems: Record<string, string>; // For keyValues selection
  onChange: (key: string, value: string, checked: boolean) => void;
}

export const TemplateFieldSelection = ({
  keyValues,
  lineItems, // Destructure new prop
  selectedItems,
  onChange,
}: Props) => {
  const [selectAllKeyValues, setSelectAllKeyValues] = useState(false);

  // Update selectAllKeyValues state if all individual key-value checkboxes are selected
  useEffect(() => {
    const allSelected =
      keyValues.length > 0 &&
      keyValues.every(({ key, value }) => selectedItems[key] === value);
    setSelectAllKeyValues(allSelected);
  }, [keyValues, selectedItems]);

  const handleSelectAllKeyValuesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setSelectAllKeyValues(checked);
    keyValues.forEach(({ key, value }) => onChange(key, value, checked));
  };

  return (
    <div className="space-y-6">
      {" "}
      {/* Increased spacing for better separation */}
      {/* Key-Value Fields Section */}
      <h3 className="text-lg font-bold text-purple-700">
        General Information Fields
      </h3>
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={selectAllKeyValues}
          onChange={handleSelectAllKeyValuesChange}
          className="accent-purple-600"
        />
        <Label className="font-semibold text-purple-600">
          Select All General Fields
        </Label>
      </div>
      <div className="space-y-4">
        {keyValues.map(({ key, value }, idx) => (
          <div key={`kv-${key}-${idx}`}>
            {" "}
            {/* Added prefix for unique key */}
            <Label htmlFor={`input-${key}-${idx}`}>{key}</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems[key] === value}
                onChange={(e) => onChange(key, value, e.target.checked)}
                className="accent-purple-600"
              />
              <Input
                id={`input-${key}-${idx}`}
                value={value}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
        ))}
      </div>
      {/* Separator */}
      <hr className="my-8 border-t border-gray-300" />
      {/* Line Items Section */}
      <h3 className="text-lg font-bold text-purple-700">Line Items</h3>
      {lineItems.length === 0 ? (
        <p className="text-gray-500">No line items extracted.</p>
      ) : (
        <div className="space-y-4">
          {lineItems.map((item, idx) => (
            <div
              key={`li-${idx}`}
              className="border p-4 rounded-md shadow-sm bg-white"
            >
              <h4 className="font-semibold text-md mb-2">Item {idx + 1}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Label className="font-medium text-gray-700">
                    Particulars:
                  </Label>
                  <Input
                    value={item.Particulars}
                    readOnly
                    className="bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Quantity:</Label>
                  <Input
                    value={item.Qty}
                    readOnly
                    className="bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Rate:</Label>
                  <Input
                    value={item.Rate}
                    readOnly
                    className="bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Amount:</Label>
                  <Input
                    value={item.Amount}
                    readOnly
                    className="bg-gray-50 text-gray-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
