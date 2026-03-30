import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  PantryItem,
  Unit,
  StorageLocation,
  Category,
  UNITS,
  STORAGE_LOCATIONS,
  CATEGORIES,
} from "../../types/pantry";
interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PantryItem, "id">) => void;
  editItem?: PantryItem | null;
}
export function AddIngredientModal({
  isOpen,
  onClose,
  onSave,
  editItem,
}: AddIngredientModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>("pcs");
  const [storageLocation, setStorageLocation] =
    useState<StorageLocation>("pantry");
  const [category, setCategory] = useState<Category>("other");
  const [expiryDate, setExpiryDate] = useState("");

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

  const storageLocationLabels: Record<StorageLocation, string> = {
    fridge: "Tủ lạnh",
    freezer: "Tủ đông",
    pantry: "Tủ đựng",
    room: "Nhiệt độ phòng",
  };

  const categoryLabels: Record<Category, string> = {
    protein: "Protein",
    vegetable: "Rau củ",
    fruit: "Hoa quả",
    grain: "Ngũ cốc",
    dairy: "Sản phẩm sữa",
    condiment: "Gia vị",
    beverage: "Đồ uống",
    other: "Khác",
  };
  const [openedDate, setOpenedDate] = useState("");
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name);
        setQuantity(editItem.quantity.toString());
        setUnit(editItem.unit);
        setStorageLocation(editItem.storageLocation);
        setCategory(editItem.category);
        setExpiryDate(editItem.expiryDate);
        setOpenedDate(editItem.openedDate || "");
        setNotes(editItem.notes || "");
      } else {
        // Reset form for new item
        setName("");
        setQuantity("");
        setUnit("pcs");
        setStorageLocation("pantry");
        setCategory("other");
        // Default expiry to 7 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        setExpiryDate(defaultDate.toISOString().split("T")[0]);
        setOpenedDate("");
        setNotes("");
      }
    }
  }, [isOpen, editItem]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !expiryDate) return;
    onSave({
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      storageLocation,
      category,
      expiryDate,
      ...(openedDate && { openedDate }),
      ...(notes.trim() && { notes: notes.trim() }),
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {editItem ? "Chỉnh sửa nguyên liệu" : "Thêm nguyên liệu"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên nguyên liệu
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
              placeholder="vd: Trứng gà, Sữa tươi..."
              required
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số lượng
              </label>
              <input
                type="number"
                id="quantity"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
                placeholder="0"
                required
              />
            </div>
            <div className="w-1/3">
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Đơn vị
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none appearance-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {unitLabels[u] || u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ngày hết hạn
            </label>
            <input
              type="date"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="storageLocation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nơi lưu trữ
              </label>
              <select
                id="storageLocation"
                value={storageLocation}
                onChange={(e) =>
                  setStorageLocation(e.target.value as StorageLocation)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none appearance-none"
              >
                {STORAGE_LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {storageLocationLabels[location] || location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Danh mục
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="openedDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ngày mở hộp (Tùy chọn)
            </label>
            <input
              type="date"
              id="openedDate"
              value={openedDate}
              onChange={(e) => setOpenedDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ghi chú (Tùy chọn)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none resize-none"
              placeholder="Bất kỳ ghi chú bổ sung nào..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              {editItem ? "Lưu thay đổi" : "Thêm nguyên liệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
