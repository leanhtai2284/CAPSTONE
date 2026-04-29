import React from "react";
import { Users, Goal, Lock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GroupCard({ group, onInvite, onDelete, isOwner }) {
  const navigate = useNavigate();

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Card Header */}
      <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>

      {/* Card Content */}
      <div className="p-5">
        {/* Title & Badge */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => navigate(`/groups/${group._id}`)}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400">
              {group.name}
            </h3>
          </div>
          {isOwner && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded">
              Chủ sở hữu
            </span>
          )}
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Users className="w-4 h-4 text-blue-500" />
            <span>{group.members?.length || 0} thành viên</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="text-lg">{goalIcons[group.goal]}</span>
            <span>{goalLabels[group.goal]}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            {group.privacy === "private" ? (
              <>
                <Lock className="w-4 h-4 text-yellow-500" />
                <span>Riêng tư</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Công khai</span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        {group.stats && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bữa ăn
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {group.stats.totalMeals || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hoạt động
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {group.stats.totalActivity || 0}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/groups/${group._id}`)}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition"
          >
            Xem chi tiết
          </button>
          {isOwner ? (
            <>
              <button
                onClick={onInvite}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
              >
                Mời
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition"
                title="Xóa nhóm"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              disabled
              className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              Thành viên
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
