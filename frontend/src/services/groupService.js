// src/services/groupService.js
import axiosInstance from "./axiosInstance";

export const groupService = {
  // ============= GROUP CRUD =============
  async getAllGroups() {
    try {
      const { data } = await axiosInstance.get("/groups");
      return data.data || data.items || data;
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách nhóm:", error);
      throw error;
    }
  },

  async getGroupById(groupId) {
    try {
      const { data } = await axiosInstance.get(`/groups/${groupId}`);
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi tải chi tiết nhóm:", error);
      throw error;
    }
  },

  async createGroup(groupData) {
    try {
      const { data } = await axiosInstance.post("/groups", groupData);
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi tạo nhóm:", error);
      throw error;
    }
  },

  async updateGroup(groupId, groupData) {
    try {
      const { data } = await axiosInstance.put(`/groups/${groupId}`, groupData);
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật nhóm:", error);
      throw error;
    }
  },

  async deleteGroup(groupId) {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      return true;
    } catch (error) {
      console.error("❌ Lỗi khi xóa nhóm:", error);
      throw error;
    }
  },

  // ============= MEMBERS MANAGEMENT =============
  async getGroupMembers(groupId) {
    try {
      const { data } = await axiosInstance.get(`/groups/${groupId}/members`);
      return data.data || data.members || data;
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách thành viên:", error);
      throw error;
    }
  },

  async addMember(groupId, userId) {
    try {
      const { data } = await axiosInstance.post(
        `/groups/${groupId}/members`,
        { userId }
      );
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi thêm thành viên vào nhóm:", error);
      throw error;
    }
  },

  async removeMember(groupId, userId) {
    try {
      await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      return true;
    } catch (error) {
      console.error("❌ Lỗi khi xóa thành viên khỏi nhóm:", error);
      throw error;
    }
  },

  async updateMemberRole(groupId, userId, role) {
    try {
      const { data } = await axiosInstance.put(
        `/groups/${groupId}/members/${userId}`,
        { role }
      );
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật vai trò thành viên:", error);
      throw error;
    }
  },

  // ============= INVITES =============
  async sendInvite(groupId, email) {
    try {
      const { data } = await axiosInstance.post(`/groups/${groupId}/invites`, {
        email,
      });
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi gửi lời mời:", error);
      throw error;
    }
  },

  async getGroupInvites(groupId) {
    try {
      const { data } = await axiosInstance.get(`/groups/${groupId}/invites`);
      return data.data || data.invites || data;
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách lời mời:", error);
      throw error;
    }
  },

  async acceptInvite(inviteId) {
    try {
      const { data } = await axiosInstance.post(`/invites/${inviteId}/accept`);
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi chấp nhận lời mời:", error);
      throw error;
    }
  },

  async rejectInvite(inviteId) {
    try {
      await axiosInstance.post(`/invites/${inviteId}/reject`);
      return true;
    } catch (error) {
      console.error("❌ Lỗi khi từ chối lời mời:", error);
      throw error;
    }
  },

  async getPendingInvites() {
    try {
      const { data } = await axiosInstance.get("/invites/pending");
      return data.data || data.invites || data;
    } catch (error) {
      console.error("❌ Lỗi khi tải lời mời đang chờ:", error);
      throw error;
    }
  },

  // ============= COLLABORATIVE MENU =============
  async getGroupMenu(groupId) {
    try {
      const { data } = await axiosInstance.get(`/groups/${groupId}/menu`);
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi tải menu nhóm:", error);
      throw error;
    }
  },

  async addMealToGroupMenu(groupId, mealId, mealData) {
    try {
      const { data } = await axiosInstance.post(
        `/groups/${groupId}/menu/meals`,
        { mealId, ...mealData }
      );
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi thêm món ăn vào menu nhóm:", error);
      throw error;
    }
  },

  async removeMealFromGroupMenu(groupId, mealId) {
    try {
      await axiosInstance.delete(`/groups/${groupId}/menu/meals/${mealId}`);
      return true;
    } catch (error) {
      console.error("❌ Lỗi khi xóa món ăn khỏi menu nhóm:", error);
      throw error;
    }
  },

  async voteMeal(groupId, mealId, vote) {
    try {
      const { data } = await axiosInstance.post(
        `/groups/${groupId}/menu/meals/${mealId}/vote`,
        { vote }
      );
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi bình chọn món ăn:", error);
      throw error;
    }
  },

  // ============= GROUP STATS =============
  async getGroupStats(groupId) {
    try {
      const { data } = await axiosInstance.get(`/groups/${groupId}/stats`);
      return data.data || data;
    } catch (error) {
      console.error("❌ Lỗi khi tải thống kê nhóm:", error);
      throw error;
    }
  },

  async getGroupNutrition(groupId) {
    try {
      const { data } = await axiosInstance.get(
        `/groups/${groupId}/nutrition`
      );
      return data.data || data.nutrition || data;
    } catch (error) {
      console.error("❌ Lỗi khi tải thông tin dinh dưỡng nhóm:", error);
      throw error;
    }
  },
};
