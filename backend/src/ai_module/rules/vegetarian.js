export default function applyVegetarian(candidates, prefs) {
  if (!prefs?.vegetarian) return candidates;
  return candidates.filter((r) =>
    (r.diet_tags || []).some((t) => t === "vegetarian" || t === "vegan")
  );
}
