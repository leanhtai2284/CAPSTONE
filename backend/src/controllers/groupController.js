import crypto from "crypto";
import Group from "../models/Group.js";
import GroupInvite from "../models/GroupInvite.js";
import GroupMenu from "../models/GroupMenu.js";
import User from "../models/User.js";

const isOwner = (group, userId) =>
  group.owner?.toString() === userId.toString() ||
  group.createdBy?.toString() === userId.toString();

const getMemberUserId = (member) => {
  if (!member?.user) return null;
  return member.user._id ? member.user._id.toString() : member.user.toString();
};

const getMemberRole = (group, userId) => {
  const member = group.members.find(
    (m) => getMemberUserId(m) === userId.toString(),
  );
  return member?.role;
};

const canManageMembers = (group, userId) => {
  if (isOwner(group, userId)) return true;
  const role = getMemberRole(group, userId);
  return role === "admin";
};

const hasPendingInvite = async (groupId, email) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail) return false;
  const invite = await GroupInvite.findOne({
    group: groupId,
    email: normalizedEmail,
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).select("_id");
  return Boolean(invite);
};

export const getAllGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: groups });
  } catch (error) {
    console.error("Error getAllGroups:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const userId = req.user._id;
    const isMember =
      isOwner(group, userId) ||
      group.members.some((m) => getMemberUserId(m) === userId.toString());

    if (group.privacy === "private" && !isMember) {
      const invited = await hasPendingInvite(group._id, req.user.email);
      if (!invited) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    res.json({ success: true, data: group });
  } catch (error) {
    console.error("Error getGroupById:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, description, goal, privacy } = req.body;

    if (!name || String(name).trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Group name must be at least 3 characters",
      });
    }

    const group = await Group.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : "",
      goal,
      privacy,
      owner: req.user._id,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    await group.populate("owner", "name email avatar");

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    console.error("Error createGroup:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { name, description, goal, privacy } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isOwner(group, req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Only owner can update group" });
    }

    if (name !== undefined) group.name = String(name).trim();
    if (description !== undefined)
      group.description = String(description).trim();
    if (goal !== undefined) group.goal = goal;
    if (privacy !== undefined) group.privacy = privacy;

    await group.save();

    const populated = await Group.findById(group._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json({ success: true, data: populated });
  } catch (error) {
    console.error("Error updateGroup:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isOwner(group, req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Only owner can delete group" });
    }

    await Group.findByIdAndDelete(req.params.id);
    await GroupInvite.deleteMany({ group: req.params.id });
    await GroupMenu.deleteMany({ group: req.params.id });

    res.json({ success: true, message: "Group deleted" });
  } catch (error) {
    console.error("Error deleteGroup:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "members.user",
      "name email avatar status",
    );

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const userId = req.user._id;
    const isMember =
      isOwner(group, userId) ||
      group.members.some((m) => getMemberUserId(m) === userId.toString());

    if (!isMember) {
      const invited = await hasPendingInvite(group._id, req.user.email);
      if (!invited) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    const members = group.members
      .filter((m) => m.user)
      .map((m) => ({
        _id: m.user._id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
        joinedAt: m.joinedAt,
      }));

    res.json({ success: true, data: members });
  } catch (error) {
    console.error("Error getGroupMembers:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!canManageMembers(group, req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findById(userId).select("name email avatar");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const exists = group.members.some(
      (m) => getMemberUserId(m) === userId.toString(),
    );
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already a member" });
    }

    group.members.push({
      user: userId,
      role: "member",
      joinedAt: new Date(),
    });

    await group.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: "member",
        joinedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error addMember:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const requesterId = req.user._id.toString();
    const targetId = String(userId);

    if (!canManageMembers(group, requesterId) && requesterId !== targetId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (group.owner?.toString() === targetId) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot remove owner" });
    }

    group.members = group.members.filter(
      (m) => getMemberUserId(m) !== targetId,
    );

    await group.save();

    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("Error removeMember:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isOwner(group, req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Only owner can update roles" });
    }

    if (!role || !["admin", "member"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const member = group.members.find(
      (m) => getMemberUserId(m) === userId.toString(),
    );

    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    if (member.role === "owner") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot change owner role" });
    }

    member.role = role;
    await group.save();

    res.json({ success: true, data: { userId, role } });
  } catch (error) {
    console.error("Error updateMemberRole:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const sendInvite = async (req, res) => {
  try {
    const { email } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!canManageMembers(group, req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    if (!normalizedEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const alreadyMember = group.members.some(
      (m) => getMemberUserId(m) === user._id.toString(),
    );
    if (alreadyMember) {
      return res
        .status(400)
        .json({ success: false, message: "User already a member" });
    }

    const existingInvite = await GroupInvite.findOne({
      group: group._id,
      email: normalizedEmail,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return res.status(409).json({
        success: false,
        message: "Invite already sent",
      });
    }

    const invite = await GroupInvite.create({
      group: group._id,
      email: normalizedEmail,
      invitedBy: req.user._id,
      token: crypto.randomBytes(16).toString("hex"),
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ success: true, data: invite });
  } catch (error) {
    console.error("Error sendInvite:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getGroupInvites = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!canManageMembers(group, req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const invites = await GroupInvite.find({ group: group._id })
      .populate("invitedBy", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: invites });
  } catch (error) {
    console.error("Error getGroupInvites:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getPendingInvites = async (req, res) => {
  try {
    const invites = await GroupInvite.find({
      email: req.user.email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("group", "name")
      .populate("invitedBy", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: invites });
  } catch (error) {
    console.error("Error getPendingInvites:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const invite = await GroupInvite.findById(req.params.id);

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Invite is not pending" });
    }

    if (invite.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invite expired" });
    }

    if (invite.email !== req.user.email) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const group = await Group.findById(invite.group);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const alreadyMember = group.members.some(
      (m) => getMemberUserId(m) === req.user._id.toString(),
    );

    if (!alreadyMember) {
      group.members.push({
        user: req.user._id,
        role: "member",
        joinedAt: new Date(),
      });
      await group.save();
    }

    invite.status = "accepted";
    invite.acceptedAt = new Date();
    await invite.save();

    res.json({ success: true, data: { groupId: group._id } });
  } catch (error) {
    console.error("Error acceptInvite:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const rejectInvite = async (req, res) => {
  try {
    const invite = await GroupInvite.findById(req.params.id);

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.email !== req.user.email) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    invite.status = "rejected";
    await invite.save();

    res.json({ success: true, message: "Invite rejected" });
  } catch (error) {
    console.error("Error rejectInvite:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
