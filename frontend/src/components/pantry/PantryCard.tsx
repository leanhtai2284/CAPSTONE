import React from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChefHat,
  Refrigerator,
  FileText,
} from "lucide-react";
import { format } from "date-fns-tz";
import { PantryItem, Unit } from "../../types/pantry";

interface PantryCardProps {
  item: PantryItem;
  onClick: (item: PantryItem) => void;
  onEdit: (item: PantryItem) => void;
  onDelete: (id: string) => void;
  selected?: boolean;
  onSelect?: (itemId: string, selected: boolean) => void;
}
export function PantryCard({
  item,
  onClick,
  onEdit,
  onDelete,
  selected = false,
  onSelect,
}: PantryCardProps) {
  const status =
    item.status ??
    (new Date(item.expiryDate) < new Date() ? "expired" : "fresh");
  const daysToExpire = item.daysToExpire;

  const unitLabels: Record<Unit, string> = {
    g: "gam",
    kg: "kg",
    ml: "ml",
    l: "l",
    pcs: "cái",
    pack: "gói",
    bottle: "chai",
    can: "lon",
  };

  const storageLocationLabels: Record<string, string> = {
    fridge: "Tủ lạnh",
    freezer: "Tủ đông",
    pantry: "Tủ đựng",
    room: "Nhiệt độ phòng",
  };

  const statusConfig = {
    expired: {
      colors: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
      label: "Đã hết hạn",
    },
    expiring: {
      colors: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: Clock,
      label: "Sắp hết hạn",
    },
    fresh: {
      colors: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
      label: "Tươi",
    },
  };

  const config =
    statusConfig[status as "expired" | "expiring" | "fresh"] ||
    statusConfig.fresh;
  const StatusIcon = config.icon;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open recipe panel if clicking on checkbox, label, or buttons
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLLabelElement ||
      e.target instanceof HTMLButtonElement ||
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("label")
    ) {
      return;
    }
    onClick(item);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item._id ?? "");
  };
  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl p-5 shadow-sm border hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col h-full ${
        selected ? "border-primary ring-2 ring-primary" : "border-gray-100"
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Xem công thức cho ${item.name}`}
    >
      {/* Action Buttons (visible on hover) */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleEdit}
          className="p-2 bg-white rounded-full text-gray-400 hover:text-blue-100 hover:bg-blue-600 shadow-sm border border-gray-100 transition-colors"
          aria-label={`Chỉnh sửa ${item.name}`}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 bg-white rounded-full text-gray-400 hover:text-red-100 hover:bg-red-600 shadow-sm border border-gray-100 transition-colors"
          aria-label={`Xóa ${item.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        {onSelect && (
          <label className="inline-flex items-center mb-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(item._id ?? "", e.target.checked);
              }}
              className="form-checkbox h-5 w-5 text-green-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-xs text-gray-500"></span>
          </label>
        )}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 " title={item.name}>
              {item.name}
            </h3>

            <p className="text-gray-500 text- font-medium mt-1">
              {item.quantity} {unitLabels[item.unit] || item.unit}
            </p>
          </div>

          <div className="flex text-gray-500 text-sm mt-2 gap-1 items-center">
            <Refrigerator className="w-4 h-4" />
            <span>
              {storageLocationLabels[item.storageLocation] ||
                item.storageLocation}
            </span>
          </div>
        </div>

        {item.notes && (
          <div className="flex items-start text-xs text-gray-500 mt-2 gap-1">
            <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span
              className="truncate max-h-5 overflow-hidden"
              title={item.notes}
            >
              {item.notes}
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1.5" />
          <span>
            {format(new Date(item.expiryDate), "MMM d", {
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </span>
        </div>

        <div
          className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.colors}`}
        >
          <StatusIcon className="w-3.5 h-3.5 mr-1" />
          {config.label}
          {typeof daysToExpire === "number" && (
            <span className="ml-1">({daysToExpire} ngày)</span>
          )}
        </div>
      </div>
    </div>
  );
}
