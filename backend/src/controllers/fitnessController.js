import User from "../models/User.js";
import { calcTDEE, getFallbackCalorieTarget } from "../utils/tdee.js";

/**
 * PUT /api/users/fitness-profile
 * Cập nhật thông tin thể chất của user (chiều cao, cân nặng, tuổi, giới tính)
 * Auth: Bắt buộc JWT
 */
export async function updateFitnessProfile(req, res) {
  try {
    const userId = req.user._id;
    const { height_cm, weight_kg, age, gender } = req.body;

    // Validate dữ liệu đầu vào
    const errors = [];
    if (height_cm !== undefined && (height_cm < 50 || height_cm > 300)) {
      errors.push("Chiều cao phải từ 50 đến 300 cm");
    }
    if (weight_kg !== undefined && (weight_kg < 1 || weight_kg > 500)) {
      errors.push("Cân nặng phải từ 1 đến 500 kg");
    }
    if (age !== undefined && (age < 1 || age > 120)) {
      errors.push("Tuổi phải từ 1 đến 120");
    }
    if (gender !== undefined && !["male", "female"].includes(gender)) {
      errors.push('Giới tính phải là "male" hoặc "female"');
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Chỉ cập nhật các field được truyền vào
    const updateFields = {};
    if (height_cm !== undefined) updateFields["fitnessProfile.height_cm"] = height_cm;
    if (weight_kg !== undefined) updateFields["fitnessProfile.weight_kg"] = weight_kg;
    if (age !== undefined)       updateFields["fitnessProfile.age"] = age;
    if (gender !== undefined)    updateFields["fitnessProfile.gender"] = gender;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, select: "fitnessProfile preferences.goal preferences.activityLevel" }
    ).lean();

    // Tính và trả về TDEE ngay sau khi cập nhật
    const tdee = calcTDEE(
      user.fitnessProfile,
      user.preferences?.activityLevel,
      user.preferences?.goal
    );

    return res.json({
      success: true,
      message: "Đã cập nhật thông tin thể chất",
      data: {
        fitnessProfile: user.fitnessProfile,
        tdee: tdee ?? {
          note: "Chưa đủ thông tin để tính TDEE (cần: chiều cao, cân nặng, tuổi, giới tính)",
        },
      },
    });
  } catch (err) {
    console.error("[updateFitnessProfile]", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

/**
 * GET /api/users/tdee
 * Lấy chỉ số TDEE, BMR và mục tiêu macro của user
 * Auth: Bắt buộc JWT
 */
export async function getTDEE(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("fitnessProfile preferences.goal preferences.activityLevel")
      .lean();

    const tdee = calcTDEE(
      user.fitnessProfile,
      user.preferences?.activityLevel,
      user.preferences?.goal
    );

    if (!tdee) {
      // Chưa đủ thông tin → trả về fallback
      const fallbackTarget = getFallbackCalorieTarget(user.preferences?.goal);
      return res.json({
        success: true,
        is_estimated: true,
        message: "Chưa đủ thông tin thể chất. Vui lòng cập nhật hồ sơ thể chất để có kết quả chính xác.",
        data: {
          daily_calorie_target: fallbackTarget,
          missing_fields: getMissingFields(user.fitnessProfile),
        },
      });
    }

    return res.json({
      success: true,
      is_estimated: false,
      data: tdee,
    });
  } catch (err) {
    console.error("[getTDEE]", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

// Helper: Liệt kê field còn thiếu
function getMissingFields(fitnessProfile) {
  const missing = [];
  if (!fitnessProfile?.height_cm) missing.push("height_cm (chiều cao)");
  if (!fitnessProfile?.weight_kg) missing.push("weight_kg (cân nặng)");
  if (!fitnessProfile?.age)       missing.push("age (tuổi)");
  if (!fitnessProfile?.gender)    missing.push("gender (giới tính: male/female)");
  return missing;
}
