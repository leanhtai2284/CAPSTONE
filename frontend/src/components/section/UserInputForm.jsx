import React, { useState } from "react";
import { motion } from "framer-motion";
import { SparklesIcon, LoaderIcon } from "lucide-react";

const UserInputForm = ({ onGenerate, isGenerating }) => {
  const [preferences, setPreferences] = useState({
    activityLevel: "moderate",
    dietaryGoal: "maintain", // maintain | lose | gain
    budget: "medium", // low | medium | high
    dietType: "eat-clean", // eat-clean | keto | vegan | traditional
    foodPreferences: [],
    allergies: [],
    familySize: 2,
    region: "North",
  });

  const handleChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ✅ gửi thẳng preferences ra cho ForYouPage
    onGenerate(preferences);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className=" rounded-2xl p-6 border bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 sticky top-8"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-secondary" />
        Hãy nhập thông tin của bạn
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mức độ hoạt động */}
        <div>
          <label className="block text-sm  font-bold  mb-2">
            Mức độ hoạt động
          </label>
          <select
            value={preferences.activityLevel}
            onChange={(e) =>
              setPreferences({ ...preferences, activityLevel: e.target.value })
            }
            className="w-full bg-gray-200 dark:bg-gray-800 border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          >
            <option value="sedentary">Ít vận động</option>
            <option value="moderate">Trung bình</option>
            <option value="active">Năng động</option>
          </select>
        </div>

        {/* Mục tiêu dinh dưỡng */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Mục tiêu dinh dưỡng
          </label>
          <select
            value={preferences.dietaryGoal}
            onChange={(e) =>
              setPreferences({ ...preferences, dietaryGoal: e.target.value })
            }
            className="w-full bg-gray-200 dark:bg-gray-800 border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          >
            <option value="maintain">Duy trì cân nặng</option>
            <option value="lose">Giảm cân</option>
            <option value="gain">Tăng cân</option>
          </select>
        </div>

        {/* Ngân sách */}
        <div>
          <label className="block text-sm font-bold  mb-2">Ngân sách</label>
          <select
            value={preferences.budget}
            onChange={(e) =>
              setPreferences({ ...preferences, budget: e.target.value })
            }
            className="w-full bg-gray-200 dark:bg-gray-800 border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>
        </div>

        {/* Chế độ ăn */}
        <div>
          <label className="block text-sm font-bold  mb-2">Chế độ ăn</label>
          <select
            value={preferences.dietType}
            onChange={(e) =>
              setPreferences({ ...preferences, dietType: e.target.value })
            }
            className="w-full bg-gray-200 dark:bg-gray-800 border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          >
            <option value="eat-clean">Eat Clean (Ăn sạch)</option>
            <option value="keto">Keto (Ít tinh bột)</option>
            <option value="vegan">Thuần chay</option>
            <option value="traditional">Ẩm thực Việt truyền thống</option>
          </select>
        </div>

        {/* Số người ăn */}
        <div>
          <label className="block text-sm  font-bold  mb-2">Số người ăn</label>
          <input
            type="number"
            min="1"
            max="10"
            value={preferences.familySize}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                familySize: parseInt(e.target.value),
              })
            }
            className="w-full bg-gray-200 dark:bg-gray-800 border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Vùng miền */}
        <div>
          <label className="block text-sm  font-bold  mb-2">Vùng miền</label>
          <select
            value={preferences.region}
            onChange={(e) =>
              setPreferences({ ...preferences, region: e.target.value })
            }
            className="w-full bg-gray-200 dark:bg-gray-800 border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          >
            <option value="North">Miền Bắc</option>
            <option value="Central">Miền Trung</option>
            <option value="South">Miền Nam</option>
          </select>
        </div>

        {/* Nút tạo thực đơn */}
        <motion.button
          type="submit"
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-green-500 to-[#3CAEA3] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <LoaderIcon className="w-5 h-5 animate-spin" />
              Đang tạo thực đơn...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Tạo thực đơn ngay
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default UserInputForm;
