import React, { useState } from "react";
import { Save, Key } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "../components/ui/ChangePasswordModal";
import { useAuth } from "../hooks/useAuth";

function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const handleSave = () => {
    toast.success("Cài đặt đã được lưu thành công!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold  mb-6">Cài đặt & Tài khoản</h2>

      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium  mb-4">
                Thông tin gói dịch vụ
              </h3>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Gói hiện tại:</span>
                  <span className="text-primary font-medium">Miễn phí</span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Bạn đang sử dụng gói Miễn phí với các tính năng cơ bản.
                </p>

                <button
                  className="w-full py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  onClick={() => navigate("/comingsoon")}
                >
                  Nâng cấp lên Premium
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <h4 className="font-medium mb-2">So sánh các gói</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Gợi ý món ăn cơ bản
                    </span>
                    <div>
                      <span className="text-primary mr-4">✓</span>
                      <span className="text-primary">✓</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Lưu thực đơn
                    </span>
                    <div>
                      <span className="text-primary mr-4">✓</span>
                      <span className="text-primary">✓</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Thống kê dinh dưỡng nâng cao
                    </span>
                    <div>
                      <span className="text-red-500 mr-4">✗</span>
                      <span className="text-primary">✓</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Xuất PDF danh sách
                    </span>
                    <div>
                      <span className="text-red-500 mr-4">✗</span>
                      <span className="text-primary">✓</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Gợi ý cá nhân hóa
                    </span>
                    <div>
                      <span className="text-red-500 mr-4">✗</span>
                      <span className="text-primary">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Tài khoản & Bảo mật</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email đăng nhập
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800  "
                  />
                </div>

                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </button>
              </div>
            </div>

            {/* Save button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}

export default Settings;
