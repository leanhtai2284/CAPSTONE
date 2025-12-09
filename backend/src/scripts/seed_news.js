import dotenv from "dotenv";
import connectDB from "../config/db.js";
import News from "../models/News.js";
import User from "../models/User.js";

dotenv.config();

const sampleNews = [
    {
        title: "10 Mẹo nấu phở bò đậm đà hương vị",
        description: "Khám phá bí quyết nấu một tô phở bò thơm ngon, nước dùng trong veo với hương vị truyền thống Hà Nội.",
        content: `
# Mẹo nấu phở bò ngon

Phở bò là món ăn truyền thống của Việt Nam, đặc biệt là miền Bắc. Để có một tô phở ngon, bạn cần chú ý:

## 1. Chọn xương

- Xương ống bò tươi, không mùi hôi
- Xương phải to, có nhiều tủy
- Ngâm xương với nước muối pha chanh 30 phút để khử mùi hôi

## 2. Làm nước dùng

- Hầm xương ít nhất 3-4 giờ
- Thêm gừng, hành tây nướng
- Gia vị: hạt nêm, đường phèn, nước mắm

## 3. Gia vị quan trọng

- Hoa hồi, quế, thảo quả, hạt tiêu
- Rang khô gia vị trước khi cho vào nước dùng
- Không cho quá nhiều gia vị vì sẽ át vị ngọt của xương

## 4. Bánh phở

- Chọn bánh phở tươi, trắng mịn
- Trụng bánh nhanh, không để quá lâu
- Xếp bánh vào tô trước khi chan nước dùng

Chúc các bạn thành công!
    `,
        category: "cooking-tips",
        imageUrl: "https://images.unsplash.com/photo-1580797200599-8e74b7c36d42?w=800",
        featured: true,
        tags: ["phở", "món việt", "nấu ăn"],
    },
    {
        title: "Lợi ích sức khỏe của rau củ quả theo màu sắc",
        description: "Mỗi màu sắc của rau củ quả đều mang lại những lợi ích sức khỏe khác nhau. Hãy cùng tìm hiểu!",
        content: `
# Rau củ theo màu sắc và lợi ích

## Màu xanh lá cây
- Bông cải xanh, rau bina, cải xoăn
- Giàu vitamin K, sắt, canxi
- Tốt cho xương và thị lực

## Màu đỏ/cam
- Cà chua, ớt chuông đỏ, cà rốt
- Chứa beta-carotene, lycopene
- Tốt cho tim mạch và làn da

## Màu tím
- Bắp cải tím, củ dền, nho
- Chứa anthocyanin
- Chống lão hóa, tăng cường trí nhớ

Hãy ăn đa dạng màu sắc mỗi ngày!
    `,
        category: "nutrition",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
        featured: true,
        tags: ["dinh dưỡng", "sức khỏe", "rau củ"],
    },
    {
        title: "Cách làm bánh mì Việt Nam giòn rụm",
        description: "Bí quyết làm bánh mì Sài Gòn với vỏ giòn tan, ruột mềm mịn ngay tại nhà.",
        content: `
# Công thức bánh mì Việt Nam

## Nguyên liệu
- Bột mì: 500g
- Men nở: 10g  
- Đường: 30g
- Muối: 8g
- Bơ: 30g
- Nước: 300ml

## Cách làm
1. Trộn bột với men, đường, muối
2. Nhào bột với nước và bơ
3. Ủ bột 1 giờ
4. Nặn bánh và ủ thêm 30 phút
5. Nướng 200°C trong 25 phút

Chúc bạn thành công!
    `,
        category: "recipe",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
        featured: false,
        tags: ["bánh mì", "nướng", "sài gòn"],
    },
    {
        title: "Văn hóa ẩm thực miền Trung Việt Nam",
        description: "Khám phá nét đặc trưng của ẩm thực miền Trung với hương vị đậm đà, cay nồng.",
        content: `
# Đặc trưng ẩm thực miền Trung

Miền Trung Việt Nam nổi tiếng với ẩm thực đậm đà, cay nồng và đa dạng.

## Món ăn tiêu biểu
- Bún bò Huế
- Cơm hến
- Bánh bèo, bánh nậm
- Mì Quảng

## Đặc điểm
- Thích dùng ớt, sả, mắm ruốc
- Món ăn nhỏ nhắn, tinh tế
- Màu sắc bắt mắt

Ẩm thực miền Trung là sự kết hợp hoàn hảo giữa cung đình và dân gian!
    `,
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
        featured: true,
        tags: ["văn hóa", "miền trung", "huế"],
    },
    {
        title: "Chế độ ăn Địa Trung Hải: Bí quyết sống lâu",
        description: "Tìm hiểu về chế độ ăn được UNESCO công nhận là di sản văn hóa phi vật thể.",
        content: `
# Chế độ ăn Địa Trung Hải

## Nguyên tắc cơ bản
- Ăn nhiều rau, trái cây, ngũ cốc
- Dùng dầu olive làm chất béo chính
- Ăn cá ít nhất 2 lần/tuần
- Hạn chế thịt đỏ và đồ ngọt

## Lợi ích
- Giảm nguy cơ bệnh tim mạch
- Cải thiện sức khỏe não bộ
- Kiểm soát cân nặng hiệu quả

Một lối sống và ăn uống lành mạnh!
    `,
        category: "health",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        featured: false,
        tags: ["sức khỏe", "chế độ ăn", "địa trung hải"],
    },
    {
        title: "Mẹo bảo quản thực phẩm tươi lâu hơn",
        description: "Những mẹo đơn giản giúp bạn bảo quản thực phẩm tươi ngon và tiết kiệm hơn.",
        content: `
# Bảo quản thực phẩm hiệu quả

## Rau xanh
- Rửa sạch, để ráo nước
- Bọc giấy thấm ẩm
- Bảo quản trong ngăn mát tủ lạnh

## Thịt cá
- Chia nhỏ thành từng phần ăn
- Bảo quản trong túi kín hoặc hộp
- Ghi ngày tháng trên bao bì

## Trái cây
- Không rửa trước khi bảo quản
- Để riêng từng loại
- Một số loại để ngoài, một số để tủ lạnh

Tiết kiệm và an toàn hơn!
    `,
        category: "cooking-tips",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
        featured: false,
        tags: ["bảo quản", "mẹo hay", "tiết kiệm"],
    },
];

const seedNews = async () => {
    try {
        await connectDB();
        console.log("✅ Connected to MongoDB");

        // Find admin user
        const admin = await User.findOne({ role: "admin" });
        if (!admin) {
            console.log("❌ No admin user found. Please create an admin first.");
            process.exit(1);
        }

        console.log(`✅ Found admin: ${admin.email}`);

        // Delete existing news
        await News.deleteMany({});
        console.log("🗑️  Cleared existing news");

        // Create sample news
        const newsWithAuthor = sampleNews.map((news) => ({
            ...news,
            author: admin._id,
        }));

        const createdNews = await News.insertMany(newsWithAuthor);
        console.log(`✅ Created ${createdNews.length} sample news articles`);

        console.log("\n📰 Sample News:");
        createdNews.forEach((news, idx) => {
            console.log(`${idx + 1}. ${news.title} [${news.category}]${news.featured ? " ⭐" : ""}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding news:", error);
        process.exit(1);
    }
};

seedNews();
