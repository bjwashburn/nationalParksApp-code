<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const userName = ref('');
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const authStore = useAuthStore();
const router = useRouter();

const handleCreateAccount = async () => {
    if (password.value !== confirmPassword.value) {
        authStore.errorMessage = 'Passwords do not match';
        return;
    }
    const userData = {
        userName: userName.value,
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
    };

    await authStore.createAccount(userData);

    if (authStore.isAuthenticated) {
        router.push('/dashboard');
    }
};
</script>

<template>
    <div class="container create-account-vue">
        <header class="header">
            <div class="logo">ParkQuest</div>
            <nav class="nav">
                <router-link to="/">Home</router-link>
                <router-link to="/about">About</router-link>
                <router-link to="/sign-in">Sign In</router-link>
                <router-link to="/create-account">Create Account</router-link>
            </nav>
        </header>

        <section class="create-account-section">
            <h1>Create Account</h1>
            <form @submit.prevent="handleCreateAccount" class="create-account-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="first-name">First Name</label>
                        <input type="text" id="first-name" v-model="firstName" placeholder="Enter your first name" required :disabled="authStore.isLoading"/>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" v-model="email" placeholder="Enter your email" required :disabled="authStore.isLoading"/>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="last-name">Last Name</label>
                        <input type="text" id="last-name" v-model="lastName" placeholder="Enter your last name" required :disabled="authStore.isLoading"/>
                    </div>
                    <div class="form-group">
                        <label for="user-name">Username</label>
                        <input type="text" id="user-name" v-model="userName" placeholder="Enter your username" required :disabled="authStore.isLoading"/>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" v-model="password" placeholder="Enter your password" required :disabled="authStore.isLoading"/>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" v-model="confirmPassword" placeholder="Confirm password" required :disabled="authStore.isLoading"/>
                    </div>
                </div>
                <button type="submit" class="btn btn-filled" :disabled="authStore.isLoading">
                    {{ authStore.isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>
                <p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
            </form>
            <p class="sign-in-link">
                Already have an account? <router-link to="/sign-in">Sign in</router-link>
            </p>
        </section>

        <footer class="footer">
            <router-link to="/contact">Contact Us</router-link>
            <router-link to="/terms">Terms of Use</router-link>
            <router-link to="/privacy">Privacy Policy</router-link>
        </footer>
    </div>
</template>
