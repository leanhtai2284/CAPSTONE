import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: [true, "Nội dung bình luận không được để trống"],
        trim: true,
        maxLength: [500, "Bình luận không được vượt quá 500 ký tự"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Tiêu đề không được để trống"],
            trim: true,
            maxLength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
        },
        description: {
            type: String,
            required: [true, "Mô tả không được để trống"],
            trim: true,
            maxLength: [500, "Mô tả không được vượt quá 500 ký tự"],
        },
        content: {
            type: String,
            required: [true, "Nội dung không được để trống"],
        },
        category: {
            type: String,
            required: [true, "Danh mục không được để trống"],
            enum: {
                values: ["recipe", "nutrition", "cooking-tips", "health", "culture"],
                message: "Danh mục không hợp lệ",
            },
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Tác giả không được để trống"],
        },
        imageUrl: {
            type: String,
            default: "",
            trim: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [commentSchema],
        views: {
            type: Number,
            default: 0,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index để tối ưu query
newsSchema.index({ category: 1, createdAt: -1 });
newsSchema.index({ featured: 1, createdAt: -1 });
newsSchema.index({ title: "text", description: "text" });

// Virtual để lấy số lượng likes
newsSchema.virtual("likesCount").get(function () {
    return this.likes.length;
});

// Virtual để lấy số lượng comments
newsSchema.virtual("commentsCount").get(function () {
    return this.comments.length;
});

// Đảm bảo virtuals được bao gồm khi convert sang JSON
newsSchema.set("toJSON", { virtuals: true });
newsSchema.set("toObject", { virtuals: true });

const News = mongoose.model("News", newsSchema);

export default News;
