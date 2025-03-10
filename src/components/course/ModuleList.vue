 <!--
  ModuleList - Collapsible list of modules with progress tracking
  File path: src/components/course/ModuleList.vue
-->

<template>
    <div class="module-list">
      <transition-group name="module-list" tag="div" class="accordion" :id="accordionId">
        <div 
          v-for="(module, index) in sortedModules" 
          :key="module.id" 
          class="accordion-item module-item"
          :class="{ 'completed': isModuleCompleted(module.id) }"
        >
          <!-- Module Header -->
          <h2 class="accordion-header" :id="`heading-${module.id}`">
            <button 
              class="accordion-button" 
              :class="{ 
                'collapsed': !isModuleExpanded(module.id),
                'module-locked': module.locked && !canManage
              }"
              type="button" 
              data-bs-toggle="collapse" 
              :data-bs-target="`#collapse-${module.id}`" 
              aria-expanded="false" 
              :aria-controls="`collapse-${module.id}`"
              :disabled="module.locked && !canManage"
              @click="toggleModule(module.id)"
            >
              <div class="d-flex justify-content-between align-items-center w-100 pe-3">
                <div class="module-title-section">
                  <div class="d-flex align-items-center">
                    <div class="module-number me-2">{{ index + 1 }}</div>
                    <div class="module-title">{{ module.title }}</div>
                  </div>
                  <div class="module-subtitle text-muted small" v-if="module.subtitle">
                    {{ module.subtitle }}
                  </div>
                </div>
                
                <div class="module-meta d-flex align-items-center">
                  <!-- Module status badges -->
                  <span 
                    v-if="module.locked && !canManage" 
                    class="badge bg-secondary me-2"
                  >
                    <i class="bi bi-lock-fill me-1"></i> Locked
                  </span>
                  
                  <span 
                    v-else-if="isModuleCompleted(module.id)" 
                    class="badge bg-success me-2"
                  >
                    <i class="bi bi-check-circle-fill me-1"></i> Completed
                  </span>
                  
                  <span 
                    v-else-if="isModuleInProgress(module.id)" 
                    class="badge bg-info text-dark me-2"
                  >
                    <i class="bi bi-play-fill me-1"></i> In Progress
                  </span>
                  
                  <!-- Content count and duration -->
                  <span 
                    v-if="module.contentCount" 
                    class="badge bg-light text-dark me-2"
                  >
                    <i class="bi bi-file-text me-1"></i> {{ module.contentCount }}
                  </span>
                  
                  <span 
                    v-if="module.duration" 
                    class="badge bg-light text-dark"
                  >
                    <i class="bi bi-clock me-1"></i> {{ formatDuration(module.duration) }}
                  </span>
                </div>
              </div>
            </button>
          </h2>
          
          <!-- Module Content -->
          <div 
            :id="`collapse-${module.id}`" 
            class="accordion-collapse collapse" 
            :class="{ 'show': isModuleExpanded(module.id) }"
            :aria-labelledby="`heading-${module.id}`" 
            :data-bs-parent="allowMultiple ? '' : `#${accordionId}`"
          >
            <div class="accordion-body">
              <div class="module-content mb-3">
                <p class="module-description" v-if="module.description">
                  {{ module.description }}
                </p>
                
                <!-- Content Items -->
                <div v-if="module.contentItems && module.contentItems.length > 0" class="content-items-list">
                  <div 
                    v-for="(item, i) in module.contentItems" 
                    :key="`item-${module.id}-${i}`"
                    class="content-item"
                  >
                    <div class="d-flex align-items-center">
                      <div class="content-icon me-3">
                        <i :class="getContentTypeIcon(item.contentType)"></i>
                      </div>
                      <div class="content-details flex-grow-1">
                        <div class="content-title">{{ item.title }}</div>
                        <div class="content-meta text-muted small">
                          {{ getContentTypeLabel(item.contentType) }}
                          <span v-if="item.duration" class="ms-2">
                            <i class="bi bi-clock me-1"></i> {{ formatDuration(item.duration) }}
                          </span>
                        </div>
                      </div>
                      <div class="content-actions">
                        <button 
                          class="btn btn-sm btn-primary"
                          @click="navigateToContent(module.id, item.id)"
                        >
                          <i class="bi bi-box-arrow-up-right"></i>
                          <span class="d-none d-md-inline ms-1">View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-muted text-center py-3">
                  <i class="bi bi-info-circle mb-2 d-block" style="font-size: 1.5rem;"></i>
                  <p v-if="canManage">No content added to this module yet. Add content to get started.</p>
                  <p v-else>No content available for this module yet.</p>
                </div>
              </div>
              
              <!-- Module Actions -->
              <div class="module-actions d-flex" :class="{ 'justify-content-between': canManage, 'justify-content-end': !canManage }">
                <!-- Management Actions -->
                <div v-if="canManage" class="management-actions">
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="$emit('edit-module', module)"
                  >
                    <i class="bi bi-pencil me-1"></i> Edit Module
                  </button>
                  
                  <button 
                    class="btn btn-sm btn-outline-success me-2"
                    @click="$emit('add-content', module.id)"
                  >
                    <i class="bi bi-plus-circle me-1"></i> Add Content
                  </button>
                  
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="$emit('delete-module', module)"
                  >
                    <i class="bi bi-trash me-1"></i> Delete
                  </button>
                </div>
                
                <!-- Student Actions -->
                <div class="student-actions" v-if="!canManage">
                  <button 
                    v-if="isModuleCompleted(module.id)"
                    class="btn btn-sm btn-outline-secondary me-2"
                    @click="markModuleIncomplete(module.id)"
                  >
                    <i class="bi bi-arrow-counterclockwise me-1"></i> Mark as Incomplete
                  </button>
                  
                  <button 
                    v-else-if="!module.locked"
                    class="btn btn-sm btn-success"
                    @click="markModuleComplete(module.id)"
                    :disabled="!canMarkComplete(module.id)"
                  >
                    <i class="bi bi-check-circle me-1"></i> Mark as Complete
                  </button>
                </div>
                
                <!-- View Module Link -->
                <router-link 
                  :to="{ name: 'ModuleView', params: { id: module.id }}" 
                  class="btn btn-sm btn-primary"
                  v-if="!module.locked || canManage"
                >
                  <i class="bi bi-eye me-1"></i> View Module
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
      
      <!-- Empty State -->
      <div v-if="modules.length === 0" class="empty-state text-center p-4 border rounded">
        <i class="bi bi-journal-x mb-3" style="font-size: 2rem; color: #6c757d;"></i>
        <h5>No Modules Available</h5>
        <p class="text-muted">
          {{ canManage ? 'Start by adding your first module to this course.' : 'No modules have been added to this course yet.' }}
        </p>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, type PropType, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useProgressStore } from '../../stores/progress'
  import type { Module } from '../../types/module'
  
  export default defineComponent({
    name: 'ModuleList',
    
    props: {
      modules: {
        type: Array as PropType<Module[]>,
        required: true
      },
      canManage: {
        type: Boolean,
        default: false
      },
      allowMultiple: {
        type: Boolean,
        default: false
      }
    },
    
    emits: ['edit-module', 'delete-module', 'add-content', 'module-completed', 'module-incompleted'],
    
    setup(props, { emit }) {
      const router = useRouter()
      const progressStore = useProgressStore()
      
      // Generate unique ID for the accordion
      const accordionId = `module-accordion-${Date.now()}`
      
      // Keep track of expanded modules
      const expandedModules = ref<number[]>([])
      
      // Computed property for sorted modules
      const sortedModules = computed(() => {
        return [...props.modules].sort((a, b) => {
          // Sort by order if available
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order
          }
          // Otherwise sort by ID
          return a.id - b.id
        })
      })
      
      // Check if a module is completed
      const isModuleCompleted = (moduleId: number): boolean => {
        return progressStore.isModuleCompleted(moduleId)
      }
      
      // Check if a module is in progress
      const isModuleInProgress = (moduleId: number): boolean => {
        const module = props.modules.find(m => m.id === moduleId)
        if (!module || !module.contentItems || module.contentItems.length === 0) {
          return false
        }
        
        // In a real app, you would have specific progress tracking
        // This is a simplified implementation
        const completion = Math.random() * 100 // Mock implementation
        return completion > 0 && completion < 100
      }
      
      // Check if a module can be marked as complete
      const canMarkComplete = (moduleId: number): boolean => {
        const module = props.modules.find(m => m.id === moduleId)
        // In a real app, you would check if all required content has been viewed
        return !!module && !module.locked
      }
      
      // Format duration from minutes to human-readable format
      const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
          return `${minutes} min`
        } else {
          const hours = Math.floor(minutes / 60)
          const remainingMinutes = minutes % 60
          if (remainingMinutes === 0) {
            return `${hours} hr${hours !== 1 ? 's' : ''}`
          } else {
            return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min`
          }
        }
      }
      
      // Get icon for content type
      const getContentTypeIcon = (type: string): string => {
        switch (type?.toLowerCase()) {
          case 'video':
            return 'bi bi-play-circle'
          case 'pdf':
            return 'bi bi-file-pdf'
          case 'text':
            return 'bi bi-file-text'
          case 'quiz':
            return 'bi bi-question-circle'
          case 'assignment':
            return 'bi bi-clipboard-check'
          default:
            return 'bi bi-file-earmark'
        }
      }
      
      // Get label for content type
      const getContentTypeLabel = (type: string): string => {
        switch (type?.toLowerCase()) {
          case 'video':
            return 'Video'
          case 'pdf':
            return 'PDF Document'
          case 'text':
            return 'Text Content'
          case 'quiz':
            return 'Quiz'
          case 'assignment':
            return 'Assignment'
          default:
            return 'Content'
        }
      }
      
      // Toggle module expansion
      const toggleModule = (moduleId: number): void => {
        if (!props.allowMultiple) {
          // If multiple modules are not allowed, replace the array
          if (expandedModules.value.includes(moduleId)) {
            expandedModules.value = []
          } else {
            expandedModules.value = [moduleId]
          }
        } else {
          // If multiple modules are allowed, toggle the specific module
          if (expandedModules.value.includes(moduleId)) {
            expandedModules.value = expandedModules.value.filter(id => id !== moduleId)
          } else {
            expandedModules.value.push(moduleId)
          }
        }
      }
      
      // Check if a module is expanded
      const isModuleExpanded = (moduleId: number): boolean => {
        return expandedModules.value.includes(moduleId)
      }
      
      // Mark a module as complete
      const markModuleComplete = async (moduleId: number) => {
        if (!canMarkComplete(moduleId)) return
        
        try {
          await progressStore.markModuleCompleted(moduleId)
          emit('module-completed', moduleId)
        } catch (error) {
          console.error('Failed to mark module as complete:', error)
          // In a real app, you would show a notification to the user
        }
      }
      
      // Mark a module as incomplete
      const markModuleIncomplete = async (moduleId: number) => {
        try {
          await progressStore.markModuleIncomplete(moduleId)
          emit('module-incompleted', moduleId)
        } catch (error) {
          console.error('Failed to mark module as incomplete:', error)
          // In a real app, you would show a notification to the user
        }
      }
      
      // Navigate to content
      const navigateToContent = (moduleId: number, contentId: number) => {
        // Navigate to module view with a query parameter for the specific content
        router.push({ 
          name: 'ModuleView', 
          params: { id: moduleId },
          query: { content: contentId.toString() }
        })
      }
      
      // Initialize - expand the first module if none are expanded
      onMounted(() => {
        if (props.modules.length > 0 && expandedModules.value.length === 0) {
          // Expand the first accessible module
          const firstAccessibleModule = props.modules.find(m => !m.locked || props.canManage)
          if (firstAccessibleModule) {
            expandedModules.value = [firstAccessibleModule.id]
          }
        }
      })
      
      return {
        accordionId,
        sortedModules,
        expandedModules,
        isModuleCompleted,
        isModuleInProgress,
        canMarkComplete,
        formatDuration,
        getContentTypeIcon,
        getContentTypeLabel,
        toggleModule,
        isModuleExpanded,
        markModuleComplete,
        markModuleIncomplete,
        navigateToContent
      }
    }
  })
  </script>
  
  <style scoped>
  .module-list {
    margin-bottom: 2rem;
  }
  
  .module-item {
    margin-bottom: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .module-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  
  .module-item.completed {
    border-left: 4px solid #20c997;
  }
  
  .accordion-button {
    padding: 1rem;
    font-weight: 500;
  }
  
  .accordion-button:not(.collapsed) {
    background-color: rgba(253, 126, 20, 0.05);
    color: #fd7e14;
  }
  
  .accordion-button:focus {
    box-shadow: 0 0 0 0.25rem rgba(253, 126, 20, 0.25);
  }
  
  .module-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #fd7e14;
    color: white;
    font-weight: 600;
    border-radius: 50%;
    font-size: 0.85rem;
  }
  
  .accordion-button.module-locked {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
  
  .module-description {
    color: #6c757d;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
  
  .content-items-list {
    background-color: #f8f9fa;
    border-radius: 0.25rem;
    overflow: hidden;
  }
  
  .content-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.2s ease;
  }
  
  .content-item:last-child {
    border-bottom: none;
  }
  
  .content-item:hover {
    background-color: rgba(253, 126, 20, 0.05);
  }
  
  .content-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e9ecef;
    color: #6c757d;
    font-size: 1.25rem;
  }
  
  .content-title {
    font-weight: 500;
    color: #343a40;
    margin-bottom: 0.25rem;
  }
  
  .module-actions, .content-actions {
    margin-top: 0.5rem;
  }
  
  .module-actions button, .content-actions button {
    transition: all 0.2s ease;
  }
  
  .module-actions button:hover, .content-actions button:hover {
    transform: translateY(-2px);
  }
  
  .empty-state {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 2rem !important;
  }
  
  /* List transition animations */
  .module-list-enter-active,
  .module-list-leave-active {
    transition: all 0.5s ease;
  }
  
  .module-list-enter-from,
  .module-list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  
  .module-list-move {
    transition: transform 0.5s ease;
  }
  
  /* Media Queries */
  @media (max-width: 768px) {
    .module-meta {
      display: none !important;
    }
    
    .content-item {
      padding: 0.5rem;
    }
    
    .content-icon {
      width: 30px;
      height: 30px;
      font-size: 1rem;
    }
    
    .module-actions {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
  </style>