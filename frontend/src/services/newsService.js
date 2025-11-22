const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USE_API = import.meta.env.VITE_USE_API === "true";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const mockDelay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const mockNews = [
  {
    id: "1",
    title: "10 Món Ăn Việt Nam Nổi Tiếng Thế Giới",
    summary:
      "Khám phá những món ăn Việt Nam đã chinh phục thế giới với hương vị độc đáo và giá trị dinh dưỡng cao.",
    content:
      "Việt Nam tự hào có nền ẩm thực phong phú và đa dạng. Từ phở, bánh mì đến bún chả, những món ăn này không chỉ ngon miệng mà còn giàu dinh dưỡng...",
    category: "Ẩm Thực",
    author: "SmartMeal VN",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    publishedAt: "2024-01-15",
    readTime: "5 phút",
    tags: ["Ẩm thực", "Văn hóa", "Dinh dưỡng"],
    views: 1523,
  },
  {
    id: "2",
    title: "Chế Độ Ăn Uống Lành Mạnh Cho Người Bận Rộn",
    summary:
      "Bí quyết ăn uống lành mạnh dành cho người có ít thời gian nhưng vẫn muốn duy trì sức khỏe tốt.",
    content:
      "Cuộc sống hiện đại khiến nhiều người khó duy trì chế độ ăn uống lành mạnh. Tuy nhiên, với một số bí quyết đơn giản...",
    category: "Sức Khỏe",
    author: "SmartMeal VN",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    publishedAt: "2024-01-14",
    readTime: "7 phút",
    tags: ["Sức khỏe", "Dinh dưỡng", "Lối sống"],
    views: 2341,
  },
  {
    id: "3",
    title: "Công Thức Nấu Phở Bò Truyền Thống",
    summary:
      "Hướng dẫn chi tiết cách nấu phở bò chuẩn vị, từ nước dùng thơm ngon đến cách trình bày đẹp mắt.",
    content:
      "Phở bò là món ăn biểu tượng của ẩm thực Việt Nam. Để có được tô phở ngon, bạn cần chú ý đến nhiều yếu tố...",
    category: "Công Thức",
    author: "SmartMeal VN",
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800",
    publishedAt: "2024-01-13",
    readTime: "10 phút",
    tags: ["Công thức", "Phở", "Món Bắc"],
    views: 3421,
  },
  {
    id: "4",
    title: "Lợi Ích Của Việc Ăn Uống Theo Mùa",
    summary:
      "Tìm hiểu tại sao ăn uống theo mùa không chỉ tốt cho sức khỏe mà còn thân thiện với môi trường.",
    content:
      "Ăn uống theo mùa là một cách tiếp cận tự nhiên và bền vững với thực phẩm. Thực phẩm theo mùa thường tươi ngon hơn...",
    category: "Sức Khỏe",
    author: "SmartMeal VN",
    image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800",
    publishedAt: "2024-01-12",
    readTime: "6 phút",
    tags: ["Sức khỏe", "Môi trường", "Lối sống"],
    views: 1892,
  },
  {
    id: "5",
    title: "Bí Quyết Giữ Dáng Với Ẩm Thực Việt",
    summary:
      "Cách giữ dáng hiệu quả bằng cách kết hợp các món ăn Việt Nam truyền thống vào chế độ ăn hàng ngày.",
    content:
      "Ẩm thực Việt Nam không chỉ ngon mà còn có nhiều món ăn phù hợp cho việc giữ dáng. Với nhiều rau củ, thịt nạc...",
    category: "Sức Khỏe",
    author: "SmartMeal VN",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    publishedAt: "2024-01-11",
    readTime: "8 phút",
    tags: ["Sức khỏe", "Giảm cân", "Dinh dưỡng"],
    views: 2756,
  },
  {
    id: "6",
    title: "Khám Phá Ẩm Thực Miền Trung",
    summary:
      "Hành trình khám phá những món ăn đặc sắc của miền Trung Việt Nam với hương vị cay nồng đặc trưng.",
    content:
      "Miền Trung Việt Nam nổi tiếng với ẩm thực đậm đà, cay nồng. Từ bún bò Huế, cao lầu Hội An đến bánh xèo...",
    category: "Ẩm Thực",
    author: "SmartMeal VN",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    publishedAt: "2024-01-10",
    readTime: "9 phút",
    tags: ["Ẩm thực", "Miền Trung", "Văn hóa"],
    views: 1987,
  },
  {
    id: "7",
    title: "Thực Đơn Cho Người Ăn Chay",
    summary:
      "Gợi ý thực đơn đa dạng và đầy đủ dinh dưỡng cho người ăn chay, từ bữa sáng đến bữa tối.",
    content:
      "Ăn chay không có nghĩa là nhàm chán hay thiếu dinh dưỡng. Với sự đa dạng của ẩm thực Việt Nam...",
    category: "Dinh Dưỡng",
    author: "SmartMeal VN",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    publishedAt: "2024-01-09",
    readTime: "6 phút",
    tags: ["Ăn chay", "Dinh dưỡng", "Thực đơn"],
    views: 1634,
  },
  {
    id: "8",
    title: "Cách Bảo Quản Thực Phẩm Tươi Ngon",
    summary:
      "Mẹo bảo quản thực phẩm giúp giữ được độ tươi ngon và dinh dưỡng lâu nhất có thể.",
    content:
      "Bảo quản thực phẩm đúng cách không chỉ giúp tiết kiệm mà còn đảm bảo an toàn thực phẩm. Mỗi loại thực phẩm...",
    category: "Mẹo Vặt",
    author: "SmartMeal VN",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
    publishedAt: "2024-01-08",
    readTime: "5 phút",
    tags: ["Mẹo vặt", "Bảo quản", "An toàn"],
    views: 1423,
  },
];

async function tryFetchJson(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { signal: controller.signal, ...opts });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export const newsService = {
  // Get all news articles (tries API then falls back to mock)
  async getAllNews(category = null, search = "") {
    if (USE_API) {
      try {
        const params = new URLSearchParams();
        if (category && category !== "Tất cả") params.append("category", category);
        if (search) params.append("search", search);
        const data = await tryFetchJson(`${API_BASE}/api/news?${params.toString()}`, {
          headers: getAuthHeaders(),
        });
        // Expect API to return { items, total }
        if (data && Array.isArray(data.items)) return { items: data.items, total: data.total ?? data.items.length };
      } catch (err) {
        console.warn("newsService.getAllNews API failed, falling back to mock:", err.message);
      }
    }

    // Fallback: mock implementation
    await mockDelay(400);
    let filtered = [...mockNews];
    if (category && category !== "Tất cả") filtered = filtered.filter((n) => n.category === category);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.summary.toLowerCase().includes(s) ||
          (n.tags || []).some((t) => t.toLowerCase().includes(s))
      );
    }
    filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return { items: filtered, total: filtered.length };
  },

  // Get news by ID
  async getNewsById(id) {
    if (USE_API) {
      try {
        const data = await tryFetchJson(`${API_BASE}/api/news/${id}`, {
          headers: getAuthHeaders(),
        });
        return data;
      } catch (err) {
        console.warn("newsService.getNewsById API failed, falling back to mock:", err.message);
      }
    }

    await mockDelay(200);
    const found = mockNews.find((m) => String(m.id) === String(id));
    if (!found) throw new Error("Không tìm thấy bài viết");
    return found;
  },

  // Get categories
  async getCategories() {
    if (USE_API) {
      try {
        const data = await tryFetchJson(`${API_BASE}/api/news/categories`, {
          headers: getAuthHeaders(),
        });
        if (Array.isArray(data)) return ["Tất cả", ...data];
        if (data && Array.isArray(data.items)) return ["Tất cả", ...data.items];
      } catch (err) {
        console.warn("newsService.getCategories API failed, falling back to mock:", err.message);
      }
    }

    // Mock categories
    await mockDelay(100);
    const cats = [...new Set(mockNews.map((n) => n.category))];
    return ["Tất cả", ...cats];
  },

  // Get featured news (tries API then fallback)
  async getFeaturedNews(limit = 3) {
    if (USE_API) {
      try {
        const data = await tryFetchJson(`${API_BASE}/api/news/featured?limit=${encodeURIComponent(limit)}`, {
          headers: getAuthHeaders(),
        });
        if (Array.isArray(data)) return data.slice(0, limit);
        if (data && Array.isArray(data.items)) return data.items.slice(0, limit);
      } catch (err) {
        console.warn("newsService.getFeaturedNews API failed, falling back to mock:", err.message);
      }
    }

    await mockDelay(200);
    return [...mockNews].sort((a, b) => b.views - a.views).slice(0, limit);
  },
};