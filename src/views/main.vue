<!-- eslint-disable vue/multi-word-component-names -->
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

const editForm = ref({
    firstName: authStore.user?.firstName || '',
    lastName: authStore.user?.lastName || '',
    email: authStore.user?.email || '',
    userName: authStore.user?.userName || '',
});

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
const featuredParksLimit = ref(20);
const featuredParksStart = ref(0);
const sliderRef = ref(null);

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

// Navigate to My Trips page to create a trip for the selected park
const createTripForPark = () => {
    if (!selectedPark.value) return;
    router.push({
        path: '/my-trips',
        query: { parkId: selectedPark.value._id || selectedPark.value.id },
    });
    closeParkDetailsModal();
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
        console.log('Fetching parks with token:', authStore.token, `limit=${parkLimit.value}&start=${parkStart.value}&q=${parkSearch.value}`);
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
            throw new Error(errorData.message || 'Failed to fetch parks');
        }

        const data = await response.json();
        console.log('Raw parks data from API:', data);
        parkResults.value = data.data || [];
    } catch (error) {
        console.error('Error fetching parks:', error);
        alert(error.message || 'An error occurred while fetching parks');
    }
};

const fetchCampgrounds = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch campgrounds');
        return;
    }

    try {
        console.log('Fetching campgrounds with token:', authStore.token, `limit=${campgroundLimit.value}&start=${campgroundStart.value}&q=${campgroundSearch.value}`);
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
            throw new Error(errorData.message || 'Failed to fetch campgrounds');
        }

        const data = await response.json();
        console.log('Raw campgrounds data from API:', data);
        campgroundResults.value = data.data || [];
    } catch (error) {
        console.error('Error fetching campgrounds:', error);
        alert(error.message || 'An error occurred while fetching campgrounds');
    }
};

const fetchThingsToDo = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch things to do');
        return;
    }

    try {
        console.log('Fetching things to do with token:', authStore.token, `limit=${thingToDoLimit.value}&start=${thingToDoStart.value}&q=${thingToDoSearch.value}`);
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
        console.log('Fetching featured parks with token:', authStore.token, `limit=${featuredParksLimit.value}&start=${featuredParksStart.value}`);
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
        console.log('Raw featured parks data from API:', data);
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
</script>

<template>
    <div class="container">
        <aside class="sidebar">
            <div class="logo">ParkQuest</div>
            <nav class="nav">
                <router-link to="/explore-parks">Explore Parks</router-link>
                <router-link to="/map-view">Map View</router-link>
                <router-link to="/connect-with-friends">Connect with Friends</router-link>
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
                    <input v-model="parkSearch" @keyup.enter="handleSearch" placeholder="Search parks" class="search-input"/>
                    <button @click="handleSearch" class="btn btn-filled">Search</button>
                    <ul class="results-list">
                        <li v-for="park in parkResults" :key="park.id" @click="openParkDetailsModal(park)">
                            {{ park.name || park.fullName || 'Unnamed Park' }}
                        </li>
                    </ul>
                </div>

                <div class="search-box">
                    <h2>Campgrounds</h2>
                    <input v-model="campgroundSearch" @keyup.enter="handleSearch" placeholder="Search campgrounds" class="search-input"/>
                    <button @click="handleSearch" class="btn btn-filled">Search</button>
                    <ul class="results-list">
                        <li v-for="campground in campgroundResults" :key="campground.id" @click="openCampgroundDetailsModal(campground)">
                            {{ campground.name || 'Unnamed Campground' }}
                        </li>
                    </ul>
                </div>

                <div class="search-box">
                    <h2>Things To Do</h2>
                    <input v-model="thingToDoSearch" @keyup.enter="handleSearch" placeholder="Search activities" class="search-input"/>
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
                        <div v-for="park in featuredParks" :key="park.id" class="park-card" @click="openParkDetailsModal(park)">
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
                            <input type="text" id="firstName" v-model="editForm.firstName" placeholder="Enter your first name" required/>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <input type="text" id="lastName" v-model="editForm.lastName" placeholder="Enter your last name" required/>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" v-model="editForm.email" placeholder="Enter your email" required/>
                        </div>
                        <div class="form-group">
                            <label for="userName">Username</label>
                            <input type="text" id="userName" v-model="editForm.userName" placeholder="Enter your username" required/>
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
                    <button @click="closeCampgroundDetailsModal" class="btn btn-outline">Close</button>
                </div>
            </div>

            <div v-if="showThingToDoDetailsModal" class="modal-overlay">
                <div class="modal">
                    <h2>{{ selectedThingToDo?.title || 'Unnamed Activity' }}</h2>
                    <p><strong>Description:</strong> {{ selectedThingToDo?.shortDescription || selectedThingToDo?.longDescription || 'No description available' }}</p>
                    <button @click="closeThingToDoDetailsModal" class="btn btn-outline">Close</button>
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

/* Search Grid */
.search-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 40px;
    max-width: 100%;
}

.search-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-box h2 {
    font-size: 1.2rem;
    margin: 0 0 10px 0;
    text-align: center;
}

.search-input {
    padding: 8px;
    font-size: 0.9rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
}

.btn-filled {
    background: #000;
    color: #fff;
    border: none;
    padding: 8px 15px;
    font-size: 0.9rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
}

.btn-filled:hover {
    background: #333;
}

.results-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
}

.results-list li {
    padding: 8px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
}

.results-list li:hover {
    background: #f5f5f5;
}

.featured-parks {
    margin-bottom: 40px;
    max-width: 100%;
}

.featured-parks h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
}

.slider-container {
    position: relative;
    display: flex;
    align-items: center;
    max-width: 100%;
}

.park-grid {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 10px 0;
    -webkit-overflow-scrolling: touch;
    max-width: calc(100% - 100px);
    margin: 0 auto;
}

.park-grid::-webkit-scrollbar {
    height: 8px;
}

.park-grid::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

.park-card {
    flex: 0 0 250px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
}

.park-card:hover {
    transform: translateY(-5px);
}

.park-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    margin-bottom: 10px;
}

.placeholder-image {
    width: 100%;
    height: 150px;
    background: #e0e0e0;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: #666;
}

.park-info {
    padding: 10px;
}

.park-info h3 {
    margin: 5px 0;
    font-size: 1.1rem;
}

.park-info p {
    margin: 5px 0;
    color: #666;
}

.description {
    font-size: 0.9rem;
    color: #888;
}

.slider-arrow {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background 0.2s;
}

.slider-arrow.left {
    left: 0;
}

.slider-arrow.right {
    right: 0;
}

.slider-arrow:hover {
    background: #f5f5f5;
}

/* Modal Styles */
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

.modal-park-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 20px;
}

.edit-form {
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

.form-group input {
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
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

.btn-outline {
    background: none;
    border: 1px solid #ddd;
    color: #333;
}

.btn-outline:hover {
    background: #f5f5f5;
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

.btn-danger {
    background: #ff4d4f;
    color: white;
    border: none;
}

.btn-danger:hover {
    background: #d9363e;
}
</style>
