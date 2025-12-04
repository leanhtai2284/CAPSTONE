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

export async function swapSingleMealApi(mealId, preferences) {
  const payload = {
    mealId,
    dietaryRestrictions: preferences.dietaryRestrictions || [],
    cuisinePreferences: preferences.cuisinePreferences || [],
    avoidIngredients: preferences.avoidIngredients || [],
    allergies: preferences.allergies || [],
  };

  const res = await fetch(`${API_BASE}/api/recipes/swap-single-meal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Swap meal failed");
  }

  return res.json(); // { success: true, meal: {...} }
}
