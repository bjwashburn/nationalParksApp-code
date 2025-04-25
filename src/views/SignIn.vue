<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleSignIn = async () => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email.value)) {
        authStore.errorMessage = 'Please enter a valid email address';
        return;
    }

    if (password.value.length < 8) {
        authStore.errorMessage = 'Password must be at least 8 characters long';
        return;
    }

    try {
        await authStore.signIn(email.value, password.value);
        console.log('After sign-in, isAuthenticated:', authStore.isAuthenticated);
        if (authStore.isAuthenticated) {
            router.push('/dashboard');
        } else {
            console.error('Sign-in failed, not navigating to dashboard');
        }
    } catch (error) {
        console.error('Sign-in error in component:', error);
    }
};
</script>

<template>
    <div class="container sign-in-vue">
        <header class="header">
            <div class="logo">ParkQuest</div>
            <nav class="nav">
                <router-link to="/">Home</router-link>
                <router-link to="/about">About</router-link>
                <router-link to="/sign-in">Sign In</router-link>
                <router-link to="/create-account">Create Account</router-link>
            </nav>
        </header>

        <section class="sign-in-section">
            <h1>Sign In</h1>
            <form @submit.prevent="handleSignIn" class="sign-in-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" v-model="email" placeholder="Enter your email" required :disabled="authStore.isLoading"/>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" v-model="password" placeholder="Enter your password" required :disabled="authStore.isLoading"/>
                    </div>
                </div>
                <p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
                <button type="submit" class="btn btn-filled" :disabled="authStore.isLoading">
                    {{ authStore.isLoading ? 'Signing In...' : 'Sign In' }}
                </button>
            </form>
            <p class="create-account-link">
                Don't have an account? <router-link to="/create-account">Create one</router-link>
            </p>
        </section>

        <footer class="footer">
            <router-link to="/contact">Contact Us</router-link>
            <router-link to="/terms">Terms of Use</router-link>
            <router-link to="/privacy">Privacy Policy</router-link>
        </footer>
    </div>
</template>
