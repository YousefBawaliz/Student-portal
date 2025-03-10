 <!--
  AssignmentSubmitter - Component for submitting assignment links
  File path: src/components/assignment/AssignmentSubmitter.vue
-->

<template>
    <div class="assignment-submitter">
      <form @submit.prevent="submitAssignment">
        <div class="mb-3">
          <label for="submissionUrl" class="form-label">
            Submission URL <span class="text-danger">*</span>
          </label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-link-45deg"></i>
            </span>
            <input
              type="url"
              class="form-control"
              id="submissionUrl"
              v-model="submissionUrl"
              placeholder="https://"
              required
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-text">
            Provide a link to your assignment submission (e.g., Google Drive, GitHub, or any other file sharing service)
          </div>
        </div>
  
        <div class="d-flex justify-content-between align-items-center">
          <div v-if="existingSubmission" class="text-muted small">
            <i class="bi bi-info-circle me-1"></i>
            Submitting will update your previous submission.
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !submissionUrl"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ existingSubmission ? 'Update Submission' : 'Submit Assignment' }}
          </button>
        </div>
      </form>
  
      <div v-if="submitError" class="alert alert-danger mt-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ submitError }}
        <button type="button" class="btn btn-sm btn-link text-danger" @click="submitError = ''">
          Dismiss
        </button>
      </div>
  
      <div v-if="submitSuccess" class="alert alert-success mt-3">
        <i class="bi bi-check-circle-fill me-2"></i>
        {{ submitSuccess }}
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted, watch, type PropType } from 'vue'
  import { useAssignmentStore } from '../../stores/assignment'
  import type { Submission } from '../../types/assignment'
  
  export default defineComponent({
    name: 'AssignmentSubmitter',
    props: {
      assignmentId: {
        type: Number,
        required: true
      },
      existingSubmission: {
        type: Object as PropType<Submission | null>,
        default: null
      }
    },
    emits: ['submission-complete'],
    setup(props, { emit }) {
      const assignmentStore = useAssignmentStore()
      
      // State
      const submissionUrl = ref('')
      const isSubmitting = ref(false)
      const submitError = ref('')
      const submitSuccess = ref('')
      
      // Initialize form with existing submission if available
      onMounted(() => {
        if (props.existingSubmission?.submissionUrl) {
          submissionUrl.value = props.existingSubmission.submissionUrl
        }
      })
      
      // Reset form if existingSubmission changes
      watch(() => props.existingSubmission, (newSubmission) => {
        if (newSubmission?.submissionUrl) {
          submissionUrl.value = newSubmission.submissionUrl
        }
      })
      
      // Methods
      const submitAssignment = async () => {
        // Validate URL (basic validation)
        if (!isValidUrl(submissionUrl.value)) {
          submitError.value = 'Please enter a valid URL including http:// or https://'
          return
        }
        
        isSubmitting.value = true
        submitError.value = ''
        submitSuccess.value = ''
        
        try {
          const submissionData = {
            assignmentId: props.assignmentId,
            submissionUrl: submissionUrl.value.trim()
          }
          
          const submission = await assignmentStore.submitAssignment(submissionData)
          
          // Display success message
          submitSuccess.value = props.existingSubmission 
            ? 'Your submission has been updated successfully!' 
            : 'Your assignment has been submitted successfully!'
            
          // Emit event to parent component
          emit('submission-complete', submission)
          
          // Clear the success message after 5 seconds
          setTimeout(() => {
            submitSuccess.value = ''
          }, 5000)
        } catch (error: any) {
          console.error('Error submitting assignment:', error)
          submitError.value = error.message || 'Failed to submit assignment. Please try again.'
        } finally {
          isSubmitting.value = false
        }
      }
      
      // Utility function to validate URL
      const isValidUrl = (urlString: string): boolean => {
        try {
          const url = new URL(urlString)
          return url.protocol === 'http:' || url.protocol === 'https:'
        } catch (e) {
          return false
        }
      }
      
      return {
        submissionUrl,
        isSubmitting,
        submitError,
        submitSuccess,
        submitAssignment
      }
    }
  })
  </script>
  
  <style scoped>
  .assignment-submitter {
    padding: 1rem;
    border-radius: 8px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
  }
  
  .assignment-submitter:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .btn-primary {
    background-color: #fd7e14;
    border-color: #fd7e14;
    transition: all 0.2s ease;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #e76b08;
    border-color: #e76b08;
    transform: translateY(-2px);
  }
  
  .btn-primary:disabled {
    background-color: #fd7e14;
    border-color: #fd7e14;
    opacity: 0.65;
  }
  </style>