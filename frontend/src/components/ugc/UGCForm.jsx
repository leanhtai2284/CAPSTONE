import React, { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { recipeService } from "../../services/recipeService";

export default function UGCForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_vi: "",
    region: "Bắc",
    category: "main",
    meal_types: [],
    prep_time_min: "",
    cook_time_min: "",
    difficulty: "easy",
    servings: 1,
    description: "",

    spice_level: 0,
    ingredients: [{ name: "", amount: "", unit: "", scalable: true }],
    steps: [""],
    utensils: [],
    diet_tags: [],
    allergens: [],
    taste_profile: [],
    suitable_for: [],
    avoid_for: [],
    nutrition: {
      calories: "",
      protein_g: "",
      carbs_g: "",
      fat_g: "",
      fiber_g: "",
      sodium_mg: "",
      sugar_g: "",
    },
    price_estimate: { min: "", max: "", currency: "VND" },
  });

  const [cookingVideo, setCookingVideo] = useState(null);
  const [recipeImages, setRecipeImages] = useState([]);
  const videoRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleImageFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const newFiles = Array.from(files).slice(0, 5 - recipeImages.length);
      if (newFiles.length === 0) {
        toast.warning("Tối đa 5 ảnh");
        return;
      }
      const withPreview = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setRecipeImages((prev) => [...prev, ...withPreview].slice(0, 5));
      if (imageInputRef.current) imageInputRef.current.value = "";
    },
    [recipeImages.length],
  );

  const removeImage = useCallback((index) => {
    setRecipeImages((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "number" ? (value ? Number(value) : "") : value,
        },
      }));
    } else if (type === "checkbox") {
      if (name === "meal_types") {
        setFormData((prev) => ({
          ...prev,
          meal_types: checked
            ? [...prev.meal_types, value]
            : prev.meal_types.filter((t) => t !== value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? (value ? Number(value) : "") : value,
      }));
    }
  };

  const mergeUnique = (existing, incoming) => {
    const out = new Set([...(existing || []), ...(incoming || [])]);
    return Array.from(out).filter(Boolean);
  };

  const handleIngredientChange = (index, field, value) => {
    setFormData((prev) => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: field === "amount" ? (value ? value : "") : value,
      };
      return { ...prev, ingredients: newIngredients };
    });
  };

  const addArrayItem = (field, defaultValue = "") =>
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  const removeArrayItem = (field, index) =>
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));

  // Reuse parsing logic from admin form (simplified)
  const parseIngredientsFromText = (text) => {
    const lines = text.split("\n").filter((l) => l.trim());
    const units = [
      "muỗng canh",
      "muỗng cà phê",
      "muỗng",
      "thìa canh",
      "thìa cà phê",
      "thìa",
      "tbsp",
      "tsp",
      "cup",
      "kg",
      "g",
      "gram",
      "l",
      "ml",
      "củ",
      "quả",
      "trái",
      "miếng",
      "viên",
      "nhánh",
      "lá",
      "bó",
      "tép",
      "con",
      "cái",
      "chiếc",
      "chén",
      "bát",
      "ly",
      "lon",
      "chai",
      "hộp",
      "gói",
      "bịch",
    ];
    const out = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let cleaned = trimmed.replace(/^[-•\d+.\)]\s*/, "").trim();
      const numberMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
      const amount = numberMatch ? parseFloat(numberMatch[1]) : "";
      if (numberMatch) cleaned = cleaned.replace(/\d+(?:\.\d+)?\s*/, "").trim();
      let foundUnit = "";
      let name = cleaned;
      const sortedUnits = [...units].sort((a, b) => b.length - a.length);
      for (const u of sortedUnits) {
        const lc = cleaned.toLowerCase();
        if (lc.startsWith(u) || lc.endsWith(u) || lc.includes(" " + u + " ")) {
          foundUnit = u;
          break;
        }
      }
      out.push({
        name: name || trimmed,
        amount: amount || "",
        unit: foundUnit || "",
        scalable: true,
      });
    });
    return out;
  };

  const parseStepsFromText = (text) =>
    text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/^[-•]\s*/, ""));

  // Image uploads handled via recipeImages state + recipe_images FormData field

  const handleVideoFile = (file) => {
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      // 200MB limit
      toast.error("Video quá lớn (max 200MB)");
      return;
    }
    const preview = URL.createObjectURL(file);
    setCookingVideo({ file, preview });
  };

  const handleImportIngredients = () => {
    const t = prompt("Nhập danh sách nguyên liệu (mỗi dòng):", "");
    if (t) {
      const parsed = parseIngredientsFromText(t);
      setFormData((prev) => ({
        ...prev,
        ingredients: [
          ...prev.ingredients.filter((i) => i.name || i.amount),
          ...parsed,
        ],
      }));
      toast.success("Imported");
    }
  };

  const handleImportSteps = () => {
    const t = prompt("Nhập các bước (mỗi dòng):", "");
    if (t) {
      const parsed = parseStepsFromText(t);
      setFormData((prev) => ({
        ...prev,
        steps: [...prev.steps.filter((s) => s.trim()), ...parsed],
      }));
      toast.success("Imported");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name_vi) return toast.warning("Vui lòng nhập tên món");
    try {
      setLoading(true);
      const fd = new FormData();
      // Basic fields
      Object.entries({
        name_vi: formData.name_vi,
        region: formData.region,
        category: formData.category,
        prep_time_min: formData.prep_time_min,
        cook_time_min: formData.cook_time_min,
        difficulty: formData.difficulty,
        servings: formData.servings,
        description: formData.description,

        spice_level: formData.spice_level,
      }).forEach(([k, v]) => {
        if (v !== undefined && v !== "") fd.append(k, v);
      });
      fd.append("meal_types", JSON.stringify(formData.meal_types));
      fd.append(
        "ingredients",
        JSON.stringify(
          formData.ingredients.filter((i) => i.name || i.amount || i.unit),
        ),
      );
      fd.append(
        "steps",
        JSON.stringify(formData.steps.filter((s) => s && s.trim())),
      );

      // Append recipe images
      recipeImages.forEach((img) => {
        if (img.file) fd.append("recipe_images", img.file);
      });

      if (cookingVideo && cookingVideo.file)
        fd.append("cooking_video", cookingVideo.file);

      await recipeService.createUGC(fd);
      toast.success("Gửi công thức thành công — đang chờ admin duyệt");
      setFormData({
        name_vi: "",
        region: "Bắc",
        category: "main",
        meal_types: [],
        prep_time_min: "",
        cook_time_min: "",
        difficulty: "easy",
        servings: 1,
        description: "",

        spice_level: 0,
        ingredients: [{ name: "", amount: "", unit: "", scalable: true }],
        steps: [""],
      });
      if (cookingVideo && cookingVideo.preview)
        URL.revokeObjectURL(cookingVideo.preview);
      setCookingVideo(null);
      recipeImages.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      setRecipeImages([]);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Lỗi khi gửi công thức");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gửi Công Thức
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID (unique)
                </label>
                <input
                  type="text"
                  name="external_id"
                  value={formData.external_id || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      external_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="ID (không bắt buộc)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên món ăn *
                </label>
                <input
                  type="text"
                  name="name_vi"
                  value={formData.name_vi}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vùng miền *
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Bắc">Bắc</option>
                  <option value="Trung">Trung</option>
                  <option value="Nam">Nam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại món *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="main">Món chính</option>
                  <option value="soup">Canh/Súp</option>
                  <option value="salad">Salad</option>
                  <option value="snack">Đồ ăn vặt</option>
                  <option value="dessert">Tráng miệng</option>
                  <option value="drink">Đồ uống</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Độ khó
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số phần ăn
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thời gian chuẩn bị (phút)
                </label>
                <input
                  type="number"
                  name="prep_time_min"
                  value={formData.prep_time_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thời gian nấu (phút)
                </label>
                <input
                  type="number"
                  name="cook_time_min"
                  value={formData.cook_time_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Độ cay (0-5)
                </label>
                <input
                  type="number"
                  name="spice_level"
                  value={formData.spice_level}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hình ảnh món ăn (tối đa 5 ảnh)
                </label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={(e) => handleImageFiles(e.target.files)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {recipeImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {recipeImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          ×
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0.5 left-0.5 bg-green-600 text-white text-[10px] px-1 rounded">
                            Chính
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Meal Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bữa ăn phù hợp
              </label>
              <div className="flex gap-4">
                {["breakfast", "lunch", "dinner"].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      name="meal_types"
                      value={type}
                      checked={formData.meal_types.includes(type)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {type === "breakfast"
                        ? "Sáng"
                        : type === "lunch"
                          ? "Trưa"
                          : "Tối"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nguyên liệu
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleImportIngredients}
                    className="text-sm text-blue-600 hover:text-blue-700 border border-blue-600 px-3 py-1 rounded"
                  >
                    📋 Import từ text
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("ingredients", {
                        name: "",
                        amount: "",
                        unit: "",
                        scalable: true,
                      })
                    }
                    className="text-sm text-green-600"
                  >
                    + Thêm nguyên liệu
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                💡 Tip: Click "Import từ text" để paste danh sách nguyên liệu
                (mỗi dòng một nguyên liệu, ví dụ: "500g thịt heo")
              </p>
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Tên nguyên liệu"
                    value={ing.name}
                    onChange={(e) =>
                      handleIngredientChange(idx, "name", e.target.value)
                    }
                    className="col-span-4 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Số lượng"
                    value={ing.amount}
                    onChange={(e) =>
                      handleIngredientChange(idx, "amount", e.target.value)
                    }
                    className="col-span-3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Đơn vị"
                    value={ing.unit}
                    onChange={(e) =>
                      handleIngredientChange(idx, "unit", e.target.value)
                    }
                    className="col-span-3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={ing.scalable}
                      onChange={(e) =>
                        handleIngredientChange(
                          idx,
                          "scalable",
                          e.target.checked,
                        )
                      }
                      className="mr-1"
                    />
                    <span className="text-xs text-gray-500">Scale</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("ingredients", idx)}
                    className="col-span-1 text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Các bước nấu
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleImportSteps}
                    className="text-sm text-blue-600 hover:text-blue-700 border border-blue-600 px-3 py-1 rounded"
                  >
                    📋 Import từ text
                  </button>
                  <button
                    type="button"
                    onClick={() => addArrayItem("steps", "")}
                    className="text-sm text-green-600"
                  >
                    + Thêm bước
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                💡 Tip: Click "Import từ text" để paste các bước nấu (mỗi dòng
                một bước, có thể có số thứ tự)
              </p>
              {formData.steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <span className="text-sm text-gray-500 w-8 pt-2">
                    {idx + 1}.
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        steps: prev.steps.map((s, i) =>
                          i === idx ? e.target.value : s,
                        ),
                      }))
                    }
                    rows="2"
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("steps", idx)}
                    className="text-red-600 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* (No inline media) Video will be at the end per design */}

            {/* Video (moved to end) */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Video nấu ăn (mp4) — tối đa 1
              </label>
              <input
                ref={videoRef}
                type="file"
                accept="video/mp4,video/*"
                onChange={(e) => handleVideoFile(e.target.files[0])}
                className=""
              />
              {cookingVideo && (
                <div className="mt-3 relative border rounded overflow-hidden">
                  <video
                    src={cookingVideo.preview}
                    className="w-full h-48 object-cover"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (cookingVideo.preview)
                        URL.revokeObjectURL(cookingVideo.preview);
                      setCookingVideo(null);
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded"
                  >
                    X
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Gửi công thức"}
              </button>
              <button
                type="button"
                onClick={() => {
                  /* reset */ setFormData({
                    name_vi: "",
                    region: "Bắc",
                    category: "main",
                    meal_types: [],
                    prep_time_min: "",
                    cook_time_min: "",
                    difficulty: "easy",
                    servings: 1,
                    description: "",

                    spice_level: 0,
                    ingredients: [
                      { name: "", amount: "", unit: "", scalable: true },
                    ],
                    steps: [""],
                  });
                  recipeImages.forEach(
                    (f) => f.preview && URL.revokeObjectURL(f.preview),
                  );
                  if (cookingVideo && cookingVideo.preview)
                    URL.revokeObjectURL(cookingVideo.preview);
                  setRecipeImages([]);
                  setCookingVideo(null);
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
