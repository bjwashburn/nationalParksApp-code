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
    <div class="container">
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

.sign-in-section {
    text-align: center;
    padding: 50px 20px;
    flex: 1;
}

.sign-in-section h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 40px;
}

.sign-in-form {
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

.error-message {
    color: red;
    margin-top: 10px;
    font-size: 0.9rem;
    text-align: center;
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

.create-account-link {
    margin-top: 20px;
    font-size: 0.9rem;
}

.create-account-link a {
    color: #333;
    text-decoration: underline;
}

/* Footer */
.footer {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid #ddd;
}

.footer a {
    margin: 0 10px;
    text-decoration: none;
    color: #333;
    text-transform: capitalize;
}

.footer a:hover {
    text-decoration: underline;
}
</style>
