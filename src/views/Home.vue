<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

if (authStore.isAuthenticated) {
    router.push('/dashboard');
}
</script>

<template>
    <div class="container">
        <header class="header">
            <div class="logo">ParkQuest</div>
            <nav class="nav">
                <router-link to="/about">About</router-link>
                <router-link to="/sign-in">Sign In</router-link>
                <router-link to="/create-account">Create Account</router-link>
            </nav>
        </header>

        <section class="welcome-section">
            <h1>Welcome to ParkQuest</h1>
            <div class="buttons">
                <router-link to="/create-account" class="btn btn-outline">Create Account</router-link>
                <router-link to="/sign-in" class="btn btn-filled">Sign In</router-link>
            </div>
        </section>
    </div>
</template>

<style scoped>
.container {
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav a {
    margin-left: 20px;
    text-decoration: none;
    color: #333;
}

.welcome-section {
    background-color: #666;
    color: white;
    text-align: center;
    padding: 50px 20px;
    margin: 20px 0;
}

.welcome-section h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
}

.buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.btn {
    padding: 10px 20px;
    font-size: 1rem;
    text-decoration: none;
    display: inline-block;
}

.btn-outline {
    background: transparent;
    border: 2px solid white;
    color: white;
}

.btn-filled {
    background: black;
    color: white;
    border: none;
}
</style>
