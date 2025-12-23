// Rule cho mục tiêu GIẢM CÂN
// Ưu tiên món ăn có ít calories, nhiều protein và fiber
export default function applyWeightLoss(candidates, prefs) {
  if (prefs?.goal !== "weight_loss") return candidates;

  const maxCals = prefs.max_calories_per_meal || 500;
  const minProtein = prefs.min_protein_g || 15;
  const minFiber = prefs.min_fiber_g || 3;

  return candidates
    .filter((r) => {
      const cals = r.nutrition?.calories || 0;
      const protein = r.nutrition?.protein_g || 0;
      const fiber = r.nutrition?.fiber_g || 0;

      // Ít calo nhưng đủ protein
      return cals <= maxCals && protein >= minProtein;
    })
    .sort((a, b) => {
      // Ưu tiên món có ít calories, nhiều protein và fiber
      const scoreA =
        -(a.nutrition?.calories || 0) * 0.3 +
        (a.nutrition?.protein_g || 0) * 2 +
        (a.nutrition?.fiber_g || 0) * 1.5;
      const scoreB =
        -(b.nutrition?.calories || 0) * 0.3 +
        (b.nutrition?.protein_g || 0) * 2 +
        (b.nutrition?.fiber_g || 0) * 1.5;
      return scoreB - scoreA;
    });
}
