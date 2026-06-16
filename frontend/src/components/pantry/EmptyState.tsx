import React from "react";
import { Plus, ChefHat } from "lucide-react";

interface EmptyStateProps {
  onAddClick: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <ChefHat className="w-12 h-12 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Bạn chưa có nguyên liệu nào trong kho
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Bắt đầu thêm những nguyên liệu bạn đang có ở nhà để tạo kho của riêng
        bạn. Nhờ đó, bạn sẽ dễ dàng tìm được công thức phù hợp và tránh lãng phí
        thực phẩm.
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <Plus className="w-5 h-5 mr-2" />
        Thêm Nguyên Liệu 
      </button>
    </div>
  );
}
