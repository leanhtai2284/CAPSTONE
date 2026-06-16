import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CALORIES_TABLE = {
  lose: {
    sedentary: 1600,
    moderate: 1900,
    active: 2100,
  },
  maintain: {
    sedentary: 1800,
    moderate: 2200,
    active: 2500,
  },
  gain: {
    sedentary: 2200,
    moderate: 2500,
    active: 2800,
  },
};

const NutritionSummary = ({
  familySize = 1,
  dietaryGoal = "maintain",
  activityLevel = "moderate",
}) => {
  // Helpers for formatting
  const fmtNumber = (v, decimals = 1) => {
    if (v == null || Number.isNaN(Number(v))) return "0";
    const n = Number(v);
    return n % 1 === 0 ? n.toString() : n.toFixed(decimals);
  };

  const fmtCalories = (v) => {
    const n = Number(v) || 0;
    if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}k kcal`;
    }
    return `${Math.round(n).toLocaleString()} kcal`;
  };

  const resolvedFamilySize = Math.max(1, Number(familySize) || 1);
  const goalKey = CALORIES_TABLE[dietaryGoal] ? dietaryGoal : "maintain";
  const activityKey = CALORIES_TABLE[goalKey][activityLevel]
    ? activityLevel
    : "moderate";

  const perPersonCalories = CALORIES_TABLE[goalKey][activityKey];
  const totalCalories = perPersonCalories * resolvedFamilySize;

  const totals = {
    calories: totalCalories,
    protein: (totalCalories * 0.2) / 4,
    carbs: (totalCalories * 0.5) / 4,
    fat: (totalCalories * 0.3) / 9,
  };

  const macroData = [
    { name: "Protein", value: totals.protein, color: "#3CAEA3" },
    { name: "Carbs", value: totals.carbs, color: "#E9C46A" },
    { name: "Fat", value: totals.fat, color: "#F4A261" },
  ];

  return (
    <motion.div
      key={`nutrition-summary`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className=" rounded-2xl p-6 border border-gray-800"
    >
      <h3 className="text-xl font-bold mb-6">Thống kê dinh dưỡng hôm nay</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: "1px solid #444",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Calories</span>
              <span className="text-2xl font-bold text-orange-500">
                {fmtCalories(totals.calories)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Tổng theo {resolvedFamilySize} người
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Protein</div>
              <div className="text-lg font-bold text-[#3CAEA3]">
                {fmtNumber(totals.protein, 1)}g
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Carbs</div>
              <div className="text-lg font-bold text-[#E9C46A]">
                {fmtNumber(totals.carbs, 1)}g
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Fat</div>
              <div className="text-lg font-bold text-[#F4A261]">
                {fmtNumber(totals.fat, 1)}g
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NutritionSummary;
