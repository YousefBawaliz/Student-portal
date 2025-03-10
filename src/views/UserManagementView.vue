 <!--
  UserManagementView - Admin interface for managing users
  File path: src/views/UserManagementView.vue
-->

<template>
    <div class="user-management">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>User Management</h1>
        
        <button class="btn btn-primary">
          <i class="bi bi-person-plus me-2"></i>Create User
        </button>
      </div>
      
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search by name, username, or email"
                  v-model="searchQuery"
                />
              </div>
            </div>
            
            <div class="col-md-3">
              <select class="form-select" v-model="roleFilter">
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
              </select>
            </div>
            
            <div class="col-md-3">
              <button class="btn btn-outline-secondary w-100" @click="applyFilters">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <div v-else-if="users.length === 0" class="alert alert-info">
        No users found. Try adjusting your filter criteria.
      </div>
      
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="getRoleBadgeClass(user.role)">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ user.createdAt }}</td>
              <td>{{ user.lastLogin || 'Never' }}</td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination controls -->
      <nav aria-label="User pagination" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item disabled">
            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
          </li>
          <li class="page-item active"><a class="page-link" href="#">1</a></li>
          <li class="page-item"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
          <li class="page-item">
            <a class="page-link" href="#">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue'
  import { useAuthStore } from '../stores/auth'
  import type { User } from '../types/user'
  
  
  export default defineComponent({
    name: 'UserManagementView',
    setup() {
      // State
      const loading = ref(true)
      const error = ref('')
      const users = ref<User[]>([])
      const searchQuery = ref('')
      const roleFilter = ref('all')
      
      // Methods
      const fetchUsers = async () => {
        // TODO: Implement fetching users
      }
      
      const applyFilters = () => {
        // TODO: Implement filter logic
      }
      
      const getRoleBadgeClass = (role: string) => {
        switch(role) {
          case 'admin': return 'bg-danger'
          case 'teacher': return 'bg-success'
          case 'student': return 'bg-primary'
          default: return 'bg-secondary'
        }
      }
      
      // Lifecycle hooks
      onMounted(() => {
        fetchUsers()
      })
      
      return {
        loading,
        error,
        users,
        searchQuery,
        roleFilter,
        applyFilters,
        getRoleBadgeClass
      }
    }
  })
  </script>
  
  <style scoped>
  .user-management {
    padding: 1rem;
  }
  </style>