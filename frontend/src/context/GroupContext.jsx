import React, { createContext, useContext, useState, useEffect } from "react";
import { groupService } from "../services/groupService";

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupMenu, setGroupMenu] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============= LOAD INITIAL DATA =============
  useEffect(() => {
    loadGroups();
    loadPendingInvites();
  }, []);

  // ============= GROUPS =============
  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupService.getAllGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error("❌ Lỗi tải groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetail = async (groupId) => {
    try {
      setLoading(true);
      setError(null);
      const [groupData, members, menu] = await Promise.all([
        groupService.getGroupById(groupId),
        groupService.getGroupMembers(groupId),
        groupService.getGroupMenu(groupId),
      ]);
      setSelectedGroup(groupData);
      setGroupMembers(Array.isArray(members) ? members : []);
      setGroupMenu(Array.isArray(menu) ? menu : []);
    } catch (err) {
      setError(err.message);
      console.error("❌ Lỗi tải chi tiết group:", err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      setLoading(true);
      setError(null);
      const newGroup = await groupService.createGroup(groupData);
      setGroups([...groups, newGroup]);
      return newGroup;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (groupId, groupData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await groupService.updateGroup(groupId, groupData);
      setGroups(groups.map((g) => (g._id === groupId ? updated : g)));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(updated);
      }
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      setLoading(true);
      setError(null);
      await groupService.deleteGroup(groupId);
      setGroups(groups.filter((g) => g._id !== groupId));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============= MEMBERS =============
  const addMember = async (groupId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const newMember = await groupService.addMember(groupId, userId);
      setGroupMembers([...groupMembers, newMember]);
      return newMember;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (groupId, userId) => {
    try {
      setLoading(true);
      setError(null);
      await groupService.removeMember(groupId, userId);
      setGroupMembers(groupMembers.filter((m) => m._id !== userId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============= INVITES =============
  const loadPendingInvites = async () => {
    try {
      const data = await groupService.getPendingInvites();
      setPendingInvites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi tải lời mời đang chờ:", err);
    }
  };

  const sendInvite = async (groupId, email) => {
    try {
      setLoading(true);
      setError(null);
      const invite = await groupService.sendInvite(groupId, email);
      return invite;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (inviteId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await groupService.acceptInvite(inviteId);
      setPendingInvites(pendingInvites.filter((i) => i._id !== inviteId));
      await loadGroups(); // Reload groups
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectInvite = async (inviteId) => {
    try {
      setLoading(true);
      setError(null);
      await groupService.rejectInvite(inviteId);
      setPendingInvites(pendingInvites.filter((i) => i._id !== inviteId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============= COLLABORATIVE MENU =============
  const addMealToMenu = async (groupId, mealId, mealData) => {
    try {
      setLoading(true);
      setError(null);
      const meal = await groupService.addMealToGroupMenu(
        groupId,
        mealId,
        mealData
      );
      setGroupMenu([...groupMenu, meal]);
      return meal;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMealFromMenu = async (groupId, mealId) => {
    try {
      setLoading(true);
      setError(null);
      await groupService.removeMealFromGroupMenu(groupId, mealId);
      setGroupMenu(groupMenu.filter((m) => m._id !== mealId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const voteMeal = async (groupId, mealId, vote) => {
    try {
      const result = await groupService.voteMeal(groupId, mealId, vote);
      // Update local menu with new vote count
      setGroupMenu(
        groupMenu.map((m) =>
          m._id === mealId ? { ...m, votes: result.votes } : m
        )
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    // State
    groups,
    selectedGroup,
    groupMembers,
    groupMenu,
    pendingInvites,
    loading,
    error,

    // Methods
    loadGroups,
    loadGroupDetail,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    loadPendingInvites,
    sendInvite,
    acceptInvite,
    rejectInvite,
    addMealToMenu,
    removeMealFromMenu,
    voteMeal,
  };

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup must be used within GroupProvider");
  }
  return context;
};
