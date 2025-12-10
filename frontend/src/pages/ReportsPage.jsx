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
  const [report, setReport] = useState(null);

  // ✅ Dữ liệu biểu đồ tuần (có thể lấy từ API sau)
  const [nutritionData, setNutritionData] = useState([]);

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
          <h1 className="text-3xl  font-bold mb-4 ">Báo cáo dinh dưỡng</h1>

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
        {error && <div className="mb-6 text-sm text-red-500">{error}</div>}

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
                <div className="text-3xl font-bold ">{report?.total_meals ?? 0}</div>
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
                  {(report?.diet_score ?? 0).toFixed(1)}%
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
                  {report?.total_calories ?? 0}
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
              Dinh dưỡng trung bình ({periodType === "weekly" ? "Tuần" : "Ngày"}
              )
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

        {/* Calorie alert banner */}
        {report?.calorie_alert?.level && report.calorie_alert.level !== "ok" && (
          <motion.div
            className={`rounded-2xl p-4 mb-6 ${
              report.calorie_alert.level === "danger"
                ? "bg-red-500 text-white"
                : "bg-yellow-300 text-black"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="max-w-7xl mx-auto">
              <strong>
                {report.calorie_alert.level === "danger" ? "Cảnh báo lượng calo:" : "Lưu ý lượng calo:"}
              </strong>
              <span className="ml-2">{report.calorie_alert.message}</span>
            </div>
          </motion.div>
        )}

        {/* Gợi ý AI */}
        <motion.div
          className={`rounded-2xl p-8 border mb-8 ${
            (report?.diet_score ?? 0) >= 75
              ? "bg-green-500 border-green-500/30"
              : (report?.diet_score ?? 0) >= 50
              ? "bg-yellow-400 border-yellow-400/30"
              : "bg-red-500 border-red-500/30"
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">Gợi ý cải thiện 🌿</h3>
          <p className="text-gray-100 text-lg leading-relaxed">
            {report?.notes || "Chưa có gợi ý"}
          </p>
          <div className="mt-4 text-sm text-white/90">
            <strong>Điểm dinh dưỡng: </strong>
            {(report?.diet_score ?? 0).toFixed(1)}%
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
