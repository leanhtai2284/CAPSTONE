# 👥 Group Feature - Quick Start Guide

## Installation & Setup

### 1. Import Required Providers

In your `App.jsx`, make sure `GroupProvider` is wrapped around your app content:

```jsx
import { GroupProvider } from "./context/GroupContext";

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider>
        <AuthProvider>
          <GroupProvider>
            <MealSelectionProvider>
              {/* Your app content */}
            </MealSelectionProvider>
          </GroupProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}
```

### 2. Add Routes

Routes are already added in `privateRoutes.jsx`:
```javascript
{ path: "/groups", element: <GroupDashboard /> },
{ path: "/groups/:groupId", element: <GroupDetail /> },
```

### 3. Add NavBar Link

The "👥 Nhóm" link is already added to NavBar.

## Usage in Components

### Hook Import
```javascript
import { useGroup } from "../hooks/useGroup";
```

### Access & Display Groups

```jsx
import { useGroup } from "../hooks/useGroup";

export default function MyGroupComponent() {
  const { groups, loading, error } = useGroup();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {groups.map(group => (
        <div key={group._id}>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Create a Group

```jsx
export default function CreateGroupComponent() {
  const { createGroup, loading } = useGroup();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "healthy",
    privacy: "private"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newGroup = await createGroup(formData);
      toast.success("Group created!");
    } catch (error) {
      toast.error("Failed to create group");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Group name"
      />
      {/* More form fields */}
      <button type="submit" disabled={loading}>Create</button>
    </form>
  );
}
```

### Invite Members

```jsx
import { useGroup } from "../hooks/useGroup";
import { toast } from "sonner";

export default function InviteMembersComponent({ groupId }) {
  const { sendInvite, loading } = useGroup();
  const [email, setEmail] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await sendInvite(groupId, email);
      toast.success("Invite sent!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to send invite");
    }
  };

  return (
    <form onSubmit={handleInvite}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="friend@example.com"
      />
      <button type="submit" disabled={loading}>Send Invite</button>
    </form>
  );
}
```

### View & Manage Group Details

```jsx
import { useGroup } from "../hooks/useGroup";
import GroupMembers from "../components/group/GroupMembers";
import GroupMenuVoting from "../components/group/GroupMenuVoting";

export default function GroupDetailsComponent({ groupId }) {
  const {
    selectedGroup,
    groupMembers,
    groupMenu,
    removeMember,
    loadGroupDetail
  } = useGroup();

  useEffect(() => {
    loadGroupDetail(groupId);
  }, [groupId]);

  if (!selectedGroup) return <div>Loading...</div>;

  return (
    <div>
      <h1>{selectedGroup.name}</h1>
      
      <section>
        <h2>Members</h2>
        <GroupMembers
          members={groupMembers}
          onRemoveMember={(userId) => removeMember(groupId, userId)}
        />
      </section>

      <section>
        <h2>Menu</h2>
        <GroupMenuVoting groupId={groupId} meals={groupMenu} />
      </section>
    </div>
  );
}
```

### Handle Pending Invites

```jsx
import { useGroup } from "../hooks/useGroup";
import { useEffect } from "react";

export default function PendingInvitesComponent() {
  const { pendingInvites, acceptInvite, rejectInvite, loadPendingInvites } = useGroup();

  useEffect(() => {
    loadPendingInvites();
  }, []);

  return (
    <div>
      <h2>Pending Invites ({pendingInvites.length})</h2>
      {pendingInvites.map(invite => (
        <div key={invite._id}>
          <p>Invited to: {invite.group?.name}</p>
          <button onClick={() => acceptInvite(invite._id)}>Accept</button>
          <button onClick={() => rejectInvite(invite._id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
```

### Vote on Meals

```jsx
export default function MealVotingComponent() {
  const { voteMeal } = useGroup();

  const handleVote = async (groupId, mealId) => {
    try {
      await voteMeal(groupId, mealId, true); // true = like
      toast.success("Vote recorded!");
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  return (
    <div>
      {/* Meal items with vote buttons */}
      <button onClick={() => handleVote(groupId, mealId)}>👍 Like</button>
    </div>
  );
}
```

## Available Hooks & Services

### useGroup Hook
```javascript
const {
  // State
  groups,                      // Current user's groups
  selectedGroup,              // Currently selected group
  groupMembers,              // Members of selected group
  groupMenu,                 // Menu items of selected group
  pendingInvites,            // Pending invites for user
  loading,                   // Loading state
  error,                     // Error message

  // Methods
  loadGroups,                // Fetch all groups
  loadGroupDetail,           // Fetch group details
  createGroup,               // Create new group
  updateGroup,               // Update group
  deleteGroup,               // Delete group
  addMember,                 // Add member to group
  removeMember,              // Remove member from group
  loadPendingInvites,        // Fetch pending invites
  sendInvite,                // Send invite via email
  acceptInvite,              // Accept an invite
  rejectInvite,              // Reject an invite
  addMealToMenu,             // Add meal to group menu
  removeMealFromMenu,        // Remove meal from menu
  voteMeal,                  // Vote for a meal
} = useGroup();
```

### groupService Functions
```javascript
import { groupService } from "../services/groupService";

// All service methods return Promises
await groupService.getAllGroups();
await groupService.getGroupById(groupId);
await groupService.createGroup(groupData);
await groupService.sendInvite(groupId, email);
await groupService.acceptInvite(inviteId);
await groupService.voteMeal(groupId, mealId, voteValue);
```

## UI Components Ready to Use

All UI components are pre-built and styled:

1. **CreateGroupModal** - Modal form to create groups
2. **InviteUI** - Modal to invite members via email
3. **GroupCard** - Display individual group
4. **GroupList** - Display multiple groups
5. **GroupMembers** - List and manage members
6. **GroupMenuVoting** - Vote on meals

## Common Tasks

### Create a Group and Invite Members
```javascript
const { createGroup, sendInvite } = useGroup();

// Create group
const newGroup = await createGroup({
  name: "Fitness Team",
  description: "Morning workout meals",
  goal: "fitness",
  privacy: "private"
});

// Send invites
await sendInvite(newGroup._id, "friend1@example.com");
await sendInvite(newGroup._id, "friend2@example.com");
```

### Accept Multiple Invites
```javascript
const { pendingInvites, acceptInvite } = useGroup();

for (const invite of pendingInvites) {
  await acceptInvite(invite._id);
}
```

### Update Group Menu
```javascript
const { addMealToMenu, voteMeal, removeMealFromMenu } = useGroup();

// Add meal
await addMealToMenu(groupId, mealId, { note: "Suggested by John" });

// Vote for it
await voteMeal(groupId, mealId, true);

// Remove if needed
await removeMealFromMenu(groupId, mealId);
```

## Error Handling

All methods throw errors that should be caught:

```javascript
try {
  await createGroup(data);
} catch (error) {
  console.error("Error:", error.message);
  toast.error(error.message);
}
```

## Best Practices

1. **Always wrap context usage in try-catch**
   ```javascript
   try {
     await groupAction();
   } catch (error) {
     // Handle error
   }
   ```

2. **Show loading states**
   ```javascript
   {loading && <div>Loading...</div>}
   ```

3. **Display error messages**
   ```javascript
   {error && <div className="text-red-600">{error}</div>}
   ```

4. **Use toast notifications for feedback**
   ```javascript
   import { toast } from "sonner";
   
   toast.success("✅ Success!");
   toast.error("❌ Error!");
   ```

5. **Load data on component mount**
   ```javascript
   useEffect(() => {
     loadGroups();
   }, []);
   ```

6. **Validate form inputs**
   ```javascript
   if (!formData.name.trim()) {
     toast.error("Name required");
     return;
   }
   ```

## Component Props Reference

### CreateGroupModal
```jsx
<CreateGroupModal
  isOpen={boolean}        // Show/hide modal
  onClose={() => {}}      // Close handler
/>
```

### InviteUI
```jsx
<InviteUI
  groupId={string}       // Which group to invite to
  isOpen={boolean}       // Show/hide modal
  onClose={() => {}}     // Close handler
  groupName={string}     // Display name
/>
```

### GroupCard
```jsx
<GroupCard
  group={object}         // Group data
  isOwner={boolean}      // Is current user owner
  onInvite={() => {}}    // Invite handler
  onDelete={() => {}}    // Delete handler
/>
```

### GroupMembers
```jsx
<GroupMembers
  members={array}        // Member list
  isOwner={boolean}      // Is current user owner
  onRemoveMember={() => {}}  // Remove handler
  onChangeRole={() => {}}    // Role change handler
  loading={boolean}      // Loading state
/>
```

### GroupMenuVoting
```jsx
<GroupMenuVoting
  groupId={string}       // Group ID
  meals={array}          // Menu items
  onRemove={() => {}}    // Remove handler (optional)
/>
```

## Troubleshooting

### Groups not loading
- Ensure `GroupProvider` wraps your app
- Check if user is authenticated (AuthProvider)
- Check browser console for API errors

### Invites not working
- Verify backend endpoints are implemented
- Check email validation
- Ensure user exists with that email

### Votes not updating
- Check if meal is already added to menu
- Verify group ID and meal ID are correct

### Navigation issues
- Ensure routes are added to `privateRoutes.jsx`
- Check if routes are protected with `ProtectedRoute`

## Support

For issues or questions:
1. Check the GROUP_FEATURE_README.md for detailed docs
2. Review BACKEND_INTEGRATION_GUIDE.md for API specs
3. Check component source code comments
4. Review example usage in GroupDashboard.jsx
