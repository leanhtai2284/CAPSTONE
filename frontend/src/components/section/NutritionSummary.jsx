import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const allMealsByDay = {
  1: { calories: 1740, protein: 132, carbs: 148, fat: 61 },
  2: { calories: 1680, protein: 125, carbs: 142, fat: 58 },
  3: { calories: 1720, protein: 128, carbs: 156, fat: 54 },
  4: { calories: 1650, protein: 118, carbs: 138, fat: 62 },
  5: { calories: 1700, protein: 130, carbs: 145, fat: 56 },
  6: { calories: 1780, protein: 135, carbs: 162, fat: 64 },
  0: { calories: 1620, protein: 120, carbs: 134, fat: 52 },
};

const NutritionSummary = ({ selectedDay, viewMode }) => {
  const dayToUse = viewMode === "weekly" ? selectedDay : new Date().getDay();
  const totalNutrition = allMealsByDay[dayToUse];

  const macroData = [
    { name: "Protein", value: totalNutrition.protein, color: "#3CAEA3" },
    { name: "Carbs", value: totalNutrition.carbs, color: "#E9C46A" },
    { name: "Fat", value: totalNutrition.fat, color: "#F4A261" },
  ];

  return (
    <motion.div
      key={`nutrition-${dayToUse}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className=" rounded-2xl p-6 border border-gray-800"
    >
      <h3 className="text-xl font-semibold mb-6">Daily Nutrition Summary</h3>
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
                {totalNutrition.calories}
              </span>
            </div>
            <div className="text-xs text-gray-500">kcal</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Protein</div>
              <div className="text-lg font-bold text-[#3CAEA3]">
                {totalNutrition.protein}g
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Carbs</div>
              <div className="text-lg font-bold text-[#E9C46A]">
                {totalNutrition.carbs}g
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Fat</div>
              <div className="text-lg font-bold text-[#F4A261]">
                {totalNutrition.fat}g
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NutritionSummary;
