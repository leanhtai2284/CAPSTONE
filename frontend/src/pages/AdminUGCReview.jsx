import React, { useEffect, useState } from "react";
import AdminNavBar from "../components/layout/AdminNavBar";
import { recipeService } from "../services/recipeService";
import { toast } from "react-toastify";
import AdminRecipeDetailModal from "../components/admin/AdminRecipeDetailModal";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminUGCReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/admin/login");
      return;
    }
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getPendingUGC();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Không thể tải danh sách kiểm duyệt");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Phê duyệt công thức này và công khai?")) return;
    try {
      await recipeService.approveUGC(id);
      toast.success("Đã phê duyệt");
      loadPending();
      setSelected(null);
    } catch (err) {
      toast.error(err.message || "Không thể phê duyệt");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Lý do từ chối (tùy chọn):");
    if (reason === null) return; // user cancelled
    try {
      await recipeService.rejectUGC(id, reason);
      toast.success("Đã từ chối công thức");
      loadPending();
      setSelected(null);
    } catch (err) {
      toast.error(err.message || "Không thể từ chối");
    }
  };

  return (
    <div className="min-h-screen flex">
      <AdminNavBar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Kiểm duyệt nội dung
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Danh sách công thức do người dùng gửi chờ phê duyệt
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-600">Đang tải...</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Người gửi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày gửi</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((r) => (
                      <tr key={r._id || r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {r.image_url && (
                              <img src={r.image_url} alt={r.name_vi} className="h-10 w-10 rounded-full object-cover mr-3" />
                            )}
                            <button onClick={() => setSelected(r)} className="text-sm font-medium text-left text-gray-900 dark:text-white hover:underline">
                              {r.name_vi}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{r.uploaded_by?.name || r.uploaded_by?.email || "Người dùng"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(r.createdAt || r.created_at || Date.now()).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => setSelected(r)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3">Xem</button>
                          <button onClick={() => handleApprove(r._id || r.id)} className="text-green-600 hover:text-green-900 mr-3">Phê duyệt</button>
                          <button onClick={() => handleReject(r._id || r.id)} className="text-red-600 hover:text-red-900">Từ chối</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selected && (
            <AdminRecipeDetailModal
              recipe={selected}
              onClose={() => setSelected(null)}
              onApprove={() => handleApprove(selected._id || selected.id)}
              onReject={() => handleReject(selected._id || selected.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUGCReview;
