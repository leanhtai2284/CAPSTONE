export default function applyHighProtein(candidates, prefs) {
  if (prefs?.goal !== "muscle_gain") return candidates;
  const minP = prefs.min_protein_g || 20;
  return candidates
    .filter((r) => (r.nutrition?.protein_g || 0) >= minP)
    .sort(
      (a, b) => (b.nutrition?.protein_g || 0) - (a.nutrition?.protein_g || 0)
    );
}
