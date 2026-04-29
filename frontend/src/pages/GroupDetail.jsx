import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UtensilsCrossed,
  TrendingUp,
  Plus,
  Settings,
  Share2,
  Trash2,
} from "lucide-react";
import { useGroup } from "../hooks/useGroup";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import GroupMembers from "../components/group/GroupMembers";
import GroupMenuVoting from "../components/group/GroupMenuVoting";
import InviteUI from "../components/group/InviteUI";

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
    removeMember,
    deleteGroup,
    loading,
    error,
  } = useGroup();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadGroupDetail(groupId);
    }
  }, [groupId]);

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
        "Bạn chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác."
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
        toast.success("✅ Đã xóa bữa ăn!");
      } catch (error) {
        toast.error("❌ Lỗi khi xóa bữa ăn");
      }
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
          <div className="p-6 -mt-20 relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedGroup.name}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    {goalIcons[selectedGroup.goal]} {goalLabels[selectedGroup.goal]}
                  </span>
                  {isOwner && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded">
                      Chủ sở hữu
                    </span>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Mời thành viên
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Xóa nhóm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {selectedGroup.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedGroup.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Thành viên</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groupMembers.length}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span className="text-xs">Bữa ăn</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groupMenu.length}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Hoạt động</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groupMembers.length * 5}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs">Chia sẻ</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(groupMembers.length * 2.5)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "menu", label: "📋 Thực đơn", icon: UtensilsCrossed },
            { id: "members", label: "👥 Thành viên", icon: Users },
            { id: "nutrition", label: "🥗 Dinh dưỡng", icon: TrendingUp },
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
                {isOwner && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
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

          {activeTab === "nutrition" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Thống kê dinh dưỡng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-lg p-6 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Tổng Calo (Trung bình/ngày)
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    2,500
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {groupMembers.length} thành viên
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Protein (g)
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    125
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
                    275
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
                    70
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
    </div>
  );
}
