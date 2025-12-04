// src/services/recipeApi.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function suggestMenuApi(payload) {
  const res = await fetch(`${API_BASE}/api/recipes/suggest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Suggest menu failed");
  }

  return res.json(); // { items: [...] }
}

export async function suggestWeeklyApi(payload) {
  const res = await fetch(`${API_BASE}/api/recipes/suggest-weekly`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Suggest weekly menu failed");
  }

  return res.json(); // { weeklyMenu: [...] }
}
export async function getRecipeDetailApi(id, servings) {
  const url = new URL(`${API_BASE}/api/recipes/${id}`);
  if (servings) url.searchParams.set("servings", servings);

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Get recipe failed");
  }
  return res.json();
}

export async function swapSingleMealApi(meal, dietTags) {
  // meal là object món cần đổi
  // dietTags là mảng diet_tags từ userPreferences

  const payload = {
    meal_type: meal.meal_types?.[0], // breakfast, lunch, hoặc dinner
    diet_tags: dietTags || [],
    exclude_ids: [meal._id || meal.id], // Loại trừ món hiện tại
  };

  console.log(" Gửi swap request:", payload);

  const res = await fetch(`${API_BASE}/api/recipes/swap-single-meal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Không thể đổi món");
  }

  const data = await res.json(); // { items: [newMeal] }
  return { success: true, meal: data.items?.[0] };
}
