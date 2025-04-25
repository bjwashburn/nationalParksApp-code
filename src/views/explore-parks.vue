<!-- explore-parks.vue -->
<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

// Reactive state for modals and dropdowns
const showDropdown = ref(false);

// Reactive state for data
const parks = ref([]);
const audioFiles = ref([]);
const galleries = ref([]);
const videos = ref([]);

// Reactive state for search
const searchQuery = ref(''); // Store the search input
const searchedPark = ref(''); // Store the park name after pressing Enter

// Pagination parameters
const limit = 10; // Number of items per page
const start = 0; // Starting index

// Compute profile initial
const profileInitial = computed(() => {
    return authStore.user?.email?.charAt(0).toUpperCase() || 'U';
});

// Filtered multimedia content based on searched park
const filteredAudioFiles = computed(() => {
    if (!searchedPark.value) return [];
    return audioFiles.value.filter(audio =>
        audio.relatedParks.some(park =>
            park.name.toLowerCase().includes(searchedPark.value.toLowerCase())
        )
    );
});

const filteredGalleries = computed(() => {
    if (!searchedPark.value) return [];
    return galleries.value.filter(gallery =>
        gallery.relatedParks.some(park =>
            park.name.toLowerCase().includes(searchedPark.value.toLowerCase())
        )
    );
});

const filteredVideos = computed(() => {
    if (!searchedPark.value) return [];
    return videos.value.filter(video =>
        video.relatedParks.some(park =>
            park.name.toLowerCase().includes(searchedPark.value.toLowerCase())
        )
    );
});

// Handle search on Enter key press
const handleSearch = (event) => {
    if (event.key === 'Enter') {
        searchedPark.value = searchQuery.value.trim();
    }
};

// Toggle dropdown
const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

// Handle sign-out
const handleSignOut = () => {
    showDropdown.value = false;
    authStore.signOut();
    router.push('/sign-in');
};

// Fetch parks (requires token)
const fetchParks = async () => {
    if (!authStore.token) {
        console.warn('No token available to fetch parks');
        alert('You need to be logged in to fetch parks. Please sign in.');
        router.push('/sign-in');
        return;
    }

    try {
        console.log('Fetching parks with token:', authStore.token);
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/national-parks?limit=${limit}&start=${start}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch parks: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        parks.value = data.data || [];
    } catch (error) {
        console.error('Error fetching parks:', error);
        console.error('Error details:', error.message, error.stack);
        alert(error.message || 'An error occurred while fetching parks. This might be due to a CORS issue, an invalid token, or a network problem. Please check the console for more details.');
        parks.value = [];
    }
};

// Fetch audio files (no token required)
const fetchAudioFiles = async () => {
    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/multimedia/audio?limit=${limit}&start=${start}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch audio files: ${response.status} ${response.statusText}`);
        }

        audioFiles.value = await response.json().data || [];
    } catch (error) {
        console.error('Error fetching audio files:', error);
        console.error('Error details:', error.message, error.stack);
        alert(error.message || 'An error occurred while fetching audio files. This might be due to a CORS issue or a network problem. Please check the console for more details.');
        audioFiles.value = [];
    }
};

// Fetch galleries (no token required)
const fetchGalleries = async () => {
    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/multimedia/galleries?limit=${limit}&start=${start}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch galleries: ${response.status} ${response.statusText}`);
        }

        galleries.value = await response.json().data || [];
    } catch (error) {
        console.error('Error fetching galleries:', error);
        console.error('Error details:', error.message, error.stack);
        alert(error.message || 'An error occurred while fetching galleries. This might be due to a CORS issue or a network problem. Please check the console for more details.');
        galleries.value = [];
    }
};

// Fetch videos (no token required)
const fetchVideos = async () => {
    try {
        const response = await fetch(`https://excursions-api-server.azurewebsites.net/multimedia/videos?limit=${limit}&start=${start}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch videos: ${response.status} ${response.statusText}`);
        }

        videos.value = await response.json().data || [];
    } catch (error) {
        console.error('Error fetching videos:', error);
        console.error('Error details:', error.message, error.stack);
        alert(error.message || 'An error occurred while fetching videos. This might be due to a CORS issue or a network problem. Please check the console for more details.');
        videos.value = [];
    }
};

// Watch for authentication changes and pre-fetch data
watch(() => authStore.isAuthenticated, (newValue) => {
    if (newValue) {
        fetchParks();
        fetchAudioFiles();
        fetchGalleries();
        fetchVideos();
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
                <h1>Explore Parks</h1>
                <p>Discover multimedia content from national parks</p>
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

            <!-- Search Bar -->
            <section class="search-section">
                <div class="form-group">
                    <label for="parkSearch">Search for a Park</label>
                    <input
                        id="parkSearch"
                        v-model="searchQuery"
                        @keydown="handleSearch"
                        type="text"
                        placeholder="Enter park name and press Enter"
                    />
                </div>
            </section>

            <!-- Display Results if a Search Has Been Performed -->
            <div v-if="searchedPark">
                <!-- Audio Section -->
                <section class="audio-list">
                    <h2>Audio Files for "{{ searchedPark }}"</h2>
                    <div class="audio-grid">
                        <div v-for="audio in filteredAudioFiles" :key="audio.id" class="audio-card">
                            <h3>{{ audio.title || 'Untitled Audio' }}</h3>
                            <p><strong>Park:</strong> {{ audio.relatedParks[0]?.name || 'Unknown Park' }}</p>
                            <audio controls>
                                <source :src="audio.url" type="audio/mpeg">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                        <div v-if="filteredAudioFiles.length === 0" class="no-audio">
                            <p>No audio files found for "{{ searchedPark }}".</p>
                        </div>
                    </div>
                </section>

                <!-- Galleries Section -->
                <section class="gallery-list">
                    <h2>Galleries for "{{ searchedPark }}"</h2>
                    <div class="gallery-grid">
                        <div v-for="gallery in filteredGalleries" :key="gallery.id" class="gallery-card">
                            <h3>{{ gallery.title || 'Untitled Gallery' }}</h3>
                            <p><strong>Park:</strong> {{ gallery.relatedParks[0]?.name || 'Unknown Park' }}</p>
                            <div class="image-grid">
                                <img
                                    v-for="image in gallery.images"
                                    :key="image.url"
                                    :src="image.url"
                                    :alt="image.altText || 'Gallery Image'"
                                    class="gallery-image"
                                />
                            </div>
                        </div>
                        <div v-if="filteredGalleries.length === 0" class="no-galleries">
                            <p>No galleries found for "{{ searchedPark }}".</p>
                        </div>
                    </div>
                </section>

                <!-- Videos Section -->
                <section class="video-list">
                    <h2>Videos for "{{ searchedPark }}"</h2>
                    <div class="video-grid">
                        <div v-for="video in filteredVideos" :key="video.id" class="video-card">
                            <h3>{{ video.title || 'Untitled Video' }}</h3>
                            <p><strong>Park:</strong> {{ video.relatedParks[0]?.name || 'Unknown Park' }}</p>
                            <video controls>
                                <source :src="video.versions[0]?.url" type="video/mp4">
                                Your browser does not support the video element.
                            </video>
                        </div>
                        <div v-if="filteredVideos.length === 0" class="no-videos">
                            <p>No videos found for "{{ searchedPark }}".</p>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Message Before Search -->
            <div v-else class="no-search">
                <p>Please enter a park name and press Enter to search for multimedia content.</p>
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

.search-section {
    margin-bottom: 40px;
    display: flex;
    justify-content: center;
}

.form-group {
    display: flex;
    flex-direction: column;
    width: 300px;
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

.audio-list,
.gallery-list,
.video-list {
    margin-bottom: 40px;
    max-width: 100%;
}

.audio-list h2,
.gallery-list h2,
.video-list h2 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
}

.audio-grid,
.gallery-grid,
.video-grid {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 10px 0;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;
}

.audio-grid::-webkit-scrollbar,
.gallery-grid::-webkit-scrollbar,
.video-grid::-webkit-scrollbar {
    height: 8px;
}

.audio-grid::-webkit-scrollbar-thumb,
.gallery-grid::-webkit-scrollbar-thumb,
.video-grid::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

.audio-card,
.gallery-card,
.video-card {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    flex: 0 0 300px;
}

.audio-card:hover,
.gallery-card:hover,
.video-card:hover {
    transform: translateY(-5px);
}

.audio-card h3,
.gallery-card h3,
.video-card h3 {
    font-size: 1.3rem;
    margin: 0 0 15px 0;
}

.audio-card p,
.gallery-card p,
.video-card p {
    font-size: 1rem;
    color: #666;
    margin: 5px 0;
}

.audio-card audio,
.video-card video {
    width: 100%;
    margin-top: 10px;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.gallery-image {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
}

.no-audio,
.no-galleries,
.no-videos,
.no-search {
    text-align: center;
    padding: 20px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
}
</style>
