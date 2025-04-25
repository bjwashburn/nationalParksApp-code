<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/no-side-effects-in-computed-properties -->
<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const showDropdown = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showParkDetailsModal = ref(false);
const showCampgroundDetailsModal = ref(false);
const showThingToDoDetailsModal = ref(false);
const showCreateTripModal = ref(false);

const editForm = ref({
    firstName: authStore.user?.firstName || '',
    lastName: authStore.user?.lastName || '',
    email: authStore.user?.email || '',
    userName: authStore.user?.userName || '',
});

const tripForm = ref({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    park: '',
    campground: '',
    thingstodo: [],
});

const thingstodoInput = ref('');
const selectedPark = ref(null);
const selectedCampground = ref(null);
const selectedThingToDo = ref(null);
const parkSearch = ref('');
const campgroundSearch = ref('');
const thingToDoSearch = ref('');
const parkLimit = ref(50);
const campgroundLimit = ref(50);
const thingToDoLimit = ref(50);
const parkStart = ref(0);
const campgroundStart = ref(0);
const thingToDoStart = ref(0);
const parkResults = ref([]);
const campgroundResults = ref([]);
const thingToDoResults = ref([]);
const featuredParks = ref([]);
const featuredParksLimit = ref(15);
const featuredParksStart = ref(0);
const sliderRef = ref(null);

const tripFormErrors = ref({
    name: '',
    startDate: '',
    endDate: '',
    park: '',
    campground: '',
    thingstodo: '',
    dates: '',
});

watch(thingstodoInput, (newValue) => {
    if (newValue) {
        tripForm.value.thingstodo = newValue.split(',').map(id => id.trim()).filter(id => id.length > 0);
    } else {
        tripForm.value.thingstodo = [];
    }
});

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

const profileInitial = computed(() => {
    return authStore.user?.email?.charAt(0).toUpperCase() || 'U';
});

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const openEditModal = () => {
    showDropdown.value = false;
    showEditModal.value = true;
    editForm.value = {
        firstName: authStore.user?.firstName || '',
        lastName: authStore.user?.lastName || '',
        email: authStore.user?.email || '',
        userName: authStore.user?.userName || '',
    };
};

const openDeleteModal = () => {
    showDropdown.value = false;
    showDeleteModal.value = true;
};

const openParkDetailsModal = (park) => {
    selectedPark.value = park;
    showParkDetailsModal.value = true;
};

const openCampgroundDetailsModal = (campground) => {
    selectedCampground.value = campground;
    showCampgroundDetailsModal.value = true;
};

const openThingToDoDetailsModal = (thingToDo) => {
    selectedThingToDo.value = thingToDo;
    showThingToDoDetailsModal.value = true;
};

const openCreateTripModal = (park) => {
    if (!authStore.isAuthenticated) {
        alert('You need to be logged in to create a trip.');
        router.push('/sign-in');
        return;
    }
    selectedPark.value = park;
    tripForm.value = {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        park: park?.id || park?._id || '',
        campground: '',
        thingstodo: [],
    };
    thingstodoInput.value = '';
    showCreateTripModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
};

const closeParkDetailsModal = () => {
    showParkDetailsModal.value = false;
    selectedPark.value = null;
};

const closeCampgroundDetailsModal = () => {
    showCampgroundDetailsModal.value = false;
    selectedCampground.value = null;
};

const closeThingToDoDetailsModal = () => {
    showThingToDoDetailsModal.value = false;
    selectedThingToDo.value = null;
};

const closeCreateTripModal = () => {
    showCreateTripModal.value = false;
    selectedPark.value = null;
};

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
            console.error('Create trip error response:', errorData);
            throw new Error(errorData.message || 'Failed to create trip');
        }

        const { trip: newTrip } = await response.json();
        console.log('Created trip:', newTrip);
        closeCreateTripModal();
        alert('Trip created successfully!');
        router.push('/my-trips');
    } catch (error) {
        console.error('Error creating trip:', error);
        alert(`Error: ${error.message}`);
    }
};

const createTripForPark = () => {
    if (!selectedPark.value) {
        alert('No park selected.');
        return;
    }
    openCreateTripModal(selectedPark.value);
};

const handleEditAccount = async () => {
    try {
        if (!editForm.value.firstName || editForm.value.firstName.length < 1 || editForm.value.firstName.length > 128) {
            throw new Error('First name must be between 1 and 128 characters');
        }
        if (!editForm.value.lastName || editForm.value.lastName.length < 1 || editForm.value.lastName.length > 128) {
            throw new Error('Last name must be between 1 and 128 characters');
        }
        if (!editForm.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.value.email)) {
            throw new Error('Invalid email format');
        }
        if (!editForm.value.userName || editForm.value.userName.length < 1 || editForm.value.userName.length > 128) {
            throw new Error('Username must be between 1 and 128 characters');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(editForm.value.userName)) {
            throw new Error('Username can only contain letters, numbers, and underscores');
        }
        const payload = {};
        if (editForm.value.firstName !== authStore.user.firstName) {
            payload.firstName = editForm.value.firstName;
        }
        if (editForm.value.lastName !== authStore.user.lastName) {
            payload.lastName = editForm.value.lastName;
        }
        if (editForm.value.email !== authStore.user.email) {
            payload.email = editForm.value.email;
        }
        if (editForm.value.userName !== authStore.user.userName) {
            payload.userName = editForm.value.userName;
        }

        if (Object.keys(payload).length === 0) {
            alert('No changes to update.');
            closeEditModal();
            return;
        }

        console.log('Updating account with payload:', payload, 'token:', authStore.token);

        const response = await fetch('https://excursions-api-server.azurewebsites.net/user', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(payload),
        });

        console.log('Edit account response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Edit account error response:', errorData);
            throw new Error(errorData.message || 'Failed to update account');
        }

        const updatedUser = await response.json();
        console.log('Updated user data:', updatedUser);

        authStore.user = updatedUser.user || updatedUser;
        localStorage.setItem('user', JSON.stringify(authStore.user));
        closeEditModal();
        alert('Account updated successfully');
    } catch (error) {
        console.error('Error updating account:', error);
        alert(error.message || 'An error occurred while updating your account');
    }
};

const handleDeleteAccount = async () => {
    try {
        const response = await fetch('https://excursions-api-server.azurewebsites.net/user', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete account');
        }

        authStore.signOut();
        router.push('/sign-in');
        alert('Account deleted successfully');
    } catch (error) {
        alert(error.message || 'An error occurred while deleting your account');
    }
};

const handleSignOut = () => {
    showDropdown.value = false;
    authStore.signOut();
    router.push('/sign-in');
};

const fetchParks = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch parks');
        return;
    }

    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/national-parks?limit=${parkLimit.value}&start=${parkStart.value}&q=${parkSearch.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch parks error response:', errorData);
            throw new Error('Failed to fetch parks');
        }

        const data = await response.json();
        parkResults.value = data.data || [];
    } catch (error) {
        console.error('Error fetching parks:', error);
        alert('An error occurred while fetching parks');
        parkResults.value = [];
    }
};

const fetchCampgrounds = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch campgrounds');
        return;
    }

    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/campgrounds?limit=${campgroundLimit.value}&start=${campgroundStart.value}&q=${campgroundSearch.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch campgrounds error response:', errorData);
            throw new Error('Failed to fetch campgrounds');
        }

        const data = await response.json();
        console.log('Raw campgrounds data from API:', data);
        campgroundResults.value = data.data || [];
    } catch (error) {
        console.error('Error fetching campgrounds:', error);
        alert('An error occurred while fetching campgrounds');
    }
};

const fetchThingsToDo = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch things to do');
        return;
    }

    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/things-to-do?limit=${thingToDoLimit.value}&start=${thingToDoStart.value}&q=${thingToDoSearch.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch things to do error response:', errorData);
            throw new Error(errorData.message || 'Failed to fetch things to do');
        }

        const data = await response.json();
        console.log('Raw things to do data from API:', data);
        thingToDoResults.value = data.data || [];
    } catch (error) {
        console.error('Error fetching things to do:', error);
        alert(error.message || 'An error occurred while fetching things to do');
    }
};

const fetchFeaturedParks = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch featured parks');
        return;
    }

    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/national-parks?limit=${featuredParksLimit.value}&start=${featuredParksStart.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch featured parks error response:', errorData);
            throw new Error(errorData.message || 'Failed to fetch featured parks');
        }

        const data = await response.json();
        featuredParks.value = data.data || [];
    } catch (error) {
        console.error('Error fetching featured parks:', error);
        alert(error.message || 'An error occurred while fetching featured parks');
    }
};

const scrollLeft = () => {
    if (sliderRef.value) {
        sliderRef.value.scrollBy({ left: -300, behavior: 'smooth' });
    }
};

const scrollRight = () => {
    if (sliderRef.value) {
        sliderRef.value.scrollBy({ left: 300, behavior: 'smooth' });
    }
};

watch(() => authStore.isAuthenticated, (newValue) => {
    console.log('isAuthenticated changed:', newValue, 'token:', authStore.token);
    if (newValue) {
        fetchParks();
        fetchCampgrounds();
        fetchThingsToDo();
        fetchFeaturedParks();
    } else {
        router.push('/sign-in');
    }
}, { immediate: true });

const handleSearch = () => {
    parkStart.value = 0;
    campgroundStart.value = 0;
    thingToDoStart.value = 0;
    fetchParks();
    fetchCampgrounds();
    fetchThingsToDo();
};

const handleImageError = (event) => {
    event.target.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-image';
    placeholder.textContent = 'No Image Available';
    event.target.parentNode.appendChild(placeholder);
};
</script>

<template>
  <div class="container main-vue">
    <aside class="sidebar">
      <div class="logo">ParkQuest</div>
      <nav class="nav">
        <router-link to="/my-trips">My Trips</router-link>
        <router-link to="/about">About Us</router-link>
      </nav>
    </aside>

    <main class="main-content">
      <header class="header">
        <h1>Discover Amazing National Parks</h1>
        <p>Plan your next adventure to the most beautiful parks in the country</p>
      </header>

      <div class="welcome-message" v-if="authStore.isAuthenticated">
        <h2>Welcome, {{ authStore.user?.userName }}!</h2>
      </div>

      <div class="user-profile">
        <div class="profile-icon" @click="toggleDropdown">
          <span v-if="authStore.isAuthenticated">{{ profileInitial }}</span>
        </div>
        <div v-if="showDropdown" class="dropdown">
          <button @click="openEditModal" class="dropdown-item">Edit Account</button>
          <button @click="openDeleteModal" class="dropdown-item">Delete Account</button>
          <button @click="handleSignOut" class="dropdown-item">Sign Out</button>
        </div>
      </div>

      <section class="search-grid">
        <div class="search-box">
          <h2>National Parks</h2>
          <input v-model="parkSearch" @keyup.enter="handleSearch" placeholder="Search parks" class="search-input" />
          <button @click="handleSearch" class="btn btn-filled">Search</button>
          <ul class="results-list">
            <li v-for="park in parkResults" :key="park.id" @click="openParkDetailsModal(park)">
              {{ park.name || park.fullName || 'Unnamed Park' }}
            </li>
          </ul>
        </div>

        <div class="search-box">
          <h2>Campgrounds</h2>
          <input v-model="campgroundSearch" @keyup.enter="handleSearch" placeholder="Search campgrounds" class="search-input" />
          <button @click="handleSearch" class="btn btn-filled">Search</button>
          <ul class="results-list">
            <li v-for="campground in campgroundResults" :key="campground.id" @click="openCampgroundDetailsModal(campground)">
              {{ campground.name || 'Unnamed Campground' }}
            </li>
          </ul>
        </div>

        <div class="search-box">
          <h2>Things To Do</h2>
          <input v-model="thingToDoSearch" @keyup.enter="handleSearch" placeholder="Search activities" class="search-input" />
          <button @click="handleSearch" class="btn btn-filled">Search</button>
          <ul class="results-list">
            <li v-for="thing in thingToDoResults" :key="thing.id" @click="openThingToDoDetailsModal(thing)">
              {{ thing.title || 'Unnamed Activity' }}
            </li>
          </ul>
        </div>
      </section>

      <section class="featured-parks">
        <h2>Featured Parks</h2>
        <div class="slider-container">
          <button class="slider-arrow left" @click="scrollLeft" aria-label="Scroll left">←</button>
          <div class="park-grid" ref="sliderRef">
            <div v-for="park in featuredParks" :key="park.id" class="park-card" @click="openCreateTripModal(park)">
              <img
                v-if="park.images && park.images.length > 0"
                :src="park.images[0].url"
                :alt="park.images[0].altText || park.name || park.fullName || 'Park Image'"
                class="park-image"
                @error="handleImageError"
              />
              <div v-else class="placeholder-image">No Image Available</div>
              <div class="park-info">
                <h3>{{ park.name || park.fullName || 'Unnamed Park' }}</h3>
                <p>{{ park.states || 'Unknown Location' }}</p>
                <p class="description">{{ park.description ? park.description.slice(0, 100) + '...' : 'No description available' }}</p>
              </div>
            </div>
          </div>
          <button class="slider-arrow right" @click="scrollRight" aria-label="Scroll right">→</button>
        </div>
      </section>

      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal">
          <h2>Edit Account</h2>
          <form @submit.prevent="handleEditAccount" class="edit-form">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input type="text" id="firstName" v-model="editForm.firstName" placeholder="Enter your first name" required />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input type="text" id="lastName" v-model="editForm.lastName" placeholder="Enter your last name" required />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="editForm.email" placeholder="Enter your email" required />
            </div>
            <div class="form-group">
              <label for="userName">Username</label>
              <input type="text" id="userName" v-model="editForm.userName" placeholder="Enter your username" required />
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-filled">Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal">
          <h2>Delete Account</h2>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <div class="modal-actions">
            <button @click="closeDeleteModal" class="btn btn-outline">Cancel</button>
            <button @click="handleDeleteAccount" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>

      <div v-if="showParkDetailsModal" class="modal-overlay">
        <div class="modal">
          <h2>{{ selectedPark?.name || selectedPark?.fullName || 'Unnamed Park' }}</h2>
          <img
            v-if="selectedPark?.images && selectedPark.images.length > 0"
            :src="selectedPark.images[0].url"
            :alt="selectedPark.images[0].altText || selectedPark.name || selectedPark.fullName || 'Park Image'"
            class="modal-park-image"
            @error="handleImageError"
          />
          <div v-else class="placeholder-image">No Image Available</div>
          <p><strong>Address:</strong> {{ selectedPark?.addresses?.[0]?.line1 || 'N/A' }}, {{ selectedPark?.addresses?.[0]?.city || 'N/A' }}, {{ selectedPark?.addresses?.[0]?.stateCode || 'N/A' }} {{ selectedPark?.addresses?.[0]?.postalCode || 'N/A' }}</p>
          <p><strong>Contacts:</strong> {{ selectedPark?.contacts?.phoneNumbers?.[0]?.phoneNumber || 'N/A' }}, {{ selectedPark?.contacts?.emailAddresses?.[0]?.emailAddress || 'N/A' }}</p>
          <p><strong>Description:</strong> {{ selectedPark?.description || 'No description available' }}</p>
          <p><strong>Hours:</strong> {{ selectedPark?.operatingHours?.[0]?.description || 'No hours available' }}</p>
          <div class="modal-actions">
            <button @click="closeParkDetailsModal" class="btn btn-outline">Close</button>
            <button @click="createTripForPark" class="btn btn-filled">Create Trip</button>
          </div>
        </div>
      </div>

      <div v-if="showCampgroundDetailsModal" class="modal-overlay">
        <div class="modal">
          <h2>{{ selectedCampground?.name || 'Unnamed Campground' }}</h2>
          <p><strong>Description:</strong> {{ selectedCampground?.description || 'No description available' }}</p>
          <div class="modal-actions">
            <button @click="closeCampgroundDetailsModal" class="btn btn-outline">Close</button>
          </div>
        </div>
      </div>

      <div v-if="showThingToDoDetailsModal" class="modal-overlay">
        <div class="modal">
          <h2>{{ selectedThingToDo?.title || 'Unnamed Activity' }}</h2>
          <p><strong>Description:</strong> {{ selectedThingToDo?.shortDescription || selectedThingToDo?.longDescription || 'No description available' }}</p>
          <div class="modal-actions">
            <button @click="closeThingToDoDetailsModal" class="btn btn-outline">Close</button>
          </div>
        </div>
      </div>

      <div v-if="showCreateTripModal" class="modal-overlay">
        <div class="modal">
          <h2>Create a New Trip for {{ selectedPark?.name || selectedPark?.fullName || 'Selected Park' }}</h2>
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
              <label for="park">Selected Park</label>
              <input type="text" id="park" :value="selectedPark?.name || selectedPark?.fullName || 'Selected Park'" disabled />
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
    </main>
  </div>
</template>
