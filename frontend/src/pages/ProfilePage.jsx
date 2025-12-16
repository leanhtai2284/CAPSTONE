import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserIcon, SaveIcon, XIcon, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { userService } from "../services/userService";
import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    region: "mien-nam",
    familySize: "4",
    activityLevel: "moderate",
    goal: "maintain",
    budget: "medium",
    diet: "normal",
    likedFoods: [],
    avoidedFoods: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setUser } = useAuth();

  // Helper function to map region from backend to frontend format
  const mapRegionToFrontend = (region) => {
    const mapping = {
      Bắc: "mien-bac",
      Trung: "mien-trung",
      Nam: "mien-nam",
    };
    return mapping[region] || "mien-nam";
  };

  // Helper function to map region from frontend to backend format
  const mapRegionToBackend = (region) => {
    const mapping = {
      "mien-bac": "Bắc",
      "mien-trung": "Trung",
      "mien-nam": "Nam",
    };
    return mapping[region] || "Nam";
  };

  // ✅ Lấy thông tin profile từ API khi load trang
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getProfile();

        if (response.success && response.data) {
          const userData = response.data;
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            region: userData.preferences?.region
              ? mapRegionToFrontend(userData.preferences.region)
              : "mien-nam",
            familySize: userData.preferences?.familySize?.toString() || "4",
            activityLevel: userData.preferences?.activityLevel || "moderate",
            goal: userData.preferences?.goal || "maintain",
            budget: userData.preferences?.budget || "medium",
            diet: userData.preferences?.diet || "normal",
            likedFoods: userData.preferences?.likedFoods || [],
            avoidedFoods: userData.preferences?.avoidedFoods || [],
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin hồ sơ:", error);
        toast.error(error.message || "Không thể tải thông tin hồ sơ", {
          position: "top-right",
          autoClose: 3000,
        });

        // Fallback: Lấy từ localStorage nếu API thất bại
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setProfile((prev) => ({
            ...prev,
            name: storedUser.name || "",
            email: storedUser.email || "",
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ✅ Hàm lưu hồ sơ
  const handleSave = async () => {
    try {
      setSaving(true);

      // Chuẩn bị dữ liệu để gửi lên API
      const profileData = {
        name: profile.name,
        preferences: {
          region: mapRegionToBackend(profile.region),
          familySize: parseInt(profile.familySize) || 4,
          activityLevel: profile.activityLevel,
          goal: profile.goal,
          budget: profile.budget,
          diet: profile.diet,
          likedFoods: profile.likedFoods,
          avoidedFoods: profile.avoidedFoods,
        },
      };

      const response = await userService.updateProfile(profileData);

      if (response.success) {
        toast.success(response.message || "Đã lưu thay đổi hồ sơ thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          theme: "colored",
        });

        // Cập nhật localStorage và AuthContext để các trang (ví dụ Home) có thể thấy chế độ ăn mới ngay lập tức
        if (response.data) {
          // response.data là object user được backend trả về
          try {
            localStorage.setItem("user", JSON.stringify(response.data));
            // update context
            setUser(response.data);
          } catch (err) {
            console.warn(
              "Không thể cập nhật local user sau khi lưu hồ sơ:",
              err
            );
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      toast.error(error.message || "Không thể lưu thay đổi hồ sơ", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeTag = (type, item) => {
    if (type === "liked") {
      setProfile({
        ...profile,
        likedFoods: profile.likedFoods.filter((f) => f !== item),
      });
    } else {
      setProfile({
        ...profile,
        avoidedFoods: profile.avoidedFoods.filter((f) => f !== item),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-0 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-500" />
          <p className="text-slate-600 dark:text-slate-400">
            Đang tải thông tin hồ sơ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-0 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="dark:bg-slate-900/80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                <p className="text-slate-500">{profile.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium  mb-2">
                    Vùng miền
                  </label>
                  <select
                    value={profile.region}
                    onChange={(e) =>
                      setProfile({ ...profile, region: e.target.value })
                    }
                    className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2  focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="mien-bac">Miền Bắc</option>
                    <option value="mien-trung">Miền Trung</option>
                    <option value="mien-nam">Miền Nam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium  mb-2">
                    Quy mô gia đình
                  </label>
                  <input
                    type="number"
                    value={profile.familySize}
                    onChange={(e) =>
                      setProfile({ ...profile, familySize: e.target.value })
                    }
                    className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2  focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Goals & Preferences */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4">
                Mục tiêu dinh dưỡng
              </h3>

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Mức độ vận động
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3  gap-3">
                  {[
                    { value: "low", label: "Ít vận động" },
                    { value: "moderate", label: "Vừa phải" },
                    { value: "high", label: "Nhiều" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setProfile({ ...profile, activityLevel: option.value })
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        profile.activityLevel === option.value
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                          : "bg-gray-100 dark:bg-slate-950 text-black dark:text-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mục tiêu
                </label>
                <select
                  value={profile.goal}
                  onChange={(e) =>
                    setProfile({ ...profile, goal: e.target.value })
                  }
                  className="w-full bg-gray-100 dark:bg-slate-950 text-black dark:text-white border border-slate-700 rounded-lg px-4 py-3  focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="lose">Giảm cân</option>
                  <option value="maintain">Duy trì</option>
                  <option value="gain">Tăng cân</option>
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Ngân sách
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: "low", label: "Tiết kiệm" },
                    { value: "medium", label: "Trung bình" },
                    { value: "high", label: "Cao" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setProfile({ ...profile, budget: option.value })
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        profile.budget === option.value
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                          : "bg-gray-100 dark:bg-slate-950 text-black dark:text-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet Type */}
              <div>
                <label className="block text-sm font-medium  mb-2">
                  Chế độ ăn
                </label>
                <select
                  value={profile.diet}
                  onChange={(e) =>
                    setProfile({ ...profile, diet: e.target.value })
                  }
                  className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="normal">Bình thường</option>
                  <option value="clean">Eat Clean</option>
                  <option value="keto">Keto</option>
                  <option value="vegetarian">Ăn chay</option>
                </select>
              </div>

              {/* Liked Foods */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thực phẩm yêu thích
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.likedFoods.map((food) => (
                    <span
                      key={food}
                      className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm"
                    >
                      <span>{food}</span>
                      <button onClick={() => removeTag("liked", food)}>
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Thêm thực phẩm..."
                  className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      setProfile({
                        ...profile,
                        likedFoods: [
                          ...profile.likedFoods,
                          e.currentTarget.value,
                        ],
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>

              {/* Avoided Foods */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thực phẩm cần tránh
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.avoidedFoods.map((food) => (
                    <span
                      key={food}
                      className="inline-flex items-center space-x-2 bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-sm"
                    >
                      <span>{food}</span>
                      <button onClick={() => removeTag("avoided", food)}>
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Thêm thực phẩm..."
                  className="w-full bg-gray-100 dark:bg-slate-950 border border-slate-700 rounded-lg px-4 py-2  focus:outline-none focus:border-green-500 transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      setProfile({
                        ...profile,
                        avoidedFoods: [
                          ...profile.avoidedFoods,
                          e.currentTarget.value,
                        ],
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ✅ Floating Save Button (không đổi giao diện) */}
        <motion.button
          className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: saving ? 1 : 1.1 }}
          whileTap={{ scale: saving ? 1 : 0.9 }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-semibold">Đang lưu...</span>
            </>
          ) : (
            <>
              <SaveIcon className="w-6 h-6" />
              <span className="font-semibold">Lưu thay đổi</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ProfilePage;
