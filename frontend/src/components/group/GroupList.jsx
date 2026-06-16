import React from "react";
import GroupCard from "./GroupCard";
import { useNavigate } from "react-router-dom";

export default function GroupList({
  groups,
  onInvite,
  onDelete,
  userId,
  isLoading,
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Bạn chưa có nhóm nào
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tạo một nhóm mới hoặc chờ lời mời từ bạn bè để bắt đầu quản lý kế
          hoạch ăn uống cùng nhau
        </p>
        <button
          onClick={() => navigate("/groups")}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block"
        >
          Khám phá nhóm
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => {
        const isOwner =
          group.owner?._id === userId || group.createdBy === userId;
        return (
          <GroupCard
            key={group._id}
            group={group}
            isOwner={isOwner}
            onInvite={() => onInvite(group)}
            onDelete={() => onDelete(group._id)}
          />
        );
      })}
    </div>
  );
}
