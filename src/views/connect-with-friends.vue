<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

// Reactive state for modals and forms
const showDropdown = ref(false);
const showAddFriendModal = ref(false);
const showHandleFriendRequestModal = ref(false);
const showCreateExcursionInviteModal = ref(false);
const showHandleExcursionInviteModal = ref(false);
const showRemoveUserModal = ref(false);
const showLeaveExcursionModal = ref(false);

// Reactive state for data
const friends = ref([]);
const friendRequests = ref([]);
const excursions = ref([]);
const excursionInvites = ref([]);
const users = ref([]); // For selecting users to invite or remove

// Form data
const addFriendForm = ref({
    email: '',
});

const handleFriendRequestForm = ref({
    requestId: '',
    action: '', // 'accept' or 'decline'
});

const createExcursionInviteForm = ref({
    excursionId: '',
    userId: '',
});

const handleExcursionInviteForm = ref({
    inviteId: '',
    action: '', // 'accept' or 'decline'
});

const removeUserForm = ref({
    excursionId: '',
    userId: '',
});

const leaveExcursionForm = ref({
    excursionId: '',
});

// Selected items for modals
const selectedFriendRequest = ref(null);
const selectedExcursionInvite = ref(null);

// Compute profile initial
const profileInitial = computed(() => {
    return authStore.user?.email?.charAt(0).toUpperCase() || 'U';
});

// Form validation
const isAddFriendFormValid = computed(() => {
    return addFriendForm.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFriendForm.value.email);
});

const isCreateExcursionInviteFormValid = computed(() => {
    return createExcursionInviteForm.value.excursionId && createExcursionInviteForm.value.userId;
});

const isRemoveUserFormValid = computed(() => {
    return removeUserForm.value.excursionId && removeUserForm.value.userId;
});

const isLeaveExcursionFormValid = computed(() => {
    return leaveExcursionForm.value.excursionId;
});

// Toggle dropdown
const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

// Open modals
const openAddFriendModal = () => {
    showAddFriendModal.value = true;
    addFriendForm.value.email = '';
};

const openHandleFriendRequestModal = (request) => {
    selectedFriendRequest.value = request;
    handleFriendRequestForm.value.requestId = request._id;
    showHandleFriendRequestModal.value = true;
};

const openCreateExcursionInviteModal = async () => {
    await fetchExcursions();
    await fetchUsers();
    showCreateExcursionInviteModal.value = true;
    createExcursionInviteForm.value = { excursionId: '', userId: '' };
};

const openHandleExcursionInviteModal = (invite) => {
    selectedExcursionInvite.value = invite;
    handleExcursionInviteForm.value.inviteId = invite._id;
    showHandleExcursionInviteModal.value = true;
};

const openRemoveUserModal = async () => {
    await fetchExcursions();
    await fetchUsers();
    showRemoveUserModal.value = true;
    removeUserForm.value = { excursionId: '', userId: '' };
};

const openLeaveExcursionModal = async () => {
    await fetchExcursions();
    showLeaveExcursionModal.value = true;
    leaveExcursionForm.value.excursionId = '';
};

// Close modals
const closeAddFriendModal = () => {
    showAddFriendModal.value = false;
};

const closeHandleFriendRequestModal = () => {
    showHandleFriendRequestModal.value = false;
    selectedFriendRequest.value = null;
};

const closeCreateExcursionInviteModal = () => {
    showCreateExcursionInviteModal.value = false;
};

const closeHandleExcursionInviteModal = () => {
    showHandleExcursionInviteModal.value = false;
    selectedExcursionInvite.value = null;
};

const closeRemoveUserModal = () => {
    showRemoveUserModal.value = false;
};

const closeLeaveExcursionModal = () => {
    showLeaveExcursionModal.value = false;
};

// Handle sign-out
const handleSignOut = () => {
    showDropdown.value = false;
    authStore.signOut();
    router.push('/sign-in');
};

// Fetch friends
const fetchFriends = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch friends');
        return;
    }

    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/friends', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch friends');
        }

        friends.value = await response.json();
    } catch (error) {
        console.error('Error fetching friends:', error);
        alert(error.message || 'An error occurred while fetching friends');
        friends.value = [];
    }
};

// Delete friend
const handleDeleteFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/friends/${friendId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete friend');
        }

        friends.value = friends.value.filter(friend => friend._id !== friendId);
        alert('Friend removed successfully');
    } catch (error) {
        console.error('Error deleting friend:', error);
        alert(error.message || 'An error occurred while deleting the friend');
    }
};

// Create friend request
const handleCreateFriendRequest = async () => {
    try {
        if (!isAddFriendFormValid.value) {
            throw new Error('Please enter a valid email address');
        }

        const payload = {
            email: addFriendForm.value.email,
        };

        const response = await fetch('https://excursions-api-server.azurewebsites.net/friends/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send friend request');
        }

        await fetchFriendRequests();
        closeAddFriendModal();
        alert('Friend request sent successfully');
    } catch (error) {
        console.error('Error sending friend request:', error);
        alert(error.message || 'An error occurred while sending the friend request');
    }
};

// Fetch friend requests
const fetchFriendRequests = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch friend requests');
        return;
    }

    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/friends/requests', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch friend requests');
        }

        friendRequests.value = await response.json();
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        alert(error.message || 'An error occurred while fetching friend requests');
        friendRequests.value = [];
    }
};

// Handle friend request
const handleFriendRequest = async () => {
    try {
        if (!handleFriendRequestForm.value.action) {
            throw new Error('Please select an action (accept or decline)');
        }

        const payload = {
            action: handleFriendRequestForm.value.action,
        };

        const response = await fetch(`https://excursions-api-server.azurewebsites.net/friends/requests/${handleFriendRequestForm.value.requestId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to handle friend request');
        }

        await fetchFriendRequests();
        await fetchFriends();
        closeHandleFriendRequestModal();
        alert(`Friend request ${handleFriendRequestForm.value.action}ed successfully`);
    } catch (error) {
        console.error('Error handling friend request:', error);
        alert(error.message || 'An error occurred while handling the friend request');
    }
};

// Delete friend request
const handleDeleteFriendRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this friend request?')) return;

    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/friends/requests/${requestId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete friend request');
        }

        friendRequests.value = friendRequests.value.filter(req => req._id !== requestId);
        alert('Friend request deleted successfully');
    } catch (error) {
        console.error('Error deleting friend request:', error);
        alert(error.message || 'An error occurred while deleting the friend request');
    }
};

// Fetch excursions
const fetchExcursions = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch excursions');
        return;
    }

    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/excursions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch excursions');
        }

        excursions.value = await response.json();
    } catch (error) {
        console.error('Error fetching excursions:', error);
        alert(error.message || 'An error occurred while fetching excursions');
        excursions.value = [];
    }
};

// Fetch users (for inviting or removing)
const fetchUsers = async () => {
    // Note: The API doesn't provide a direct endpoint for fetching users. Assuming Ascertain if there's an endpoint to fetch users; you might need to adjust this based on your API.
    // For this example, we'll assume you have an endpoint to fetch users.
    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch users');
        }

        users.value = await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        alert(error.message || 'An error occurred while fetching users');
        users.value = [];
    }
};

// Create excursion invite
const handleCreateExcursionInvite = async () => {
    try {
        if (!isCreateExcursionInviteFormValid.value) {
            throw new Error('Please select an excursion and a user');
        }

        const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursion/${createExcursionInviteForm.value.excursionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ userId: createExcursionInviteForm.value.userId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create excursion invite');
        }

        await fetchExcursionInvites();
        closeCreateExcursionInviteModal();
        alert('Excursion invite sent successfully');
    } catch (error) {
        console.error('Error creating excursion invite:', error);
        alert(error.message || 'An error occurred while creating the excursion invite');
    }
};

// Fetch excursion invites
const fetchExcursionInvites = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch excursion invites');
        return;
    }

    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/share/excursions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch excursion invites');
        }

        excursionInvites.value = await response.json();
    } catch (error) {
        console.error('Error fetching excursion invites:', error);
        alert(error.message || 'An error occurred while fetching excursion invites');
        excursionInvites.value = [];
    }
};

// Handle excursion invite
const handleExcursionInvite = async () => {
    try {
        if (!handleExcursionInviteForm.value.action) {
            throw new Error('Please select an action (accept or decline)');
        }

        const payload = {
            action: handleExcursionInviteForm.value.action,
        };

        const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursions/${handleExcursionInviteForm.value.inviteId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to handle excursion invite');
        }

        await fetchExcursionInvites();
        await fetchExcursions();
        closeHandleExcursionInviteModal();
        alert(`Excursion invite ${handleExcursionInviteForm.value.action}ed successfully`);
    } catch (error) {
        console.error('Error handling excursion invite:', error);
        alert(error.message || 'An error occurred while handling the excursion invite');
    }
};

// Delete excursion invite
const handleDeleteExcursionInvite = async (inviteId) => {
    if (!confirm('Are you sure you want to delete this excursion invite?')) return;

    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursions/${inviteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete excursion invite');
        }

        excursionInvites.value = excursionInvites.value.filter(invite => invite._id !== inviteId);
        alert('Excursion invite deleted successfully');
    } catch (error) {
        console.error('Error deleting excursion invite:', error);
        alert(error.message || 'An error occurred while deleting the excursion invite');
    }
};

// Remove user from excursion
const handleRemoveUser = async () => {
    try {
        if (!isRemoveUserFormValid.value) {
            throw new Error('Please select an excursion and a user');
        }

        const response = await fetch(`https://excursions-api-server.azurewebsites.net/remove/excursions/${removeUserForm.value.excursionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ userId: removeUserForm.value.userId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove user from excursion');
        }

        await fetchExcursions();
        closeRemoveUserModal();
        alert('User removed from excursion successfully');
    } catch (error) {
        console.error('Error removing user from excursion:', error);
        alert(error.message || 'An error occurred while removing the user from the excursion');
    }
};

// Leave excursion
const handleLeaveExcursion = async () => {
    try {
        if (!isLeaveExcursionFormValid.value) {
            throw new Error('Please select an excursion');
        }

        const response = await fetch(`https://excursions-api-server.azurewebsites.net/leave/excursions/${leaveExcursionForm.value.excursionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to leave excursion');
        }

        await fetchExcursions();
        closeLeaveExcursionModal();
        alert('You have left the excursion successfully');
    } catch (error) {
        console.error('Error leaving excursion:', error);
        alert(error.message || 'An error occurred while leaving the excursion');
    }
};

// Watch for authentication changes and pre-fetch data
watch(() => authStore.isAuthenticated, (newValue) => {
    if (newValue) {
        fetchFriends();
        fetchFriendRequests();
        fetchExcursions();
        fetchExcursionInvites();
    } else {
        router.push('/sign-in');
    }
}, { immediate: true });
</script>

<template>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">ParkQuest</div>
            <nav class="nav">
                <router-link to="/dashboard">Home</router-link>
                <router-link to="/explore-parks">Explore Parks</router-link>
                <router-link to="/map-view">Map View</router-link>
                <router-link to="/connect-with-friends">Connect with Friends</router-link>
                <router-link to="/about">About Us</router-link>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <header class="header">
                <h1>Connect with Friends</h1>
                <p>Manage your friends, requests, and excursion invites</p>
            </header>

            <!-- Welcome Message -->
            <div class="welcome-message" v-if="authStore.isAuthenticated">
                <h2>Welcome, {{ authStore.user?.userName }}!</h2>
            </div>

            <!-- User Profile Icon with Dropdown -->
            <div class="user-profile">
                <div class="profile-icon" @click="toggleDropdown">
                    <span v-if="authStore.isAuthenticated">{{ profileInitial }}</span>
                </div>
                <div v-if="showDropdown" class="dropdown">
                    <button @click="handleSignOut" class="dropdown-item">Sign Out</button>
                </div>
            </div>

            <!-- Friend Actions -->
            <section class="friend-actions">
                <button @click="openAddFriendModal" class="btn btn-filled">Add Friend</button>
                <button @click="openCreateExcursionInviteModal" class="btn btn-filled">Create Excursion Invite</button>
                <button @click="openRemoveUserModal" class="btn btn-filled">Remove User from Excursion</button>
                <button @click="openLeaveExcursionModal" class="btn btn-filled">Leave Excursion</button>
            </section>

            <!-- Display Friends -->
            <section class="friend-list">
                <h2>Your Friends</h2>
                <div class="friend-grid">
                    <div v-for="friend in friends" :key="friend._id" class="friend-card">
                        <h3>{{ friend.userName || 'Unnamed Friend' }}</h3>
                        <p><strong>Email:</strong> {{ friend.email || 'N/A' }}</p>
                        <div class="friend-actions">
                            <button @click="handleDeleteFriend(friend._id)" class="btn btn-danger">Remove</button>
                        </div>
                    </div>
                    <div v-if="friends.length === 0" class="no-friends">
                        <p>No friends found. Add a new friend to get started!</p>
                    </div>
                </div>
            </section>

            <!-- Display Friend Requests -->
            <section class="friend-request-list">
                <h2>Friend Requests</h2>
                <div class="friend-request-grid">
                    <div v-for="request in friendRequests" :key="request._id" class="friend-request-card">
                        <h3>{{ request.from?.userName || 'Unknown User' }}</h3>
                        <p><strong>Email:</strong> {{ request.from?.email || 'N/A' }}</p>
                        <div class="friend-request-actions">
                            <button @click="openHandleFriendRequestModal(request)" class="btn btn-filled">Handle Request</button>
                            <button @click="handleDeleteFriendRequest(request._id)" class="btn btn-danger">Delete</button>
                        </div>
                    </div>
                    <div v-if="friendRequests.length === 0" class="no-friend-requests">
                        <p>No friend requests found.</p>
                    </div>
                </div>
            </section>

            <!-- Display Excursion Invites -->
            <section class="excursion-invite-list">
                <h2>Excursion Invites</h2>
                <div class="excursion-invite-grid">
                    <div v-for="invite in excursionInvites" :key="invite._id" class="excursion-invite-card">
                        <h3>{{ invite.excursion?.name || 'Unnamed Excursion' }}</h3>
                        <p><strong>Invited by:</strong> {{ invite.from?.userName || 'Unknown User' }}</p>
                        <div class="excursion-invite-actions">
                            <button @click="openHandleExcursionInviteModal(invite)" class="btn btn-filled">Handle Invite</button>
                            <button @click="handleDeleteExcursionInvite(invite._id)" class="btn btn-danger">Delete</button>
                        </div>
                    </div>
                    <div v-if="excursionInvites.length === 0" class="no-excursion-invites">
                        <p>No excursion invites found.</p>
                    </div>
                </div>
            </section>

            <!-- Add Friend Modal -->
            <div v-if="showAddFriendModal" class="modal-overlay">
                <div class="modal">
                    <h2>Add a New Friend</h2>
                    <form @submit.prevent="handleCreateFriendRequest" class="friend-form">
                        <div class="form-group">
                            <label for="friendEmail">Friend's Email</label>
                            <input
                                type="email"
                                id="friendEmail"
                                v-model="addFriendForm.email"
                                placeholder="Enter friend's email"
                                required
                            />
                        </div>
                        <div class="modal-actions">
                            <button type="button" @click="closeAddFriendModal" class="btn btn-outline">Cancel</button>
                            <button type="submit" class="btn btn-filled" :disabled="!isAddFriendFormValid">Send Request</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Handle Friend Request Modal -->
            <div v-if="showHandleFriendRequestModal" class="modal-overlay">
                <div class="modal">
                    <h2>Handle Friend Request</h2>
                    <form @submit.prevent="handleFriendRequest" class="friend-form">
                        <div class="form-group">
                            <label for="action">Action</label>
                            <select id="action" v-model="handleFriendRequestForm.action" required>
                                <option value="">Select an action</option>
                                <option value="accept">Accept</option>
                                <option value="decline">Decline</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" @click="closeHandleFriendRequestModal" class="btn btn-outline">Cancel</button>
                            <button type="submit" class="btn btn-filled">Submit</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Create Excursion Invite Modal -->
            <div v-if="showCreateExcursionInviteModal" class="modal-overlay">
                <div class="modal">
                    <h2>Create Excursion Invite</h2>
                    <form @submit.prevent="handleCreateExcursionInvite" class="excursion-invite-form">
                        <div class="form-group">
                            <label for="excursion">Select Excursion</label>
                            <select id="excursion" v-model="createExcursionInviteForm.excursionId" required>
                                <option value="">Select an excursion</option>
                                <option v-for="excursion in excursions" :key="excursion._id" :value="excursion._id">
                                    {{ excursion.name || 'Unnamed Excursion' }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="user">Select User</label>
                            <select id="user" v-model="createExcursionInviteForm.userId" required>
                                <option value="">Select a user</option>
                                <option v-for="user in users" :key="user._id" :value="user._id">
                                    {{ user.userName || user.email || 'Unknown User' }}
                                </option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" @click="closeCreateExcursionInviteModal" class="btn btn-outline">Cancel</button>
                            <button type="submit" class="btn btn-filled" :disabled="!isCreateExcursionInviteFormValid">Send Invite</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Handle Excursion Invite Modal -->
            <div v-if="showHandleExcursionInviteModal" class="modal-overlay">
                <div class="modal">
                    <h2>Handle Excursion Invite</h2>
                    <form @submit.prevent="handleExcursionInvite" class="excursion-invite-form">
                        <div class="form-group">
                            <label for="action">Action</label>
                            <select id="action" v-model="handleExcursionInviteForm.action" required>
                                <option value="">Select an action</option>
                                <option value="accept">Accept</option>
                                <option value="decline">Decline</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" @click="closeHandleExcursionInviteModal" class="btn btn-outline">Cancel</button>
                            <button type="submit" class="btn btn-filled">Submit</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Remove User Modal -->
            <div v-if="showRemoveUserModal" class="modal-overlay">
                <div class="modal">
                    <h2>Remove User from Excursion</h2>
                    <form @submit.prevent="handleRemoveUser" class="remove-user-form">
                        <div class="form-group">
                            <label for="excursion">Select Excursion</label>
                            <select id="excursion" v-model="removeUserForm.excursionId" required>
                                <option value="">Select an excursion</option>
                                <option v-for="excursion in excursions" :key="excursion._id" :value="excursion._id">
                                    {{ excursion.name || 'Unnamed Excursion' }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="user">Select User</label>
                            <select id="user" v-model="removeUserForm.userId" required>
                                <option value="">Select a user</option>
                                <option v-for="user in users" :key="user._id" :value="user._id">
                                    {{ user.userName || user.email || 'Unknown User' }}
                                </option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" @click="closeRemoveUserModal" class="btn btn-outline">Cancel</button>
                            <button type="submit" class="btn btn-filled" :disabled="!isRemoveUserFormValid">Remove User</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Leave Excursion Modal -->
            <div v-if="showLeaveExcursionModal" class="modal-overlay">
                <div class="modal">
                    <h2>Leave Excursion</h2>
                    <form @submit.prevent="handleLeaveExcursion" class="leave-excursion-form">
                        <div class="form-group">
                            <label for="excursion">Select Excursion</label>
                            <select id="excursion" v-model="leaveExcursionForm.excursionId" required>
                                <option value="">Select an excursion</option>
                                <option v-for="excursion in excursions" :key="excursion._id" :value="excursion._id">
                                    {{ excursion.name || 'Unnamed Excursion' }}
                                </option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" @click="closeLeaveExcursionModal" class="btn btn-outline">Cancel</button>
                            <button type="submit" class="btn btn-filled" :disabled="!isLeaveExcursionFormValid">Leave Excursion</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
* {
    box-sizing: border-box;
}

.container {
    display: flex;
    font-family: Arial, sans-serif;
    min-height: 100vh;
    background: #f5f5f5;
    max-width: 100vw;
    overflow-x: hidden;
}

.sidebar {
    width: 250px;
    background: #fff;
    padding: 20px;
    border-right: 1px solid #ddd;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    position: fixed;
    height: 100vh;
    overflow-y: auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 30px;
    text-align: center;
}

.nav {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.nav a {
    text-decoration: none;
    color: #333;
    font-size: 1.1rem;
    padding: 10px;
    display: block;
    transition: background 0.2s;
}

.nav a:hover {
    color: #555;
    background: #f0f0f0;
    border-radius: 4px;
}

.main-content {
    flex: 1;
    padding: 20px;
    margin-left: 250px;
    max-width: calc(100vw - 250px);
}

.header {
    background: #666;
    color: #fff;
    padding: 20px;
    text-align: center;
    margin-bottom: 20px;
    border-radius: 4px;
    width: 100%;
}

.header h1 {
    font-size: 2rem;
    margin: 0;
}

.header p {
    font-size: 1rem;
    margin: 5px 0 0;
}

.welcome-message {
    margin-bottom: 20px;
    text-align: right;
}

.welcome-message h2 {
    font-size: 1.5rem;
    color: #333;
    margin: 0;
}

.user-profile {
    position: relative;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}

.profile-icon {
    width: 40px;
    height: 40px;
    background: #ccc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    border: 2px solid #fff;
    transition: background 0.2s;
}

.profile-icon:hover {
    background: #bbb;
}

.dropdown {
    position: absolute;
    top: 50px;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 150px;
}

.dropdown-item {
    display: block;
    width: 100%;
    padding: 10px 20px;
    background: none;
    border: none;
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.dropdown-item:hover {
    background: #f5f5f5;
}

.friend-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 40px;
    flex-wrap: wrap;
}

.friend-list,
.friend-request-list,
.excursion-invite-list {
    margin-bottom: 40px;
    max-width: 100%;
}

.friend-list h2,
.friend-request-list h2,
.excursion-invite-list h2 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
}

.friend-grid,
.friend-request-grid,
.excursion-invite-grid {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 10px 0;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;
}

.friend-grid::-webkit-scrollbar,
.friend-request-grid::-webkit-scrollbar,
.excursion-invite-grid::-webkit-scrollbar {
    height: 8px;
}

.friend-grid::-webkit-scrollbar-thumb,
.friend-request-grid::-webkit-scrollbar-thumb,
.excursion-invite-grid::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

.friend-card,
.friend-request-card,
.excursion-invite-card {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    flex: 0 0 250px;
}

.friend-card:hover,
.friend-request-card:hover,
.excursion-invite-card:hover {
    transform: translateY(-5px);
}

.friend-card h3,
.friend-request-card h3,
.excursion-invite-card h3 {
    font-size: 1.3rem;
    margin: 0 0 15px 0;
}

.friend-card p,
.friend-request-card p,
.excursion-invite-card p {
    font-size: 1rem;
    color: #666;
    margin: 5px 0;
}

.friend-actions,
.friend-request-actions,
.excursion-invite-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.no-friends,
.no-friend-requests,
.no-excursion-invites {
    text-align: center;
    padding: 20px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    overflow-y: auto;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    max-height: 80vh;
    overflow-y: auto;
}

.modal h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
}

.modal p {
    font-size: 1rem;
    margin-bottom: 10px;
}

.friend-form,
.excursion-invite-form,
.remove-user-form,
.leave-excursion-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-size: 1.1rem;
    margin-bottom: 5px;
}

.form-group input,
.form-group textarea,
.form-group select {
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
    color: #aaa;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.btn {
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
}

.btn-filled {
    background: #000;
    color: #fff;
    border: none;
}

.btn-filled:hover {
    background: #333;
}

.btn-outline {
    background: none;
    border: 1px solid #ddd;
    color: #333;
}

.btn-outline:hover {
    background: #f5f5f5;
}

.btn-danger {
    background: #ff4d4f;
    color: white;
    border: none;
}

.btn-danger:hover {
    background: #d9363e;
}
</style>
