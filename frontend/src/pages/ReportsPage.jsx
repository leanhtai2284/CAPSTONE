import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUpIcon, AwardIcon, CalendarIcon } from "lucide-react";
import { reportService } from "../services/reportService";

const ReportsPage = () => {
  // period_type tương ứng cột trong database
  const [periodType, setPeriodType] = useState("weekly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Dữ liệu mô phỏng giống bảng user_reports
  const [report, setReport] = useState({
    _id: 1,
    user_id: 12,
    period_type: periodType, // weekly / daily
    start_date: "2025-10-14",
    end_date: "2025-10-21",
    total_meals: 21,
    total_calories: 13450,
    avg_protein: 90.5,
    avg_carbs: 230.4,
    avg_fat: 68.2,
    diet_score: 87.2,
    notes:
      "Bạn đang duy trì chế độ ăn rất tốt! Hãy tăng thêm lượng protein vào bữa sáng để đạt hiệu quả tốt hơn.",
    created_at: "2025-10-21T12:00:00Z",
  });

  // ✅ Dữ liệu biểu đồ tuần (có thể lấy từ API sau)
  const [nutritionData, setNutritionData] = useState([
    { day: "T2", protein: 85, carbs: 220, fat: 65, calories: 1850 },
    { day: "T3", protein: 92, carbs: 240, fat: 70, calories: 1980 },
    { day: "T4", protein: 88, carbs: 210, fat: 68, calories: 1820 },
    { day: "T5", protein: 95, carbs: 250, fat: 72, calories: 2050 },
    { day: "T6", protein: 90, carbs: 230, fat: 66, calories: 1920 },
    { day: "T7", protein: 87, carbs: 215, fat: 64, calories: 1840 },
    { day: "CN", protein: 93, carbs: 245, fat: 71, calories: 2010 },
  ]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    reportService
      .getUserNutritionReport({ period: periodType })
      .then((res) => {
        if (!mounted) return;
        const { report: rep, nutritionData: data } = res.data || {};
        if (rep) setReport(rep);
        if (Array.isArray(data)) setNutritionData(data);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Không thể tải báo cáo");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [periodType]);

  return (
    <div className="min-h-screen container py-2 mx-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Báo cáo dinh dưỡng
          </h1>

          <div className="flex space-x-2 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-2 border dark:border-slate-800 bg-white border-gray-300">
            <button
              onClick={() => setPeriodType("weekly")}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                periodType === "weekly"
                  ? "bg-green-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Theo tuần
            </button>
            <button
              onClick={() => setPeriodType("daily")}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                periodType === "daily"
                  ? "bg-green-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Theo ngày
            </button>
          </div>
        </motion.div>

        {/* Loading / Error */}
        {loading && (
          <div className="mb-6 text-sm text-slate-500">Đang tải báo cáo...</div>
        )}
        {error && (
          <div className="mb-6 text-sm text-red-500">{error}</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Tổng số bữa */}
          <motion.div
            className="dark:bg-slate-900/80 rounded-2xl p-6 border dark:border-slate-800 bg-white border-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-3xl font-bold ">{report.total_meals}</div>
                <div className="text-slate-400">Tổng số bữa</div>
              </div>
            </div>
          </motion.div>

          {/* Điểm dinh dưỡng */}
          <motion.div
            className="dark:bg-slate-900/80 rounded-2xl p-6 border dark:border-slate-800 bg-white border-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <AwardIcon className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-3xl font-bold ">
                  {report.diet_score.toFixed(1)}%
                </div>
                <div className="text-slate-400">Điểm dinh dưỡng</div>
              </div>
            </div>
          </motion.div>

          {/* Tổng năng lượng */}
          <motion.div
            className="dark:bg-slate-900/80 rounded-2xl p-6 border dark:border-slate-800 bg-white border-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUpIcon className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-3xl font-bold ">
                  {report.total_calories}
                </div>
                <div className="text-slate-400">Tổng năng lượng (kcal)</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Biểu đồ trung bình dinh dưỡng */}
          <motion.div
            className="dark:bg-slate-900/80 bg-white border-gray-300 rounded-2xl p-6 border dark:border-slate-800 "
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold  mb-6">
              Dinh dưỡng trung bình (
              {periodType === "weekly" ? "Tuần" : "Ngày"})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="protein" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="carbs" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="fat" fill="#eab308" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Biểu đồ calo */}
          <motion.div
            className="dark:bg-slate-900/80 rounded-2xl p-6 border dark:border-slate-800 bg-white border-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-bold mb-6">Lượng calo theo ngày</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: "#22c55e", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Gợi ý AI */}
        <motion.div
          className="bg-green-500 rounded-2xl p-8 border border-green-500/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Gợi ý cải thiện 🌿
          </h3>
          <p className="text-gray-100 text-lg leading-relaxed">
            {report.notes}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
