import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
const NutritionSummary = ({ meals = [] }) => {
  // Only show nutrition summary when actual meals are provided
  if (!meals || meals.length === 0) return null;

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

  // Sum totals from meals array
  const totals = meals.reduce(
    (acc, meal) => {
      const n = meal.nutrition || {};
      const servings = meal.servings || 1;

      const calories =
        (n.calories ?? n.calories_kcal ?? n.kcal ?? 0) * servings;
      const protein = (n.protein_g ?? n.protein ?? 0) * servings;
      const carbs = (n.carbs_g ?? n.carbs ?? 0) * servings;
      const fat = (n.fat_g ?? n.fat ?? 0) * servings;

      acc.calories += Number(calories) || 0;
      acc.protein += Number(protein) || 0;
      acc.carbs += Number(carbs) || 0;
      acc.fat += Number(fat) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

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
              <span className="text-2xl font-bold text-[#F4A261]">
                {fmtCalories(totals.calories)}
              </span>
            </div>
            <div className="text-xs text-gray-500">kcal</div>
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

      {/* Per-meal breakdown */}
      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">Per-meal breakdown</h4>
        <div className="space-y-2">
          {meals.map((meal, idx) => {
            const n = meal.nutrition || {};
            const servings = meal.servings || 1;
            const c = (n.calories ?? n.calories_kcal ?? n.kcal ?? 0) * servings;
            const p = (n.protein_g ?? n.protein ?? 0) * servings;
            const ca = (n.carbs_g ?? n.carbs ?? 0) * servings;
            const f = (n.fat_g ?? n.fat ?? 0) * servings;
            const title =
              meal.name_vi || meal.name || meal.title || `Meal ${idx + 1}`;
            return (
              <div
                key={`meal-${meal.id || meal._id || idx}`}
                className="flex items-center justify-between bg-gray-100 dark:bg-slate-900 rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">{title}</div>
                  <div className="text-xs text-gray-500">
                    Servings: {servings}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{fmtCalories(c)}</div>
                  <div className="text-xs text-gray-500">
                    {fmtNumber(p, 1)}g • {fmtNumber(ca, 1)}g • {fmtNumber(f, 1)}
                    g
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default NutritionSummary;
