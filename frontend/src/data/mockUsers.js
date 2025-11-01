export const mockUsers = [
  {
    _id: "672f101a1234567890abcd01",
    name: "Nguyễn Văn A",
    email: "vana@example.com",
    password: "hashed_password",
    activity_level: "moderate",
    dietary_goals: "maintain",
    budget: "medium",
    allergies: ["tôm", "cua"],
    family_size: 3,
    region: "North",
    created_at: "2025-10-01T08:00:00Z",
  },
  {
    _id: "672f101a1234567890abcd02",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    password: "hashed_password",
    activity_level: "active",
    dietary_goals: "lose",
    budget: "low",
    allergies: [],
    family_size: 1,
    region: "South",
    created_at: "2025-10-05T09:00:00Z",
  },
  {
    _id: "672f101a1234567890abcd03",
    name: "Lê Minh C",
    email: "minhc@example.com",
    password: "hashed_password",
    activity_level: "sedentary",
    dietary_goals: "gain",
    budget: "high",
    allergies: ["sữa"],
    family_size: 4,
    region: "Central",
    created_at: "2025-10-10T07:30:00Z",
  },
];

// 🔹 Giả lập hàm POST API
export const mockPostUserPreferences = async (preferences) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        _id: `mock_${Date.now()}`,
        name: "Mock User",
        email: "mock@example.com",
        password: "hashed_password",
        activity_level: preferences.activityLevel,
        dietary_goals: preferences.dietaryGoal,
        budget: preferences.budget,
        allergies: preferences.allergies,
        family_size: preferences.familySize,
        region: preferences.region,
        created_at: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      resolve({
        success: true,
        message: "Mock user preferences saved successfully",
        data: newUser,
      });
    }, 1000); // giả lập độ trễ 1s như gọi API thật
  });
};
