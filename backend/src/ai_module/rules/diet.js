export default function applyDiet(candidates, prefs) {
  if (!prefs?.diet_tags?.length) return candidates;
  return candidates.filter((r) =>
    prefs.diet_tags.every((t) => (r.diet_tags || []).includes(t))
  );
}
