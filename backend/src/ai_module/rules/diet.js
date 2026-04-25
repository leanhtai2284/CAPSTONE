export default function applyDiet(candidates, prefs) {
  if (!prefs?.diet_tags?.length) return candidates;

  // Nếu user chọn "traditional" (Ẩm thực Việt truyền thống)
  // → Không filter theo diet_tags, trả về tất cả món
  if (prefs.diet_tags.includes("traditional")) {
    return candidates;
  }

  // Các diet khác (eatclean, keto, vegetarian...) → Strict match
  return candidates.filter((r) =>
    prefs.diet_tags.every((t) => (r.diet_tags || []).includes(t))
  );
}
