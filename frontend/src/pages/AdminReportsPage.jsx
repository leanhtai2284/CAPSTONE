import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavBar from "../components/layout/AdminNavBar";
import { useAuth } from "../hooks/useAuth";
import { statisticsService } from "../services/statisticsService";
import { toast } from "react-toastify";
import BarChart from "../components/admin/charts/BarChart";
import PieChart from "../components/admin/charts/PieChart";
import LineChart from "../components/admin/charts/LineChart";
import AreaChart from "../components/admin/charts/AreaChart";

const AdminReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/admin/login");
      return;
    }
    loadStatistics();
  }, [user, navigate]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticsService.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      toast.error(error.message || "Không thể tải thống kê");
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format category names
  const formatCategory = (category) => {
    const categoryMap = {
      main: "Món chính",
      soup: "Canh/Súp",
      salad: "Salad",
      snack: "Đồ ăn vặt",
      dessert: "Tráng miệng",
      drink: "Đồ uống",
    };
    return categoryMap[category] || category;
  };

  // Format difficulty
  const formatDifficulty = (difficulty) => {
    const difficultyMap = {
      easy: "Dễ",
      medium: "Trung bình",
      hard: "Khó",
    };
    return difficultyMap[difficulty] || difficulty;
  };

  // Format date for trends
  const formatTrendDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Format month for monthly trends
  const formatMonth = (monthString) => {
    const [year, month] = monthString.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("vi-VN", {
      month: "short",
      year: "numeric",
    });
  };

  // Fill missing days in 30-day trend
  const fillDailyTrend = (data, days = 30) => {
    const filledData = [];
    const dataMap = new Map();
    data.forEach((item) => {
      dataMap.set(item._id, item.count);
    });

    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      const formattedDate = formatTrendDate(dateString);
      filledData.push({
        date: formattedDate,
        count: dataMap.get(dateString) || 0,
      });
    }
    return filledData;
  };

  // Fill missing months in 12-month trend
  const fillMonthlyTrend = (data, months = 12) => {
    const filledData = [];
    const dataMap = new Map();
    data.forEach((item) => {
      dataMap.set(item._id, item.count);
    });

    const today = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthString = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const formattedMonth = formatMonth(monthString);
      filledData.push({
        month: formattedMonth,
        count: dataMap.get(monthString) || 0,
      });
    }
    return filledData;
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex">
        <AdminNavBar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-lg text-gray-600 dark:text-gray-300">
            Đang tải thống kê...
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="min-h-screen flex">
        <AdminNavBar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-lg text-red-600 dark:text-red-400">
            Không thể tải thống kê
          </div>
        </div>
      </div>
    );
  }

  const { overview, recipes, trends } = statistics;

  // Prepare chart data
  const recipesByCategoryData = recipes.byCategory.map((item) => ({
    name: formatCategory(item._id || "Khác"),
    count: item.count,
  }));

  const recipesByRegionData = recipes.byRegion.map((item) => ({
    name: item._id || "Khác",
    count: item.count,
  }));

  const recipesByDifficultyData = recipes.byDifficulty.map((item) => ({
    name: formatDifficulty(item._id || "Khác"),
    count: item.count,
  }));

  // Fill data for daily trends (30 days)
  const userTrendsData = fillDailyTrend(trends.userRegistration, 30);
  const recipeTrendsData = fillDailyTrend(trends.recipeCreation, 30);

  // Fill data for monthly trends (12 months)
  const userRegistrationByMonthData = fillMonthlyTrend(
    trends.userRegistrationByMonth,
    12
  );
  const recipeCreationByMonthData = fillMonthlyTrend(
    trends.recipeCreationByMonth,
    12
  );

  const avgCaloriesData = recipes.avgCaloriesByCategory.map((item) => ({
    name: formatCategory(item._id || "Khác"),
    calories: Math.round(item.avgCalories || 0),
  }));

  return (
    <div className="min-h-screen  flex">
      <AdminNavBar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Báo Cáo và Thống Kê
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Theo dõi mức sử dụng và hiệu suất hệ thống
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tổng số người dùng
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {overview.totalUsers}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +{overview.newUsersLast7Days} trong 7 ngày
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tổng số công thức
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {overview.totalRecipes}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +{overview.newRecipesLast7Days} trong 7 ngày
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Người dùng mới (30 ngày)
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {overview.newUsersLast30Days}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {overview.totalAdmins} quản trị viên
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-4">
                  <svg
                    className="w-8 h-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Công thức mới (30 ngày)
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {overview.newRecipesLast30Days}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {overview.totalRegularUsers} người dùng thường
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-4">
                  <svg
                    className="w-8 h-8 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="space-y-6">
            {/* Row 1: Recipe Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart
                data={recipes.byCategory}
                dataKey="count"
                nameKey="_id"
                title="Phân bố công thức theo loại món"
                colors={[
                  "#3b82f6",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                  "#ec4899",
                ]}
              />
              <PieChart
                data={recipes.byRegion}
                dataKey="count"
                nameKey="_id"
                title="Phân bố công thức theo vùng miền"
                colors={["#10b981", "#3b82f6", "#f59e0b"]}
              />
            </div>

            {/* Row 2: Recipe Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChart
                data={recipesByDifficultyData}
                dataKey="count"
                nameKey="name"
                color="#8b5cf6"
                title="Số lượng công thức theo độ khó"
              />
              <BarChart
                data={avgCaloriesData}
                dataKey="calories"
                nameKey="name"
                color="#ef4444"
                title="Calories trung bình theo loại món"
              />
            </div>

            {/* Row 3: Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                data={userTrendsData}
                dataKey="count"
                nameKey="date"
                color="#3b82f6"
                title="Xu hướng đăng ký người dùng (30 ngày gần nhất)"
              />
              <LineChart
                data={recipeTrendsData}
                dataKey="count"
                nameKey="date"
                color="#10b981"
                title="Xu hướng tạo công thức (30 ngày gần nhất)"
              />
            </div>

            {/* Row 4: Monthly Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AreaChart
                data={userRegistrationByMonthData}
                dataKey="count"
                nameKey="month"
                color="#8b5cf6"
                title="Đăng ký người dùng theo tháng (12 tháng gần nhất)"
              />
              <AreaChart
                data={recipeCreationByMonthData}
                dataKey="count"
                nameKey="month"
                color="#f59e0b"
                title="Tạo công thức theo tháng (12 tháng gần nhất)"
              />
            </div>
          </div>

          {/* Summary Tables */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Loại Món Ăn
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Loại món
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số lượng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipesByCategoryData.slice(0, 5).map((item, index) => (
                      <tr key={index} className="border-b dark:border-gray-700">
                        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">
                          {item.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Regions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Phân bố theo Vùng Miền
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vùng miền
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số lượng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipesByRegionData.map((item, index) => (
                      <tr key={index} className="border-b dark:border-gray-700">
                        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">
                          {item.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
