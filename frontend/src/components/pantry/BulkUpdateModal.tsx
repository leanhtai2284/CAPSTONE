import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PantryItem } from "../../types/pantry";
interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PantryItem[];
  onSave: (
    updatedItems: {
      id: string;
      quantity: number;
    }[],
  ) => void;
}
export function BulkUpdateModal({
  isOpen,
  onClose,
  items,
  onSave,
}: BulkUpdateModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  useEffect(() => {
    if (isOpen) {
      const initialQuantities: Record<string, number> = {};
      items.forEach((item) => {
        const id = item._id || "";
        if (id) {
          initialQuantities[id] = item.quantity;
        }
      });
      setQuantities(initialQuantities);
    }
  }, [isOpen, items]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = Object.entries(quantities).map(([id, quantity]) => ({
      id,
      quantity,
    }));
    onSave(updates);
  };
  const handleQuantityChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setQuantities((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : num,
    }));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            Bulk Update Quantities
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      quantities[item._id ?? ""] === 0
                        ? ""
                        : quantities[item._id ?? ""]
                    }
                    onChange={(e) =>
                      handleQuantityChange(item._id ?? "", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none text-sm"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
