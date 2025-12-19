import News from "../models/News.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

// @desc    Get all news with pagination, filter, search
// @route   GET /api/news
// @access  Public
export const getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Filter by category
    if (req.query.category && req.query.category !== "all") {
      query.category = req.query.category;
    }

    // Search by title or description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Get total count
    const total = await News.countDocuments(query);

    // Get news with pagination
    const news = await News.find(query)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all news error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách tin tức",
      error: error.message,
    });
  }
};

// @desc    Get featured news
// @route   GET /api/news/featured
// @access  Public
export const getFeaturedNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const news = await News.find({ featured: true })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("Get featured news error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy tin tức nổi bật",
      error: error.message,
    });
  }
};

// @desc    Get single news by ID
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate("author", "name email")
      .populate("comments.user", "name");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức",
      });
    }

    // Increment views
    news.views += 1;
    await news.save();

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("Get news by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy tin tức",
      error: error.message,
    });
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
export const createNews = async (req, res) => {
  try {
    const { title, description, content, category, featured, tags } = req.body;

    // Validate required fields
    if (!title || !description || !content || !category) {
      // Xóa file đã upload nếu có lỗi
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Lấy URL ảnh từ file upload hoặc để trống
    const imageUrl = req.file ? `/uploads/news/${req.file.filename}` : "";

    // Parse tags nếu là string
    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        parsedTags = JSON.parse(tags);
      } else {
        parsedTags = tags;
      }
    }

    const news = await News.create({
      title,
      description,
      content,
      category,
      imageUrl,
      featured: featured === "true" || featured === true,
      tags: parsedTags,
      author: req.user._id,
    });

    const populatedNews = await News.findById(news._id).populate(
      "author",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Tạo tin tức thành công",
      data: populatedNews,
    });
  } catch (error) {
    console.error("Create news error:", error);
    // Xóa file đã upload nếu có lỗi
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo tin tức",
      error: error.message,
    });
  }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
export const updateNews = async (req, res) => {
  try {
    const { title, description, content, category, featured, tags } = req.body;

    const news = await News.findById(req.params.id);

    if (!news) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức",
      });
    }

    // Nếu có file mới được upload
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (news.imageUrl && news.imageUrl.startsWith("/uploads/")) {
        const oldImagePath = `.${news.imageUrl}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      news.imageUrl = `/uploads/news/${req.file.filename}`;
    }

    // Update fields
    if (title) news.title = title;
    if (description) news.description = description;
    if (content) news.content = content;
    if (category) news.category = category;
    if (featured !== undefined) {
      news.featured = featured === "true" || featured === true;
    }
    if (tags) {
      if (typeof tags === "string") {
        news.tags = JSON.parse(tags);
      } else {
        news.tags = tags;
      }
    }

    await news.save();

    const updatedNews = await News.findById(news._id).populate(
      "author",
      "name email"
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật tin tức thành công",
      data: updatedNews,
    });
  } catch (error) {
    console.error("Update news error:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật tin tức",
      error: error.message,
    });
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức",
      });
    }

    // Xóa ảnh nếu có
    if (news.imageUrl && news.imageUrl.startsWith("/uploads/")) {
      const imagePath = `.${news.imageUrl}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await news.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa tin tức thành công",
    });
  } catch (error) {
    console.error("Delete news error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa tin tức",
      error: error.message,
    });
  }
};

// @desc    Like/Unlike news
// @route   POST /api/news/:id/like
// @access  Private
export const likeNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức",
      });
    }

    const userId = req.user._id;
    const likeIndex = news.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      news.likes.splice(likeIndex, 1);
    } else {
      // Like
      news.likes.push(userId);
    }

    await news.save();

    const updatedNews = await News.findById(news._id).populate(
      "author",
      "name email"
    );

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? "Đã bỏ thích" : "Đã thích",
      data: updatedNews,
    });
  } catch (error) {
    console.error("Like news error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thích tin tức",
      error: error.message,
    });
  }
};

// @desc    Add comment to news
// @route   POST /api/news/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nội dung bình luận không được để trống",
      });
    }

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức",
      });
    }

    news.comments.push({
      user: req.user._id,
      content: content.trim(),
    });

    await news.save();

    const updatedNews = await News.findById(news._id)
      .populate("author", "name email")
      .populate("comments.user", "name");

    res.status(200).json({
      success: true,
      message: "Thêm bình luận thành công",
      data: updatedNews,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm bình luận",
      error: error.message,
    });
  }
};
