 <!--
  CourseCard - Visual representation of a course for dashboard and course list
  File path: src/components/course/CourseCard.vue
-->

<template>
    <div 
      class="course-card h-100"
      :class="{ 
        'teaching': course.isTeaching,
        'enrolled': course.isEnrolled && !course.isTeaching
      }"
      @click="$emit('click')"
    >
      <div class="card-body d-flex flex-column">
        <!-- Card Header -->
        <div class="course-header mb-3">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="card-title mb-0">{{ course.name }}</h5>
            <span class="course-code badge bg-secondary">{{ course.code }}</span>
          </div>
          <!-- <div class="course-instructor text-muted small mt-1">
            <span v-if="course.instructorName">{{ course.instructorName }}</span>
            <span v-else-if="course.isTeaching">You're teaching</span>
          </div> -->
        </div>
        
        <!-- Course Content -->
        <p class="card-text course-description flex-grow-1">{{ course.description }}</p>
        
        <!-- Course Meta Info -->
        <div class="course-meta mt-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center">
              <i class="bi bi-calendar3 me-2 text-primary"></i>
              <span class="small text-muted">{{ formatSchedule(course.schedule) }}</span>
            </div>
            <div class="d-flex align-items-center">
              <i class="bi bi-people-fill me-2 text-primary"></i>
              <span class="small text-muted">{{ course.studentCount || 0 }} students</span>
            </div>
          </div>
          
          <!-- Progress Bar (when applicable) -->
          <div v-if="showProgress && progress !== null" class="mt-2">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="small">Progress</span>
              <span class="small fw-bold">{{ Math.round(progress) }}%</span>
            </div>
            <div class="progress" style="height: 8px;">
              <div 
                class="progress-bar progress-bar-striped" 
                role="progressbar" 
                :class="progressBarClass"
                :style="{ width: `${progress}%` }" 
                :aria-valuenow="progress" 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Card Actions -->
        <div class="course-actions d-flex justify-content-between mt-3">
          <div>
            <span 
              v-if="course.isTeaching" 
              class="badge bg-success me-1"
            >
              Teaching
            </span>
            <span 
              v-else-if="course.role === 'student'" 
              class="badge bg-primary me-1"
            >
              Enrolled
            </span>
            <span 
              v-if="hasRecentActivity" 
              class="badge bg-warning text-dark"
            >
              New
            </span>
          </div>
          
          <button 
            class="btn btn-sm btn-primary view-button"
            @click.stop="$emit('click')"
          >
            <i class="bi bi-arrow-right me-1"></i>
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed, type PropType } from 'vue'
  import type { Course } from '../../types/course'
  
  export default defineComponent({
    name: 'CourseCard',
    
    props: {
      course: {
        type: Object as PropType<Course>,
        required: true
      },
      showProgress: {
        type: Boolean,
        default: true
      }
    },
    
    emits: ['click'],
    
    setup(props) {
      // Computed value for progress
      const progress = computed(() => {
        return props.course.progress !== undefined ? props.course.progress : null
      })
      
      // Computed class for progress bar
      const progressBarClass = computed(() => {
        if (progress.value === null) return ''
        
        if (progress.value >= 100) {
          return 'bg-success'
        } else if (progress.value >= 50) {
          return 'bg-info'
        } else if (progress.value >= 25) {
          return 'bg-primary'
        } else {
          return 'bg-warning'
        }
      })
      
      // Check if course has recent activity (would be determined by backend in real app)
      const hasRecentActivity = computed(() => {
        // Check if course was updated in the last 7 days
        if (!props.course.updatedAt) return false
        
        const updatedAt = new Date(props.course.updatedAt)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - updatedAt.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        return diffDays <= 7
      })
      
      // Format the schedule
      const formatSchedule = (schedule: string): string => {
        if (!schedule) return 'No schedule set'
        
        // Basic formatting - in a real app, this might be more sophisticated
        return schedule
      }
      
      return {
        progress,
        progressBarClass,
        hasRecentActivity,
        formatSchedule
      }
    }
  })
  </script>
  
  <style scoped>
  .course-card {
    position: relative;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #fd7e14;
  }
  
  .course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  .course-card.teaching {
    border-left-color: #20c997;
  }
  
  .course-card.enrolled {
    border-left-color: #0d6efd;
  }
  
  .card-title {
    font-weight: 600;
    color: #343a40;
    transition: color 0.2s ease;
  }
  
  .course-card:hover .card-title {
    color: #fd7e14;
  }
  
  .course-code {
    font-size: 0.8rem;
    padding: 0.35rem 0.65rem;
  }
  
  .course-description {
    color: #6c757d;
    font-size: 0.9rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 4rem;
  }
  
  .course-meta i {
    font-size: 0.9rem;
  }
  
  .view-button {
    transition: all 0.2s ease;
    transform-origin: right;
  }
  
  .course-card:hover .view-button {
    background-color: #fd7e14;
    border-color: #fd7e14;
    transform: scale(1.05);
  }
  
  /* Progress bar colors - used in computed property */
  .progress-bar.bg-success {
    background-color: #20c997 !important;
  }
  
  .progress-bar.bg-info {
    background-color: #0dcaf0 !important;
  }
  
  .progress-bar.bg-primary {
    background-color: #0d6efd !important;
  }
  
  .progress-bar.bg-warning {
    background-color: #ffc107 !important;
  }
  
  .progress {
    background-color: #e9ecef;
    overflow: hidden;
  }
  
  /* Animation for hover effect */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(253, 126, 20, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(253, 126, 20, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(253, 126, 20, 0);
    }
  }
  
  .course-card:hover .view-button {
    animation: pulse 1.5s infinite;
  }
  </style>