import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SparklesIcon, LoaderIcon, UserIcon, XIcon } from "lucide-react";
import { toast } from "react-toastify";
import { userService } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";

const DEFAULT_FORM = {
  name: "",
  region: "mien-nam",
  familySize: "4",
  activityLevel: "moderate",
  dietaryGoal: "maintain",
  budget: "medium",
  dietType: "eat-clean",
};

const UserInputForm = ({
  isOpen,
  forceRequired = false,
  isGenerating,
  initialValues,
  onGenerate,
  onClose,
  onProfileSaved,
}) => {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const { setUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...DEFAULT_FORM, ...initialValues });
    }
  }, [isOpen, initialValues]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const mapRegionToBackend = (region) => {
    const mapping = {
      "mien-bac": "Bắc",
      "mien-trung": "Trung",
      "mien-nam": "Nam",
    };
    return mapping[region] || "Nam";
  };

  const mapDietTypeToProfileDiet = (dietType) => {
    const mapping = {
      "eat-clean": "clean",
      keto: "keto",
      vegan: "vegetarian",
      traditional: "normal",
    };
    return mapping[dietType] || "normal";
  };

  const mapRegionToPlannerRegion = (region) => {
    const mapping = {
      "mien-bac": "North",
      "mien-trung": "Central",
      "mien-nam": "South",
    };
    return mapping[region] || "South";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }

    try {
      setIsSaving(true);
      const profilePayload = {
        name: formData.name.trim(),
        preferences: {
          region: mapRegionToBackend(formData.region),
          familySize: parseInt(formData.familySize, 10) || 4,
          activityLevel: formData.activityLevel,
          goal: formData.dietaryGoal,
          budget: formData.budget,
          diet: mapDietTypeToProfileDiet(formData.dietType),
        },
      };

      const response = await userService.updateProfile(profilePayload);
      if (response?.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
      }

      onProfileSaved?.(formData);
      onGenerate({
        dietaryGoal: formData.dietaryGoal,
        activityLevel: formData.activityLevel,
        budget: formData.budget,
        dietType: formData.dietType,
        region: mapRegionToPlannerRegion(formData.region),
      });

      if (!forceRequired) {
        onClose?.();
      }
    } catch (error) {
      toast.error(error.message || "Không thể lưu thông tin người dùng");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900/90 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    Hãy nhập thông tin để AI tạo thực đơn cho riêng bạn
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Thông tin sẽ được lưu để theo dõi và gợi ý thực đơn chính
                    xác hơn.
                  </p>
                </div>
                {!forceRequired && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Đóng"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-3">
                        <UserIcon className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Vùng miền
                      </label>
                      <select
                        value={formData.region}
                        onChange={(e) => handleChange("region", e.target.value)}
                        className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                      >
                        <option value="mien-bac">Miền Bắc</option>
                        <option value="mien-trung">Miền Trung</option>
                        <option value="mien-nam">Miền Nam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Quy mô gia đình
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.familySize}
                        onChange={(e) =>
                          handleChange("familySize", e.target.value)
                        }
                        className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-primary">
                      Thông tin tạo thực đơn
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mục tiêu dinh dưỡng
                      </label>
                      <select
                        value={formData.dietaryGoal}
                        onChange={(e) =>
                          handleChange("dietaryGoal", e.target.value)
                        }
                        className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                      >
                        <option value="maintain">Duy trì cân nặng</option>
                        <option value="lose">Giảm cân</option>
                        <option value="gain">Tăng cân</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mức độ vận động
                      </label>
                      <select
                        value={formData.activityLevel}
                        onChange={(e) =>
                          handleChange("activityLevel", e.target.value)
                        }
                        className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                      >
                        <option value="sedentary">Ít vận động</option>
                        <option value="moderate">Vừa phải</option>
                        <option value="active">Năng động</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ngân sách
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => handleChange("budget", e.target.value)}
                        className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                      >
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Chế độ ăn
                      </label>
                      <select
                        value={formData.dietType}
                        onChange={(e) =>
                          handleChange("dietType", e.target.value)
                        }
                        className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                      >
                        <option value="eat-clean">Eat Clean (Ăn sạch)</option>
                        <option value="keto">Keto (Ít tinh bột)</option>
                        <option value="vegan">Thuần chay</option>
                        <option value="traditional">
                          Ẩm thực Việt truyền thống
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isGenerating || isSaving}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-secondary text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating || isSaving ? (
                    <>
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                      Đang lưu và tạo thực đơn...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Lưu thông tin & Tạo thực đơn
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserInputForm;
