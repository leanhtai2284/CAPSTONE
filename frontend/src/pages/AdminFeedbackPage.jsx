import React, { useEffect, useState } from "react";
import AdminNavBar from "../components/layout/AdminNavBar";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminFeedbackService } from "../services/adminFeedbackService";

const typeLabels = {
  suggestion: "Góp ý",
  bug: "Báo lỗi",
  feature: "Tính năng mới",
};

const statusLabels = {
  pending: "Chờ xử lý",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
};

const getStatusBorderClass = (status) => {
  switch (status) {
    case "in_progress":
      return "border-l-4 border-blue-400";
    case "resolved":
      return "border-l-4 border-green-500";
    case "pending":
    default:
      return "border-l-4 border-yellow-400";
  }
};

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] = useState("pending");
  const [filters, setFilters] = useState({ type: "", status: "", date: "" });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/admin/login");
      return;
    }
    loadData();
  }, [user, navigate, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.date) {
        params.from = filters.date;
        params.to = filters.date;
      }

      const res = await adminFeedbackService.getAll(params);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Bạn chắc chắn muốn xoá góp ý này?")) return;
    try {
      await adminFeedbackService.delete(id);
      setItems((prev) => prev.filter((it) => it._id !== id));
      if (selected && selected._id === id) {
        setSelected(null);
        setResponseText("");
      }
      toast.success("Đã xoá phản hồi");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleSelect = (fb) => {
    setSelected(fb);
    setResponseText(fb.adminResponse || "");
    setStatus(fb.status || "pending");
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      const res = await adminFeedbackService.update(selected._id, {
        status,
        adminResponse: responseText,
      });
      const updated = res.data;
      setItems((prev) => prev.map((it) => (it._id === updated._id ? updated : it)));
      setSelected(updated);
      toast.success("Đã cập nhật phản hồi");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AdminNavBar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-2xl font-bold mb-4">Quản lý góp ý & phản hồi</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: e.target.value || "" }))
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Tất cả loại</option>
                <option value="suggestion">Góp ý</option>
                <option value="bug">Báo lỗi</option>
                <option value="feature">Tính năng mới</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value || "" }))
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã xử lý</option>
              </select>

              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, date: e.target.value || "" }))
                }
                className="border rounded px-2 py-1 text-sm"
              />
            </div>

            {loading ? (
              <div className="text-sm text-gray-500">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có phản hồi nào</div>
            ) : (
              <ul className="divide-y max-h-[520px] overflow-y-auto">
                {items.map((fb) => (
                  <li
                    key={fb._id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex justify-between gap-2 ${getStatusBorderClass(
                      fb.status || "pending"
                    )}`}
                    onClick={() => handleSelect(fb)}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                          {typeLabels[fb.type] || "Khác"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(fb.createdAt).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-sm line-clamp-2">{fb.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {statusLabels[fb.status || "pending"]}
                      </div>
                      {fb.user && (
                        <div className="text-[11px] text-gray-400 mt-1">
                          {fb.user.name} ({fb.user.email})
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, fb._id)}
                      className="text-xs text-red-500 hover:text-red-600 px-1 self-start"
                      title="Xoá góp ý"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="md:w-1/2 bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            {selected ? (
              <>
                <h2 className="text-lg font-semibold mb-2">Chi tiết phản hồi</h2>
                <div className="mb-2 text-sm">
                  <span className="font-medium">Loại:</span> {" "}
                  {typeLabels[selected.type] || selected.type}
                </div>
                <div className="mb-2 text-sm">
                  <span className="font-medium">Người gửi:</span> {" "}
                  {selected.user
                    ? `${selected.user.name} (${selected.user.email})`
                    : "Ẩn danh"}
                </div>
                <div className="mb-3 text-sm">
                  <span className="font-medium">Nội dung:</span>
                  <p className="mt-1 whitespace-pre-wrap">{selected.message}</p>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="resolved">Đã xử lý</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Phản hồi của admin (gửi cho người dùng)
                  </label>
                  <textarea
                    rows={5}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm resize-none"
                    placeholder="Nhập nội dung phản hồi gửi cho người dùng..."
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 text-sm"
                >
                  Cập nhật & gửi phản hồi
                </button>

                {selected.respondedAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Đã phản hồi lúc: {" "}
                    {new Date(selected.respondedAt).toLocaleString("vi-VN")}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">
                Chọn một phản hồi ở bên trái để xem chi tiết và trả lời.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
