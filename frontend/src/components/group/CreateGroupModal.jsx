import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { useGroup } from "../../hooks/useGroup";
import { toast } from "sonner";

export default function CreateGroupModal({ isOpen, onClose }) {
  const { createGroup, loading } = useGroup();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "healthy",
    privacy: "private",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên nhóm không được để trống";
    }
    if (formData.name.length < 3) {
      newErrors.name = "Tên nhóm phải có ít nhất 3 ký tự";
    }
    if (formData.description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createGroup(formData);
      toast.success("✅ Tạo nhóm thành công!");
      setFormData({
        name: "",
        description: "",
        goal: "healthy",
        privacy: "private",
      });
      onClose();
    } catch (error) {
      toast.error(
        "❌ Lỗi khi tạo nhóm: " + (error.message || "Vui lòng thử lại")
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tạo nhóm mới
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên nhóm
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Nhóm Fitness Sáng"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả mục đích của nhóm..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 ký tự
            </p>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mục tiêu
            </label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="healthy">Ăn uống lành mạnh</option>
              <option value="fitness">Fitness & Tập luyện</option>
              <option value="weight_loss">Giảm cân</option>
              <option value="muscle_gain">Tăng cơ bắp</option>
              <option value="balanced">Cân bằng dinh dưỡng</option>
            </select>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quyền riêng tư
            </label>
            <select
              name="privacy"
              value={formData.privacy}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="private">Riêng tư (chỉ thành viên được mời)</option>
              <option value="public">Công khai (ai cũng có thể tham gia)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo..." : "Tạo nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
