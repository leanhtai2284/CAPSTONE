import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { recipeService } from "../../services/recipeService";
import { toast } from "react-toastify";

const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name_vi: "",
    region: "Bắc",
    category: "main",
    meal_types: [],
    prep_time_min: "",
    cook_time_min: "",
    difficulty: "easy",
    servings: 1,
    description: "",
    image_url: "",
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
    price_estimate: {
      min: "",
      max: "",
      currency: "VND",
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const recipe = await recipeService.getRecipeById(id);
      setFormData({
        ...recipe,
        ingredients: recipe.ingredients?.length
          ? recipe.ingredients
          : [{ name: "", amount: "", unit: "", scalable: true }],
        steps: recipe.steps?.length ? recipe.steps : [""],
      });
    } catch (error) {
      toast.error(error.message || "Không thể tải công thức");
      navigate("/admin/recipes");
    } finally {
      setLoading(false);
    }
  };

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

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field, defaultValue = "") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setFormData((prev) => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: field === "amount" || field === "scalable" ? (field === "scalable" ? value : Number(value) || "") : value,
      };
      return { ...prev, ingredients: newIngredients };
    });
  };

  // Parse ingredients from text
  const parseIngredientsFromText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const ingredients = [];
    
    // Common Vietnamese units
    const units = ['muỗng canh', 'muỗng cà phê', 'muỗng', 'kg', 'g', 'l', 'ml', 'củ', 'quả', 'trái', 'nhánh', 'lá', 'bó', 'tép', 'con', 'cái', 'chén', 'bát', 'lon', 'hộp'];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Remove leading dashes, bullets, numbers
      let cleaned = trimmed.replace(/^[-•\d+\.\)]\s*/, '').trim();
      
      // Try to find number
      const numberMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
      const amount = numberMatch ? parseFloat(numberMatch[1]) : "";
      
      if (numberMatch) {
        // Remove the number from the string
        cleaned = cleaned.replace(/\d+(?:\.\d+)?\s*/, '').trim();
      }
      
      // Try to find unit
      let foundUnit = '';
      let name = cleaned;
      
      // Check for multi-word units first (longer units)
      const sortedUnits = [...units].sort((a, b) => b.length - a.length);
      for (const unit of sortedUnits) {
        const lowerCleaned = cleaned.toLowerCase();
        const lowerUnit = unit.toLowerCase();
        
        // Check if unit is at the start
        if (lowerCleaned.startsWith(lowerUnit)) {
          foundUnit = unit;
          name = cleaned.substring(unit.length).trim();
          break;
        }
        // Check if unit is at the end
        else if (lowerCleaned.endsWith(lowerUnit)) {
          foundUnit = unit;
          name = cleaned.substring(0, cleaned.length - unit.length).trim();
          break;
        }
        // Check if unit is in the middle (with spaces)
        else if (lowerCleaned.includes(' ' + lowerUnit + ' ')) {
          const parts = cleaned.split(new RegExp('\\s+' + unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+', 'i'));
          if (parts.length === 2) {
            foundUnit = unit;
            name = (parts[0] + ' ' + parts[1]).trim();
            break;
          }
        }
      }
      
      // If no unit found but we have amount, the rest is the name
      if (!foundUnit && amount) {
        name = cleaned;
      }
      
      ingredients.push({
        name: name || trimmed,
        amount: amount || "",
        unit: foundUnit || "",
        scalable: true,
      });
    });
    
    return ingredients;
  };

  // Parse steps from text
  const parseStepsFromText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const steps = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Remove leading numbers and dots (e.g., "1. ", "1) ", "- ")
      const cleaned = trimmed
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[-•]\s*/, '')
        .trim();
      
      if (cleaned) {
        steps.push(cleaned);
      }
    });
    
    return steps;
  };

  const handleImportIngredients = () => {
    const text = prompt(
      "Nhập danh sách nguyên liệu (mỗi dòng một nguyên liệu):\n\nVí dụ:\n500g thịt heo\n2 muỗng canh dầu ăn\n1 củ hành tây",
      ""
    );
    if (text) {
      const parsed = parseIngredientsFromText(text);
      if (parsed.length > 0) {
        setFormData((prev) => ({
          ...prev,
          ingredients: [...prev.ingredients.filter(ing => ing.name || ing.amount), ...parsed],
        }));
        toast.success(`Đã import ${parsed.length} nguyên liệu!`);
      } else {
        toast.warning("Không thể parse nguyên liệu từ text. Vui lòng kiểm tra định dạng.");
      }
    }
  };

  const handleImportSteps = () => {
    const text = prompt(
      "Nhập các bước nấu (mỗi dòng một bước):\n\nVí dụ:\n1. Rửa sạch thịt heo\n2. Cắt thịt thành miếng nhỏ\n3. Ướp thịt với gia vị",
      ""
    );
    if (text) {
      const parsed = parseStepsFromText(text);
      if (parsed.length > 0) {
        setFormData((prev) => ({
          ...prev,
          steps: [...prev.steps.filter(s => s.trim()), ...parsed],
        }));
        toast.success(`Đã import ${parsed.length} bước nấu!`);
      } else {
        toast.warning("Không thể parse bước nấu từ text. Vui lòng kiểm tra định dạng.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Clean up data
      const submitData = {
        ...formData,
        ingredients: formData.ingredients.filter(
          (ing) => ing.name && ing.amount && ing.unit
        ),
        steps: formData.steps.filter((step) => step.trim()),
        prep_time_min: formData.prep_time_min || undefined,
        cook_time_min: formData.cook_time_min || undefined,
        nutrition: Object.fromEntries(
          Object.entries(formData.nutrition).map(([k, v]) => [
            k,
            v === "" ? undefined : Number(v),
          ])
        ),
        price_estimate: {
          min: formData.price_estimate.min ? Number(formData.price_estimate.min) : undefined,
          max: formData.price_estimate.max ? Number(formData.price_estimate.max) : undefined,
          currency: formData.price_estimate.currency,
        },
      };

      if (isEdit) {
        await recipeService.updateRecipe(id, submitData);
        toast.success("Cập nhật công thức thành công!");
      } else {
        await recipeService.createRecipe(submitData);
        toast.success("Tạo công thức thành công!");
      }
      navigate("/admin/recipes");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? "Sửa Công Thức" : "Thêm Công Thức Mới"}
            </h1>
            <button
              onClick={() => navigate("/admin/recipes")}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Quay lại
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID (unique) *
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
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
                      {type === "breakfast" ? "Sáng" : type === "lunch" ? "Trưa" : "Tối"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
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
                  Nguyên liệu *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleImportIngredients}
                    className="text-sm text-blue-600 hover:text-blue-700 border border-blue-600 px-3 py-1 rounded"
                    title="Import từ text (ví dụ: 500g thịt heo, 2 muỗng canh dầu ăn)"
                  >
                    📋 Import từ text
                  </button>
                  <button
                    type="button"
                    onClick={() => addArrayItem("ingredients", { name: "", amount: "", unit: "", scalable: true })}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    + Thêm nguyên liệu
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                💡 Tip: Click "Import từ text" để paste danh sách nguyên liệu (mỗi dòng một nguyên liệu, ví dụ: "500g thịt heo")
              </p>
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Tên nguyên liệu"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                    className="col-span-4 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Số lượng"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                    className="col-span-3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Đơn vị"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                    className="col-span-3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={ing.scalable}
                      onChange={(e) => handleIngredientChange(index, "scalable", e.target.checked)}
                      className="mr-1"
                    />
                    <span className="text-xs text-gray-500">Scale</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("ingredients", index)}
                    className="col-span-1 text-red-600 hover:text-red-700"
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
                  Các bước nấu *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleImportSteps}
                    className="text-sm text-blue-600 hover:text-blue-700 border border-blue-600 px-3 py-1 rounded"
                    title="Import từ text (mỗi dòng một bước)"
                  >
                    📋 Import từ text
                  </button>
                  <button
                    type="button"
                    onClick={() => addArrayItem("steps", "")}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    + Thêm bước
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                💡 Tip: Click "Import từ text" để paste các bước nấu (mỗi dòng một bước, có thể có số thứ tự)
              </p>
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <span className="text-sm text-gray-500 w-8 pt-2">{index + 1}.</span>
                  <textarea
                    value={step}
                    onChange={(e) => handleArrayChange("steps", index, e.target.value)}
                    rows="2"
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("steps", index)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Nutrition */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Thông tin dinh dưỡng</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Calories *
                  </label>
                  <input
                    type="number"
                    name="nutrition.calories"
                    value={formData.nutrition.calories}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    name="nutrition.protein_g"
                    value={formData.nutrition.protein_g}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    name="nutrition.carbs_g"
                    value={formData.nutrition.carbs_g}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    name="nutrition.fat_g"
                    value={formData.nutrition.fat_g}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fiber (g)
                  </label>
                  <input
                    type="number"
                    name="nutrition.fiber_g"
                    value={formData.nutrition.fiber_g}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sodium (mg)
                  </label>
                  <input
                    type="number"
                    name="nutrition.sodium_mg"
                    value={formData.nutrition.sodium_mg}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sugar (g)
                  </label>
                  <input
                    type="number"
                    name="nutrition.sugar_g"
                    value={formData.nutrition.sugar_g}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Price Estimate */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Ước tính giá</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giá tối thiểu (VND)
                  </label>
                  <input
                    type="number"
                    name="price_estimate.min"
                    value={formData.price_estimate.min}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giá tối đa (VND)
                  </label>
                  <input
                    type="number"
                    name="price_estimate.max"
                    value={formData.price_estimate.max}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Array fields with comma-separated input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diet Tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.diet_tags.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      diet_tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Allergens (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.allergens.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allergens: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Taste Profile (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.taste_profile.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taste_profile: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Utensils (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.utensils.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      utensils: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suitable For (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.suitable_for.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      suitable_for: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Avoid For (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.avoid_for.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      avoid_for: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Tạo mới"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/recipes")}
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
};

export default RecipeForm;

