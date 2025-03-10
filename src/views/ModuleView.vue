 <!--
  ModuleView - Displays content for a specific module
  File path: src/views/ModuleView.vue
-->

<template>
    <div class="module-view">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <div v-else>
        <!-- Module Header -->
        <div class="module-header card mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="d-flex align-items-center mb-3">
                  <router-link
                    :to="{ name: 'CourseDetail', params: { id: module.courseId } }"
                    class="btn btn-sm btn-outline-secondary me-3"
                  >
                    <i class="bi bi-arrow-left me-1"></i> Back to Course
                  </router-link>
                  <h1 class="card-title mb-0">{{ module.title }}</h1>
                </div>
                <p class="card-text">{{ module.description }}</p>
              </div>
              
              <div class="btn-group" v-if="canManageModule">
                <button class="btn btn-outline-primary">
                  <i class="bi bi-pencil me-1"></i> Edit
                </button>
                <button class="btn btn-outline-danger">
                  <i class="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Module Content -->
        <div class="module-content mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Content</h2>
            <button v-if="canManageModule" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>Add Content
            </button>
          </div>
          
          <div v-if="!contentItems.length" class="alert alert-info">
            No content available for this module yet.
          </div>
          
          <div v-else>
            <!-- Content items will be displayed here -->
            <ContentViewer v-for="item in contentItems" :key="item.id" :content="item" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  import { useModuleStore } from '../stores/module'
  import ContentViewer from '../components/content/ContentViewer.vue'
  import type { User } from '../types/user'
  
  export default defineComponent({
    name: 'ModuleView',
    components: {
      ContentViewer
    },
    setup() {
      const route = useRoute()
      const authStore = useAuthStore()
      const moduleStore = useModuleStore()
      
      // State
      const loading = ref(true)
      const error = ref('')
      const contentItems = ref([])
      
      // Computed properties
      const moduleId = computed(() => Number(route.params.id))
      const module = computed(() => moduleStore.currentModule)
      const canManageModule = computed(() => 
        authStore.isAdmin || 
        (authStore.isTeacher && module.value?.canManage)
      )
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
      const fetchModuleData = async () => {
        // TODO: Implement fetching module data
      }
      
      // Lifecycle hooks
      onMounted(() => {
        fetchModuleData()
      })
      
      return {
        loading,
        error,
        module,
        contentItems,
        canManageModule,
        user
      }
    }
  })
  </script>
  
  <style scoped>
  .module-view {
    padding: 1rem;
  }
  
  .module-header {
    border-left: 4px solid #fd7e14;
  }
  </style>