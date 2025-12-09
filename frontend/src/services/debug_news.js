// Quick console debug script để kiểm tra localStorage
console.log("=== DEBUG AUTH TOKEN ===");
console.log("Token:", localStorage.getItem("token"));
console.log("User:", localStorage.getItem("user"));
console.log("=======================");

// Try creating news
import newsService from "./newsService.js";

const testData = {
    title: "Test từ console",
    description: "Mô tả test",
    content: "Nội dung test",
    category: "recipe",
    imageUrl: "",
    featured: false,
    tags: ["test"],
};

newsService.createNews(testData)
    .then((res) => {
        console.log("✅ SUCCESS:", res);
    })
    .catch((err) => {
        console.error("❌ ERROR:", err.response?.data || err.message);
    });
