"use strict";

// Authentication module for CircuitFoundry
class AuthModule {
    constructor() {
        this.currentUser = null;
        this.users = [];
    }

    // Initialize auth module
    init() {
        this.loadUsers();
        this.checkAuthState();n    }

    // Load users from localStorage
    loadUsers() {
        const users = localStorage.getItem('circuitfoundry_users');
        this.users = users ? JSON.parse(users) : [];
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('circuitfoundry_users', JSON.stringify(this.users));
    }

    // Check authentication state
    checkAuthState() {
        const currentUser = localStorage.getItem('circuitfoundry_current_user');
        if (currentUser) {
            this.currentUser = JSON.parse(currentUser);
            return true;
        }
        return false;
    }

    // Create new user account
    async createUser(username, email, password) {
        // Validate inputs
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Check if username already exists
        if (this.users.find(user => user.username === username)) {
            throw new Error('Username already exists');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create user object
        const user = {
            id: this.generateUserId(),
            username,
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
            preferences: {}
        };

        // Add user to users list
        this.users.push(user);
        this.saveUsers();

        // Set current user
        this.currentUser = user;
        localStorage.setItem('circuitfoundry_current_user', JSON.stringify(user));

        return user;
    }

    // Login user
    async loginUser(username, password) {
        // Find user
        const user = this.users.find(u => u.username === username);
        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Verify password
        const isValid = await this.verifyPassword(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid username or password');
        }

        // Set current user
        this.currentUser = user;
        localStorage.setItem('circuitfoundry_current_user', JSON.stringify(user));

        return user;
    }

    // Logout user
    logoutUser() {
        this.currentUser = null;
        localStorage.removeItem('circuitfoundry_current_user');
    }

    // Password hashing
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const salt = crypto.getRandomValues(new Uint8Array(16));

        const key = await crypto.subtle.digest('SHA-256', data);
        const keyArray = new Uint8Array(key);

        return Array.from(keyArray, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Verify password
    async verifyPassword(password, storedHash) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === storedHash;
    }

    // Generate unique user ID
    generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Export the module
window.AuthModule = AuthModule;
