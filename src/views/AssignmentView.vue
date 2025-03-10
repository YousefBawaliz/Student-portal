<!--
  AssignmentView - Displays details for a specific assignment and handles submissions
  File path: src/views/AssignmentView.vue
-->

<template>
  <div class="assignment-view">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading assignment details...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger my-4">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
    </div>
    
    <div v-else class="assignment-content">
      <!-- Assignment Header -->
      <div class="assignment-header card mb-4" v-if="assignment">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="d-flex align-items-center mb-3">
                <router-link
                  :to="{ name: 'CourseDetail', params: { id: assignment.courseId } }"
                  class="btn btn-sm btn-outline-secondary me-3"
                >
                  <i class="bi bi-arrow-left me-1"></i> Back to Course
                </router-link>
                <h1 class="card-title mb-0">{{ assignment.title }}</h1>
              </div>
              <div class="assignment-meta mb-3">
                <span class="badge" :class="getDueDateClass()">
                  <i class="bi bi-calendar-event me-1"></i>
                  Due: {{ formatDate(assignment.dueDate) }}
                </span>
                <span class="badge bg-secondary ms-2" v-if="assignment.submissionCount !== undefined">
                  <i class="bi bi-people-fill me-1"></i>
                  {{ assignment.submissionCount }} submissions
                </span>
                <span class="badge bg-info ms-2">
                  <i class="bi bi-person-fill me-1"></i>
                  Created by: {{ assignment.creatorName || 'Instructor' }}
                </span>
              </div>
              <div class="card-text description-container">
                <p>{{ assignment.description }}</p>
              </div>
            </div>
            
            <div class="action-buttons" v-if="canManageAssignment">
              <button class="btn btn-outline-primary me-2" @click="showEditForm = !showEditForm">
                <i class="bi bi-pencil me-1"></i> Edit
              </button>
              <button class="btn btn-outline-danger" @click="confirmDeleteAssignment">
                <i class="bi bi-trash me-1"></i> Delete
              </button>
            </div>
          </div>
          
          <!-- Edit Form (conditionally displayed) -->
          <div v-if="showEditForm && canManageAssignment" class="edit-form mt-4 p-3 border rounded bg-light">
            <h4 class="mb-3">Edit Assignment</h4>
            <form @submit.prevent="saveAssignment">
              <div class="mb-3">
                <label for="title" class="form-label">Title</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="title" 
                  v-model="editForm.title" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="dueDate" class="form-label">Due Date</label>
                <input 
                  type="datetime-local" 
                  class="form-control" 
                  id="dueDate" 
                  v-model="editForm.dueDate" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="description" 
                  v-model="editForm.description" 
                  rows="4" 
                  required
                ></textarea>
              </div>
              
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="showEditForm = false">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  <i class="bi bi-save me-1"></i> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Student View - Submission Section -->
      <div v-if="isStudent" class="submission-section card mb-4">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h3 class="mb-0">Your Submission</h3>
          <span class="submission-status" :class="getSubmissionStatusClass('badge')" v-if="submission">
            {{ getSubmissionStatus() }}
          </span>
        </div>
        
        <div class="card-body">
          <div v-if="submission" class="submission-details">
            <!-- Existing submission -->
            <div class="alert" :class="getSubmissionStatusClass('alert')">
              <div class="d-flex align-items-center">
                <i class="bi" :class="getSubmissionStatusIcon()"></i>
                <div class="ms-3">
                  <h5 class="alert-heading">{{ getSubmissionStatus() }}</h5>
                  <p class="mb-0">Your submission has been recorded.</p>
                </div>
              </div>
            </div>
            
            <div class="submission-info p-3 border rounded mb-3">
              <div class="row mb-2">
                <div class="col-md-3 fw-bold">Submitted on:</div>
                <div class="col-md-9">{{ formatDate(submission.submittedAt, true) }}</div>
              </div>
              
              <div class="row mb-2">
                <div class="col-md-3 fw-bold">Submission Link:</div>
                <div class="col-md-9">
                  <a :href="submission.submissionUrl" target="_blank" class="submission-link">
                    <i class="bi bi-link-45deg me-1"></i>
                    {{ submission.submissionUrl }}
                    <i class="bi bi-box-arrow-up-right ms-1"></i>
                  </a>
                </div>
              </div>
              
              <div class="row" v-if="submission.grade !== undefined && submission.grade !== null">
                <div class="col-md-3 fw-bold">Grade:</div>
                <div class="col-md-9">
                  <span class="badge bg-success p-2">{{ submission.grade }} / 100</span>
                </div>
              </div>
            </div>
            
            <div v-if="!isAssignmentPastDue && assignment" class="resubmit-section">
              <h5 class="mb-3">Update your submission</h5>
              <p class="text-muted mb-3">You can update your submission until the deadline.</p>
              <AssignmentSubmitter 
                :assignmentId="assignment.id" 
                :existingSubmission="submission"
                @submission-complete="handleSubmissionComplete"
              />
            </div>
          </div>
          
          <div v-else>
            <!-- No submission yet -->
            <div class="alert alert-warning mb-3">
              <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-circle-fill fs-4"></i>
                <div class="ms-3">
                  <h5 class="alert-heading">No Submission Yet</h5>
                  <p class="mb-0">You haven't submitted this assignment yet.</p>
                </div>
              </div>
            </div>
            
            <div v-if="!isAssignmentPastDue && assignment">
              <h5 class="mb-3">Submit your work</h5>
              <AssignmentSubmitter 
                :assignmentId="assignment.id"
                @submission-complete="handleSubmissionComplete" 
              />
            </div>
            
            <div v-else class="alert alert-danger">
              <div class="d-flex align-items-center">
                <i class="bi bi-clock-history fs-4"></i>
                <div class="ms-3">
                  <h5 class="alert-heading">Deadline Passed</h5>
                  <p class="mb-0">The deadline for this assignment has passed. Contact your instructor if you need an extension.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Teacher View - Submissions List -->
      <div v-if="canManageAssignment" class="submissions-section card">
        <div class="card-header bg-light">
          <h3 class="mb-0">Student Submissions</h3>
        </div>
        
        <div class="card-body">
          <div v-if="!submissions.length" class="alert alert-info">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle-fill fs-4"></i>
              <div class="ms-3">
                <h5 class="alert-heading">No Submissions</h5>
                <p class="mb-0">No submissions have been received for this assignment yet.</p>
              </div>
            </div>
          </div>
          
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Student</th>
                  <th>Submitted On</th>
                  <th>Submission</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sub, index) in submissions" :key="sub.id">
                  <td>{{ sub.studentName }}</td>
                  <td>{{ formatDate(sub.submittedAt) }}</td>
                  <td>
                    <a :href="sub.submissionUrl" target="_blank" class="btn btn-sm btn-outline-primary">
                      <i class="bi bi-link-45deg me-1"></i> View
                    </a>
                  </td>
                  <td>
                    <span class="badge" :class="getGradeStatusClass(sub)">
                      {{ sub.grade !== undefined && sub.grade !== null ? 'Graded' : 'Pending' }}
                    </span>
                  </td>
                  <td>
                    <span v-if="sub.grade !== undefined && sub.grade !== null">
                      {{ sub.grade }} / 100
                    </span>
                    <span v-else>—</span>
                  </td>
                  <td>
                    <button 
                      class="btn btn-sm btn-primary" 
                      @click="openGradeModal(sub, index)"
                    >
                      {{ sub.grade !== undefined && sub.grade !== null ? 'Update Grade' : 'Grade' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Grading Modal -->
      <div class="modal fade" id="gradeModal" tabindex="-1" aria-labelledby="gradeModalLabel" aria-hidden="true" ref="gradeModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="gradeModalLabel">Grade Submission</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedSubmission">
                <p><strong>Student:</strong> {{ selectedSubmission.studentName }}</p>
                <p>
                  <strong>Submission:</strong> 
                  <a :href="selectedSubmission.submissionUrl" target="_blank">
                    {{ selectedSubmission.submissionUrl }}
                    <i class="bi bi-box-arrow-up-right ms-1"></i>
                  </a>
                </p>
                <p><strong>Submitted On:</strong> {{ formatDate(selectedSubmission.submittedAt, true) }}</p>
                
                <div class="mb-3">
                  <label for="grade" class="form-label">Grade (0-100):</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="grade" 
                    v-model.number="gradeForm.grade" 
                    min="0" 
                    max="100" 
                    required
                  >
                </div>
                
                <div class="mb-3">
                  <label for="feedback" class="form-label">Feedback (optional):</label>
                  <textarea 
                    class="form-control" 
                    id="feedback" 
                    v-model="gradeForm.feedback" 
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                class="btn btn-primary" 
                @click="submitGrade" 
                :disabled="isGrading"
              >
                <span v-if="isGrading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Submit Grade
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true" ref="deleteModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete this assignment?</p>
              <p class="text-danger"><strong>This action cannot be undone.</strong></p>
              <p>All student submissions will also be deleted.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                class="btn btn-danger" 
                @click="deleteAssignment" 
                :disabled="isDeleting"
              >
                <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAssignmentStore } from '../stores/assignment'
import AssignmentSubmitter from '../components/assignment/AssignmentSubmitter.vue'
import { Modal } from 'bootstrap'
import type { Assignment, Submission } from '../types/assignment'

export default defineComponent({
  name: 'AssignmentView',
  components: {
    AssignmentSubmitter
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const assignmentStore = useAssignmentStore()
    
    // State
    const loading = ref(true)
    const error = ref('')
    const submission = ref<Submission | null>(null)
    const submissions = ref<Submission[]>([])
    const showEditForm = ref(false)
    const isSaving = ref(false)
    const isGrading = ref(false)
    const isDeleting = ref(false)
    const selectedSubmission = ref<Submission | null>(null)
    const selectedSubmissionIndex = ref(-1)
    const gradeModal = ref<HTMLElement | null>(null)
    const deleteModal = ref<HTMLElement | null>(null)
    
    // Form state
    const editForm = reactive({
      title: '',
      description: '',
      dueDate: ''
    })
    
    const gradeForm = reactive({
      grade: 0,
      feedback: ''
    })
    
    // Computed properties
    const assignmentId = computed(() => Number(route.params.id))
    const assignment = computed(() => assignmentStore.currentAssignment)
    const isStudent = computed(() => authStore.isStudent)
    const canManageAssignment = computed(() => 
      authStore.isAdmin || 
      (authStore.isTeacher && assignment.value?.canManage)
    )
    const isAssignmentPastDue = computed(() => {
      if (!assignment.value?.dueDate) return false
      const dueDate = new Date(assignment.value.dueDate)
      const now = new Date()
      return dueDate < now
    })
    
    // Methods
    const fetchAssignmentData = async () => {
      loading.value = true
      error.value = ''
      
      try {
        // Fetch assignment details
        await assignmentStore.fetchAssignment(assignmentId.value)
        
        // Populate edit form with current values
        if (assignment.value) {
          editForm.title = assignment.value.title
          editForm.description = assignment.value.description
          editForm.dueDate = formatDateForInput(assignment.value.dueDate)
        }
        
        // Fetch appropriate submissions based on user role
        if (isStudent.value) {
          await fetchUserSubmission()
        } else if (canManageAssignment.value) {
          await fetchAllSubmissions()
        }
      } catch (err) {
        error.value = 'Failed to load assignment data. Please try again later.'
        console.error('Error loading assignment:', err)
      } finally {
        loading.value = false
      }
    }
    
    const fetchUserSubmission = async () => {
      try {
        const userSubmission = await assignmentStore.fetchUserSubmission(assignmentId.value)
        submission.value = userSubmission
      } catch (err) {
        console.error('Error loading user submission:', err)
        // Don't set error here, as it's normal for a user to not have a submission yet
      }
    }
    
    const fetchAllSubmissions = async () => {
      try {
        const allSubmissions = await assignmentStore.fetchSubmissionsForAssignment(assignmentId.value)
        submissions.value = allSubmissions
      } catch (err) {
        console.error('Error loading submissions:', err)
        // Don't set error here as it's not critical
      }
    }
    
    const getSubmissionStatus = () => {
      if (!submission.value) return 'Not Submitted'
      
      if (submission.value.grade !== undefined && submission.value.grade !== null) {
        return 'Graded'
      }
      
      return 'Submitted'
    }
    
    const getSubmissionStatusClass = (type = 'alert') => {
      const status = getSubmissionStatus()
      
      if (type === 'alert') {
        switch (status) {
          case 'Graded': return 'alert-success'
          case 'Submitted': return 'alert-info'
          default: return 'alert-warning'
        }
      } else if (type === 'badge') {
        switch (status) {
          case 'Graded': return 'bg-success'
          case 'Submitted': return 'bg-info'
          default: return 'bg-warning'
        }
      }
      
      return ''
    }
    
    const getSubmissionStatusIcon = () => {
      const status = getSubmissionStatus()
      
      switch (status) {
        case 'Graded': return 'bi-check-circle-fill fs-4'
        case 'Submitted': return 'bi-clock-fill fs-4'
        default: return 'bi-exclamation-circle-fill fs-4'
      }
    }
    
    const getGradeStatusClass = (sub: Submission): string => {
      return sub.grade !== undefined && sub.grade !== null ? 'bg-success' : 'bg-warning'
    }
    
    const getDueDateClass = () => {
      if (isAssignmentPastDue.value) {
        return 'bg-danger'
      }
      
      // Due within 48 hours
      if (assignment.value?.dueDate) {
        const dueDate = new Date(assignment.value.dueDate)
        const now = new Date()
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        if (hoursUntilDue <= 48) {
          return 'bg-warning'
        }
      }
      
      return 'bg-primary'
    }
    
    const formatDate = (dateString: string, includeTime = false): string => {
      if (!dateString) return 'N/A'
      
      const options: Intl.DateTimeFormatOptions = includeTime 
        ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: 'short', day: 'numeric' }
      
      return new Date(dateString).toLocaleDateString(undefined, options)
    }
    
    const formatDateForInput = (dateString: string): string => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    const handleSubmissionComplete = async (newSubmission: Submission): Promise<void> => {
      submission.value = newSubmission
      await fetchUserSubmission()
    }
    
    const saveAssignment = async () => {
      isSaving.value = true
      
      try {
        const updatedData = {
          title: editForm.title,
          description: editForm.description,
          dueDate: new Date(editForm.dueDate).toISOString()
        }
        
        await assignmentStore.updateAssignment(assignmentId.value, updatedData)
        showEditForm.value = false
      } catch (err) {
        console.error('Error updating assignment:', err)
        error.value = 'Failed to update assignment. Please try again.'
      } finally {
        isSaving.value = false
      }
    }
    
    const openGradeModal = (sub: Submission, index: number): void => {
      selectedSubmission.value = sub
      selectedSubmissionIndex.value = index
      gradeForm.grade = sub.grade !== undefined && sub.grade !== null ? sub.grade : 0
      gradeForm.feedback = sub.feedback || ''
      
      if (gradeModal.value) {
        const modal = new Modal(gradeModal.value)
        modal.show()
      }
    }
    
    const submitGrade = async () => {
      if (!selectedSubmission.value) return
      
      isGrading.value = true
      
      try {
        const updatedSubmission = await assignmentStore.gradeSubmission(
          selectedSubmission.value.id,
          gradeForm.grade
        )
        
        // Update the submission in the list
        if (selectedSubmissionIndex.value !== -1) {
          submissions.value[selectedSubmissionIndex.value] = updatedSubmission
        }
        
        // Close the modal
        if (gradeModal.value) {
          const modal = Modal.getInstance(gradeModal.value)
          modal?.hide()
        }
      } catch (err) {
        console.error('Error grading submission:', err)
        error.value = 'Failed to submit grade. Please try again.'
      } finally {
        isGrading.value = false
      }
    }
    
    const confirmDeleteAssignment = () => {
      // Show the delete confirmation modal
      if (deleteModal.value) {
        const modal = new Modal(deleteModal.value)
        modal.show()
      }
    }
    
    const deleteAssignment = async () => {
      isDeleting.value = true
      
      try {
        await assignmentStore.deleteAssignment(assignmentId.value)
        
        // Close the modal
        if (deleteModal.value) {
          const modal = Modal.getInstance(deleteModal.value)
          modal?.hide()
        }
        
        // Redirect to the course detail page
        router.push({ 
          name: 'CourseDetail', 
          params: { id: assignment.value?.courseId || 0 } 
        })
      } catch (err) {
        console.error('Error deleting assignment:', err)
        error.value = 'Failed to delete assignment. Please try again.'
      } finally {
        isDeleting.value = false
      }
    }
    
    // Lifecycle hooks
    onMounted(() => {
      fetchAssignmentData()
    })
    
    return {
      loading,
      error,
      assignment,
      submission,
      submissions,
      isStudent,
      canManageAssignment,
      isAssignmentPastDue,
      showEditForm,
      isSaving,
      isGrading,
      isDeleting,
      editForm,
      gradeForm,
      selectedSubmission,
      gradeModal,
      deleteModal,
      getSubmissionStatus,
      getSubmissionStatusClass,
      getSubmissionStatusIcon,
      getGradeStatusClass,
      getDueDateClass,
      formatDate,
      handleSubmissionComplete,
      saveAssignment,
      openGradeModal,
      submitGrade,
      confirmDeleteAssignment,
      deleteAssignment
    }
  }
})
</script>

<style scoped>
.assignment-view {
  padding: 1rem;
  animation: fadeIn 0.3s ease-in;
}

.assignment-content {
  max-width: 1200px;
  margin: 0 auto;
}

.assignment-header {
  border-left: 4px solid #fd7e14;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.assignment-header:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.description-container {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.submission-section,
.submissions-section {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.submission-section:hover,
.submissions-section:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.submission-link {
  word-break: break-all;
  display: inline-block;
}

.badge {
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
}

.action-buttons .btn {
  transition: all 0.2s ease;
}

.action-buttons .btn:hover {
  transform: translateY(-2px);
}

.edit-form {
  transition: all 0.3s ease;
  animation: slideDown 0.3s ease;
}

.table {
  border-collapse: separate;
  border-spacing: 0;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(253, 126, 20, 0.05);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { 
    opacity: 0;
    transform: translateY(-20px); 
  }
  to { 
    opacity: 1;
    transform: translateY(0); 
  }
}
</style>