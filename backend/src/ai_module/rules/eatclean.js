export default function applyEatclean(candidates, prefs) {
  if (!prefs?.eatclean && !prefs?.max_calories_per_meal) return candidates;
  const maxC = prefs.max_calories_per_meal || 600;
  return candidates.filter((r) => (r.nutrition?.calories || 0) <= maxC);
}
