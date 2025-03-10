/**
 * Authentication Store
 * Handles user authentication, session management, and user information
 * File path: src/stores/auth.ts
 */

import { defineStore } from 'pinia'
import authService from '../services/authService'
import type { User } from '../types/user'
import router from '../router'

interface AuthState {
  currentUser: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: () => true,
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isTeacher: (state) => state.currentUser?.role === 'teacher',
    isStudent: (state) => state.currentUser?.role === 'student',
    userRole: (state) => state.currentUser?.role || null
  },

  actions: {
    /**
     * Login user with username and password
     */
    async login(username: string, password: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.login(username, password)
        this.token = response.token
        this.currentUser = response.user
        
        // Store token in localStorage
        localStorage.setItem('token', response.token)
        
        // Redirect to dashboard after successful login
        router.push({ name: 'Dashboard' })
        
        return true
      } catch (error: any) {
        this.error = error.message || 'Login failed. Please check your credentials.'
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Logout current user
     */
    async logout() {
      this.isLoading = true
      
      try {
        // Call backend to invalidate token if needed
        await authService.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear state regardless of API response
        this.token = null
        this.currentUser = null
        localStorage.removeItem('token')
        this.isLoading = false
        
        // Redirect to login page
        router.push({ name: 'Login' })
      }
    },
    
    /**
     * Check if user is authenticated and fetch user profile
     */
    async checkAuth() {
      // Skip if no token exists
      if (!this.token) {
        return false
      }
      
      this.isLoading = true
      
      try {
        const user = await authService.getCurrentUser()
        this.currentUser = user
        return true
      } catch (error) {
        // Token might be invalid or expired
        this.token = null
        this.currentUser = null
        localStorage.removeItem('token')
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Update user profile information
     */
    async updateProfile(userData: Partial<User>) {
      if (!this.currentUser) {
        throw new Error('No authenticated user')
      }
      
      this.isLoading = true
      
      try {
        const updatedUser = await authService.updateProfile(userData)
        this.currentUser = updatedUser
        return updatedUser
      } catch (error: any) {
        this.error = error.message || 'Failed to update profile'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Clear any error messages
     */
    clearError() {
      this.error = null
    }
  }
})