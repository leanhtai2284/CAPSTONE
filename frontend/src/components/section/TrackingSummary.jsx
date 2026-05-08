import React from "react";
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

const TrackingSummary = ({ trackingToday }) => {
  if (!trackingToday) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Tiến độ hôm nay</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-6">
          <p className="text-sm">Chưa ghi nhận bữa ăn nào hôm nay</p>
        </div>
      </div>
    );
  }

  const { daily_totals, progress } = trackingToday;

  if (!progress) {
    return null;
  }

  const {
    calorie_target = 2000,
    calories_consumed = 0,
    calories_remaining = 0,
    calories_pct = 0,
    status = "under",
    macro_targets = null,
  } = progress;

  // Get status color and icon
  const getStatusDisplay = () => {
    switch (status) {
      case "over":
        return {
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          icon: AlertCircle,
          label: "Vượt mục tiêu",
        };
        s;
      case "on_track":
        return {
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          icon: CheckCircle,
          label: "Đúng mục tiêu",
        };
      case "under":
      default:
        return {
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
          icon: TrendingUp,
          label: "Dưới mục tiêu",
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  // Calculate progress bar color based on percentage
  const getProgressBarColor = () => {
    if (calories_pct <= 60) return "from-blue-500 to-cyan-500";
    if (calories_pct <= 110) return "from-green-500 to-emerald-500";
    return "from-orange-500 to-red-500";
  };

  return (
    <div
      className={`rounded-2xl p-6 border border-gray-200 dark:border-gray-800 ${statusDisplay.bgColor}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Tiến độ hôm nay
          <StatusIcon className={`w-5 h-5 ${statusDisplay.color}`} />
        </h3>
        <span className={`text-sm font-semibold ${statusDisplay.color}`}>
          {statusDisplay.label}
        </span>
      </div>

      {/* Main Calorie Info */}
      <div className="space-y-4">
        {/* Calorie display */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Calories
            </span>
            <span className="text-lg font-bold">
              {calories_consumed} / {calorie_target} kcal
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressBarColor()} transition-all duration-300`}
              style={{
                width: `${Math.min(calories_pct, 100)}%`,
              }}
            />
          </div>

          {/* Percentage and remaining */}
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {calories_pct.toFixed(0)}%
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Còn lại:{" "}
              <span className="font-semibold">
                {Math.max(0, calories_remaining)} kcal
              </span>
            </span>
          </div>
        </div>

        {/* Macro targets if available */}
        {macro_targets && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Macro Targets
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-sm font-bold text-red-600 dark:text-red-400">
                  {macro_targets.protein_g}g
                </div>
                <div className="text-xs text-gray-500">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  {macro_targets.fat_g}g
                </div>
                <div className="text-xs text-gray-500">Fat</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {macro_targets.carbs_g}g
                </div>
                <div className="text-xs text-gray-500">Carbs</div>
              </div>
            </div>
          </div>
        )}

        {/* Daily totals if available */}
        {daily_totals && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Thông tin dinh dưỡng
            </p>
            <div className="grid grid-cols-2 gap-3">
              {daily_totals.protein_g && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Protein:
                  </span>
                  <span className="ml-2 font-semibold">
                    {daily_totals.protein_g}g
                  </span>
                </div>
              )}
              {daily_totals.carbs_g && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Carbs:
                  </span>
                  <span className="ml-2 font-semibold">
                    {daily_totals.carbs_g}g
                  </span>
                </div>
              )}
              {daily_totals.fat_g && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Fat:</span>
                  <span className="ml-2 font-semibold">
                    {daily_totals.fat_g}g
                  </span>
                </div>
              )}
              {daily_totals.fiber_g && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Fiber:
                  </span>
                  <span className="ml-2 font-semibold">
                    {daily_totals.fiber_g}g
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingSummary;
