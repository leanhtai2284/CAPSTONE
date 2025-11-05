// backend/src/ai_module/rules/keto.js
export default function applyKeto(list, prefs) {
  const wantsKeto =
    prefs?.keto === true ||
    (Array.isArray(prefs?.diet_tags) && prefs.diet_tags.includes("keto"));

  if (!wantsKeto) return list;

  const maxCarbs = Number(prefs?.max_carbs_g) || 25; // low-carb mặc định
  // Nếu món không có nutrition, tạm giữ lại (đừng loại sạch)
  return list.filter((r) => {
    const carbs = r?.nutrition?.carbs_g;
    return typeof carbs !== "number" || carbs <= maxCarbs;
  });
}
