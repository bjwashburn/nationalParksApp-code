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
    <div class="container">
        <header class="header">
            <div class="logo">National Parks App</div>
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

<style scoped>

.container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    background: #fff;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #ddd;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav {
    display: flex;
    gap: 20px;
}

.nav a {
    text-decoration: none;
    color: #333;
    font-size: 1rem;
}

.nav a:hover {
    text-decoration: underline;
}

.create-account-section {
    text-align: center;
    padding: 50px 20px;
    flex: 1;
}

.create-account-section h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 40px;
}

.create-account-form {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.form-row {
    display: flex;
    gap: 30px;
    justify-content: space-between;
}

.form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    text-align: left;
}

.form-group label {
    font-size: 1.1rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 8px;
}

.form-group input {
    padding: 12px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    background: #fff;
}

.form-group input::placeholder {
    color: #aaa;
    font-size: 1rem;
}

.btn-filled {
    background: #000;
    color: #fff;
    border: none;
    padding: 12px 30px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 25px;
    width: 200px;
    margin: 0 auto;
    display: block;
    transition: background 0.2s;
}

.btn-filled:hover:not(:disabled) {
    background: #333;
}

.btn-filled:disabled {
    background: #666;
    cursor: not-allowed;
}

.error-message {
    color: red;
    margin-top: 10px;
    font-size: 0.9rem;
}

.sign-in-link {
    margin-top: 20px;
    font-size: 0.9rem;
}

.sign-in-link a {
    color: #333;
    text-decoration: underline;
}

.footer {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid #ddd;
}

.footer a {
    margin: 0 10px;
    text-decoration: none;
    color: #333;
}

.footer a:hover {
    text-decoration: underline;
}
</style>
