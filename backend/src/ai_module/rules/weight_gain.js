// Rule cho mục tiêu TĂNG CÂN (không phải muscle gain)
// Ưu tiên món ăn có nhiều carbs và calories
export default function applyWeightGain(candidates, prefs) {
  if (prefs?.goal !== "weight_gain") return candidates;

  const minCals = prefs.min_calories_per_meal || 600;
  const minCarbs = prefs.min_carbs_g || 50;

  return candidates
    .filter((r) => {
      const cals = r.nutrition?.calories || 0;
      const carbs = r.nutrition?.carbs_g || 0;
      return cals >= minCals && carbs >= minCarbs;
    })
    .sort((a, b) => {
      // Ưu tiên món có nhiều carbs và calories hơn
      const scoreA =
        (a.nutrition?.calories || 0) * 0.5 + (a.nutrition?.carbs_g || 0) * 2;
      const scoreB =
        (b.nutrition?.calories || 0) * 0.5 + (b.nutrition?.carbs_g || 0) * 2;
      return scoreB - scoreA;
    });
}
