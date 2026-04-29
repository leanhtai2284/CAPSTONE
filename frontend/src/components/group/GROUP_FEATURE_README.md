# 👥 Social & Group Feature Documentation

## Overview
This is a comprehensive Social & Group feature for managing collaborative meal plans. Users can create groups, invite members, manage menus collaboratively, and track shared nutrition goals.

## Features

### 1. **Group Management**
- Create, update, and delete groups
- Set group goals (healthy eating, fitness, weight loss, muscle gain, balanced)
- Privacy control (private/public groups)
- Group descriptions and metadata

### 2. **Member Management**
- Add/remove group members
- Role-based permissions (owner, admin, member)
- Member profiles with avatars
- Activity tracking

### 3. **Collaborative Menu**
- Add meals to group menu
- Vote/like system for meals
- Collaborative meal planning
- Nutrition stats aggregation

### 4. **Invite System**
- Send email invites
- Accept/reject invites
- Shareable invite links
- Pending invite tracking

## File Structure

```
frontend/src/
├── components/
│   └── group/
│       ├── CreateGroupModal.jsx      # Create new group form
│       ├── GroupCard.jsx             # Group display card
│       ├── GroupList.jsx             # List of groups
│       ├── GroupMembers.jsx          # Members management
│       ├── GroupMenuVoting.jsx       # Menu voting interface
│       └── InviteUI.jsx              # Invite members UI
├── context/
│   └── GroupContext.jsx              # Global group state management
├── hooks/
│   └── useGroup.js                   # Custom hook for groups
├── services/
│   └── groupService.js               # API integration
└── pages/
    ├── GroupDashboard.jsx            # Main groups page
    └── GroupDetail.jsx               # Individual group page
```

## Component API Reference

### GroupContext

#### State
```javascript
{
  groups: Array,                  // All user groups
  selectedGroup: Object,          // Currently viewed group
  groupMembers: Array,            // Members of selected group
  groupMenu: Array,               // Menu items of group
  pendingInvites: Array,          // Pending invites
  loading: Boolean,               // Loading state
  error: String                   // Error message
}
```

#### Methods
```javascript
// Group Management
loadGroups()                           // Load all groups
loadGroupDetail(groupId)               // Load group details
createGroup(groupData)                 // Create new group
updateGroup(groupId, groupData)        // Update group
deleteGroup(groupId)                   // Delete group

// Member Management
addMember(groupId, userId)             // Add member to group
removeMember(groupId, userId)          // Remove member

// Invites
loadPendingInvites()                   // Load pending invites
sendInvite(groupId, email)             // Send email invite
acceptInvite(inviteId)                 // Accept invite
rejectInvite(inviteId)                 // Reject invite

// Collaborative Menu
addMealToMenu(groupId, mealId, data)  // Add meal to group menu
removeMealFromMenu(groupId, mealId)   // Remove meal from menu
voteMeal(groupId, mealId, vote)       // Vote for a meal
```

### CreateGroupModal
Props:
```javascript
{
  isOpen: Boolean,          // Modal visibility
  onClose: Function         // Callback when closing
}
```

### InviteUI
Props:
```javascript
{
  groupId: String,          // To invite users to
  isOpen: Boolean,          // Modal visibility
  onClose: Function,        // Callback when closing
  groupName: String         // Display in header
}
```

### GroupCard
Props:
```javascript
{
  group: Object,            // Group data
  isOwner: Boolean,         // Is current user owner
  onInvite: Function,       // Invite handler
  onDelete: Function        // Delete handler
}
```

### GroupMembers
Props:
```javascript
{
  members: Array,           // Member list
  isOwner: Boolean,         // Current user is owner
  onRemoveMember: Function, // Remove member handler
  onChangeRole: Function,   // Change role handler
  loading: Boolean          // Loading state
}
```

### GroupMenuVoting
Props:
```javascript
{
  groupId: String,          // Group ID
  meals: Array,             // Menu items
  onRemove: Function        // Remove meal handler
}
```

## Usage Examples

### Using the Group Context in Components

```javascript
import { useGroup } from "../hooks/useGroup";

export default function MyComponent() {
  const {
    groups,
    loading,
    error,
    createGroup,
    sendInvite,
  } = useGroup();

  const handleCreateGroup = async () => {
    try {
      await createGroup({
        name: "Fitness Team",
        description: "Morning workout meal group",
        goal: "fitness",
        privacy: "private"
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    // JSX here
  );
}
```

### Creating a Group

```javascript
const newGroup = await createGroup({
  name: "My Meal Group",
  description: "Collaborative meal planning",
  goal: "healthy",              // Options: healthy, fitness, weight_loss, muscle_gain, balanced
  privacy: "private"             // Options: private, public
});
```

### Inviting Members

```javascript
try {
  await sendInvite(groupId, "friend@example.com");
  toast.success("Invite sent!");
} catch (error) {
  toast.error("Failed to send invite");
}
```

### Voting on Meals

```javascript
try {
  await voteMeal(groupId, mealId, true); // true = like, false/null = unlike
  toast.success("Vote recorded!");
} catch (error) {
  toast.error("Failed to vote");
}
```

## API Endpoints Required

The GroupService expects these backend endpoints:

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Members
- `GET /api/groups/:id/members` - Get group members
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `PUT /api/groups/:id/members/:userId` - Update member role

### Invites
- `GET /api/groups/:id/invites` - Get group invites
- `POST /api/groups/:id/invites` - Send invite
- `GET /api/invites/pending` - Get pending invites
- `POST /api/invites/:id/accept` - Accept invite
- `POST /api/invites/:id/reject` - Reject invite

### Menu
- `GET /api/groups/:id/menu` - Get group menu
- `POST /api/groups/:id/menu/meals` - Add meal to menu
- `DELETE /api/groups/:id/menu/meals/:mealId` - Remove meal
- `POST /api/groups/:id/menu/meals/:mealId/vote` - Vote for meal

### Stats
- `GET /api/groups/:id/stats` - Get group statistics
- `GET /api/groups/:id/nutrition` - Get nutrition info

## Expected Data Structures

### Group
```javascript
{
  _id: String,
  name: String,
  description: String,
  goal: String,              // healthy, fitness, weight_loss, muscle_gain, balanced
  privacy: String,           // private, public
  owner: User Object,
  members: Array of Member,
  createdAt: Date,
  updatedAt: Date
}
```

### Member
```javascript
{
  _id: String,
  name: String,
  email: String,
  avatar: String,
  role: String,              // owner, admin, member
  joinedAt: Date
}
```

### Invitation
```javascript
{
  _id: String,
  group: Group Object,
  email: String,
  invitedBy: User Object,
  status: String,            // pending, accepted, rejected
  createdAt: Date
}
```

### Menu Item
```javascript
{
  _id: String,
  name: String,
  name_vi: String,
  description: String,
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  suggestedBy: String,       // Username
  votes: Number,
  addedAt: Date
}
```

## Styling

All components use:
- **TailwindCSS** for styling
- **Dark mode support** with `dark:` prefix
- **Lucide React** icons for visual elements
- **Toast notifications** via Sonner library

## Integration with Existing App

The feature integrates seamlessly with:
- **AuthContext** - User authentication
- **MealSelectionContext** - Meal selection
- **LoadingContext** - Loading states
- **Routes** - Private routes protection

## Navigation

- Main page: `/groups` (GroupDashboard)
- Group detail: `/groups/:groupId` (GroupDetail)
- Accessible via NavBar "👥 Nhóm" link

## Notes

1. **Real-time Features**: Consider WebSocket integration for real-time updates
2. **Notifications**: Integrate with NotificationService for invite alerts
3. **Analytics**: Group progress and meal statistics
4. **Permissions**: Enhance with granular permission system
5. **Moderation**: Add content moderation for inappropriate group names

## Future Enhancements

- [ ] Group meals/events scheduling
- [ ] Shared shopping lists
- [ ] Meal tracking and progress charts
- [ ] Group challenges and achievements
- [ ] Recipe sharing and comments
- [ ] Calendar view of group meal plans
- [ ] Mobile app sync
- [ ] Push notifications
- [ ] Social sharing integrations
