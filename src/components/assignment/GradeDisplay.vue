 <!--
  GradeDisplay - Component for displaying assignment grades
  File path: src/components/assignment/GradeDisplay.vue
-->

<template>
    <div class="grade-display">
      <div v-if="loading" class="text-center p-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="small text-muted mt-2 mb-0">Loading grade...</p>
      </div>
      
      <div v-else-if="!grade && !graded" class="ungraded-state">
        <div class="d-flex align-items-center">
          <i class="bi bi-hourglass-split grade-icon text-muted me-3"></i>
          <div>
            <h5 class="mb-1">Not Graded Yet</h5>
            <p class="text-muted mb-0">Your submission is pending review by your instructor.</p>
          </div>
        </div>
      </div>
      
      <div v-else-if="graded" class="graded-state">
        <div class="grade-header d-flex justify-content-between align-items-center mb-2">
          <h5 class="mb-0">Your Grade</h5>
          <span class="grade-pill" :class="getGradeClass()">
            {{ grade }}/{{ maxScore }}
          </span>
        </div>
        
        <div class="progress mb-3" style="height: 10px;">
          <div 
            class="progress-bar" 
            :class="getProgressClass()"
            role="progressbar" 
            :style="`width: ${percentage}%`" 
            :aria-valuenow="percentage" 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
        
        <div class="d-flex justify-content-between mb-2">
          <span class="grade-label">Failed</span>
          <span class="grade-label">Average</span>
          <span class="grade-label">Excellent</span>
        </div>
        
        <div v-if="feedback" class="feedback-section mt-3 p-3">
          <h6 class="feedback-header mb-2">
            <i class="bi bi-chat-left-text me-2"></i>
            Instructor Feedback
          </h6>
          <p class="feedback-content mb-0">{{ feedback }}</p>
        </div>
        
        <div v-if="showGradedDate && gradedAt" class="graded-info mt-3">
          <small class="text-muted">
            <i class="bi bi-clock me-1"></i>
            Graded on {{ formatDate(gradedAt) }}
          </small>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed, ref, watch, type PropType } from 'vue'
  import type { Submission } from '../../types/assignment'
  
  export default defineComponent({
    name: 'GradeDisplay',
    props: {
      submission: {
        type: Object as PropType<Submission | null>,
        default: null
      },
      maxScore: {
        type: Number,
        default: 100
      },
      loading: {
        type: Boolean,
        default: false
      },
      showGradedDate: {
        type: Boolean,
        default: true
      }
    },
    setup(props) {
      // Computed properties
      const grade = computed(() => props.submission?.grade)
      const graded = computed(() => grade.value !== undefined && grade.value !== null)
      const feedback = computed(() => props.submission?.feedback || '')
      const gradedAt = computed(() => props.submission?.gradedAt)
      
      // Calculate percentage for progress bar
      const percentage = computed(() => {
        if (!graded.value || grade.value === undefined || grade.value === null) {
          return 0
        }
        return (grade.value / props.maxScore) * 100
      })
      
      // Methods
      const getGradeClass = () => {
        if (!graded.value || grade.value === undefined || grade.value === null) {
          return 'grade-pending'
        }
        
        const percentage = (grade.value / props.maxScore) * 100
        
        if (percentage >= 90) {
          return 'grade-excellent'
        } else if (percentage >= 70) {
          return 'grade-good'
        } else if (percentage >= 60) {
          return 'grade-average'
        } else {
          return 'grade-poor'
        }
      }
      
      const getProgressClass = () => {
        if (!graded.value || grade.value === undefined || grade.value === null) {
          return 'bg-secondary'
        }
        
        const percentage = (grade.value / props.maxScore) * 100
        
        if (percentage >= 90) {
          return 'bg-success'
        } else if (percentage >= 70) {
          return 'bg-primary'
        } else if (percentage >= 60) {
          return 'bg-info'
        } else {
          return 'bg-danger'
        }
      }
      
      const formatDate = (dateString: string): string => {
        if (!dateString) return ''
        
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      return {
        grade,
        graded,
        feedback,
        gradedAt,
        percentage,
        getGradeClass,
        getProgressClass,
        formatDate
      }
    }
  })
  </script>
  
  <style scoped>
  .grade-display {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1.25rem;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
  }
  
  .grade-display:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  
  .grade-icon {
    font-size: 2rem;
  }
  
  .grade-pill {
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.35rem 0.8rem;
    border-radius: 2rem;
  }
  
  .grade-excellent {
    background-color: #d4edda;
    color: #155724;
  }
  
  .grade-good {
    background-color: #cce5ff;
    color: #004085;
  }
  
  .grade-average {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .grade-poor {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .grade-pending {
    background-color: #e2e3e5;
    color: #383d41;
  }
  
  .grade-label {
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  .feedback-section {
    background-color: white;
    border-radius: 6px;
    border-left: 3px solid #fd7e14;
  }
  
  .feedback-header {
    color: #495057;
  }
  
  .feedback-content {
    font-style: italic;
    color: #495057;
  }
  
  .ungraded-state, .graded-state {
    animation: fadeIn 0.5s ease-in;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  </style>