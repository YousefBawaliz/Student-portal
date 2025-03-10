 <!--
  ProgressTracker - Component to visualize student progress in a course
  File path: src/components/progress/ProgressTracker.vue
-->

<template>
    <div class="progress-tracker">
      <!-- Different visualization based on display type -->
      <div v-if="displayType === 'circle'" class="progress-circle-container">
        <div class="progress-circle" :style="{ background: `conic-gradient(${themeColor} ${progressDegrees}deg, #e9ecef 0deg)` }">
          <div class="progress-inner">
            <div class="progress-value">{{ displayValue }}</div>
            <div v-if="showLabel" class="progress-label">{{ label || 'Complete' }}</div>
          </div>
        </div>
      </div>
  
      <div v-else-if="displayType === 'bar'" class="progress-bar-container">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <div v-if="showLabel" class="progress-label">{{ label || 'Progress' }}</div>
          <div class="progress-value">{{ displayValue }}</div>
        </div>
        <div class="progress" :style="{ height: `${barHeight}px` }">
          <div 
            class="progress-bar progress-bar-striped" 
            :class="{ 'progress-bar-animated': animated }"
            role="progressbar" 
            :style="{ width: `${value}%`, backgroundColor: themeColor }" 
            :aria-valuenow="value" 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
      </div>
  
      <!-- Module completion list for detailed view -->
      <div v-if="displayType === 'detailed' && modules && modules.length > 0" class="module-progress-list mt-3">
        <div class="module-progress-header d-flex justify-content-between">
          <div>Modules</div>
          <div>Status</div>
        </div>
        <transition-group name="list" tag="div" class="module-list">
          <div v-for="module in modules" :key="module.id" class="module-item">
            <div class="d-flex justify-content-between align-items-center py-2 px-1 border-bottom">
              <div class="module-title text-truncate">{{ module.title || `Module ${module.moduleId || module.id}` }}</div>
              <div class="module-status">
                <span v-if="module.completed" class="badge bg-success">
                  <i class="bi bi-check-circle-fill me-1"></i>Completed
                </span>
                <span v-else class="badge bg-secondary">
                  <i class="bi bi-circle me-1"></i>Pending
                </span>
              </div>
            </div>
          </div>
        </transition-group>
        <div v-if="showModuleCount" class="module-summary mt-2 text-muted">
          {{ completedModules }} of {{ modules.length }} modules completed
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed, type PropType } from 'vue'
  import { useProgressStore } from '../../stores/progress'

  // Define a local interface that combines properties needed from both Module and ModuleProgress
  interface Module {
    id: number;
    title?: string;
    moduleId?: number; // For ModuleProgress objects
    completed: boolean;
    completedAt?: string | null;
  }
  
  export default defineComponent({
    name: 'ProgressTracker',
    props: {
      // Course ID to track progress for
      courseId: {
        type: Number,
        required: false,
        default: null
      },
      // Module ID for individual module progress
      moduleId: {
        type: Number,
        required: false,
        default: null
      },
      // Display type: 'circle', 'bar', or 'detailed'
      displayType: {
        type: String,
        default: 'bar',
        validator: (value: string) => ['circle', 'bar', 'detailed'].includes(value)
      },
      // Override the calculated progress value (0-100)
      value: {
        type: Number,
        default: null
      },
      // Color theme for the progress indicator
      color: {
        type: String,
        default: '#fd7e14' // Default to orange theme
      },
      // Height for progress bar in pixels
      barHeight: {
        type: Number,
        default: 8
      },
      // Show progress animation
      animated: {
        type: Boolean,
        default: false
      },
      // Custom label text
      label: {
        type: String,
        default: ''
      },
      // Show or hide the label
      showLabel: {
        type: Boolean,
        default: true
      },
      // Show count of modules completed
      showModuleCount: {
        type: Boolean,
        default: true
      },
      // Custom modules data (for when not using a courseId)
      customModules: {
        type: Array as PropType<Module[]>,
        default: () => []
      }
    },
    setup(props) {
      const progressStore = useProgressStore()
  
      // Computed progress value based on props or store data
      const progressValue = computed(() => {
        // If explicit value is provided, use it
        if (props.value !== null) {
          return Math.min(Math.max(props.value, 0), 100)
        }
  
        // For course progress
        if (props.courseId) {
          const courseProgress = progressStore.getCourseProgress(props.courseId)
          return courseProgress ? courseProgress.percentage : 0
        }
  
        // For module progress
        if (props.moduleId) {
          const isCompleted = progressStore.isModuleCompleted(props.moduleId)
          return isCompleted ? 100 : 0
        }
  
        return 0
      })
  
      // Format display value with % sign
      const displayValue = computed(() => {
        return `${Math.round(progressValue.value)}%`
      })
  
      // Calculate degrees for circle progress (360 degrees = 100%)
      const progressDegrees = computed(() => {
        return (progressValue.value / 100) * 360
      })
  
      // Theme color based on props
      const themeColor = computed(() => props.color)
  
      // Get modules for the course
      const modules = computed(() => {
        if (props.customModules && props.customModules.length > 0) {
          return props.customModules
        }
  
        if (props.courseId) {
          const courseProgress = progressStore.getCourseProgress(props.courseId)
          if (courseProgress && courseProgress.modules) {
            // Map ModuleProgress objects to include a title property
            return courseProgress.modules.map(module => ({
              ...module,
              title: `Module ${module.moduleId || module.id}`
            }))
          }
        }
  
        return []
      })
  
      // Count of completed modules
      const completedModules = computed(() => {
        return modules.value.filter(module => module.completed).length
      })
  
      return {
        progressValue,
        displayValue,
        progressDegrees,
        themeColor,
        modules,
        completedModules
      }
    }
  })
  </script>
  
  <style scoped>
  .progress-tracker {
    width: 100%;
  }
  
  /* Circle progress styles */
  .progress-circle-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 0;
  }
  
  .progress-circle {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 1s ease;
  }
  
  .progress-inner {
    position: absolute;
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  }
  
  .progress-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
  }
  
  .progress-label {
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  /* Bar progress styles */
  .progress-bar-container {
    width: 100%;
  }
  
  .progress {
    background-color: #e9ecef;
    border-radius: 0.25rem;
    overflow: hidden;
  }
  
  /* Detailed view styles */
  .module-progress-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .module-progress-header {
    font-weight: bold;
    padding: 0.5rem 0.25rem;
    border-bottom: 2px solid #dee2e6;
    font-size: 0.9rem;
    color: #495057;
  }
  
  .module-item {
    transition: all 0.3s ease;
  }
  
  .module-item:hover {
    background-color: #f8f9fa;
  }
  
  .module-title {
    max-width: 70%;
    font-size: 0.9rem;
  }
  
  .module-status .badge {
    font-weight: normal;
  }
  
  .module-summary {
    font-size: 0.85rem;
    text-align: right;
  }
  
  /* Transition animations */
  .list-enter-active,
  .list-leave-active {
    transition: all 0.3s ease;
  }
  
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  
  /* Responsive adjustments */
  @media (min-width: 576px) {
    .progress-circle {
      width: 120px;
      height: 120px;
    }
    
    .progress-inner {
      width: 96px;
      height: 96px;
    }
    
    .progress-value {
      font-size: 1.75rem;
    }
  }
  </style>