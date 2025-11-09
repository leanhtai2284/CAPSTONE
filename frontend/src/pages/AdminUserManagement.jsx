import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import UserList from "../components/admin/UserList";
import AdminNavBar from "../components/layout/AdminNavBar";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const AdminUserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
  });

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/admin/login");
      return;
    }
    loadUsers();
    loadStats();
  }, [user, navigate, pagination.page, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
      });
      setUsers(response.data.users || []);
      setPagination((prev) => ({
        ...prev,
        ...response.data.pagination,
      }));
    } catch (error) {
      toast.error(error.message || "Không thể tải danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      await userService.deleteUser(id);
      toast.success("Xóa người dùng thành công!");
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error(error.message || "Không thể xóa người dùng");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      toast.success("Cập nhật vai trò thành công!");
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật vai trò");
      // Reload to revert the change
      loadUsers();
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page when filtering
    }));
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminNavBar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-lg text-gray-600 dark:text-gray-300">
            Đang tải danh sách người dùng...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminNavBar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý Tài khoản Người dùng
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý và kiểm soát quyền truy cập của người dùng vào hệ thống
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tổng số</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Quản trị viên</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.totalAdmins}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Người dùng</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalRegularUsers}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Mới (30 ngày)</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.recentUsers}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tìm kiếm theo tên hoặc email
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lọc theo vai trò
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Tất cả</option>
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>
        </div>

        {/* User List */}
        <UserList
          users={users}
          onDelete={handleDelete}
          onUpdateRole={handleUpdateRole}
          currentUserId={user?._id}
          searchTerm={filters.search}
        />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{" "}
              {pagination.total} người dùng
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Trước
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => setPagination((prev) => ({ ...prev, page }))}
                        className={`px-4 py-2 border rounded-lg ${
                          pagination.page === page
                            ? "bg-blue-500 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sau
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;

