import React, { useMemo } from "react";
import { FaMoneyBillWave } from "react-icons/fa";

const COST_TABLE = {
  low: [40000, 60000],
  medium: [60000, 80000],
  high: [90000, 120000],
};

function CostSummary({ currency = "VND", familySize = 1, budget = "medium" }) {
  const resolvedFamilySize = Math.max(1, Number(familySize) || 1);
  const budgetKey = COST_TABLE[budget] ? budget : "medium";
  const [perPersonMin, perPersonMax] = COST_TABLE[budgetKey];

  const totalMin = perPersonMin * resolvedFamilySize;
  const totalMax = perPersonMax * resolvedFamilySize;
  const averageCost = (totalMin + totalMax) / 2;

  const resolvedCurrency = currency;
  const formatter = useMemo(() => {
    const locale = resolvedCurrency === "VND" ? "vi-VN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: resolvedCurrency,
      maximumFractionDigits: 0,
    });
  }, [resolvedCurrency]);

  const formatCurrency = (amount) => formatter.format(Math.round(amount || 0));

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
              {formatCurrency(averageCost)}
            </div>
            <div className=" text-sm">Chi phí trung bình/ngày</div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-amber-500/20">
            <div>
              <div className=" text-xs mb-1">Tối thiểu</div>
              <div className="text-orange-500 font-bold">
                {formatCurrency(totalMin)}
              </div>
            </div>

            <div className="">━━━</div>

            <div className="text-right">
              <div className=" text-xs mb-1">Tối đa</div>
              <div className="text-orange-500 font-bold">
                {formatCurrency(totalMax)}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs ">
            Tổng theo {resolvedFamilySize} người
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
