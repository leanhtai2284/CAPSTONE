import React, { useState, useRef } from "react";
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
    price_estimate: { min: "", max: "", currency: "VND" },
  });

  const [cookingVideo, setCookingVideo] = useState(null);
  const videoRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: type === 'number' ? (value ? Number(value) : '') : value } }));
    } else if (type === 'checkbox') {
      if (name === 'meal_types') {
        setFormData(prev => ({ ...prev, meal_types: checked ? [...prev.meal_types, value] : prev.meal_types.filter(t => t !== value) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value ? Number(value) : '') : value }));
    }
  };

  const handleIngredientChange = (index, field, value) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: field === 'amount' ? (value ? value : '') : value };
      return { ...prev, ingredients: newIngredients };
    });
  };

  const addArrayItem = (field, defaultValue = "") => setFormData(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }));
  const removeArrayItem = (field, index) => setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  // Reuse parsing logic from admin form (simplified)
  const parseIngredientsFromText = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const units = ['muỗng canh', 'muỗng cà phê', 'muỗng', 'kg', 'g', 'l', 'ml', 'củ', 'quả', 'trái', 'nhánh', 'lá', 'bó', 'tép', 'con', 'cái', 'chén', 'bát', 'lon', 'hộp'];
    const out = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let cleaned = trimmed.replace(/^[-•\d+.\)]\s*/, '').trim();
      const numberMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
      const amount = numberMatch ? parseFloat(numberMatch[1]) : "";
      if (numberMatch) cleaned = cleaned.replace(/\d+(?:\.\d+)?\s*/, '').trim();
      let foundUnit = '';
      let name = cleaned;
      const sortedUnits = [...units].sort((a,b)=>b.length-a.length);
      for (const u of sortedUnits) {
        const lc = cleaned.toLowerCase();
        if (lc.startsWith(u) || lc.endsWith(u) || lc.includes(' ' + u + ' ')) { foundUnit = u; break; }
      }
      out.push({ name: name||trimmed, amount: amount||"", unit: foundUnit||"", scalable: true });
    });
    return out;
  };

  const parseStepsFromText = (text) =>
    text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•]\s*/, ''));

  // Note: image file uploads removed for UGC — use `image_url` instead. Only video upload is supported here.

  const handleVideoFile = (file) => {
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) { // 200MB limit
      toast.error('Video quá lớn (max 200MB)');
      return;
    }
    const preview = URL.createObjectURL(file);
    setCookingVideo({ file, preview });
  };

  const handleImportIngredients = () => {
    const t = prompt('Nhập danh sách nguyên liệu (mỗi dòng):','');
    if (t) {
      const parsed = parseIngredientsFromText(t);
      setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients.filter(i=>i.name||i.amount), ...parsed] }));
      toast.success('Imported');
    }
  };

  const handleImportSteps = () => {
    const t = prompt('Nhập các bước (mỗi dòng):','');
    if (t) {
      const parsed = parseStepsFromText(t);
      setFormData(prev => ({ ...prev, steps: [...prev.steps.filter(s=>s.trim()), ...parsed] }));
      toast.success('Imported');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name_vi) return toast.warning('Vui lòng nhập tên món');
    try {
      setLoading(true);
      const fd = new FormData();
      // Basic fields
      Object.entries({ name_vi: formData.name_vi, region: formData.region, category: formData.category, prep_time_min: formData.prep_time_min, cook_time_min: formData.cook_time_min, difficulty: formData.difficulty, servings: formData.servings, description: formData.description, image_url: formData.image_url, spice_level: formData.spice_level }).forEach(([k,v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      fd.append('meal_types', JSON.stringify(formData.meal_types));
      fd.append('ingredients', JSON.stringify(formData.ingredients.filter(i=>i.name||i.amount||i.unit)));
      fd.append('steps', JSON.stringify(formData.steps.filter(s=>s && s.trim())));
      fd.append('nutrition', JSON.stringify(formData.nutrition));
      fd.append('price_estimate', JSON.stringify(formData.price_estimate));
      fd.append('diet_tags', JSON.stringify(formData.diet_tags));
      fd.append('allergens', JSON.stringify(formData.allergens));
      fd.append('taste_profile', JSON.stringify(formData.taste_profile));
      fd.append('utensils', JSON.stringify(formData.utensils));
      fd.append('suitable_for', JSON.stringify(formData.suitable_for));
      fd.append('avoid_for', JSON.stringify(formData.avoid_for));

      if (cookingVideo && cookingVideo.file) fd.append('cooking_video', cookingVideo.file);

      await recipeService.createUGC(fd);
      toast.success('Gửi công thức thành công — đang chờ admin duyệt');
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
        nutrition: { calories: "", protein_g: "", carbs_g: "", fat_g: "", fiber_g: "", sodium_mg: "", sugar_g: "" },
        price_estimate: { min: "", max: "", currency: "VND" },
      });
      if (cookingVideo && cookingVideo.preview) URL.revokeObjectURL(cookingVideo.preview);
      setCookingVideo(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi gửi công thức');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gửi Công Thức</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID (unique)</label>
                <input type="text" name="external_id" value={formData.external_id || ""} onChange={e => setFormData(prev => ({ ...prev, external_id: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="ID (không bắt buộc)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên món ăn *</label>
                <input type="text" name="name_vi" value={formData.name_vi} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vùng miền *</label>
                <select name="region" value={formData.region} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="Bắc">Bắc</option>
                  <option value="Trung">Trung</option>
                  <option value="Nam">Nam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại món *</label>
                <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="main">Món chính</option>
                  <option value="soup">Canh/Súp</option>
                  <option value="salad">Salad</option>
                  <option value="snack">Đồ ăn vặt</option>
                  <option value="dessert">Tráng miệng</option>
                  <option value="drink">Đồ uống</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Độ khó</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số phần ăn</label>
                <input type="number" name="servings" value={formData.servings} onChange={handleChange} min="1" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thời gian chuẩn bị (phút)</label>
                <input type="number" name="prep_time_min" value={formData.prep_time_min} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thời gian nấu (phút)</label>
                <input type="number" name="cook_time_min" value={formData.cook_time_min} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Độ cay (0-5)</label>
                <input type="number" name="spice_level" value={formData.spice_level} onChange={handleChange} min="0" max="5" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL hình ảnh</label>
                <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>

            {/* Meal Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bữa ăn phù hợp</label>
              <div className="flex gap-4">
                {["breakfast", "lunch", "dinner"].map((type) => (
                  <label key={type} className="flex items-center">
                    <input type="checkbox" name="meal_types" value={type} checked={formData.meal_types.includes(type)} onChange={handleChange} className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{type === "breakfast" ? "Sáng" : type === "lunch" ? "Trưa" : "Tối"}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nguyên liệu</label>
                <div className="flex gap-2">
                  <button type="button" onClick={handleImportIngredients} className="text-sm text-blue-600 hover:text-blue-700 border border-blue-600 px-3 py-1 rounded">📋 Import từ text</button>
                  <button type="button" onClick={() => addArrayItem('ingredients', { name: '', amount: '', unit: '', scalable: true })} className="text-sm text-green-600">+ Thêm nguyên liệu</button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">💡 Tip: Click "Import từ text" để paste danh sách nguyên liệu (mỗi dòng một nguyên liệu, ví dụ: "500g thịt heo")</p>
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                  <input type="text" placeholder="Tên nguyên liệu" value={ing.name} onChange={e => handleIngredientChange(idx, 'name', e.target.value)} className="col-span-4 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <input type="text" placeholder="Số lượng" value={ing.amount} onChange={e => handleIngredientChange(idx, 'amount', e.target.value)} className="col-span-3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <input type="text" placeholder="Đơn vị" value={ing.unit} onChange={e => handleIngredientChange(idx, 'unit', e.target.value)} className="col-span-3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <div className="col-span-1 flex items-center">
                    <input type="checkbox" checked={ing.scalable} onChange={e => handleIngredientChange(idx, 'scalable', e.target.checked)} className="mr-1" />
                    <span className="text-xs text-gray-500">Scale</span>
                  </div>
                  <button type="button" onClick={() => removeArrayItem('ingredients', idx)} className="col-span-1 text-red-600">×</button>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Các bước nấu</label>
                <div className="flex gap-2">
                  <button type="button" onClick={handleImportSteps} className="text-sm text-blue-600 hover:text-blue-700 border border-blue-600 px-3 py-1 rounded">📋 Import từ text</button>
                  <button type="button" onClick={() => addArrayItem('steps', '')} className="text-sm text-green-600">+ Thêm bước</button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">💡 Tip: Click "Import từ text" để paste các bước nấu (mỗi dòng một bước, có thể có số thứ tự)</p>
              {formData.steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <span className="text-sm text-gray-500 w-8 pt-2">{idx + 1}.</span>
                  <textarea value={step} onChange={e => setFormData(prev => ({ ...prev, steps: prev.steps.map((s,i) => i===idx ? e.target.value : s) }))} rows="2" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <button type="button" onClick={() => removeArrayItem('steps', idx)} className="text-red-600 px-2">×</button>
                </div>
              ))}
            </div>

            {/* Nutrition & Price */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thông tin dinh dưỡng</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input type="number" name="nutrition.calories" value={formData.nutrition.calories} onChange={handleChange} placeholder="Calories" required className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                    <input type="number" name="nutrition.protein_g" value={formData.nutrition.protein_g} onChange={handleChange} placeholder="Protein (g)" className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                    <input type="number" name="nutrition.carbs_g" value={formData.nutrition.carbs_g} onChange={handleChange} placeholder="Carbs (g)" className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                    <input type="number" name="nutrition.fat_g" value={formData.nutrition.fat_g} onChange={handleChange} placeholder="Fat (g)" className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                    <input type="number" name="nutrition.fiber_g" value={formData.nutrition.fiber_g} onChange={handleChange} placeholder="Fiber (g)" className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                    <input type="number" name="nutrition.sodium_mg" value={formData.nutrition.sodium_mg} onChange={handleChange} placeholder="Sodium (mg)" className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                    <input type="number" name="nutrition.sugar_g" value={formData.nutrition.sugar_g} onChange={handleChange} placeholder="Sugar (g)" className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ước tính giá</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="price_estimate.min" value={formData.price_estimate.min} onChange={handleChange} placeholder="Giá tối thiểu (VND)" className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                    <input type="number" name="price_estimate.max" value={formData.price_estimate.max} onChange={handleChange} placeholder="Giá tối đa (VND)" className="w-full px-4 py-3 border rounded-xl placeholder-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* (No inline media) Video will be at the end per design */}

            {/* Extra tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diet Tags (phân cách bằng dấu phẩy)</label>
                <input type="text" value={formData.diet_tags.join(', ')} onChange={e => setFormData(prev => ({ ...prev, diet_tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergens (phân cách bằng dấu phẩy)</label>
                <input type="text" value={formData.allergens.join(', ')} onChange={e => setFormData(prev => ({ ...prev, allergens: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taste Profile (phân cách bằng dấu phẩy)</label>
                <input type="text" value={formData.taste_profile.join(', ')} onChange={e => setFormData(prev => ({ ...prev, taste_profile: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Utensils (phân cách bằng dấu phẩy)</label>
                <input type="text" value={formData.utensils.join(', ')} onChange={e => setFormData(prev => ({ ...prev, utensils: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Suitable For (phân cách bằng dấu phẩy)</label>
                <input type="text" value={formData.suitable_for.join(', ')} onChange={e => setFormData(prev => ({ ...prev, suitable_for: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avoid For (phân cách bằng dấu phẩy)</label>
                <input type="text" value={formData.avoid_for.join(', ')} onChange={e => setFormData(prev => ({ ...prev, avoid_for: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>

            {/* Video (moved to end) */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Video nấu ăn (mp4) — tối đa 1</label>
              <input ref={videoRef} type="file" accept="video/mp4,video/*" onChange={e => handleVideoFile(e.target.files[0])} className="" />
              {cookingVideo && (
                <div className="mt-3 relative border rounded overflow-hidden">
                  <video src={cookingVideo.preview} className="w-full h-48 object-cover" controls />
                  <button type="button" onClick={() => { if (cookingVideo.preview) URL.revokeObjectURL(cookingVideo.preview); setCookingVideo(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded">X</button>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{loading ? 'Đang xử lý...' : 'Gửi công thức'}</button>
              <button type="button" onClick={() => { /* reset */ setFormData({ name_vi: '', region: 'Bắc', category: 'main', meal_types: [], prep_time_min: '', cook_time_min: '', difficulty: 'easy', servings: 1, description: '', image_url: '', spice_level: 0, ingredients: [{ name: '', amount: '', unit: '', scalable: true }], steps: [''], utensils: [], diet_tags: [], allergens: [], taste_profile: [], suitable_for: [], avoid_for: [], nutrition: { calories: '', protein_g: '', carbs_g: '', fat_g: '', fiber_g: '', sodium_mg: '', sugar_g: '' }, price_estimate: { min: '', max: '', currency: 'VND' } }); mediaFiles.forEach(f => f.preview && URL.revokeObjectURL(f.preview)); if (cookingVideo && cookingVideo.preview) URL.revokeObjectURL(cookingVideo.preview); setMediaFiles([]); setCookingVideo(null); }} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
