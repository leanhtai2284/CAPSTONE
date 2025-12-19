import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, X, Loader, Image as ImageIcon, Upload } from "lucide-react";
import newsService from "../../services/newsService";
import { toast } from "react-toastify";
import AdminNavBar from "../layout/AdminNavBar";

const NewsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "recipe",
    featured: false,
    tags: "",
  });

  const categories = [
    { value: "recipe", label: "Công thức nấu ăn" },
    { value: "nutrition", label: "Dinh dưỡng" },
    { value: "cooking-tips", label: "Mẹo nấu ăn" },
    { value: "health", label: "Sức khỏe" },
    { value: "culture", label: "Văn hóa ẩm thực" },
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchNews();
    }
  }, [id]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getNewsById(id);
      const news = response.data;
      setFormData({
        title: news.title || "",
        description: news.description || "",
        content: news.content || "",
        category: news.category || "recipe",
        featured: news.featured || false,
        tags: news.tags?.join(", ") || "",
      });
      // Set preview cho ảnh hiện tại
      if (news.imageUrl) {
        setImagePreview(
          news.imageUrl.startsWith("http")
            ? news.imageUrl
            : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${
                news.imageUrl
              }`
        );
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Không thể tải thông tin tin tức");
      navigate("/admin/news");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      setImageFile(file);
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.content) {
      toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);

      // Tạo FormData để gửi file
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("content", formData.content);
      submitData.append("category", formData.category);
      submitData.append("featured", formData.featured);

      // Parse và append tags
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      submitData.append("tags", JSON.stringify(tagsArray));

      // Append image nếu có
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      if (isEditMode) {
        await newsService.updateNews(id, submitData);
        toast.success("Cập nhật tin tức thành công");
      } else {
        await newsService.createNews(submitData);
        toast.success("Tạo tin tức thành công");
      }

      navigate("/admin/news");
    } catch (error) {
      console.error("Error saving news:", error);
      toast.error(
        isEditMode ? "Không thể cập nhật tin tức" : "Không thể tạo tin tức"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen flex">
        <AdminNavBar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-500">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminNavBar />
      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isEditMode ? "Chỉnh sửa tin tức" : "Tạo tin tức mới"}
            </h1>
            <p className="text-gray-600">
              {isEditMode
                ? "Cập nhật thông tin bài viết tin tức"
                : "Tạo một bài viết tin tức mới"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Thông tin cơ bản
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập tiêu đề bài viết"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả ngắn <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Mô tả ngắn gọn về bài viết (tối đa 500 ký tự)"
                  maxLength="500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 ký tự
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="12"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                  placeholder="Nội dung chi tiết bài viết (Markdown supported)"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Hỗ trợ định dạng Markdown (# Tiêu đề, ## Tiêu đề phụ, **in
                  đậm**, vv.)
                </div>
              </div>

              {/* Category & Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      ⭐ Đánh dấu là tin nổi bật
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <motion.button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Upload size={20} />
                      Chọn ảnh từ máy tính
                    </motion.button>
                    {imagePreview && (
                      <motion.button
                        type="button"
                        onClick={handleRemoveImage}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <X size={20} />
                        Xóa ảnh
                      </motion.button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Định dạng: JPG, PNG, GIF, WEBP. Kích thước tối đa: 5MB
                  </p>

                  {imagePreview && (
                    <div className="mt-3 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Xem trước:
                      </p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-64 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (từ khóa)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ví dụ: món việt, phở, nấu ăn (phân cách bằng dấu phẩy)"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Phân cách các tag bằng dấu phẩy
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition shadow-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditMode ? "Cập nhật" : "Tạo mới"}
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => navigate("/admin/news")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
              >
                <X size={20} />
                Hủy
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsForm;
