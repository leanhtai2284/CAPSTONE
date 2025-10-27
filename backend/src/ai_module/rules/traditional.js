export default function applyTraditional(candidates, prefs) {
  if (!prefs?.region) return candidates;
  return [...candidates].sort(
    (a, b) => (b.region === prefs.region) - (a.region === prefs.region)
  );
}
