import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { userService } from "../services/userService";
import AdminNavBar from "../components/layout/AdminNavBar";
import { Store, CheckCircle, XCircle } from "lucide-react";

const AdminStoreApproval = () => {
  const [pendingStores, setPendingStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingStores();
  }, []);

  const loadPendingStores = async () => {
    try {
      setLoading(true);
      const res = await userService.getPendingStores();
      setPendingStores(res?.data || []);
    } catch (error) {
      toast.error(error.message || "Lỗi khi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Duyệt đăng ký cửa hàng này?")) return;
    try {
      await userService.approveStore(id);
      toast.success("Đã duyệt cửa hàng thành công!");
      loadPendingStores();
    } catch (error) {
      toast.error(error.message || "Lỗi khi duyệt");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Từ chối đăng ký cửa hàng này?")) return;
    try {
      await userService.rejectStore(id);
      toast.success("Đã từ chối đăng ký!");
      loadPendingStores();
    } catch (error) {
      toast.error(error.message || "Lỗi khi từ chối");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminNavBar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="h-8 w-8 text-emerald-600" />
            Xét Duyệt Cửa Hàng
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý và duyệt các đơn đăng ký trở thành đối tác bán hàng.
          </p>
        </div>

        {loading ? (
          <div className="text-slate-500">Đang tải...</div>
        ) : pendingStores.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm border border-slate-100">
            Hiện không có đơn đăng ký nào đang chờ duyệt.
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingStores.map((store) => (
              <div
                key={store._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {store.name}
                  </h3>
                  <div className="text-sm text-slate-500 mt-1 space-y-1">
                    <p>
                      <strong>Người đăng ký:</strong> {store.owner?.name} (
                      {store.owner?.email})
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {store.phone || "Không có"}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {store.address || "Không có"}
                    </p>
                    {store.description && (
                      <p>
                        <strong>Mô tả:</strong> {store.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(store._id)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                  >
                    <XCircle className="h-4 w-4" /> Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(store._id)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-md shadow-emerald-200"
                  >
                    <CheckCircle className="h-4 w-4" /> Duyệt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStoreApproval;
