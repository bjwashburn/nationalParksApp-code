<!-- eslint-disable vue/no-side-effects-in-computed-properties -->
<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const parkLimit = ref(50); // Default limit, adjust as needed
const parkStart = ref(0);  // Default start
const parkSearch = ref('');

// Modal visibility states
const showDropdown = ref(false);
const showCreateExcursionModal = ref(false);
const showCreateTripModal = ref(false); // New modal for standalone trip creation
const showAddTripToExcursionModal = ref(false);
const showAddToExcursionModal = ref(false);
const showTripDetailsModal = ref(false);
const showExcursionDetailsModal = ref(false);
const showInviteModal = ref(false);
const showInvitesModal = ref(false);

const thingstodoInput = ref('');
const trips = ref([]);
const excursions = ref([]);
const parkResults = ref([]);
const selectedTrip = ref(null);
const selectedExcursion = ref(null);
const excursionInvites = ref([]);
const inviteForm = ref({ friendId: '' });

// Park search states
const parkSearchQuery = ref('');
const filteredParks = computed(() => {
    if (!parkSearchQuery.value) return parkResults.value;
    const query = parkSearchQuery.value.toLowerCase();
    return parkResults.value.filter(park =>
        (park.name || park.fullName || '').toLowerCase().includes(query)
    );
});

// Form states
const tripForm = ref({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    park: '',
    campground: '',
    thingstodo: [],
});
const excursionForm = ref({
    name: '',
    description: '',
    trips: [],
});
const addToExcursionForm = ref({
    excursionId: '',
    tripId: '',
});

// Form validation errors
const tripFormErrors = ref({
    name: '',
    startDate: '',
    endDate: '',
    park: '',
    campground: '',
    thingstodo: '',
    dates: '',
});

// Watch thingstodoInput
watch(thingstodoInput, (newValue) => {
    if (newValue) {
        tripForm.value.thingstodo = newValue.split(',').map(id => id.trim()).filter(id => id.length > 0);
    } else {
        tripForm.value.thingstodo = [];
    }
});

// Form validation
const isTripFormValid = computed(() => {
    tripFormErrors.value = {
        name: '',
        startDate: '',
        endDate: '',
        park: '',
        campground: '',
        thingstodo: '',
        dates: '',
    };

    const nameValid = tripForm.value.name && tripForm.value.name.trim().length >= 1 && tripForm.value.name.trim().length <= 128;
    const startDateValid = !!tripForm.value.startDate;
    const endDateValid = !!tripForm.value.endDate;
    const parkValid = !!tripForm.value.park && /^[0-9a-fA-F-]+$/.test(tripForm.value.park);
    const campgroundValid = !tripForm.value.campground || /^[0-9a-fA-F-]+$/.test(tripForm.value.campground);
    const thingstodoValid = Array.isArray(tripForm.value.thingstodo) && tripForm.value.thingstodo.every(id => /^[0-9a-fA-F-]+$/.test(id));
    const datesValid = startDateValid && endDateValid && new Date(tripForm.value.endDate) > new Date(tripForm.value.startDate);

    if (!nameValid) tripFormErrors.value.name = 'Name must be between 1 and 128 characters';
    if (!startDateValid) tripFormErrors.value.startDate = 'Start date is required';
    if (!endDateValid) tripFormErrors.value.endDate = 'End date is required';
    if (!parkValid) tripFormErrors.value.park = 'Please select a valid park';
    if (!campgroundValid) tripFormErrors.value.campground = 'Campground ID must be a valid UUID if provided';
    if (!thingstodoValid) tripFormErrors.value.thingstodo = 'Things to do must be valid UUIDs';
    if (!datesValid) tripFormErrors.value.dates = 'End date must be after start date';

    return nameValid && startDateValid && endDateValid && parkValid && campgroundValid && thingstodoValid && datesValid;
});

const isExcursionFormValid = computed(() => {
    return excursionForm.value.name && excursionForm.value.name.trim().length >= 1;
});

const profileInitial = computed(() => {
    return authStore.user?.email?.charAt(0).toUpperCase() || 'U';
});

// Modal toggles
const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const openCreateExcursionModal = () => {
    showCreateExcursionModal.value = true;
    excursionForm.value = { name: '', description: '', trips: [] };
};

const openCreateTripModal = async () => {
    if (!authStore.isAuthenticated) {
        alert('You need to be logged in to create a trip.');
        router.push('/sign-in');
        return;
    }

    if (parkResults.value.length === 0) {
        await fetchParks();
    }

    if (parkResults.value.length === 0) {
        alert('No parks available to select. Please try again later.');
        return;
    }

    showCreateTripModal.value = true;
    tripForm.value = {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        park: '',
        campground: '',
        thingstodo: [],
    };
    parkSearchQuery.value = ''; // Reset search query
};

const openAddTripToExcursionModal = async (excursion) => {
    selectedExcursion.value = excursion;
    if (parkResults.value.length === 0) await fetchParks();
    if (parkResults.value.length === 0) {
        alert('No parks available to select.');
        return;
    }
    showAddTripToExcursionModal.value = true;
    tripForm.value = { name: '', description: '', startDate: '', endDate: '', park: '', campground: '', thingstodo: [] };
};

const openAddToExcursionModal = (trip) => {
    showAddToExcursionModal.value = true;
    addToExcursionForm.value.tripId = trip._id;
};

const openTripDetailsModal = (trip) => {
    selectedTrip.value = trip;
    showTripDetailsModal.value = true;
};

const openExcursionDetailsModal = (excursion) => {
    selectedExcursion.value = excursion;
    showExcursionDetailsModal.value = true;
};

const openInviteModal = (excursion) => {
    selectedExcursion.value = excursion;
    showInviteModal.value = true;
    inviteForm.value.friendId = '';
};

const openInvitesModal = async () => {
    await fetchInvites();
    showInvitesModal.value = true;
};

const closeCreateTripModal = () => {
    showCreateTripModal.value = false;
};

const closeAddTripToExcursionModal = () => {
    showAddTripToExcursionModal.value = false;
    selectedExcursion.value = null;
};

const closeCreateExcursionModal = () => {
    showCreateExcursionModal.value = false;
};

const closeAddToExcursionModal = () => {
    showAddToExcursionModal.value = false;
};

const closeTripDetailsModal = () => {
    showTripDetailsModal.value = false;
    selectedTrip.value = null;
};

const closeExcursionDetailsModal = () => {
    showExcursionDetailsModal.value = false;
    selectedExcursion.value = null;
};

const closeInviteModal = () => {
    showInviteModal.value = false;
    selectedExcursion.value = null;
};

const closeInvitesModal = () => {
    showInvitesModal.value = false;
};

// Sign out
const handleSignOut = () => {
    showDropdown.value = false;
    authStore.signOut();
    router.push('/sign-in');
};

const fetchParks = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch parks');
        alert('You need to be logged in to fetch parks.');
        router.push('/sign-in');
        return;
    }

    try {
        console.log('Fetching parks with token:', authStore.token, `limit=${parkLimit.value}&start=${parkStart.value}&q=${parkSearch.value}`);
        const response = await fetch(
            `https://excursions-api-server.azurewebsites.net/national-parks?limit=${parkLimit.value}&start=${parkStart.value}&q=${parkSearch.value}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch parks error response:', errorData);
            throw new Error(errorData.message || 'Failed to fetch parks');
        }

        const data = await response.json();
        console.log('Raw parks data from API:', data);
        parkResults.value = data.data || [];
    } catch (error) {
        console.error('Error fetching parks:', error);
        alert(error.message || 'Failed to fetch parks.');
        parkResults.value = [];
    }
};

// Select park
const selectPark = (park) => {
    tripForm.value.park = park._id || park.id || park.parkId || park.parkCode;
    parkSearchQuery.value = '';
};

// Create standalone trip
const handleCreateTrip = async () => {
    try {
        if (!isTripFormValid.value) {
            throw new Error('Please fix the form errors before submitting.');
        }

        const payload = {
            name: tripForm.value.name.trim(),
            description: tripForm.value.description?.trim() || '',
            startDate: new Date(tripForm.value.startDate).toISOString(),
            endDate: new Date(tripForm.value.endDate).toISOString(),
            park: tripForm.value.park,
            campground: tripForm.value.campground || undefined,
            thingstodo: tripForm.value.thingstodo.length > 0 ? tripForm.value.thingstodo : undefined,
        };

        const response = await fetch('https://excursions-api-server.azurewebsites.net/trip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create trip');
        }
        const { trip: newTrip } = await response.json();
        trips.value.push(newTrip);
        closeCreateTripModal();
        alert('Trip created successfully!');
    } catch (error) {
        console.error('Error creating trip:', error);
        alert(`Error: ${error.message}`);
    }
};

// Create trip and add to excursion
const handleCreateTripAndAddToExcursion = async () => {
    if (!selectedExcursion.value) {
        alert('No excursion selected.');
        return;
    }
    try {
        if (!isTripFormValid.value) {
            throw new Error('Please fix the form errors before submitting.');
        }

        const payload = {
            name: tripForm.value.name.trim(),
            description: tripForm.value.description?.trim() || '',
            startDate: new Date(tripForm.value.startDate).toISOString(),
            endDate: new Date(tripForm.value.endDate).toISOString(),
            park: tripForm.value.park,
            campground: tripForm.value.campground || undefined,
            thingstodo: tripForm.value.thingstodo.length > 0 ? tripForm.value.thingstodo : undefined,
        };

        const response = await fetch('https://excursions-api-server.azurewebsites.net/trip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create trip');
        }
        const { trip: newTrip } = await response.json();

        // Add the trip to the excursion
        const excursionId = selectedExcursion.value._id || selectedExcursion.value.id;
        const updateResponse = await fetch(`https://excursions-api-server.azurewebsites.net/excursion/${excursionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ trips: [...(selectedExcursion.value.trips || []), newTrip._id] }),
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to add trip to excursion');
        }
        const updatedExcursion = await updateResponse.json();

        const index = excursions.value.findIndex(exc => (exc._id || exc.id) === excursionId);
        if (index !== -1) excursions.value[index] = updatedExcursion;

        trips.value.push(newTrip);
        closeAddTripToExcursionModal();
        alert('Trip created and added to excursion successfully!');
    } catch (error) {
        console.error('Error creating trip:', error);
        alert(`Error: ${error.message}`);
    }
};

// Fetch trips
const fetchTrips = async () => {
    if (!authStore.token) return;
    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/trips', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch trips');
        trips.value = await response.json() || [];
    } catch (error) {
        console.error('Error fetching trips:', error);
        alert('Failed to fetch trips.');
        trips.value = [];
    }
};

// Fetch excursions
const fetchExcursions = async () => {
    if (!authStore.token) return;
    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/excursions', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch excursions');
        }
        const data = await response.json();
        const excursionsData = data.excursion || data;
        const normalizedExcursions = (Array.isArray(excursionsData) ? excursionsData : []).map(excursion => {
            if (excursion.title && !excursion.name) {
                excursion.name = excursion.title;
                delete excursion.title;
            }
            if (Array.isArray(excursion.host) && excursion.host.length > 0) {
                excursion.host = excursion.host[0];
            } else if (!excursion.host) {
                excursion.host = { _id: authStore.user?._id || 'unknown' };
            }
            return excursion;
        }).filter(excursion => excursion._id || excursion.id);

        excursions.value = normalizedExcursions;
    } catch (error) {
        console.error('Error fetching excursions:', error);
        alert('Failed to fetch excursions.');
    }
};

// Create excursion
const handleCreateExcursion = async () => {
    try {
        if (!isExcursionFormValid.value) throw new Error('Excursion name is required');
        const payload = {
            name: excursionForm.value.name,
            description: excursionForm.value.description || '',
            trips: [],
        };
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
            throw new Error(errorData.message || 'Failed to create excursion');
        }
        const newExcursionData = await response.json();
        const newExcursion = newExcursionData.excursion?.[0];
        if (!newExcursion) throw new Error('Invalid response format');

        if (newExcursion.title && !newExcursion.name) {
            newExcursion.name = newExcursion.title;
            delete newExcursion.title;
        }
        if (Array.isArray(newExcursion.host) && newExcursion.host.length > 0) {
            newExcursion.host = newExcursion.host[0];
        } else if (!newExcursion.host) {
            newExcursion.host = { _id: authStore.user?._id || 'unknown' };
        }

        excursions.value.push(newExcursion);
        closeCreateExcursionModal();
        alert('Excursion created successfully');
    } catch (error) {
        console.error('Error creating excursion:', error);
        alert('Failed to create excursion.');
    }
};

// Add existing trip to excursion
const handleAddToExcursion = async () => {
    try {
        if (!addToExcursionForm.value.excursionId) throw new Error('Please select an excursion');
        const selectedExcursion = excursions.value.find(exc => (exc._id || exc.id) === addToExcursionForm.value.excursionId);
        const payload = { trips: [...(selectedExcursion.trips || []), addToExcursionForm.value.tripId] };
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/excursion/${addToExcursionForm.value.excursionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to add trip to excursion');
        const updatedExcursion = await response.json();
        const index = excursions.value.findIndex(exc => (exc._id || exc.id) === addToExcursionForm.value.excursionId);
        if (index !== -1) excursions.value[index] = updatedExcursion;
        closeAddToExcursionModal();
        alert('Trip added to excursion successfully');
    } catch (error) {
        console.error('Error adding trip to excursion:', error);
        alert('Failed to add trip to excursion.');
    }
};

// Delete trip
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
        if (!response.ok) throw new Error('Failed to delete trip');
        trips.value = trips.value.filter(trip => trip._id !== tripId);
        await fetchExcursions();
        alert('Trip deleted successfully');
    } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip.');
    }
};

// Delete excursion
const handleDeleteExcursion = async (excursion) => {
    if (!confirm('Are you sure you want to delete this excursion?')) return;
    try {
        const excursionId = excursion._id || excursion.id;
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/excursion/${excursionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete excursion');
        excursions.value = excursions.value.filter(exc => (exc._id || exc.id) !== excursionId);
        alert('Excursion deleted successfully');
    } catch (error) {
        console.error('Error deleting excursion:', error);
        alert('Failed to delete excursion.');
    }
};

// Fetch invites
const fetchInvites = async () => {
    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/share/excursions', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch invites');
        const data = await response.json();
        excursionInvites.value = data.excursionInvites || [];
    } catch (error) {
        console.error('Error fetching invites:', error);
        alert('Failed to fetch invites.');
    }
};

// Send invite
const handleSendInvite = async () => {
    try {
        if (!inviteForm.value.friendId) throw new Error('Friend ID is required');
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursion/${selectedExcursion.value._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ friendId: inviteForm.value.friendId }),
        });
        if (!response.ok) throw new Error('Failed to send invite');
        alert('Invite sent successfully');
        closeInviteModal();
    } catch (error) {
        console.error('Error sending invite:', error);
        alert('Failed to send invite.');
    }
};

// Revoke invite
const handleRevokeInvite = async (inviteId) => {
    if (!confirm('Are you sure you want to revoke this invite?')) return;
    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursions/${inviteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to revoke invite');
        excursionInvites.value = excursionInvites.value.filter(invite => invite._id !== inviteId);
        alert('Invite revoked successfully');
    } catch (error) {
        console.error('Error revoking invite:', error);
        alert('Failed to revoke invite.');
    }
};

// Handle invite
const handleInvite = async (inviteId, isAccepted) => {
    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/share/excursions/${inviteId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ isAccepted }),
        });
        if (!response.ok) throw new Error(`Failed to ${isAccepted ? 'accept' : 'deny'} invite`);
        excursionInvites.value = excursionInvites.value.filter(invite => invite._id !== inviteId);
        if (isAccepted) await fetchExcursions();
        alert(`Invite ${isAccepted ? 'accepted' : 'denied'} successfully`);
    } catch (error) {
        console.error(`Error ${isAccepted ? 'accepting' : 'denying'} invite:`, error);
        alert(`Failed to ${isAccepted ? 'accept' : 'deny'} invite.`);
    }
};

// Remove user from excursion
const handleRemoveUser = async (excursionId, userId) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/remove/excursions/${excursionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error('Failed to remove user');
        await fetchExcursions();
        alert('User removed successfully');
    } catch (error) {
        console.error('Error removing user:', error);
        alert('Failed to remove user.');
    }
};

// Leave excursion
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
        if (!response.ok) throw new Error('Failed to leave excursion');
        excursions.value = excursions.value.filter(exc => (exc._id || exc.id) !== excursionId);
        alert('You have left the excursion');
    } catch (error) {
        console.error('Error leaving excursion:', error);
        alert('Failed to leave excursion.');
    }
};

// Initialize data
watch(() => authStore.isAuthenticated, (newValue) => {
    if (newValue) {
        fetchParks();
        fetchTrips();
        fetchExcursions();
        fetchInvites();
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
              <h1>My Trips</h1>
              <p>Plan your next adventure and manage your excursions</p>
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
                  <button @click="openInvitesModal" class="dropdown-item">View Invites</button>
                  <button @click="handleSignOut" class="dropdown-item">Sign Out</button>
              </div>
          </div>

          <!-- Excursion Actions -->
          <section class="excursion-actions">
              <button @click="openCreateExcursionModal" class="btn btn-filled">Create New Excursion</button>
              <button @click="openCreateTripModal" class="btn btn-filled">Create New Trip</button>
          </section>

          <!-- Display Excursions -->
          <section class="excursion-list">
              <h2>Your Excursions</h2>
              <div class="excursion-grid">
                  <div v-for="excursion in excursions" :key="excursion._id || excursion.id" class="excursion-card">
                      <h3>{{ excursion.name || 'Unnamed Excursion' }}</h3>
                      <p><strong>Trips:</strong> {{ excursion.trips?.length || 0 }}</p>
                      <div class="excursion-actions">
                          <button @click="openExcursionDetailsModal(excursion)" class="btn btn-outline">Details</button>
                          <button @click="openAddTripToExcursionModal(excursion)" class="btn btn-filled">Add Trip</button>
                          <button @click="openInviteModal(excursion)" class="btn btn-filled">Invite Friend</button>
                          <button
                              v-if="excursion.host?._id === authStore.user?._id || !excursion.host"
                              @click="handleDeleteExcursion(excursion)"
                              class="btn btn-danger"
                          >
                              Delete
                          </button>
                          <button
                              v-else
                              @click="handleLeaveExcursion(excursion._id)"
                              class="btn btn-danger"
                          >
                              Leave
                          </button>
                      </div>
                  </div>
                  <div v-if="excursions.length === 0" class="no-excursions">
                      <p>No excursions found. Create a new excursion to get started!</p>
                  </div>
              </div>
          </section>

          <!-- Display Trips -->
          <section class="trip-list">
              <h2>Your Trips</h2>
              <div class="trip-grid">
                  <div v-for="trip in trips" :key="trip._id" class="trip-card">
                      <h3>{{ trip.name || 'Unnamed Trip' }}</h3>
                      <p><strong>Park:</strong> {{ trip.park || 'N/A' }}</p>
                      <p><strong>Start Date:</strong> {{ trip.startDate || 'N/A' }}</p>
                      <div class="trip-actions">
                          <button @click="openTripDetailsModal(trip)" class="btn btn-outline">Details</button>
                          <button @click="openAddToExcursionModal(trip)" class="btn btn-filled">Add to Excursion</button>
                          <button @click="handleDeleteTrip(trip._id)" class="btn btn-danger">Delete</button>
                      </div>
                  </div>
                  <div v-if="trips.length === 0" class="no-trips">
                      <p>No trips found. Create a new trip to get started!</p>
                  </div>
              </div>
          </section>

          <!-- Create Excursion Modal -->
          <div v-if="showCreateExcursionModal" class="modal-overlay">
              <div class="modal">
                  <h2>Create a New Excursion</h2>
                  <form @submit.prevent="handleCreateExcursion" class="excursion-form">
                      <div class="form-group">
                          <label for="excursionName">Excursion Name</label>
                          <input type="text" id="excursionName" v-model="excursionForm.name" placeholder="Enter excursion name" required />
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

          <!-- Create Trip Modal -->
          <div v-if="showCreateTripModal" class="modal-overlay">
              <div class="modal">
                  <h2>Create a New Trip</h2>
                  <form @submit.prevent="handleCreateTrip" class="trip-form">
                      <div class="form-group">
                          <label for="tripName">Trip Name</label>
                          <input type="text" id="tripName" v-model="tripForm.name" placeholder="Enter trip name" required />
                          <span class="error" v-if="tripFormErrors.name">{{ tripFormErrors.name }}</span>
                      </div>
                      <div class="form-group">
                          <label for="description">Description</label>
                          <textarea id="description" v-model="tripForm.description" placeholder="Enter a description (optional)"></textarea>
                      </div>
                      <div class="form-group">
                          <label for="startDate">Start Date</label>
                          <input type="datetime-local" id="startDate" v-model="tripForm.startDate" required />
                          <span class="error" v-if="tripFormErrors.startDate">{{ tripFormErrors.startDate }}</span>
                      </div>
                      <div class="form-group">
                          <label for="endDate">End Date</label>
                          <input type="datetime-local" id="endDate" v-model="tripForm.endDate" required />
                          <span class="error" v-if="tripFormErrors.endDate">{{ tripFormErrors.endDate }}</span>
                          <span class="error" v-if="tripFormErrors.dates">{{ tripFormErrors.dates }}</span>
                      </div>
                      <div class="form-group">
                          <label for="parkSearch">Search Parks</label>
                          <input
                              type="text"
                              id="parkSearch"
                              v-model="parkSearchQuery"
                              placeholder="Search for a park..."
                          />
                          <div class="park-list" v-if="filteredParks.length > 0">
                              <div
                                  v-for="park in filteredParks"
                                  :key="park._id || park.id || park.parkId || park.parkCode"
                                  class="park-item"
                                  @click="selectPark(park)"
                              >
                                  {{ park.name || park.fullName || 'Unnamed Park' }}
                              </div>
                          </div>
                          <div v-else-if="parkSearchQuery" class="no-results">
                              No parks found matching "{{ parkSearchQuery }}".
                          </div>
                          <span class="error" v-if="tripFormErrors.park">{{ tripFormErrors.park }}</span>
                      </div>
                      <div class="form-group">
                          <label for="campground">Select Campground (Optional)</label>
                          <input type="text" id="campground" v-model="tripForm.campground" placeholder="Enter campground ID (optional)" />
                          <span class="error" v-if="tripFormErrors.campground">{{ tripFormErrors.campground }}</span>
                      </div>
                      <div class="form-group">
                          <label for="thingstodo">Things to Do (Optional, comma-separated IDs)</label>
                          <input type="text" id="thingstodo" v-model="thingstodoInput" placeholder="Enter thingstodo IDs (e.g., id1,id2,id3)" />
                          <span class="error" v-if="tripFormErrors.thingstodo">{{ tripFormErrors.thingstodo }}</span>
                      </div>
                      <div class="modal-actions">
                          <button type="button" @click="closeCreateTripModal" class="btn btn-outline">Cancel</button>
                          <button type="submit" class="btn btn-filled" :disabled="!isTripFormValid">Create Trip</button>
                      </div>
                  </form>
              </div>
          </div>

          <!-- Add Trip to Excursion Modal -->
          <div v-if="showAddTripToExcursionModal" class="modal-overlay">
              <div class="modal">
                  <h2>Add a New Trip to {{ selectedExcursion?.name || 'Unnamed Excursion' }}</h2>
                  <form @submit.prevent="handleCreateTripAndAddToExcursion" class="trip-form">
                      <div class="form-group">
                          <label for="tripName">Trip Name</label>
                          <input type="text" id="tripName" v-model="tripForm.name" placeholder="Enter trip name" required />
                          <span class="error" v-if="tripFormErrors.name">{{ tripFormErrors.name }}</span>
                      </div>
                      <div class="form-group">
                          <label for="description">Description</label>
                          <textarea id="description" v-model="tripForm.description" placeholder="Enter a description (optional)"></textarea>
                      </div>
                      <div class="form-group">
                          <label for="startDate">Start Date</label>
                          <input type="datetime-local" id="startDate" v-model="tripForm.startDate" required />
                          <span class="error" v-if="tripFormErrors.startDate">{{ tripFormErrors.startDate }}</span>
                      </div>
                      <div class="form-group">
                          <label for="endDate">End Date</label>
                          <input type="datetime-local" id="endDate" v-model="tripForm.endDate" required />
                          <span class="error" v-if="tripFormErrors.endDate">{{ tripFormErrors.endDate }}</span>
                          <span class="error" v-if="tripFormErrors.dates">{{ tripFormErrors.dates }}</span>
                      </div>
                      <div class="form-group">
                          <label for="parkSearch">Search Parks</label>
                          <input
                              type="text"
                              id="parkSearch"
                              v-model="parkSearchQuery"
                              placeholder="Search for a park..."
                          />
                          <div class="park-list" v-if="filteredParks.length > 0">
                              <div
                                  v-for="park in filteredParks"
                                  :key="park._id || park.id || park.parkId || park.parkCode"
                                  class="park-item"
                                  @click="selectPark(park)"
                              >
                                  {{ park.name || park.fullName || 'Unnamed Park' }}
                              </div>
                          </div>
                          <div v-else-if="parkSearchQuery" class="no-results">
                              No parks found matching "{{ parkSearchQuery }}".
                          </div>
                          <span class="error" v-if="tripFormErrors.park">{{ tripFormErrors.park }}</span>
                      </div>
                      <div class="form-group">
                          <label for="campground">Select Campground (Optional)</label>
                          <input type="text" id="campground" v-model="tripForm.campground" placeholder="Enter campground ID (optional)" />
                          <span class="error" v-if="tripFormErrors.campground">{{ tripFormErrors.campground }}</span>
                      </div>
                      <div class="form-group">
                          <label for="thingstodo">Things to Do (Optional, comma-separated IDs)</label>
                          <input type="text" id="thingstodo" v-model="thingstodoInput" placeholder="Enter thingstodo IDs (e.g., id1,id2,id3)" />
                          <span class="error" v-if="tripFormErrors.thingstodo">{{ tripFormErrors.thingstodo }}</span>
                      </div>
                      <div class="modal-actions">
                          <button type="button" @click="closeAddTripToExcursionModal" class="btn btn-outline">Cancel</button>
                          <button type="submit" class="btn btn-filled" :disabled="!isTripFormValid">Create and Add Trip</button>
                      </div>
                  </form>
              </div>
          </div>

          <!-- Add to Excursion Modal -->
          <div v-if="showAddToExcursionModal" class="modal-overlay">
              <div class="modal">
                  <h2>Add Trip to Excursion</h2>
                  <form @submit.prevent="handleAddToExcursion" class="excursion-form">
                      <div class="form-group">
                          <label for="excursion">Select Excursion</label>
                          <select id="excursion" v-model="addToExcursionForm.excursionId" required>
                              <option value="">Select an excursion</option>
                              <option v-for="excursion in excursions" :key="excursion._id || excursion.id" :value="excursion._id || excursion.id">
                                  {{ excursion.name || 'Unnamed Excursion' }}
                              </option>
                          </select>
                      </div>
                      <div class="modal-actions">
                          <button type="button" @click="closeAddToExcursionModal" class="btn btn-outline">Cancel</button>
                          <button type="submit" class="btn btn-filled">Add to Excursion</button>
                      </div>
                  </form>
              </div>
          </div>

          <!-- Trip Details Modal -->
          <div v-if="showTripDetailsModal" class="modal-overlay">
              <div class="modal">
                  <h2>{{ selectedTrip?.name || 'Unnamed Trip' }}</h2>
                  <p><strong>Description:</strong> {{ selectedTrip?.description || 'N/A' }}</p>
                  <p><strong>Start Date:</strong> {{ selectedTrip?.startDate || 'N/A' }}</p>
                  <p><strong>End Date:</strong> {{ selectedTrip?.endDate || 'N/A' }}</p>
                  <p><strong>Park:</strong> {{ selectedTrip?.park || 'N/A' }}</p>
                  <p><strong>Campground:</strong> {{ selectedTrip?.campground || 'N/A' }}</p>
                  <p><strong>Things to Do:</strong> {{ selectedTrip?.thingstodo?.length ? selectedTrip.thingstodo.join(', ') : 'None' }}</p>
                  <button @click="closeTripDetailsModal" class="btn btn-outline">Close</button>
              </div>
          </div>

          <!-- Excursion Details Modal -->
          <div v-if="showExcursionDetailsModal" class="modal-overlay">
              <div class="modal">
                  <h2>{{ selectedExcursion?.name || 'Unnamed Excursion' }}</h2>
                  <p><strong>Description:</strong> {{ selectedExcursion?.description || 'N/A' }}</p>
                  <p><strong>Trips:</strong> {{ selectedExcursion?.trips?.length || 0 }}</p>
                  <p><strong>Completed:</strong> {{ selectedExcursion?.isComplete ? 'Yes' : 'No' }}</p>
                  <div v-if="selectedExcursion?.host._id === authStore.user._id">
                      <h3>Participants</h3>
                      <ul class="participant-list">
                          <li v-for="participant in selectedExcursion.participants" :key="participant._id">
                              {{ participant.userName }}
                              <button @click="handleRemoveUser(selectedExcursion._id, participant._id)" class="btn btn-danger btn-small">Remove</button>
                          </li>
                      </ul>
                  </div>
                  <button @click="closeExcursionDetailsModal" class="btn btn-outline">Close</button>
              </div>
          </div>

          <!-- Invite Modal -->
          <div v-if="showInviteModal" class="modal-overlay">
              <div class="modal">
                  <h2>Invite a Friend to {{ selectedExcursion?.name }}</h2>
                  <form @submit.prevent="handleSendInvite" class="excursion-form">
                      <div class="form-group">
                          <label for="friendId">Friend ID</label>
                          <input type="text" id="friendId" v-model="inviteForm.friendId" placeholder="Enter friend ID" required />
                      </div>
                      <div class="modal-actions">
                          <button type="button" @click="closeInviteModal" class="btn btn-outline">Cancel</button>
                          <button type="submit" class="btn btn-filled">Send Invite</button>
                      </div>
                  </form>
              </div>
          </div>

          <!-- View Invites Modal -->
          <div v-if="showInvitesModal" class="modal-overlay">
              <div class="modal">
                  <h2>Your Invites</h2>
                  <div class="invite-list">
                      <div v-for="invite in excursionInvites" :key="invite._id" class="invite-item">
                          <p><strong>Excursion:</strong> {{ invite.excursion.name }}</p>
                          <p><strong>From:</strong> {{ invite.sender.userName }}</p>
                          <div class="invite-actions">
                              <button @click="handleInvite(invite._id, true)" class="btn btn-filled">Accept</button>
                              <button @click="handleInvite(invite._id, false)" class="btn btn-danger">Deny</button>
                              <button v-if="invite.sender._id === authStore.user._id" @click="handleRevokeInvite(invite._id)" class="btn btn-danger">Revoke</button>
                          </div>
                      </div>
                      <div v-if="excursionInvites.length === 0">
                          <p>No invites found.</p>
                      </div>
                  </div>
                  <button @click="closeInvitesModal" class="btn btn-outline">Close</button>
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

.excursion-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 40px;
}

.excursion-list,
.trip-list {
    margin-bottom: 40px;
    max-width: 100%;
}

.excursion-list h2,
.trip-list h2 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
}

.excursion-grid,
.trip-grid {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 10px 0;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;
}

.excursion-grid::-webkit-scrollbar,
.trip-grid::-webkit-scrollbar {
    height: 8px;
}

.excursion-grid::-webkit-scrollbar-thumb,
.trip-grid::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

.excursion-card,
.trip-card {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.excursion-card {
    flex: 0 0 350px;
    min-height: 200px;
}

.trip-card {
    flex: 0 0 250px;
}

.excursion-card:hover,
.trip-card:hover {
    transform: translateY(-5px);
}

.excursion-card h3,
.trip-card h3 {
    font-size: 1.3rem;
    margin: 0 0 15px 0;
}

.excursion-card p,
.trip-card p {
    font-size: 1rem;
    color: #666;
    margin: 5px 0;
}

.excursion-actions,
.trip-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.no-excursions,
.no-trips {
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

.trip-form,
.excursion-form {
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
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
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

.invite-list {
    margin: 20px 0;
}

.invite-item {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 10px;
}

.invite-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.participant-list {
    list-style: none;
    padding: 0;
}

.participant-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.btn-small {
    padding: 5px 10px;
    font-size: 0.8rem;
}

/* Park search styles */
.park-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 8px;
}

.park-item {
    padding: 8px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}

.park-item:hover {
    background-color: #f0f0f0;
}

.no-results {
    color: #888;
    font-style: italic;
    margin-top: 8px;
}

/* Error message styles */
.error {
    color: red;
    font-size: 0.875rem;
    margin-top: 4px;
    display: block;
}
</style>
