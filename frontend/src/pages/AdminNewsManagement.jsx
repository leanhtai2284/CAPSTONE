import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Heart,
    MessageCircle,
    Search,
    Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import newsService from "../services/newsService";
import { toast } from "react-toastify";
import AdminNavBar from "../components/layout/AdminNavBar";

const AdminNewsManagement = () => {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const categories = [
        { value: "all", label: "Tất cả" },
        { value: "recipe", label: "Công thức" },
        { value: "nutrition", label: "Dinh dưỡng" },
        { value: "cooking-tips", label: "Mẹo nấu ăn" },
        { value: "health", label: "Sức khỏe" },
        { value: "culture", label: "Văn hóa" },
    ];

    useEffect(() => {
        fetchNews();
    }, [selectedCategory, searchTerm]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const params = { limit: 100 };
            if (selectedCategory !== "all") params.category = selectedCategory;
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const response = await newsService.getNews(params);
            setNewsList(response.data || []);
        } catch (error) {
            console.error("Error fetching news:", error);
            toast.error("Không thể tải danh sách tin tức");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tin "${title}"?`)) {
            return;
        }

        try {
            await newsService.deleteNews(id);
            toast.success("Đã xóa tin tức");
            fetchNews();
        } catch (error) {
            console.error("Error deleting news:", error);
            toast.error("Không thể xóa tin tức");
        }
    };

    const stats = {
        total: newsList.length,
        featured: newsList.filter((n) => n.featured).length,
        totalViews: newsList.reduce((sum, n) => sum + n.views, 0),
        totalLikes: newsList.reduce((sum, n) => sum + (n.likes?.length || 0), 0),
    };

    return (
        <div className="min-h-screen flex">
            <AdminNavBar />
            <div className="flex-1 ml-64">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Quản lý tin tức
                        </h1>
                        <p className="text-gray-600">
                            Quản lý các bài viết tin tức trên website
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-sm opacity-90 mb-1">Tổng tin tức</div>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-sm opacity-90 mb-1">Tin nổi bật</div>
                            <div className="text-3xl font-bold">{stats.featured}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-sm opacity-90 mb-1">Lượt xem</div>
                            <div className="text-3xl font-bold">
                                {stats.totalViews.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-sm opacity-90 mb-1">Lượt thích</div>
                            <div className="text-3xl font-bold">
                                {stats.totalLikes.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-3 text-gray-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tin tức..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <select
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>

                            <Link to="/admin/news/new">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
                                >
                                    <Plus size={20} />
                                    Tạo tin mới
                                </motion.button>
                            </Link>
                        </div>
                    </div>

                    {/* News List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
                            <p className="mt-4 text-gray-500">Đang tải...</p>
                        </div>
                    ) : newsList.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-md">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-500 text-lg mb-4">Chưa có tin tức nào</p>
                            <Link to="/admin/news/new">
                                <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                                    Tạo tin tức đầu tiên
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Tiêu đề
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Danh mục
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Thống kê
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {newsList.map((news, idx) => (
                                            <motion.tr
                                                key={news._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        {news.imageUrl && (
                                                            <img
                                                                src={news.imageUrl}
                                                                alt={news.title}
                                                                className="w-16 h-16 object-cover rounded-lg border"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-gray-800 line-clamp-1 mb-1">
                                                                {news.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500 line-clamp-2">
                                                                {news.description}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {new Date(news.createdAt).toLocaleDateString(
                                                                    "vi-VN"
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                                        {
                                                            categories.find((c) => c.value === news.category)
                                                                ?.label
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2 items-center text-sm">
                                                        <div className="flex items-center gap-4 text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Eye size={14} />
                                                                {news.views}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Heart size={14} />
                                                                {news.likes?.length || 0}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageCircle size={14} />
                                                                {news.comments?.length || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {news.featured && (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                                            <Star size={12} fill="currentColor" />
                                                            Nổi bật
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link to={`/admin/news/${news._id}/edit`}>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Sửa"
                                                            >
                                                                <Edit size={18} />
                                                            </motion.button>
                                                        </Link>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDelete(news._id, news.title)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={18} />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNewsManagement;
