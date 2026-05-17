import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UtensilsCrossed,
  TrendingUp,
  Plus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useGroup } from "../hooks/useGroup";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import GroupMembers from "../components/group/GroupMembers";
import GroupMenuVoting from "../components/group/GroupMenuVoting";
import InviteUI from "../components/group/InviteUI";
import AddMealModal from "../components/group/AddMealModal";
import { groupService } from "../services/groupService";

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedGroup,
    groupMembers,
    groupMenu,
    loadGroupDetail,
    removeMealFromMenu,
    addMealToMenu,
    removeMember,
    deleteGroup,
    loading,
    error,
  } = useGroup();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [isOwner, setIsOwner] = useState(false);

  const [checkedIngredients, setCheckedIngredients] = useState(() => {
    const saved = localStorage.getItem(`group_shopping_${groupId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const toggleIngredientCheck = (key) => {
    setCheckedIngredients((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`group_shopping_${groupId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const getSharedShoppingList = () => {
    const list = {};
    const meals = groupMenu || [];

    meals.forEach((meal) => {
      const ingredients = meal.ingredients || [];
      ingredients.forEach((ing) => {
        if (!ing.name) return;
        const name = ing.name.trim();
        const unit = (ing.unit || "").trim();
        const key = `${name.toLowerCase()}_${unit.toLowerCase()}`;

        if (list[key]) {
          list[key].amount += Number(ing.amount) || 0;
        } else {
          list[key] = {
            name,
            amount: Number(ing.amount) || 0,
            unit,
          };
        }
      });
    });

    return Object.values(list);
  };

  const shoppingList = getSharedShoppingList();
  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter(item => {
    const key = `${item.name.toLowerCase()}_${item.unit.toLowerCase()}`;
    return checkedIngredients[key];
  }).length;
  const completionPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [groupStats, setGroupStats] = useState({
    members: 0,
    meals: 0,
    totalVotes: 0,
  });
  const [groupNutrition, setGroupNutrition] = useState({
    total: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    average: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  });

  const fetchGroupStatsAndNutrition = async (currentGroupId) => {
    if (!currentGroupId) return;
    setStatsLoading(true);
    setStatsError("");

    try {
      const [stats, nutrition] = await Promise.all([
        groupService.getGroupStats(currentGroupId),
        groupService.getGroupNutrition(currentGroupId),
      ]);
      setGroupStats({
        members: stats?.members ?? 0,
        meals: stats?.meals ?? 0,
        totalVotes: stats?.totalVotes ?? 0,
      });
      setGroupNutrition({
        total: {
          calories: nutrition?.total?.calories ?? 0,
          protein: nutrition?.total?.protein ?? 0,
          carbs: nutrition?.total?.carbs ?? 0,
          fat: nutrition?.total?.fat ?? 0,
        },
        average: {
          calories: nutrition?.average?.calories ?? 0,
          protein: nutrition?.average?.protein ?? 0,
          carbs: nutrition?.average?.carbs ?? 0,
          fat: nutrition?.average?.fat ?? 0,
        },
      });
    } catch (err) {
      setStatsError(err?.message || "Không thể tải thống kê nhóm");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      loadGroupDetail(groupId);
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupStatsAndNutrition(groupId);
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    if (activeTab !== "menu" && activeTab !== "nutrition") return;

    const intervalId = setInterval(async () => {
      await loadGroupDetail(groupId, { silent: true });
      await fetchGroupStatsAndNutrition(groupId);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [groupId, activeTab]);

  useEffect(() => {
    if (selectedGroup && user) {
      const isGroupOwner =
        selectedGroup.owner?._id === user._id ||
        selectedGroup.createdBy === user._id;
      setIsOwner(isGroupOwner);
    }
  }, [selectedGroup, user]);

  const handleDeleteGroup = async () => {
    if (
      window.confirm(
        "Bạn chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.",
      )
    ) {
      try {
        await deleteGroup(groupId);
        toast.success("✅ Đã xóa nhóm!");
        navigate("/groups");
      } catch (error) {
        toast.error("❌ Lỗi khi xóa nhóm");
      }
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Bạn chắc chắn muốn xóa thành viên này?")) {
      try {
        await removeMember(groupId, memberId);
        toast.success("✅ Đã xóa thành viên!");
      } catch (error) {
        toast.error("❌ Lỗi khi xóa thành viên");
      }
    }
  };

  const handleRemoveMeal = async (mealId) => {
    if (window.confirm("Bạn chắc chắn muốn xóa bữa ăn này khỏi menu?")) {
      try {
        await removeMealFromMenu(groupId, mealId);

        // Reload group detail to refresh menu
        await loadGroupDetail(groupId);

        await fetchGroupStatsAndNutrition(groupId);

        toast.success("✅ Đã xóa bữa ăn!");
      } catch (error) {
        toast.error("❌ Lỗi khi xóa bữa ăn");
      }
    }
  };

  const handleAddMeal = async (passedGroupId, mealId, mealData) => {
    try {
      await addMealToMenu(passedGroupId, mealId, mealData);

      // Reload group detail to refresh menu
      await loadGroupDetail(groupId);

      await fetchGroupStatsAndNutrition(groupId);

      toast.success("✅ Đã thêm công thức vào menu!");
    } catch (error) {
      console.error("❌ Error adding meal:", error);
      toast.error(
        "❌ Lỗi khi thêm công thức: " + (error.message || "Vui lòng thử lại"),
      );
    }
  };

  if (error && !selectedGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/groups")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <p className="text-red-800 dark:text-red-300">
              ❌ Không thể tải nhóm: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !selectedGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const goalIcons = {
    healthy: "🥗",
    fitness: "💪",
    weight_loss: "⚖️",
    muscle_gain: "🏋️",
    balanced: "⚖️",
  };

  const goalLabels = {
    healthy: "Ăn lành mạnh",
    fitness: "Fitness",
    weight_loss: "Giảm cân",
    muscle_gain: "Tăng cơ bắp",
    balanced: "Cân bằng",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/groups")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        {/* Group Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Gradient Header */}
          <div className="h-32 bg-gradient-to-r from-green-500 to-blue-500"></div>

          {/* Content */}
          <div className="p-6 relative">
            {/* Group Avatar & Info Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-24 mb-6 relative z-10">
              {/* Styled Circular Avatar with Gradient Background */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center text-white text-4xl font-extrabold transform hover:rotate-6 transition-all duration-300">
                {selectedGroup.name ? selectedGroup.name.charAt(0).toUpperCase() : "G"}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight tracking-tight">
                  {selectedGroup.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded-full shadow-sm">
                    <span className="text-base">{goalIcons[selectedGroup.goal]}</span>
                    {goalLabels[selectedGroup.goal]}
                  </span>
                  {isOwner && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                      Chủ sở hữu
                    </span>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-2 self-start md:self-end mt-4 md:mt-0">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Mời thành viên
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                    title="Xóa nhóm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {selectedGroup.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm leading-relaxed">
                {selectedGroup.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Thành viên</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groupStats.members}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span className="text-xs">Bữa ăn</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groupStats.meals}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Bình chọn</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groupStats.totalVotes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "menu", label: "📋 Thực đơn dã ngoại", icon: UtensilsCrossed },
            { id: "shopping-list", label: "🛒 Đi chợ chung", icon: ShoppingCart },
            { id: "members", label: "👥 Thành viên", icon: Users },
            { id: "nutrition", label: "🥗 Chỉ số TB", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                activeTab === tab.id
                  ? "text-green-600 dark:text-green-400 border-green-600 dark:border-green-400"
                  : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {activeTab === "menu" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Menu Hợp Tác
                </h2>
                {(() => {
                  // Try multiple ways to match user ID
                  const isMember1 = groupMembers.some(
                    (m) => m.user?._id === user?._id,
                  );
                  const isMember2 = groupMembers.some(
                    (m) => m.user?.toString() === user?._id,
                  );
                  const isMember3 = groupMembers.some(
                    (m) => m._id === user?._id,
                  );
                  const isMember4 = groupMembers.some(
                    (m) => m?.toString() === user?._id,
                  );

                  const isMember =
                    isMember1 || isMember2 || isMember3 || isMember4;
                  return isOwner || isMember;
                })() && (
                  <button
                    onClick={() => setShowAddMealModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm bữa ăn
                  </button>
                )}
              </div>
              <GroupMenuVoting
                groupId={groupId}
                meals={groupMenu}
                onRemove={isOwner ? handleRemoveMeal : null}
              />
            </div>
          )}

          {activeTab === "members" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Thành viên nhóm
              </h2>
              <GroupMembers
                members={groupMembers}
                isOwner={isOwner}
                onRemoveMember={handleRemoveMember}
                loading={loading}
              />
            </div>
          )}

          {activeTab === "shopping-list" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    🛒 Danh sách đi chợ chung cho chuyến đi/sự kiện
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Tự động tổng hợp và gom tất cả nguyên liệu từ thực đơn dã ngoại đã lên lịch.
                  </p>
                </div>
                {totalItems > 0 && (
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tiến độ mua sắm:</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-full transition-all duration-300"
                        style={{ width: `${completionPct}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                      {completedItems}/{totalItems} ({completionPct}%)
                    </span>
                  </div>
                )}
              </div>

              {shoppingList.length === 0 ? (
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">🧺</div>
                  <p className="text-yellow-800 dark:text-yellow-300 font-medium">Danh sách đi chợ đang trống!</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-md mx-auto">
                    Vui lòng sang tab 📋 <strong>Thực đơn dã ngoại</strong>, thêm các món ăn cho chuyến đi dã ngoại/gia đình để hệ thống tự động gom nguyên liệu cần mua.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shoppingList.map((item) => {
                    const key = `${item.name.toLowerCase()}_${item.unit.toLowerCase()}`;
                    const isChecked = !!checkedIngredients[key];

                    return (
                      <div 
                        key={key}
                        onClick={() => toggleIngredientCheck(key)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                          isChecked 
                            ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900/50 opacity-70"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-800 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            isChecked 
                              ? "bg-green-500 border-green-500 text-white" 
                              : "border-gray-300 dark:border-gray-600 bg-transparent"
                          }`}>
                            {isChecked && (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`font-semibold text-gray-800 dark:text-gray-200 ${isChecked ? "line-through text-gray-400 dark:text-gray-500" : ""}`}>
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-base font-bold ${isChecked ? "text-gray-400 dark:text-gray-500" : "text-green-600 dark:text-green-400"}`}>
                            {parseFloat(item.amount.toFixed(2))}
                          </span>
                          <span className={`text-xs ml-1 font-medium ${isChecked ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"}`}>
                            {item.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "nutrition" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Thống kê dinh dưỡng
              </h2>
              {statsError && (
                <div className="mb-4 text-sm text-red-500">{statsError}</div>
              )}
              {statsLoading && (
                <div className="mb-4 text-sm text-gray-500">
                  Đang tải dữ liệu...
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-lg p-6 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Calo (Trung bình/bữa)
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {groupNutrition.average.calories}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {groupStats.meals} bữa ăn
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Protein (g)
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {groupNutrition.average.protein}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Mỗi bữa ăn
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Carbohydrates (g)
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {groupNutrition.average.carbs}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Mỗi bữa ăn
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Fat (g)
                  </p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {groupNutrition.average.fat}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Mỗi bữa ăn
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteUI
        groupId={groupId}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupName={selectedGroup.name}
      />

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        groupId={groupId}
        onAddMeal={handleAddMeal}
      />
    </div>
  );
}
