 <!--
  LoginView - Authentication view for the Student Portal
  File path: src/views/LoginView.vue
-->

<template>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="../assets/logo.svg" alt="University Logo" class="logo" />
          <h1 class="text-center">Student Portal</h1>
        </div>
        
        <div class="login-body">
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input
                type="text"
                class="form-control"
                id="username"
                v-model="username"
                placeholder="Enter your username"
                required
                autofocus
              />
            </div>
            
            <div class="mb-4">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="password"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div class="d-grid">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Sign In
              </button>
            </div>
          </form>
        </div>
        
        <div class="login-footer">
          <p class="text-center text-muted mb-0">
            © {{ currentYear }} University Student Portal
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  
  export default defineComponent({
    name: 'LoginView',
    setup() {
      const router = useRouter()
      const authStore = useAuthStore()
      
      // Form data
      const username = ref('')
      const password = ref('')
      const error = ref('')
      const loading = ref(false)
      
      // Computed properties
      const currentYear = computed(() => new Date().getFullYear())
      
      // Methods
      const handleLogin = async () => {
        try {
          loading.value = true
          error.value = ''
          
          // Attempt to login
          await authStore.login(username.value, password.value)
          
          // Redirect to dashboard on success
          router.push('/dashboard')
        } catch (err: any) {
          error.value = err.message || 'Login failed. Please try again.'
        } finally {
          loading.value = false
        }
      }
      
      return {
        username,
        password,
        error,
        loading,
        currentYear,
        handleLogin
      }
    }
  })
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f8f9fa;
  }
  
  .login-card {
    width: 100%;
    max-width: 420px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    overflow: hidden;
    transition: transform 0.3s ease;
  }
  
  .login-card:hover {
    transform: translateY(-5px);
  }
  
  .login-header {
    padding: 2rem 1.5rem;
    background-color: #f8f9fa;
    border-bottom: 3px solid #fd7e14;
  }
  
  .login-body {
    padding: 2rem 1.5rem;
  }
  
  .login-footer {
    padding: 1rem;
    border-top: 1px solid #e9ecef;
  }
  
  .logo {
    display: block;
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
  }
  </style>