import React, { useEffect, useState } from "react";
import { authService } from "../services/authService";

export default function AdminDashboard() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setInfo(data);
      } catch (err) {
        setInfo({ error: "Không thể lấy dữ liệu admin" });
      }
    };
    fetchAdmin();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <pre className="bg-black/30 p-4 rounded">
        {info ? JSON.stringify(info, null, 2) : "Đang tải..."}
      </pre>
    </div>
  );
}
