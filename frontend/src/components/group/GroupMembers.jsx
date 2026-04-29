import React from "react";
import { User, Mail, Shield, Trash2, Edit } from "lucide-react";

export default function GroupMembers({
  members,
  isOwner,
  onRemoveMember,
  onChangeRole,
  loading,
}) {
  if (!members || members.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
        <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">Không có thành viên</p>
      </div>
    );
  }

  const roleLabels = {
    owner: "Chủ sở hữu",
    admin: "Quản trị viên",
    member: "Thành viên",
  };

  const roleColors = {
    owner: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
    admin: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    member: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
  };

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member._id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
        >
          {/* Member Info */}
          <div className="flex items-center gap-3 flex-1">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {member.name?.charAt(0) || "?"}
                </span>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {member.name}
              </h4>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Mail className="w-3 h-3" />
                {member.email}
              </div>
            </div>
          </div>

          {/* Role & Actions */}
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                roleColors[member.role] || roleColors.member
              }`}
            >
              <Shield className="w-3 h-3" />
              {roleLabels[member.role] || member.role}
            </span>

            {isOwner && member.role !== "owner" && (
              <>
                <button
                  onClick={() => onChangeRole?.(member._id, member.role)}
                  disabled={loading}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition disabled:opacity-50"
                  title="Đổi vai trò"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveMember?.(member._id)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                  title="Xóa thành viên"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
