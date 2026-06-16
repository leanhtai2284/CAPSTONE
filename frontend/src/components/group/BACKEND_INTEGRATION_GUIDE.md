// Backend Integration Guide for Social & Group Feature
// This file shows the expected structure for backend implementation

/**
 * MONGOOSE MODELS REQUIRED
 */

/**
 * Group Model
 */
const GroupSchema = {
  _id: ObjectId,
  name: String,                    // Group name (required, 3+ chars)
  description: String,             // Group description (max 500 chars)
  goal: String,                    // healthy, fitness, weight_loss, muscle_gain, balanced
  privacy: String,                 // private or public
  owner: {
    type: ObjectId,
    ref: "User"
  },
  members: [{
    user: {
      type: ObjectId,
      ref: "User"
    },
    role: String,                  // owner, admin, member
    joinedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
};

/**
 * GroupMember Model (denormalized or separate)
 */
const GroupMemberSchema = {
  _id: ObjectId,
  group: {
    type: ObjectId,
    ref: "Group"
  },
  user: {
    type: ObjectId,
    ref: "User"
  },
  role: String,                    // owner, admin, member
  joinedAt: Date,
  status: String                   // active, inactive
};

/**
 * GroupInvite Model
 */
const GroupInviteSchema = {
  _id: ObjectId,
  group: {
    type: ObjectId,
    ref: "Group"
  },
  email: String,                   // Email of invitee
  invitedBy: {
    type: ObjectId,
    ref: "User"
  },
  token: String,                   // For public invite links
  status: String,                  // pending, accepted, rejected
  createdAt: Date,
  expiresAt: Date,                 // Invite expiry
  acceptedAt: Date
};

/**
 * GroupMenu Model
 */
const GroupMenuSchema = {
  _id: ObjectId,
  group: {
    type: ObjectId,
    ref: "Group"
  },
  meals: [{
    meal: {
      type: ObjectId,
      ref: "Recipe"
    },
    suggestedBy: {
      type: ObjectId,
      ref: "User"
    },
    addedAt: Date,
    votes: Number,                 // Vote count
    votedBy: [{                      // Track who voted
      type: ObjectId,
      ref: "User"
    }]
  }],
  createdAt: Date,
  updatedAt: Date
};

/**
 * GROUP CONTROLLERS REQUIRED
 */

// groups.controller.js

/**
 * GET /api/groups
 * Get all groups for current user
 * Returns: Array of groups (owned and member groups)
 */
exports.getAllGroups = async (req, res) => {
  const userId = req.user._id;
  
  const groups = await Group.find({
    $or: [
      { owner: userId },
      { "members.user": userId }
    ]
  })
  .populate("owner", "name email avatar")
  .populate("members.user", "name email avatar")
  .sort({ createdAt: -1 });

  res.json({ 
    success: true, 
    data: groups 
  });
};

/**
 * GET /api/groups/:id
 * Get specific group by ID
 */
exports.getGroupById = async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  if (!group) {
    return res.status(404).json({ 
      success: false, 
      message: "Group not found" 
    });
  }

  res.json({ success: true, data: group });
};

/**
 * POST /api/groups
 * Create new group
 * Body: { name, description, goal, privacy }
 */
exports.createGroup = async (req, res) => {
  const { name, description, goal, privacy } = req.body;

  if (!name || name.length < 3) {
    return res.status(400).json({ 
      success: false, 
      message: "Group name must be at least 3 characters" 
    });
  }

  const group = await Group.create({
    name,
    description,
    goal,
    privacy,
    owner: req.user._id,
    members: [{
      user: req.user._id,
      role: "owner",
      joinedAt: new Date()
    }]
  });

  await group.populate("owner", "name email avatar");

  res.status(201).json({ 
    success: true, 
    data: group 
  });
};

/**
 * PUT /api/groups/:id
 * Update group
 * Only owner can update
 */
exports.updateGroup = async (req, res) => {
  const { name, description, goal, privacy } = req.body;
  
  let group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({ 
      success: false, 
      message: "Group not found" 
    });
  }

  if (group.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ 
      success: false, 
      message: "Only owner can update group" 
    });
  }

  group = await Group.findByIdAndUpdate(
    req.params.id,
    { name, description, goal, privacy },
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: group });
};

/**
 * DELETE /api/groups/:id
 * Delete group
 * Only owner can delete
 */
exports.deleteGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({ 
      success: false, 
      message: "Group not found" 
    });
  }

  if (group.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ 
      success: false, 
      message: "Only owner can delete group" 
    });
  }

  await Group.findByIdAndDelete(req.params.id);
  
  // Also delete related invites and menu
  await GroupInvite.deleteMany({ group: req.params.id });
  await GroupMenu.deleteMany({ group: req.params.id });

  res.json({ 
    success: true, 
    message: "Group deleted" 
  });
};

/**
 * MEMBERS ENDPOINTS
 */

/**
 * GET /api/groups/:id/members
 * Get all members of a group
 */
exports.getGroupMembers = async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate("members.user", "name email avatar status");

  if (!group) {
    return res.status(404).json({ 
      success: false, 
      message: "Group not found" 
    });
  }

  res.json({ 
    success: true, 
    data: group.members 
  });
};

/**
 * POST /api/groups/:id/members
 * Add member to group
 * Body: { userId }
 */
exports.addMember = async (req, res) => {
  const { userId } = req.body;
  
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({ 
      success: false, 
      message: "Group not found" 
    });
  }

  // Check if already member
  if (group.members.some(m => m.user.toString() === userId)) {
    return res.status(400).json({ 
      success: false, 
      message: "User already a member" 
    });
  }

  group.members.push({
    user: userId,
    role: "member",
    joinedAt: new Date()
  });

  await group.save();

  res.json({ 
    success: true, 
    data: group 
  });
};

/**
 * DELETE /api/groups/:id/members/:userId
 * Remove member from group
 */
exports.removeMember = async (req, res) => {
  const { userId } = req.params;
  
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({ 
      success: false, 
      message: "Group not found" 
    });
  }

  group.members = group.members.filter(
    m => m.user.toString() !== userId
  );

  await group.save();

  res.json({ 
    success: true, 
    message: "Member removed" 
  });
};

/**
 * INVITE ENDPOINTS
 */

/**
 * POST /api/groups/:id/invites
 * Send invite to user email
 * Body: { email }
 */
exports.sendInvite = async (req, res) => {
  const { email } = req.body;
  
  const group = await Group.findById(req.params.id);
  if (!group) {
    return res.status(404).json({ 
      success: false, 
      message: "Group not found" 
    });
  }

  // Check if user with that email exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: "User not found" 
    });
  }

  // Check if already member
  if (group.members.some(m => m.user.toString() === user._id.toString())) {
    return res.status(400).json({ 
      success: false, 
      message: "User already a member" 
    });
  }

  // Create invite
  const invite = await GroupInvite.create({
    group: req.params.id,
    email,
    invitedBy: req.user._id,
    status: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // Send email notification
  // sendInviteEmail(email, group.name, invite.token);

  res.status(201).json({ 
    success: true, 
    data: invite 
  });
};

/**
 * GET /api/invites/pending
 * Get pending invites for current user
 */
exports.getPendingInvites = async (req, res) => {
  const invites = await GroupInvite.find({
    email: req.user.email,
    status: "pending"
  })
  .populate("group", "name description")
  .populate("invitedBy", "name email");

  res.json({ 
    success: true, 
    data: invites 
  });
};

/**
 * POST /api/invites/:id/accept
 * Accept an invite
 */
exports.acceptInvite = async (req, res) => {
  const invite = await GroupInvite.findById(req.params.id);

  if (!invite) {
    return res.status(404).json({ 
      success: false, 
      message: "Invite not found" 
    });
  }

  if (invite.email !== req.user.email) {
    return res.status(403).json({ 
      success: false, 
      message: "This invite is not for you" 
    });
  }

  const group = await Group.findById(invite.group);

  // Add user to group members
  if (!group.members.some(m => m.user.toString() === req.user._id.toString())) {
    group.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date()
    });
    await group.save();
  }

  // Update invite status
  invite.status = "accepted";
  invite.acceptedAt = new Date();
  await invite.save();

  res.json({ 
    success: true, 
    message: "Invite accepted" 
  });
};

/**
 * MENU ENDPOINTS
 */

/**
 * GET /api/groups/:id/menu
 * Get group menu
 */
exports.getGroupMenu = async (req, res) => {
  const menu = await GroupMenu.findOne({ group: req.params.id })
    .populate("meals.meal")
    .populate("meals.suggestedBy", "name avatar");

  res.json({ 
    success: true, 
    data: menu?.meals || [] 
  });
};

/**
 * POST /api/groups/:id/menu/meals
 * Add meal to group menu
 * Body: { mealId }
 */
exports.addMealToMenu = async (req, res) => {
  const { mealId } = req.body;

  let menu = await GroupMenu.findOne({ group: req.params.id });

  if (!menu) {
    menu = await GroupMenu.create({ group: req.params.id, meals: [] });
  }

  menu.meals.push({
    meal: mealId,
    suggestedBy: req.user._id,
    addedAt: new Date(),
    votes: 0
  });

  await menu.save();

  res.status(201).json({ 
    success: true, 
    data: menu 
  });
};

/**
 * POST /api/groups/:id/menu/meals/:mealId/vote
 * Vote for a meal
 * Body: { vote: true/false }
 */
exports.voteMeal = async (req, res) => {
  const { vote } = req.body;

  const menu = await GroupMenu.findOne({ group: req.params.id });

  if (!menu) {
    return res.status(404).json({ 
      success: false, 
      message: "Menu not found" 
    });
  }

  const mealIndex = menu.meals.findIndex(
    m => m.meal.toString() === req.params.mealId
  );

  if (mealIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: "Meal not found in menu" 
    });
  }

  const meal = menu.meals[mealIndex];
  const userHasVoted = meal.votedBy.some(
    id => id.toString() === req.user._id.toString()
  );

  if (vote && !userHasVoted) {
    meal.votes += 1;
    meal.votedBy.push(req.user._id);
  } else if (!vote && userHasVoted) {
    meal.votes -= 1;
    meal.votedBy = meal.votedBy.filter(
      id => id.toString() !== req.user._id.toString()
    );
  }

  await menu.save();

  res.json({ 
    success: true, 
    data: { votes: meal.votes } 
  });
};

/**
 * REQUIRED ROUTES (in routes/group.js)
 */

const router = express.Router();
const {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addMember,
  removeMember,
  sendInvite,
  getPendingInvites,
  acceptInvite,
  getGroupMenu,
  addMealToMenu,
  voteMeal
} = require("../controllers/groupController");

const { authenticate } = require("../middlewares/authMiddleware");

// Groups
router.get("/", authenticate, getAllGroups);
router.post("/", authenticate, createGroup);
router.get("/:id", authenticate, getGroupById);
router.put("/:id", authenticate, updateGroup);
router.delete("/:id", authenticate, deleteGroup);

// Members
router.get("/:id/members", authenticate, getGroupMembers);
router.post("/:id/members", authenticate, addMember);
router.delete("/:id/members/:userId", authenticate, removeMember);

// Invites
router.post("/:id/invites", authenticate, sendInvite);
router.get("/invites/pending", authenticate, getPendingInvites);
router.post("/invites/:id/accept", authenticate, acceptInvite);

// Menu
router.get("/:id/menu", authenticate, getGroupMenu);
router.post("/:id/menu/meals", authenticate, addMealToMenu);
router.post("/:id/menu/meals/:mealId/vote", authenticate, voteMeal);
router.delete("/:id/menu/meals/:mealId", authenticate, removeMealFromMenu);

module.exports = router;
