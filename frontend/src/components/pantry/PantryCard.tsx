import React from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChefHat,
  MapPin,
  FileText,
} from "lucide-react";
import { PantryItem, Unit } from "../../types/pantry";

interface PantryCardProps {
  item: PantryItem;
  onClick: (item: PantryItem) => void;
  onEdit: (item: PantryItem) => void;
  onDelete: (id: string) => void;
}
export function PantryCard({
  item,
  onClick,
  onEdit,
  onDelete,
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
      onClick={() => onClick(item)}
      className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col h-full"
      role="button"
      tabIndex={0}
      aria-label={`Xem công thức cho ${item.name}`}
    >
      {/* Tooltip - visible on hover */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 flex items-center shadow-lg">
        <ChefHat className="w-3.5 h-3.5 mr-1.5" />
        Nhấp để xem gợi ý công thức
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </div>

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

      <div className="mb-4 pr-20">
        <h3
          className="text-lg font-bold text-gray-900 truncate"
          title={item.name}
        >
          {item.name}
        </h3>
        <p className="text-gray-500 font-medium mt-1">
          {item.quantity} {unitLabels[item.unit] || item.unit}
        </p>
        <div className="flex items-center text-xs text-gray-500 mt-2 gap-1">
          <MapPin className="w-3 h-3" />
          <span>
            {storageLocationLabels[item.storageLocation] ||
              item.storageLocation}
          </span>
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
            {new Date(item.expiryDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div
          className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.colors}`}
        >
          <StatusIcon className="w-3.5 h-3.5 mr-1" />
          {config.label}
          {typeof daysToExpire === "number" && (
            <span className="ml-1">({daysToExpire}d)</span>
          )}
        </div>
      </div>
    </div>
  );
}
