import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(null);
    const isAuthenticated = ref(false);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const signIn = async (email, password) => {
        console.log('Attempting sign-in with:', email, password);
        isLoading.value = true;
        errorMessage.value = '';

        try {
            const response = await fetch('https://excursions-api-server.azurewebsites.net/user/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Sign-in response status:', response.status);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid email or password');
            }

            const data = await response.json();
            console.log('Sign-in response data:', data);
            if (data && data.token) {
                token.value = data.token;
                localStorage.setItem('token', data.token);
                await getUser();
                isAuthenticated.value = true;
                console.log('Sign-in successful, user:', user.value, 'isAuthenticated:', isAuthenticated.value);
            } else {
                throw new Error('No token returned');
            }
        } catch (error) {
            errorMessage.value = error.message || 'An error occurred during sign-in. Please try again.';
            console.error('Sign-in error:', error);
            isAuthenticated.value = false;
            token.value = null;
            localStorage.removeItem('token');
        } finally {
            isLoading.value = false;
        }
    };

    const createAccount = async (userData) => {
        isLoading.value = true;
        errorMessage.value = '';

        if (!userData.userName || userData.userName.length < 1 || userData.userName.length > 128) {
            errorMessage.value = 'Username must be between 1 and 128 characters';
            isLoading.value = false;
            return;
        }
        if (!userData.firstName || userData.firstName.length < 1 || userData.firstName.length > 128) {
            errorMessage.value = 'First name must be between 1 and 128 characters';
            isLoading.value = false;
            return;
        }
        if (!userData.lastName || userData.lastName.length < 1 || userData.lastName.length > 128) {
            errorMessage.value = 'Last name must be between 1 and 128 characters';
            isLoading.value = false;
            return;
        }
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            errorMessage.value = 'Invalid email format';
            isLoading.value = false;
            return;
        }
        if (!userData.password || !validatePassword(userData.password)) {
            errorMessage.value = 'Password must be at least 8 characters long and contain at least one letter, one number, and one special character';
            isLoading.value = false;
            return;
        }

        const requestBody = {
            userName: userData.userName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
        };

        try {
            const response = await fetch('https://excursions-api-server.azurewebsites.net/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Create account response status:', response.status);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create account');
            }

            const data = await response.json();
            console.log('Create account response data:', data);
            if (data && data.token) {
                token.value = data.token;
                user.value = data.user || data;
                isAuthenticated.value = true;
                localStorage.setItem('user', JSON.stringify(user.value));
                localStorage.setItem('token', data.token);
                console.log('Account creation successful:', data);
            } else {
                throw new Error('No token returned');
            }
        } catch (error) {
            errorMessage.value = error.message || 'An error occurred during account creation. Please try again.';
            console.error('Account creation error:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const getUser = async () => {
        if (!token.value) {
            throw new Error('No token available');
        }

        try {
            const response = await fetch('https://excursions-api-server.azurewebsites.net/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.value}`,
                },
            });

            console.log('Get user response status:', response.status);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch user');
            }

            const data = await response.json();
            console.log('Get user response data:', data);
            user.value = data.user || data;
            localStorage.setItem('user', JSON.stringify(user.value));
            console.log('User fetched successfully:', user.value);
        } catch (error) {
            errorMessage.value = error.message || 'An error occurred while fetching user data.';
            console.error('Get user error:', error);
            throw error;
        }
    };

    const signOut = () => {
        user.value = null;
        token.value = null;
        isAuthenticated.value = false;
        errorMessage.value = '';
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
        user.value = JSON.parse(storedUser);
        token.value = storedToken;
        isAuthenticated.value = true;
        console.log('Loaded from localStorage, isAuthenticated:', isAuthenticated.value);
    }

    return { user, token, isAuthenticated, isLoading, errorMessage, signIn, createAccount, getUser, signOut };
});
