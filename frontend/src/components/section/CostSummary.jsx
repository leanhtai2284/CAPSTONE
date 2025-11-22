import React, { useMemo } from "react";
import { FaMoneyBillWave } from "react-icons/fa";

function CostSummary({ meals = [], currency = "VND" }) {
  const normalizedMeals = useMemo(() => {
    if (!Array.isArray(meals)) return [];
    return meals.flatMap((item) => {
      if (Array.isArray(item?.dishes)) {
        return item.dishes.filter(Boolean);
      }

      // If an item has multiple meal_types (e.g. ['breakfast','lunch'])
      // the UI may render it multiple times (appearing in both breakfast and lunch).
      // Expand such items into repeated entries so cost summaries count duplicates
      // the same way the MealPlan UI does.
      if (Array.isArray(item?.meal_types) && item.meal_types.length > 0) {
        return item.meal_types.map(() => item);
      }

      return item ? [item] : [];
    });
  }, [meals]);

  // (Don't return here — keep hooks unconditional; we'll skip rendering later)

  const {
    totalMin,
    totalMax,
    averageCost,

    hasPriceData,
    dishCount,
    detectedCurrency,
    totalDishes,
  } = useMemo(() => {
    const totals = normalizedMeals.reduce(
      (acc, meal) => {
        const minValue = Number(meal?.price_estimate?.min);
        const maxValue = Number(meal?.price_estimate?.max);
        const hasMin = Number.isFinite(minValue) && minValue > 0;
        const hasMax = Number.isFinite(maxValue) && maxValue > 0;

        if (!hasMin && !hasMax) {
          return acc;
        }

        const currencyValue = meal?.price_estimate?.currency;

        return {
          dishCount: acc.dishCount + 1,
          totalMin: acc.totalMin + (hasMin ? minValue : maxValue),
          totalMax: acc.totalMax + (hasMax ? maxValue : minValue),
          currency: acc.currency || currencyValue,
        };
      },
      { dishCount: 0, totalMin: 0, totalMax: 0, currency: null }
    );
    const totalDishes = normalizedMeals.length;

    if (totals.dishCount === 0) {
      return {
        totalMin: 0,
        totalMax: 0,
        averageCost: 0,
        monthlyCost: 0,
        hasPriceData: false,
        dishCount: 0,
        detectedCurrency: null,
        totalDishes,
      };
    }

    const avg = (totals.totalMin + totals.totalMax) / 2;

    return {
      totalMin: totals.totalMin,
      totalMax: totals.totalMax,
      averageCost: avg,
      monthlyCost: avg * 30,
      hasPriceData: true,
      dishCount: totals.dishCount,
      detectedCurrency: totals.currency,
      totalDishes,
    };
  }, [normalizedMeals]);

  const resolvedCurrency = detectedCurrency || currency;
  const formatter = useMemo(() => {
    const locale = resolvedCurrency === "VND" ? "vi-VN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: resolvedCurrency,
      maximumFractionDigits: 0,
    });
  }, [resolvedCurrency]);

  const formatCurrency = (amount) => {
    if (!hasPriceData || !amount) return "Đang cập nhật";
    return formatter.format(Math.round(amount));
  };

  // If there are no dishes after normalization, don't render the cost summary
  if (!normalizedMeals || normalizedMeals.length === 0) return null;

  return (
    <div className="rounded-2xl p-6 shadow-2xl border border-gray-800">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        Thống kê chi phí hôm nay
      </h2>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-amber-500/40 to-red-500/20 border border-amber-500/30 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold dark:text-amber-400 text-orange-500 mb-2">
              <FaMoneyBillWave className="inline-block w-10 h-10 mr-3" />
              {hasPriceData ? formatCurrency(averageCost) : "Chưa có dữ liệu"}
            </div>
            <div className="text-slate-500 text-sm">
              Chi phí trung bình/ngày
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-amber-500/20">
            <div>
              <div className="text-slate-500 text-xs mb-1">Tối thiểu</div>
              <div className="text-orange-500 font-bold">
                {formatCurrency(totalMin)}
              </div>
            </div>

            <div className="text-slate-500">━━━</div>

            <div className="text-right">
              <div className="text-slate-500 text-xs mb-1">Tối đa</div>
              <div className="text-orange-500 font-bold">
                {formatCurrency(totalMax)}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            {hasPriceData
              ? `${dishCount}/${totalDishes} món có báo giá`
              : totalDishes > 0
              ? `Chưa có món ăn nào có báo giá (Tổng ${totalDishes} món)`
              : "Chưa có món ăn nào có báo giá"}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-bold italic p-1 rounded-lg">
          <p>
            Lưu ý: Chi phí ước tính dựa trên dữ liệu từ các dịch vụ giao đồ ăn
            bên thứ ba và có thể thay đổi tùy theo địa điểm và thời gian.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CostSummary;
