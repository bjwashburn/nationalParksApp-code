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
  <div class="container home-vue">
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

    <footer class="footer">
      <router-link to="/contact">Contact Us</router-link>
      <router-link to="/terms">Terms of Use</router-link>
      <router-link to="/privacy">Privacy Policy</router-link>
    </footer>
  </div>
</template>
