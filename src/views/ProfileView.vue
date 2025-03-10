 <!--
  ProfileView - User's own profile information and settings
  File path: src/views/ProfileView.vue
-->

<template>
    <div class="profile-view">
      <h1 class="mb-4">My Profile</h1>
      
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <div v-else class="row">
        <!-- Profile Information -->
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="card-title">Profile Information</h3>
            </div>
            
            <div class="card-body">
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label">Name</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ user.name }}</p>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label">Username</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ user.username }}</p>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label">Email</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ user.email }}</p>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label">Role</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">
                    <span class="badge" :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </p>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label class="col-sm-4 col-form-label">Member Since</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ user.createdAt }}</p>
                </div>
              </div>
              
              <div class="mb-0 row">
                <label class="col-sm-4 col-form-label">Last Login</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ user.lastLogin || 'Never' }}</p>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <button class="btn btn-primary" @click="showEditProfileForm = true">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        
        <!-- Change Password -->
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="card-title">Change Password</h3>
            </div>
            
            <div class="card-body">
              <form @submit.prevent="changePassword">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Current Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    required
                  />
                </div>
                
                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    required
                  />
                </div>
                
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    required
                  />
                </div>
                
                <button type="submit" class="btn btn-primary">Change Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue'
  import { useAuthStore } from '../stores/auth'
  import type { User } from '../types/user'
  // import { useUserStore } from '../stores/user'
  
  export default defineComponent({
    name: 'ProfileView',
    setup() {
      const authStore = useAuthStore()
      
      // State
      const loading = ref(false)
      const error = ref('')
      const showEditProfileForm = ref(false)
      const passwordForm = ref({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      // Computed properties
      const user = computed<User>(() => {
        return authStore.currentUser || {
          id: 0,
          username: '',
          email: '',
          name: '',
          role: 'student',
          createdAt: '',
          lastLogin: ''
        }
      })
      
      // Methods
      const getRoleBadgeClass = (role: string) => {
        switch(role) {
          case 'admin': return 'bg-danger'
          case 'teacher': return 'bg-success'
          case 'student': return 'bg-primary'
          default: return 'bg-secondary'
        }
      }
      
      const changePassword = async () => {
        // TODO: Implement password change logic
      }
      
      return {
        loading,
        error,
        user,
        showEditProfileForm,
        passwordForm,
        getRoleBadgeClass,
        changePassword
      }
    }
  })
  </script>
  
  <style scoped>
  .profile-view {
    padding: 1rem;
  }
  </style>