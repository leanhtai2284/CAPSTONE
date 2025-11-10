import React, { useState, useEffect } from "react";
import LoadingModal from "../components/ui/LoadingModal";
export default function AboutPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔁 Giả lập load dữ liệu
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="relative">
      <LoadingModal isOpen={loading} />
      <div
        className={`${
          loading ? "opacity-50" : "opacity-100"
        } transition-all duration-300`}
      >
        <h1 className="text-3xl font-bold text-center mt-10">Trang Chủ</h1>
        <p className="text-center mt-4 text-gray-600">
          Đây là nội dung trang home. Nền sẽ mờ khi modal đang bật.
        </p>
      </div>
    </div>
  );
}
