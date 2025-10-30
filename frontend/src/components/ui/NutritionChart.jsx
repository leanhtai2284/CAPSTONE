import React from "react";

export function NutritionChart({ nutrition }) {
  if (!nutrition) return null;

  const macros = [
    {
      name: "Protein",
      value: nutrition.protein_g,
      color: "#22C55E",
      unit: "g",
    },
    {
      name: "Carbs",
      value: nutrition.carbs_g,
      color: "#3B82F6",
      unit: "g",
    },
    {
      name: "Fat",
      value: nutrition.fat_g,
      color: "#F59E0B",
      unit: "g",
    },
    {
      name: "Fiber",
      value: nutrition.fiber_g,
      color: "#8B5CF6",
      unit: "g",
    },
  ];

  const totalMacros =
    (nutrition.protein_g || 0) +
    (nutrition.carbs_g || 0) +
    (nutrition.fat_g || 0);

  return (
    <div className="space-y-4">
      {/* Calories + Macros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/30 dark:bg-white/10 rounded-xl p-4 border border-gray-300 text-center">
          <p className="text-gray-700 dark:text-gray-200 text-sm mb-1">
            Calories
          </p>
          <p className="text-2xl font-bold">{nutrition.calories ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">kcal</p>
        </div>

        {macros.map((macro) => (
          <div
            key={macro.name}
            className="bg-white/30 dark:bg-white/10 rounded-xl p-4 border border-gray-300 text-center"
          >
            <p className="text-gray-700 dark:text-gray-200 text-sm mb-1">
              {macro.name}
            </p>
            <p className="text-2xl font-bold">{macro.value ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">
              {macro.unit}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {macros.slice(0, 3).map((macro) => {
          const percentage =
            totalMacros > 0
              ? ((macro.value / totalMacros) * 100).toFixed(0)
              : 0;
          return (
            <div key={macro.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-base">{macro.name}</span>
                <span className="font-medium">{percentage}%</span>
              </div>
              <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: macro.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sodium + Sugar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-white/10 rounded-xl border border-gray-300">
          <span className="text-gray-900 dark:text-gray-200">Sodium</span>
          <span className="font-medium">{nutrition.sodium_mg ?? 0} mg</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-white/10 rounded-xl border border-gray-300">
          <span className="text-gray-900 dark:text-gray-200">Đường</span>
          <span className="font-medium">{nutrition.sugar_g ?? 0} g</span>
        </div>
      </div>
    </div>
  );
}
