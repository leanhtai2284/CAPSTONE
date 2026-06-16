const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const UNIT_TO_GRAMS = {
  kg: 1000,
  g: 1,
  gram: 1,
  l: 1000,
  ml: 1,
  "muong canh": 15,
  "muong ca phe": 5,
  muong: 10,
  "thia canh": 15,
  "thia ca phe": 5,
  thia: 10,
  tbsp: 15,
  tsp: 5,
  cup: 250,
  chen: 250,
  bat: 250,
  ly: 250,
  lon: 330,
  chai: 330,
  hop: 200,
  goi: 100,
  bich: 100,
  mieng: 100,
  vien: 5,
  cai: 100,
  chiec: 100,
  qua: 100,
  trai: 100,
  cu: 100,
  con: 100,
  nhanh: 50,
  la: 2,
  bo: 200,
  tep: 5,
};

const INGREDIENT_DB = [
  {
    pattern: /thit heo|heo|ba roi|suon|thit ba chi/,
    nutritionPer100g: {
      calories: 242,
      protein: 27,
      carbs: 0,
      fat: 14,
      fiber: 0,
      sodium: 60,
      sugar: 0,
    },
    pricePer100g: 15000,
    tags: ["giau dam"],
    allergens: [],
    taste: ["dam da"],
    avoid: ["an chay", "halal"],
  },
  {
    pattern: /\bbo\b|thit bo|beef|nam bo/,
    nutritionPer100g: {
      calories: 250,
      protein: 26,
      carbs: 0,
      fat: 15,
      fiber: 0,
      sodium: 70,
      sugar: 0,
    },
    pricePer100g: 20000,
    tags: ["giau dam"],
    allergens: [],
    taste: ["dam da"],
    avoid: ["an chay", "halal"],
  },
  {
    pattern: /ga|thit ga|uc ga|dui ga/,
    nutritionPer100g: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sodium: 70,
      sugar: 0,
    },
    pricePer100g: 12000,
    tags: ["giau dam"],
    allergens: [],
    taste: ["dam da"],
    avoid: ["an chay", "halal"],
  },
  {
    pattern: /vit|thit vit/,
    nutritionPer100g: {
      calories: 337,
      protein: 19,
      carbs: 0,
      fat: 28,
      fiber: 0,
      sodium: 60,
      sugar: 0,
    },
    pricePer100g: 18000,
    tags: ["giau dam"],
    allergens: [],
    taste: ["dam da"],
    avoid: ["an chay", "halal"],
  },
  {
    pattern: /\bca\b|fish/,
    nutritionPer100g: {
      calories: 120,
      protein: 22,
      carbs: 0,
      fat: 2.5,
      fiber: 0,
      sodium: 80,
      sugar: 0,
    },
    pricePer100g: 15000,
    tags: ["giau dam"],
    allergens: ["ca"],
    taste: ["dam da"],
    avoid: ["an chay"],
  },
  {
    pattern: /\btom\b|tom hum|shrimp|hai san/,
    nutritionPer100g: {
      calories: 99,
      protein: 24,
      carbs: 0.2,
      fat: 0.3,
      fiber: 0,
      sodium: 150,
      sugar: 0,
    },
    pricePer100g: 20000,
    tags: ["giau dam"],
    allergens: ["hai san"],
    taste: ["dam da"],
    avoid: ["an chay"],
  },
  {
    pattern: /muc|squid/,
    nutritionPer100g: {
      calories: 92,
      protein: 15.6,
      carbs: 3.1,
      fat: 1.4,
      fiber: 0,
      sodium: 44,
      sugar: 0,
    },
    pricePer100g: 18000,
    tags: ["giau dam"],
    allergens: ["hai san"],
    taste: ["dam da"],
    avoid: ["an chay"],
  },
  {
    pattern: /cua|crab/,
    nutritionPer100g: {
      calories: 83,
      protein: 18,
      carbs: 0,
      fat: 1.5,
      fiber: 0,
      sodium: 200,
      sugar: 0,
    },
    pricePer100g: 22000,
    tags: ["giau dam"],
    allergens: ["hai san"],
    taste: ["dam da"],
    avoid: ["an chay"],
  },
  {
    pattern: /ngheu|so|oc|clam|snail/,
    nutritionPer100g: {
      calories: 86,
      protein: 15,
      carbs: 3.6,
      fat: 1.4,
      fiber: 0,
      sodium: 95,
      sugar: 0,
    },
    pricePer100g: 16000,
    tags: ["giau dam"],
    allergens: ["hai san"],
    taste: ["dam da"],
    avoid: ["an chay"],
  },
  {
    pattern: /trung|trung ga|trung vit|egg/,
    nutritionPer100g: {
      calories: 143,
      protein: 13,
      carbs: 1.1,
      fat: 10,
      fiber: 0,
      sodium: 140,
      sugar: 1.1,
    },
    pricePer100g: 6000,
    tags: ["giau dam"],
    allergens: ["trung"],
    taste: ["dam da"],
    avoid: ["an chay"],
  },
  {
    pattern: /dau hu|tofu/,
    nutritionPer100g: {
      calories: 76,
      protein: 8,
      carbs: 1.9,
      fat: 4.8,
      fiber: 0.3,
      sodium: 10,
      sugar: 0.6,
    },
    pricePer100g: 6000,
    tags: ["giau dam", "chay"],
    allergens: ["dau nanh"],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /dau xanh|dau do|dau den|dau trang|legume|bean/,
    nutritionPer100g: {
      calories: 339,
      protein: 21,
      carbs: 62,
      fat: 1.5,
      fiber: 16,
      sodium: 5,
      sugar: 2,
    },
    pricePer100g: 6000,
    tags: ["giau dam", "nhieu chat xo"],
    allergens: [],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /sua|milk/,
    nutritionPer100g: {
      calories: 60,
      protein: 3.2,
      carbs: 5,
      fat: 3.3,
      fiber: 0,
      sodium: 45,
      sugar: 5,
    },
    pricePer100g: 5000,
    tags: [],
    allergens: ["sua"],
    taste: ["ngot"],
    avoid: [],
  },
  {
    pattern: /pho mai|cheese/,
    nutritionPer100g: {
      calories: 400,
      protein: 25,
      carbs: 1.3,
      fat: 33,
      fiber: 0,
      sodium: 600,
      sugar: 0.5,
    },
    pricePer100g: 25000,
    tags: [],
    allergens: ["sua"],
    taste: ["dam da"],
    avoid: [],
  },
  {
    pattern: /butter|bo sua/,
    nutritionPer100g: {
      calories: 717,
      protein: 0.9,
      carbs: 0.1,
      fat: 81,
      fiber: 0,
      sodium: 10,
      sugar: 0.1,
    },
    pricePer100g: 20000,
    tags: [],
    allergens: ["sua"],
    taste: ["beo"],
    avoid: [],
  },
  {
    pattern: /gao|com|rice/,
    nutritionPer100g: {
      calories: 360,
      protein: 7,
      carbs: 80,
      fat: 0.7,
      fiber: 1,
      sodium: 5,
      sugar: 0,
    },
    pricePer100g: 3000,
    tags: ["nhieu carb"],
    allergens: [],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /bun|pho|mi|mi y|pasta|banh mi|mi soi/,
    nutritionPer100g: {
      calories: 350,
      protein: 12,
      carbs: 70,
      fat: 2,
      fiber: 2.5,
      sodium: 10,
      sugar: 1,
    },
    pricePer100g: 4000,
    tags: ["nhieu carb"],
    allergens: ["gluten"],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /mien|hu tieu|banh da/,
    nutritionPer100g: {
      calories: 340,
      protein: 6,
      carbs: 80,
      fat: 0.6,
      fiber: 1.5,
      sodium: 10,
      sugar: 0,
    },
    pricePer100g: 3500,
    tags: ["nhieu carb"],
    allergens: [],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /rau|cai|xa lach|rau thom|rau muong|rau den|cai be|cai ngot/,
    nutritionPer100g: {
      calories: 25,
      protein: 1.5,
      carbs: 5,
      fat: 0.2,
      fiber: 2,
      sodium: 30,
      sugar: 1,
    },
    pricePer100g: 2000,
    tags: ["nhieu chat xo"],
    allergens: [],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /ca rot|carrot/,
    nutritionPer100g: {
      calories: 41,
      protein: 0.9,
      carbs: 10,
      fat: 0.2,
      fiber: 2.8,
      sodium: 69,
      sugar: 4.7,
    },
    pricePer100g: 3000,
    tags: ["nhieu chat xo"],
    allergens: [],
    taste: ["ngot"],
    avoid: [],
  },
  {
    pattern: /dua leo|dua chuot|cucumber/,
    nutritionPer100g: {
      calories: 15,
      protein: 0.7,
      carbs: 3.6,
      fat: 0.1,
      fiber: 0.5,
      sodium: 2,
      sugar: 1.7,
    },
    pricePer100g: 2500,
    tags: ["nhieu chat xo", "it calo"],
    allergens: [],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /khoai tay|potato/,
    nutritionPer100g: {
      calories: 77,
      protein: 2,
      carbs: 17,
      fat: 0.1,
      fiber: 2.2,
      sodium: 6,
      sugar: 0.8,
    },
    pricePer100g: 2500,
    tags: ["nhieu carb"],
    allergens: [],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /khoai lang|sweet potato/,
    nutritionPer100g: {
      calories: 86,
      protein: 1.6,
      carbs: 20,
      fat: 0.1,
      fiber: 3,
      sodium: 55,
      sugar: 4.2,
    },
    pricePer100g: 2500,
    tags: ["nhieu carb", "nhieu chat xo"],
    allergens: [],
    taste: ["ngot"],
    avoid: [],
  },
  {
    pattern: /bi do|pumpkin/,
    nutritionPer100g: {
      calories: 26,
      protein: 1,
      carbs: 6.5,
      fat: 0.1,
      fiber: 0.5,
      sodium: 1,
      sugar: 2.8,
    },
    pricePer100g: 2000,
    tags: ["it calo"],
    allergens: [],
    taste: ["ngot"],
    avoid: [],
  },
  {
    pattern: /bi xanh|bi ngo|zucchini/,
    nutritionPer100g: {
      calories: 17,
      protein: 1.2,
      carbs: 3.1,
      fat: 0.3,
      fiber: 1,
      sodium: 8,
      sugar: 2.5,
    },
    pricePer100g: 2000,
    tags: ["it calo"],
    allergens: [],
    taste: ["nhat"],
    avoid: [],
  },
  {
    pattern: /nam|mushroom/,
    nutritionPer100g: {
      calories: 22,
      protein: 3.1,
      carbs: 3.3,
      fat: 0.3,
      fiber: 1,
      sodium: 5,
      sugar: 2,
    },
    pricePer100g: 4000,
    tags: ["nhieu chat xo"],
    allergens: [],
    taste: ["umami"],
    avoid: [],
  },
  {
    pattern: /ca chua|tomato/,
    nutritionPer100g: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      fiber: 1.2,
      sodium: 5,
      sugar: 2.6,
    },
    pricePer100g: 3000,
    tags: ["nhieu chat xo"],
    allergens: [],
    taste: ["chua"],
    avoid: [],
  },
  {
    pattern: /hanh|onion/,
    nutritionPer100g: {
      calories: 40,
      protein: 1.1,
      carbs: 9.3,
      fat: 0.1,
      fiber: 1.7,
      sodium: 4,
      sugar: 4.2,
    },
    pricePer100g: 2000,
    tags: [],
    allergens: [],
    taste: ["ngot"],
    avoid: [],
  },
  {
    pattern: /hanh la|hanh la non|scallion/,
    nutritionPer100g: {
      calories: 32,
      protein: 1.8,
      carbs: 7.3,
      fat: 0.2,
      fiber: 2.6,
      sodium: 16,
      sugar: 2.3,
    },
    pricePer100g: 3000,
    tags: [],
    allergens: [],
    taste: ["thom"],
    avoid: [],
  },
  {
    pattern: /toi|garlic/,
    nutritionPer100g: {
      calories: 149,
      protein: 6.4,
      carbs: 33,
      fat: 0.5,
      fiber: 2.1,
      sodium: 17,
      sugar: 1,
    },
    pricePer100g: 5000,
    tags: [],
    allergens: [],
    taste: ["dam da"],
    avoid: [],
  },
  {
    pattern: /gung|ginger/,
    nutritionPer100g: {
      calories: 80,
      protein: 1.8,
      carbs: 18,
      fat: 0.8,
      fiber: 2,
      sodium: 13,
      sugar: 1.7,
    },
    pricePer100g: 4000,
    tags: [],
    allergens: [],
    taste: ["thom", "am"],
    avoid: [],
  },
  {
    pattern: /sa|lemongrass/,
    nutritionPer100g: {
      calories: 99,
      protein: 1.8,
      carbs: 25,
      fat: 0.5,
      fiber: 1.9,
      sodium: 6,
      sugar: 0,
    },
    pricePer100g: 3000,
    tags: [],
    allergens: [],
    taste: ["thom"],
    avoid: [],
  },
  {
    pattern: /nghe|turmeric/,
    nutritionPer100g: {
      calories: 312,
      protein: 9.7,
      carbs: 67,
      fat: 3.3,
      fiber: 22.7,
      sodium: 38,
      sugar: 3.2,
    },
    pricePer100g: 4000,
    tags: [],
    allergens: [],
    taste: ["thom"],
    avoid: [],
  },
  {
    pattern: /ot|chili|ot/,
    nutritionPer100g: {
      calories: 40,
      protein: 1.9,
      carbs: 9,
      fat: 0.4,
      fiber: 1.5,
      sodium: 7,
      sugar: 5.3,
    },
    pricePer100g: 2000,
    tags: [],
    allergens: [],
    taste: ["cay"],
    avoid: ["tre em"],
  },
  {
    pattern: /duong|sugar/,
    nutritionPer100g: {
      calories: 387,
      protein: 0,
      carbs: 100,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 100,
    },
    pricePer100g: 2000,
    tags: [],
    allergens: [],
    taste: ["ngot"],
    avoid: ["tieu duong"],
  },
  {
    pattern: /muoi|salt/,
    nutritionPer100g: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 38758,
      sugar: 0,
    },
    pricePer100g: 500,
    tags: [],
    allergens: [],
    taste: ["man"],
    avoid: ["cao huyet ap"],
  },
  {
    pattern: /nuoc mam|fish sauce/,
    nutritionPer100g: {
      calories: 35,
      protein: 5,
      carbs: 3,
      fat: 0,
      fiber: 0,
      sodium: 7000,
      sugar: 2,
    },
    pricePer100g: 3000,
    tags: [],
    allergens: ["ca"],
    taste: ["man", "umami"],
    avoid: ["an chay"],
  },
  {
    pattern: /nuoc cot dua|coconut milk/,
    nutritionPer100g: {
      calories: 230,
      protein: 2.3,
      carbs: 6,
      fat: 24,
      fiber: 2.2,
      sodium: 15,
      sugar: 3.4,
    },
    pricePer100g: 6000,
    tags: [],
    allergens: [],
    taste: ["beo"],
    avoid: [],
  },
  {
    pattern: /nuoc tuong|xi dau|soy sauce/,
    nutritionPer100g: {
      calories: 53,
      protein: 8,
      carbs: 4.9,
      fat: 0.6,
      fiber: 0.8,
      sodium: 5600,
      sugar: 0.4,
    },
    pricePer100g: 2000,
    tags: [],
    allergens: ["dau nanh", "gluten"],
    taste: ["man", "umami"],
    avoid: [],
  },
  {
    pattern: /tuong ot|chili sauce/,
    nutritionPer100g: {
      calories: 89,
      protein: 1.3,
      carbs: 21,
      fat: 0.3,
      fiber: 1.5,
      sodium: 2000,
      sugar: 18,
    },
    pricePer100g: 2500,
    tags: [],
    allergens: [],
    taste: ["cay", "ngot"],
    avoid: ["tre em"],
  },
  {
    pattern: /dau|dau an|oil/,
    nutritionPer100g: {
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      fiber: 0,
      sodium: 0,
      sugar: 0,
    },
    pricePer100g: 3000,
    tags: [],
    allergens: [],
    taste: ["beo"],
    avoid: [],
  },
  {
    pattern: /me|sesame/,
    nutritionPer100g: {
      calories: 573,
      protein: 17,
      carbs: 23,
      fat: 50,
      fiber: 12,
      sodium: 11,
      sugar: 0.3,
    },
    pricePer100g: 7000,
    tags: ["giau dam"],
    allergens: ["hat"],
    taste: ["beo"],
    avoid: ["di ung hat"],
  },
  {
    pattern: /dau phong|lac|peanut/,
    nutritionPer100g: {
      calories: 567,
      protein: 25.8,
      carbs: 16,
      fat: 49,
      fiber: 8.5,
      sodium: 18,
      sugar: 4.7,
    },
    pricePer100g: 6000,
    tags: ["giau dam"],
    allergens: ["dau phong"],
    taste: ["beo"],
    avoid: ["di ung hat"],
  },
  {
    pattern: /chanh|lime|lemon|giam|vinegar/,
    nutritionPer100g: {
      calories: 22,
      protein: 0.5,
      carbs: 7,
      fat: 0.2,
      fiber: 0.3,
      sodium: 2,
      sugar: 1.5,
    },
    pricePer100g: 2000,
    tags: [],
    allergens: [],
    taste: ["chua"],
    avoid: [],
  },
];

const round1 = (value) => Math.round(value * 10) / 10;

const parseAmount = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const str = String(value).trim();
  if (!str) return null;
  if (str.includes("/")) {
    const [a, b] = str.split("/");
    const num = Number(a);
    const den = Number(b);
    if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
      return num / den;
    }
  }
  const num = Number(str.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(num) ? num : null;
};

const inferUnitGrams = (unit) => {
  const key = normalizeText(unit).trim();
  return UNIT_TO_GRAMS[key] || null;
};

const inferIngredientMatch = (name) => {
  const normalized = normalizeText(name);
  return INGREDIENT_DB.find((item) => item.pattern.test(normalized)) || null;
};

const inferUtensils = (steps) => {
  const text = normalizeText(steps.join(" "));
  const utensils = new Set();
  if (/(chien|xao|ran)/.test(text)) utensils.add("chao");
  if (/(luoc|ham|nau)/.test(text)) utensils.add("noi");
  if (/(nuong|lo nuong)/.test(text)) utensils.add("lo nuong");
  if (/(hap)/.test(text)) utensils.add("noi hap");
  if (/(xay)/.test(text)) utensils.add("may xay");
  if (/(tron|uop)/.test(text)) utensils.add("to tron");
  utensils.add("dao");
  utensils.add("thot");
  return Array.from(utensils);
};

export const estimateRecipe = ({
  ingredients,
  steps,
  servings,
  spice_level,
}) => {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0,
    price: 0,
  };

  const tags = new Set();
  const allergens = new Set();
  const taste = new Set();
  const avoid = new Set();
  let hasAnimal = false;

  (ingredients || []).forEach((item) => {
    const name = String(item?.name || "").trim();
    if (!name) return;
    const match = inferIngredientMatch(name);
    if (!match) return;

    const amount = parseAmount(item?.amount) ?? 1;
    const unitGrams = inferUnitGrams(item?.unit) ?? 100;
    const grams = amount * unitGrams;
    const factor = grams / 100;

    totals.calories += (match.nutritionPer100g?.calories || 0) * factor;
    totals.protein += (match.nutritionPer100g?.protein || 0) * factor;
    totals.carbs += (match.nutritionPer100g?.carbs || 0) * factor;
    totals.fat += (match.nutritionPer100g?.fat || 0) * factor;
    totals.fiber += (match.nutritionPer100g?.fiber || 0) * factor;
    totals.sodium += (match.nutritionPer100g?.sodium || 0) * factor;
    totals.sugar += (match.nutritionPer100g?.sugar || 0) * factor;
    totals.price += (match.pricePer100g || 0) * factor;

    (match.tags || []).forEach((t) => tags.add(t));
    (match.allergens || []).forEach((t) => allergens.add(t));
    (match.taste || []).forEach((t) => taste.add(t));
    (match.avoid || []).forEach((t) => avoid.add(t));

    if (/(thit|ga|bo|heo|ca |tom|trung)/.test(normalizeText(name))) {
      hasAnimal = true;
    }
  });

  const servingCount =
    Number.isFinite(Number(servings)) && Number(servings) > 0
      ? Number(servings)
      : 1;
  const perServingCalories = totals.calories / servingCount;
  const perServingProtein = totals.protein / servingCount;
  const perServingCarbs = totals.carbs / servingCount;
  const perServingFat = totals.fat / servingCount;
  const perServingFiber = totals.fiber / servingCount;

  if (!hasAnimal) tags.add("chay");
  if (perServingProtein >= 20) tags.add("giau dam");
  if (perServingCalories > 0 && perServingCalories <= 400) tags.add("it calo");
  if (perServingCarbs > 0 && perServingCarbs <= 30) tags.add("it carb");
  if (perServingFat > 0 && perServingFat <= 10) tags.add("it beo");
  if (perServingFiber >= 5) tags.add("nhieu chat xo");

  if (Number(spice_level) >= 3 || taste.has("cay")) avoid.add("da day yeu");

  const nutrition = {
    calories: Math.round(totals.calories),
    protein_g: round1(totals.protein),
    carbs_g: round1(totals.carbs),
    fat_g: round1(totals.fat),
    fiber_g: round1(totals.fiber),
    sodium_mg: Math.round(totals.sodium),
    sugar_g: round1(totals.sugar),
  };

  const price = totals.price;
  const priceEstimate =
    price > 0
      ? {
          min: Math.max(1000, Math.round(price * 0.85)),
          max: Math.max(2000, Math.round(price * 1.15)),
          currency: "VND",
        }
      : { min: 0, max: 0, currency: "VND" };

  const suitableFor = new Set();
  if (tags.has("it calo")) suitableFor.add("giam can");
  if (tags.has("giau dam")) suitableFor.add("tang co");
  if (tags.has("chay")) suitableFor.add("an chay");
  if (tags.has("it carb")) suitableFor.add("an kieng");

  const utensils = inferUtensils(steps || []);

  return {
    nutrition,
    price_estimate: priceEstimate,
    diet_tags: Array.from(tags),
    allergens: Array.from(allergens),
    taste_profile: Array.from(taste),
    utensils,
    suitable_for: Array.from(suitableFor),
    avoid_for: Array.from(avoid),
  };
};
