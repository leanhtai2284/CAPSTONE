import React, { useEffect, useState } from "react";
import { BellIcon, Plus, Crown, Users, Inbox, UserPlus } from "lucide-react";
import { useGroup } from "../hooks/useGroup";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import CreateGroupModal from "../components/group/CreateGroupModal";
import GroupList from "../components/group/GroupList";
import InviteUI from "../components/group/InviteUI";

export default function GroupDashboard() {
  const { user } = useAuth();
  const {
    groups,
    pendingInvites,
    loadGroups,
    loadPendingInvites,
    acceptInvite,
    rejectInvite,
    deleteGroup,
    loading,
  } = useGroup();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState(null);
  const [showPendingInvites, setShowPendingInvites] = useState(false);

  useEffect(() => {
    loadGroups();
    loadPendingInvites();
  }, []);

  const handleAcceptInvite = async (inviteId) => {
    try {
      await acceptInvite(inviteId);
      toast.success("✅ Đã chấp nhận lời mời!");
      await loadGroups();
      await loadPendingInvites();
    } catch (error) {
      toast.error("❌ Lỗi khi chấp nhận lời mời");
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await rejectInvite(inviteId);
      toast.success("✅ Đã từ chối lời mời");
      await loadPendingInvites();
    } catch (error) {
      toast.error("❌ Lỗi khi từ chối lời mời");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (
      window.confirm(
        "Bạn chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác."
      )
    ) {
      try {
        await deleteGroup(groupId);
        toast.success("✅ Đã xóa nhóm!");
      } catch (error) {
        toast.error("❌ Lỗi khi xóa nhóm");
      }
    }
  };

  const handleOpenInvite = (group) => {
    setSelectedGroupForInvite(group);
    setShowInviteModal(true);
  };

  const myGroups = groups.filter(
    (g) => g.owner?._id === user?._id || g.createdBy === user?._id
  );
  const memberGroups = groups.filter(
    (g) => g.owner?._id !== user?._id && g.createdBy !== user?._id
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-green-600 dark:text-green-500" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Nhóm Ăn Uống
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý kế hoạch dinh dưỡng cùng bạn bè
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Tạo nhóm mới
            </button>
          </div>
        </div>

        {/* Pending Invites Alert */}
        {pendingInvites.length > 0 && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowPendingInvites(!showPendingInvites)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
                  <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                    {pendingInvites.length} lời mời đang chờ
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Bạn được mời tham gia {pendingInvites.length} nhóm
                  </p>
                </div>
              </div>
              <span className="text-blue-600 dark:text-blue-300">
                {showPendingInvites ? "▼" : "▶"}
              </span>
            </div>

            {/* Pending Invites List */}
            {showPendingInvites && (
              <div className="mt-4 space-y-3 border-t border-blue-200 dark:border-blue-800 pt-4">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {invite.group?.name || "Nhóm không xác định"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mời từ:{" "}
                        <span className="font-medium">
                          {invite.invitedBy?.name || "Không xác định"}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvite(invite._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => handleRejectInvite(invite._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Groups Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nhóm do bạn tạo ({myGroups.length})
            </h2>
          </div>
          {myGroups.length > 0 ? (
            <GroupList
              groups={myGroups}
              userId={user?._id}
              onInvite={handleOpenInvite}
              onDelete={handleDeleteGroup}
              isLoading={loading}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <Inbox className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Bạn chưa tạo nhóm nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tạo nhóm đầu tiên của bạn để bắt đầu quản lý kế hoạch ăn uống
                cùng bạn bè
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block"
              >
                Tạo nhóm ngay
              </button>
            </div>
          )}
        </div>

        {/* Member Groups Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-7 h-7 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nhóm bạn đang tham gia ({memberGroups.length})
            </h2>
          </div>
          {memberGroups.length > 0 ? (
            <GroupList
              groups={memberGroups}
              userId={user?._id}
              onInvite={handleOpenInvite}
              onDelete={handleDeleteGroup}
              isLoading={loading}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Bạn chưa tham gia nhóm nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Chờ lời mời từ bạn bè hoặc tạo một nhóm mới
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Invite Modal */}
      {selectedGroupForInvite && (
        <InviteUI
          groupId={selectedGroupForInvite._id}
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedGroupForInvite(null);
          }}
          groupName={selectedGroupForInvite.name}
        />
      )}
    </div>
  );
}
