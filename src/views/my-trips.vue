<!-- eslint-disable vue/no-side-effects-in-computed-properties -->
<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const trips = ref([]);
const excursions = ref([]);
const invites = ref([]);
const friends = ref([]);
const friendRequests = ref([]);
const showCreateExcursionModal = ref(false);
const showAddToExcursionModal = ref(false);
const showTripDetailsModal = ref(false);
const showInvitesModal = ref(false);
const showManageFriendsModal = ref(false);
const showGlobalInviteModal = ref(false);
const selectedTrip = ref(null);
const excursionForm = ref({
  name: '',
  description: '',
});
const addToExcursionForm = ref({
  excursionId: '',
});
const globalInviteForm = ref({
  excursionId: '',
  friendId: '',
});
const friendRequestForm = ref({
  friendId: '',
});
const excursionFormErrors = ref({
  name: '',
});
const globalInviteFormErrors = ref({
  excursionId: '',
  friendId: '',
});
const friendRequestFormErrors = ref({
  friendId: '',
});

const isExcursionFormValid = computed(() => {
  excursionFormErrors.value = { name: '' };
  const nameValid = excursionForm.value.name && excursionForm.value.name.trim().length >= 1 && excursionForm.value.name.trim().length <= 128;
  if (!nameValid) excursionFormErrors.value.name = 'Name must be between 1 and 128 characters';
  return nameValid;
});

const isGlobalInviteFormValid = computed(() => {
  globalInviteFormErrors.value = { excursionId: '', friendId: '' };
  const excursionIdValid = globalInviteForm.value.excursionId && /^[0-9a-fA-F]{24}$/.test(globalInviteForm.value.excursionId);
  const friendIdValid = globalInviteForm.value.friendId && /^[0-9a-fA-F]{24}$/.test(globalInviteForm.value.friendId);
  if (!excursionIdValid) globalInviteFormErrors.value.excursionId = 'Select a valid excursion';
  if (!friendIdValid) globalInviteFormErrors.value.friendId = 'Select a valid friend';
  return friendIdValid && (excursionIdValid || globalInviteForm.value.excursionId); // Allow pre-filled excursionId
});

const isFriendRequestFormValid = computed(() => {
  friendRequestFormErrors.value = { friendId: '' };
  const friendIdValid = friendRequestForm.value.friendId && /^[0-9a-fA-F]{24}$/.test(friendRequestForm.value.friendId);
  if (!friendIdValid) friendRequestFormErrors.value.friendId = 'Enter a valid 24-character friend ID';
  return friendIdValid;
});

const fetchTrips = async () => {
  if (!authStore.token) {
    console.warn('No token available to fetch trips');
    return;
  }
  try {
    const response = await fetch('https://excursions-api-server.azurewebsites.net/trips', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fetch trips error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch trips');
    }
    const data = await response.json();
    console.log('Raw trips data from API:', data);
    trips.value = Array.isArray(data) ? data : (data.trips || data.trip || []);
    console.log('Processed trips:', trips.value);
  } catch (error) {
    console.error('Error fetching trips:', error);
    alert('Failed to fetch trips.');
    trips.value = [];
  }
};

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
    console.log('Fetch excursions response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fetch excursions error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch excursions');
    }
    const data = await response.json();
    console.log('Raw excursions data from API:', JSON.stringify(data, null, 2));
    excursions.value = Array.isArray(data) ? data : (data.excursions || data.excursion || []);
    console.log('Processed excursions:', JSON.stringify(excursions.value, null, 2));
    console.log('User:', JSON.stringify(authStore.user, null, 2));
    excursions.value.forEach(exc => {
      const isCreator = exc.createdBy?._id === authStore.user?._id || exc.createdBy?.id === authStore.user?._id || exc.createdBy === authStore.user?._id;
      const isHost = exc.host?._id === authStore.user?._id || exc.host?.id === authStore.user?._id || exc.host === authStore.user?._id;
      console.log(`Excursion ${exc._id}: createdBy=${JSON.stringify(exc.createdBy)}, isCreator=${isCreator}, host=${JSON.stringify(exc.host)}, isHost=${isHost}`);
    });
  } catch (error) {
    console.error('Error fetching excursions:', error);
    alert('Failed to fetch excursions.');
    excursions.value = [];
  }
};

const fetchInvites = async () => {
  if (!authStore.token) {
    console.warn('No token available to fetch invites');
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
    console.log('Fetch invites response status:', response.status);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Fetch invites error response:', errorData);
      throw new Error('Failed to fetch invites');
    }
    const data = await response.json();
    console.log('Raw invites data from API:', data);
    invites.value = data.excursionInvites || [];
    console.log('Processed invites:', invites.value);
  } catch (error) {
    console.error('Error fetching invites:', error);
    alert('Failed to fetch invites.');
    invites.value = [];
  }
};

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
    console.log('Fetch friends response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fetch friends error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch friends');
    }
    const data = await response.json();
    console.log('Raw friends data from API:', JSON.stringify(data, null, 2));
    friends.value = data.friends || [];
    console.log('Processed friends:', JSON.stringify(friends.value, null, 2));
  } catch (error) {
    console.error('Error fetching friends:', error);
    alert('Failed to fetch friends.');
    friends.value = [];
  }
};

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
    console.log('Fetch friend requests response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fetch friend requests error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch friend requests');
    }
    const data = await response.json();
    console.log('Raw friend requests data from API:', data);
    friendRequests.value = data.friendRequests || [];
    console.log('Processed friend requests:', friendRequests.value);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    alert('Failed to fetch friend requests.');
    friendRequests.value = [];
  }
};

const handleCreateExcursion = async () => {
  try {
    if (!isExcursionFormValid.value) {
      throw new Error('Please fix the form errors before submitting.');
    }
    const payload = {
      name: excursionForm.value.name.trim(),
      description: excursionForm.value.description?.trim() || '',
    };
    console.log('Creating excursion with payload:', payload, 'token:', authStore.token);
    const response = await fetch('https://excursions-api-server.azurewebsites.net/excursion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create excursion error response:', errorData);
      throw new Error(errorData.message || 'Failed to create excursion');
    }
    const data = await response.json();
    console.log('Create excursion response:', data);
    const newExcursion = data.excursion || data;
    if (!newExcursion) {
      throw new Error('Invalid response: No excursion data');
    }
    if (!Array.isArray(excursions.value)) {
      console.warn('excursions.value is not an array, resetting to []');
      excursions.value = [];
    }
    excursions.value.push(newExcursion);
    closeCreateExcursionModal();
    alert('Excursion created successfully!');
  } catch (error) {
    console.error('Error creating excursion:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleDeleteTrip = async (tripId) => {
  if (!confirm('Are you sure you want to delete this trip?')) return;
  try {
    const response = await fetch(`https://excursions-api-server.azurewebsites.net/trip/${tripId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete trip error response:', errorData);
      throw new Error(errorData.message || 'Failed to delete trip');
    }
    trips.value = trips.value.filter(trip => (trip._id || trip.id) !== tripId);
    await fetchExcursions();
    alert('Trip deleted successfully');
  } catch (error) {
    console.error('Error deleting trip:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleDeleteExcursion = async (excursionId) => {
  if (!confirm('Are you sure you want to delete this excursion?')) return;
  try {
    const response = await fetch(`https://excursions-api-server.azurewebsites.net/excursion/${excursionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete excursion error response:', errorData);
      throw new Error(errorData.message || 'Failed to delete excursion');
    }
    excursions.value = excursions.value.filter(exc => (exc._id || exc.id) !== excursionId);
    await fetchInvites();
    alert('Excursion deleted successfully');
  } catch (error) {
    console.error('Error deleting excursion:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleAddToExcursion = async () => {
  if (!addToExcursionForm.value.excursionId || !selectedTrip.value) {
    alert('Please select an excursion.');
    return;
  }
  try {
    const tripId = selectedTrip.value._id || selectedTrip.value.id;
    const excursionId = addToExcursionForm.value.excursionId;

    if (!/^[0-9a-fA-F]{24}$/.test(tripId) || !/^[0-9a-fA-F]{24}$/.test(excursionId)) {
      console.error('Invalid tripId or excursionId:', { tripId, excursionId });
      throw new Error('Invalid trip or excursion ID');
    }

    const tripExists = trips.value.some(trip => (trip._id || trip.id) === tripId);
    if (!tripExists) {
      console.error('Trip not found in trips:', tripId, 'Available trips:', trips.value);
      throw new Error('Selected trip not found');
    }

    const payloads = [
      { tripId },
      { trips: [tripId] },
      { data: { tripId } }
    ];

    let lastError = null;
    for (const payload of payloads) {
      try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/excursion/${excursionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const updatedExcursion = await response.json();
          console.log('Updated excursion:', updatedExcursion);
          const index = excursions.value.findIndex(exc => (exc._id || exc.id) === excursionId);
          if (index !== -1) excursions.value[index] = updatedExcursion.excursion || updatedExcursion;
          closeAddToExcursionModal();
          alert('Trip added to excursion successfully!');
          return;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Add trip error response:', errorData, 'status:', response.status, 'payload tried:', JSON.stringify(payload));
          lastError = new Error(errorData.message || `Failed to add trip (status: ${response.status})`);
        }
      } catch (error) {
        console.error('Error during fetch:', error, 'payload tried:', JSON.stringify(payload));
        lastError = error;
      }
    }
    throw lastError || new Error('Failed to add trip after trying all payload formats');
  } catch (error) {
    console.error('Error adding trip to excursion:', error);
    alert(`Error: ${error.message || 'Failed to add trip to excursion'}`);
  }
};

const handleSendInvite = async () => {
  try {
    if (!isGlobalInviteFormValid.value) {
      throw new Error('Please fix the form errors before submitting.');
    }
    const payload = { friendId: globalInviteForm.value.friendId };
    const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursion/${globalInviteForm.value.excursionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Send invite error response:', errorData);
      throw new Error(errorData.message || 'Failed to send invite');
    }
    const updatedExcursion = await response.json();
    const index = excursions.value.findIndex(exc => (exc._id || exc.id) === globalInviteForm.value.excursionId);
    if (index !== -1) excursions.value[index] = updatedExcursion;
    closeGlobalInviteModal();
    await fetchInvites();
    alert('Invitation sent successfully!');
  } catch (error) {
    console.error('Error sending invite:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleRevokeInvite = async (inviteId) => {
  if (!confirm('Are you sure you want to revoke this invitation?')) return;
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
      console.error('Revoke invite error response:', errorData);
      throw new Error(errorData.message || 'Failed to revoke invite');
    }
    await fetchInvites();
    await fetchExcursions();
    alert('Invitation revoked successfully');
  } catch (error) {
    console.error('Error revoking invite:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleAcceptInvite = async (inviteId) => {
  try {
    const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursions/${inviteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ isAccepted: true }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Accept invite error response:', errorData);
      throw new Error(errorData.message || 'Failed to accept invite');
    }
    await Promise.all([fetchExcursions(), fetchInvites()]);
    alert('Invitation accepted successfully');
  } catch (error) {
    console.error('Error accepting invite:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleDenyInvite = async (inviteId) => {
  try {
    const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursions/${inviteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ isAccepted: false }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Deny invite error response:', errorData);
      throw new Error(errorData.message || 'Failed to deny invite');
    }
    await fetchInvites();
    alert('Invitation denied successfully');
  } catch (error) {
    console.error('Error denying invite:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleRemoveUser = async (excursionId, userId) => {
  if (!confirm('Are you sure you want to remove this user from the excursion?')) return;
  try {
    const response = await fetch(`https://excursions-api-server.azurewebsites.net/remove/excursions/${excursionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Remove user error response:', errorData);
      throw new Error(errorData.message || 'Failed to remove user');
    }
    await fetchExcursions();
    alert('User removed successfully');
  } catch (error) {
    console.error('Error removing user:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleLeaveExcursion = async (excursionId) => {
  if (!confirm('Are you sure you want to leave this excursion?')) return;
  try {
    const response = await fetch(`https://excursions-api-server.azurewebsites.net/leave/excursions/${excursionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Leave excursion error response:', errorData);
      throw new Error('Failed to leave excursion');
    }
    excursions.value = excursions.value.filter(exc => (exc._id || exc.id) !== excursionId);
    alert('You have left the excursion');
  } catch (error) {
    console.error('Error leaving excursion:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleSendFriendRequest = async () => {
  try {
    if (!isFriendRequestFormValid.value) {
      throw new Error('Please fix the form errors before submitting.');
    }
    const friendId = friendRequestForm.value.friendId;
    if (friendId === authStore.user?._id) {
      console.error('Cannot send friend request to self:', friendId);
      throw new Error('Cannot send friend request to yourself');
    }
    const payload = { friendId };
    console.log('Sending friend request with payload:', payload, 'token:', authStore.token);
    const response = await fetch('https://excursions-api-server.azurewebsites.net/friends/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Send friend request error response:', errorData, 'status:', response.status);
      throw new Error(errorData.message || `Failed to send friend request (status: ${response.status})`);
    }
    const data = await response.json();
    console.log('Friend request response:', data);
    friendRequests.value.push(data.friendRequest || data);
    friendRequestForm.value.friendId = '';
    alert('Friend request sent successfully!');
  } catch (error) {
    console.error('Error sending friend request:', error);
    alert(`Error: ${error.message}`);
  }
};

const handleFriendRequest = async (requestId, isAccepted) => {
  try {
    const payload = { isAccepted };
    console.log('Handling friend request:', requestId, 'isAccepted:', isAccepted);
    const response = await fetch(`https://excursions-api-server.azurewebsites.net/friends/requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Handle friend request error response:', errorData);
      throw new Error(errorData.message || 'Failed to handle friend request');
    }
    await Promise.all([fetchFriendRequests(), fetchFriends()]);
    alert(`Friend request ${isAccepted ? 'accepted' : 'denied'} successfully!`);
  } catch (error) {
    console.error('Error handling friend request:', error);
    alert(`Error: ${error.message}`);
  }
};

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
      console.error('Delete friend request error response:', errorData);
      throw new Error(errorData.message || 'Failed to delete friend request');
    }
    friendRequests.value = friendRequests.value.filter(req => req._id !== requestId);
    alert('Friend request deleted successfully');
  } catch (error) {
    console.error('Error deleting friend request:', error);
    alert(`Error: ${error.message}`);
  }
};

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
      console.error('Delete friend error response:', errorData);
      throw new Error(errorData.message || 'Failed to delete friend');
    }
    friends.value = friends.value.filter(friend => friend._id !== friendId);
    alert('Friend removed successfully');
  } catch (error) {
    console.error('Error deleting friend:', error);
    alert(`Error: ${error.message}`);
  }
};

const openCreateExcursionModal = () => {
  if (!authStore.isAuthenticated) {
    alert('You need to be logged in to create an excursion.');
    router.push('/sign-in');
    return;
  }
  excursionForm.value = { name: '', description: '' };
  showCreateExcursionModal.value = true;
};

const closeCreateExcursionModal = () => {
  showCreateExcursionModal.value = false;
};

const openAddToExcursionModal = (trip) => {
  if (!authStore.isAuthenticated) {
    alert('You need to be logged in to add a trip to an excursion.');
    router.push('/sign-in');
    return;
  }
  selectedTrip.value = trip;
  addToExcursionForm.value.excursionId = '';
  showAddToExcursionModal.value = true;
};

const closeAddToExcursionModal = () => {
  showAddToExcursionModal.value = false;
  selectedTrip.value = null;
};

const openTripDetailsModal = (trip) => {
  selectedTrip.value = trip;
  showTripDetailsModal.value = true;
};

const closeTripDetailsModal = () => {
  showTripDetailsModal.value = false;
  selectedTrip.value = null;
};

const openGlobalInviteModal = (excursionId = '') => {
  if (!authStore.isAuthenticated) {
    alert('You need to be logged in to send an invite.');
    router.push('/sign-in');
    return;
  }
  console.log('Opening global invite modal, user:', JSON.stringify(authStore.user, null, 2));
  console.log('Excursions available:', JSON.stringify(excursions.value, null, 2));
  console.log('Friends available:', JSON.stringify(friends.value, null, 2));
  globalInviteForm.value = { excursionId, friendId: '' };
  showGlobalInviteModal.value = true;
};

const closeGlobalInviteModal = () => {
  showGlobalInviteModal.value = false;
};

const openInvitesModal = () => {
  if (!authStore.isAuthenticated) {
    alert('You need to be logged in to view invites.');
    router.push('/sign-in');
    return;
  }
  showInvitesModal.value = true;
};

const closeInvitesModal = () => {
  showInvitesModal.value = false;
};

const openManageFriendsModal = () => {
  if (!authStore.isAuthenticated) {
    alert('You need to be logged in to manage friends.');
    router.push('/sign-in');
    return;
  }
  friendRequestForm.value.friendId = '';
  fetchFriendRequests();
  showManageFriendsModal.value = true;
};

const closeManageFriendsModal = () => {
  showManageFriendsModal.value = false;
};

watch(() => authStore.isAuthenticated, async (newValue) => {
  if (newValue) {
    await Promise.all([
      fetchTrips(),
      fetchExcursions(),
      fetchInvites(),
      fetchFriends(),
      fetchFriendRequests()
    ]);
  } else {
    router.push('/sign-in');
  }
}, { immediate: true });
</script>

<template>
  <div class="container my-trips-vue">
    <aside class="sidebar">
      <div class="logo">ParkQuest</div>
      <nav class="nav">
        <router-link to="/dashboard">Home</router-link>
        <router-link to="/about">About Us</router-link>
      </nav>
    </aside>

    <main class="main-content">
      <header class="header">
        <h1>My Trips</h1>
        <p>Plan your next adventure and manage your excursions</p>
        <p v-if="authStore.user?._id" class="user-id">Your Friend ID: {{ authStore.user._id }}</p>
      </header>

      <section class="actions">
        <button @click="openCreateExcursionModal" class="btn btn-filled">Create New Excursion</button>
        <button @click="openInvitesModal" class="btn btn-filled">View Invites</button>
        <button @click="openManageFriendsModal" class="btn btn-filled">Manage Friends</button>
      </section>

      <section class="trip-list">
        <h2>Your Trips</h2>
        <div class="trip-grid">
          <div v-for="trip in trips" :key="trip._id || trip.id" class="trip-card">
            <h3>{{ trip.name || trip.trip?.name || 'Unnamed Trip' }}</h3>
            <p><strong>Park:</strong> {{ trip.park?.name || trip.park?.fullName || trip.park || trip.trip?.park?.name || trip.trip?.park || 'N/A' }}</p>
            <p><strong>Start Date:</strong> {{ (trip.startDate || trip.trip?.startDate) ? new Date(trip.startDate || trip.trip?.startDate).toLocaleDateString() : 'N/A' }}</p>
            <div class="trip-actions">
              <button @click="openTripDetailsModal(trip)" class="btn btn-outline">Details</button>
              <button @click="openAddToExcursionModal(trip)" class="btn btn-filled">Add to Excursion</button>
              <button @click="handleDeleteTrip(trip._id || trip.id)" class="btn btn-danger">Delete</button>
            </div>
          </div>
          <div v-if="trips.length === 0" class="no-trips">
            <p>No trips found. Create a new trip in the dashboard to get started!</p>
          </div>
        </div>
      </section>

      <section class="excursion-list">
        <h2>Your Excursions</h2>
        <div class="excursion-grid">
          <div v-for="excursion in excursions" :key="excursion._id || excursion.id" class="excursion-card">
            <h3>{{ excursion.name || excursion.excursion?.name || 'Unnamed Excursion' }}</h3>
            <p><strong>Trips:</strong> {{ excursion.trips?.length || excursion.excursion?.trips?.length || 0 }}</p>
            <p><strong>Participants:</strong> {{ excursion.participants?.length || excursion.excursion?.participants?.length || 1 }}</p>
            <div class="excursion-actions">
              <button v-if="!(excursion.host?._id === authStore.user?._id || excursion.host?.id === authStore.user?._id || excursion.host === authStore.user?._id)" @click="handleLeaveExcursion(excursion._id || excursion.id)" class="btn btn-outline">Leave</button>
              <button @click="openGlobalInviteModal(excursion._id || excursion.id)" class="btn btn-filled">Invite</button>
              <button @click="handleDeleteExcursion(excursion._id || excursion.id)" class="btn btn-danger">Delete</button>
            </div>
            <div v-if="excursion.host?._id === authStore.user?._id || excursion.host?.id === authStore.user?._id || excursion.host === authStore.user?._id">
              <h4>Participants</h4>
              <ul class="participant-list">
                <li v-for="user in (excursion.participants || excursion.excursion?.participants || [])" :key="user._id">
                  {{ user.email || user.userName || user._id }}
                  <button v-if="user._id !== authStore.user?._id" @click="handleRemoveUser(excursion._id || excursion.id, user._id)" class="btn btn-danger">Remove</button>
                </li>
              </ul>
              <h4>Pending Invites</h4>
              <ul class="invite-list">
                <li v-for="invite in invites.filter(i => i.excursion?._id === (excursion._id || excursion.id) && !i.isAccepted)" :key="invite._id">
                  {{ invite.receiver?.email || invite.receiver?.userName || invite.receiver?._id }}
                  <button @click="handleRevokeInvite(invite._id)" class="btn btn-danger">Revoke</button>
                </li>
                <li v-if="!invites.filter(i => i.excursion?._id === (excursion._id || excursion.id) && !i.isAccepted).length">No pending invites</li>
              </ul>
            </div>
          </div>
          <div v-if="excursions.length === 0" class="no-excursions">
            <p>No excursions found. Create a new excursion to get started!</p>
          </div>
        </div>
      </section>

      <div v-if="showCreateExcursionModal" class="modal-overlay">
        <div class="modal">
          <h2>Create a New Excursion</h2>
          <form @submit.prevent="handleCreateExcursion" class="excursion-form">
            <div class="form-group">
              <label for="excursionName">Excursion Name</label>
              <input type="text" id="excursionName" v-model="excursionForm.name" placeholder="Enter excursion name" required />
              <span class="error" v-if="excursionFormErrors.name">{{ excursionFormErrors.name }}</span>
            </div>
            <div class="form-group">
              <label for="excursionDescription">Description</label>
              <textarea id="excursionDescription" v-model="excursionForm.description" placeholder="Enter a description (optional)"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeCreateExcursionModal" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-filled" :disabled="!isExcursionFormValid">Create Excursion</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showAddToExcursionModal" class="modal-overlay">
        <div class="modal">
          <h2>Add Trip to Excursion</h2>
          <form @submit.prevent="handleAddToExcursion" class="excursion-form">
            <div class="form-group">
              <label for="excursionId">Select Excursion</label>
              <select id="excursionId" v-model="addToExcursionForm.excursionId" required>
                <option value="" disabled>Select an excursion</option>
                <option v-for="excursion in excursions" :key="excursion._id || excursion.id" :value="excursion._id || excursion.id">
                  {{ excursion.name || excursion.excursion?.name || 'Unnamed Excursion' }}
                </option>
                <option v-if="!excursions.length" disabled>No excursions available</option>
              </select>
              <span v-if="!excursions.length" class="error">No excursions available. Create one first.</span>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeAddToExcursionModal" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-filled">Add to Excursion</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showTripDetailsModal" class="modal-overlay">
        <div class="modal">
          <h2>{{ selectedTrip?.name || selectedTrip?.trip?.name || 'Unnamed Trip' }}</h2>
          <p><strong>Description:</strong> {{ selectedTrip?.description || selectedTrip?.trip?.description || 'N/A' }}</p>
          <p><strong>Start Date:</strong> {{ (selectedTrip?.startDate || selectedTrip?.trip?.startDate) ? new Date(selectedTrip.startDate || selectedTrip.trip?.startDate).toLocaleDateString() : 'N/A' }}</p>
          <p><strong>End Date:</strong> {{ (selectedTrip?.endDate || selectedTrip?.trip?.endDate) ? new Date(selectedTrip.endDate || selectedTrip.trip?.endDate).toLocaleDateString() : 'N/A' }}</p>
          <p><strong>Park:</strong> {{ selectedTrip?.park?.name || selectedTrip?.park?.fullName || selectedTrip?.park || selectedTrip?.trip?.park?.name || selectedTrip?.trip?.park || 'N/A' }}</p>
          <p><strong>Campground:</strong> {{ selectedTrip?.campground || selectedTrip?.trip?.campground || 'N/A' }}</p>
          <p><strong>Things to Do:</strong> {{ (selectedTrip?.thingstodo || selectedTrip?.trip?.thingstodo)?.length ? (selectedTrip?.thingstodo || selectedTrip?.trip?.thingstodo).join(', ') : 'None' }}</p>
          <div class="modal-actions">
            <button @click="closeTripDetailsModal" class="btn btn-outline">Close</button>
          </div>
        </div>
      </div>

      <div v-if="showGlobalInviteModal" class="modal-overlay">
        <div class="modal">
          <h2>Invite to Excursion</h2>
          <form @submit.prevent="handleSendInvite" class="excursion-form">
            <div class="form-group">
              <label for="globalExcursionId">Excursion</label>
              <input v-if="globalInviteForm.excursionId" type="text" id="globalExcursionId" :value="excursions.find(exc => (exc._id || exc.id) === globalInviteForm.excursionId)?.name || 'Unnamed Excursion'" readonly/>
              <select v-else id="globalExcursionId" v-model="globalInviteForm.excursionId" required>
                <option value="" disabled>Select an excursion</option>
                <option v-for="excursion in excursions" :key="excursion._id || excursion.id" :value="excursion._id || excursion.id">
                  {{ excursion.name || excursion.excursion?.name || 'Unnamed Excursion' }}
                </option>
                <option v-if="!excursions.length" disabled>No excursions available</option>
              </select>
              <span class="error" v-if="globalInviteFormErrors.excursionId">{{ globalInviteFormErrors.excursionId }}</span>
              <span v-if="!excursions.length && !globalInviteForm.excursionId" class="error">No excursions available. Create one first.</span>
            </div>
            <div class="form-group">
              <label for="friendId">Select Friend</label>
              <select id="friendId" v-model="globalInviteForm.friendId" required>
                <option value="" disabled>Select a friend</option>
                <option v-for="friend in friends" :key="friend._id" :value="friend._id">
                  {{ friend.userName || friend.email || friend._id || 'Unknown Friend' }}
                </option>
                <option v-if="!friends.length" disabled>No friends available</option>
              </select>
              <span class="error" v-if="globalInviteFormErrors.friendId">{{ globalInviteFormErrors.friendId }}</span>
              <span v-if="!friends.length" class="error">Add friends in Manage Friends first.</span>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeGlobalInviteModal" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-filled" :disabled="!isGlobalInviteFormValid">Send Invite</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showInvitesModal" class="modal-overlay">
        <div class="modal">
          <h2>Your Invitations</h2>
          <div v-if="invites.length === 0" class="no-invites">
            <p>No pending invitations.</p>
          </div>
          <ul class="invite-list">
            <li v-for="invite in invites" :key="invite._id">
              <p><strong>Excursion:</strong> {{ invite.excursion?.name || 'Unnamed Excursion' }}</p>
              <p><strong>Invited by:</strong> {{ invite.sender?.email || invite.sender?.userName || 'N/A' }}</p>
              <div class="invite-actions">
                <button @click="handleAcceptInvite(invite._id)" class="btn btn-filled">Accept</button>
                <button @click="handleDenyInvite(invite._id)" class="btn btn-danger">Deny</button>
              </div>
            </li>
          </ul>
          <div class="modal-actions">
            <button @click="closeInvitesModal" class="btn btn-outline">Close</button>
          </div>
        </div>
      </div>

      <div v-if="showManageFriendsModal" class="modal-overlay">
        <div class="modal">
          <h2>Manage Friends</h2>
          <h3>Current Friends</h3>
          <ul class="friend-list">
            <li v-for="friend in friends" :key="friend._id">
              {{ friend.userName || friend.email || friend._id }}
              <button @click="handleDeleteFriend(friend._id)" class="btn btn-danger">Remove</button>
            </li>
            <li v-if="friends.length === 0">No friends found.</li>
          </ul>
          <h3>Send Friend Request</h3>
          <form @submit.prevent="handleSendFriendRequest" class="excursion-form">
            <div class="form-group">
              <label for="friendId">Friend ID</label>
              <input type="text" id="friendId" v-model="friendRequestForm.friendId" placeholder="Enter friend ID" required />
              <span class="error" v-if="friendRequestFormErrors.friendId">{{ friendRequestFormErrors.friendId }}</span>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn-filled" :disabled="!isFriendRequestFormValid">Send Request</button>
            </div>
          </form>
          <h3>Pending Friend Requests</h3>
          <ul class="friend-request-list">
            <li v-for="request in friendRequests" :key="request._id">
              <p><strong>{{ request.sender?._id === authStore.user?._id ? 'Sent to' : 'Received from' }}:</strong> {{ request.sender?._id === authStore.user?._id ? request.receiver?.email || request.receiver?.userName || request.receiver?._id : request.sender?.email || request.sender?.userName || request.sender?._id }}</p>
              <div class="friend-request-actions">
                <button v-if="request.sender?._id !== authStore.user?._id && !request.isAccepted" @click="handleFriendRequest(request._id, true)" class="btn btn-filled">Accept</button>
                <button v-if="request.sender?._id !== authStore.user?._id && !request.isAccepted" @click="handleFriendRequest(request._id, false)" class="btn btn-danger">Deny</button>
                <button @click="handleDeleteFriendRequest(request._id)" class="btn btn-outline">Delete</button>
              </div>
            </li>
            <li v-if="friendRequests.length === 0">No pending friend requests.</li>
          </ul>
          <div class="modal-actions">
            <button @click="closeManageFriendsModal" class="btn btn-outline">Close</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
