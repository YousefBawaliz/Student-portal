<!--
  CourseListView - Displays a list of all courses with filtering and management options
  File path: src/views/CourseListView.vue
-->

<template>
  <div class="course-list-view">
    <div class="header-section mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h1>Courses</h1>
        <button v-if="canCreateCourse" class="btn btn-primary" @click="showCreateModal = true">
          <i class="bi bi-plus-circle me-2"></i>Create Course
        </button>
      </div>
      <p class="text-muted">Manage and browse available courses</p>
    </div>

    <!-- Filters and Search Section -->
    <div class="card filter-card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Search Input -->
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search by course name, code or description"
                v-model="searchQuery"
                @input="debounceSearch"
              />
              <button 
                v-if="searchQuery" 
                class="btn btn-outline-secondary" 
                type="button"
                @click="clearSearch"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Filter Dropdown -->
          <div class="col-md-3">
            <select class="form-select" v-model="statusFilter">
              <option value="all">All Courses</option>
              <option value="enrolled">Enrolled Courses</option>
              <option value="teaching" v-if="isTeacher">Teaching</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          <!-- Sort Dropdown -->
          <div class="col-md-3">
            <select class="form-select" v-model="sortOption">
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="code-asc">Code (A-Z)</option>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="students-desc">Most Students</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading courses...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <div class="d-flex align-items-center">
        <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
        <div>
          <h5 class="alert-heading">Error Loading Courses</h5>
          <p class="mb-0">{{ error }}</p>
          <button @click="fetchCourses" class="btn btn-outline-danger btn-sm mt-2">
            <i class="bi bi-arrow-clockwise me-1"></i> Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCourses.length === 0" class="empty-state text-center py-5">
      <div class="empty-icon mb-3">
        <i class="bi bi-book fs-1 text-muted"></i>
      </div>
      <h3>No Courses Found</h3>
      <p class="text-muted">
        {{ getEmptyStateMessage() }}
      </p>
      <button v-if="canCreateCourse" class="btn btn-primary mt-2" @click="showCreateModal = true">
        <i class="bi bi-plus-circle me-2"></i>Create New Course
      </button>
    </div>

    <!-- Course Grid View -->
    <div v-else>
      <div class="row g-4 courses-grid">
        <div v-for="course in paginatedCourses" :key="course.id" class="col-md-6 col-lg-4 course-card-container">
          <div 
            class="card h-100 course-card"
            :class="{'border-primary-subtle': course.isEnrolled}"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 
                  class="card-title course-title"
                  @click="navigateToCourse(course.id)"
                >
                  {{ course.name }}
                </h5>
                <span class="badge bg-secondary">{{ course.code }}</span>
              </div>
              
              <p class="card-text course-description">{{ course.description }}</p>
              
              <div class="course-meta mb-3">
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-calendar-event me-2 text-muted"></i>
                  <span class="text-muted small">{{ course.schedule }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-people-fill me-2 text-muted"></i>
                    <span class="text-muted small">{{ course.studentCount || 0 }} Students</span>
                  </div>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-journal-text me-2 text-muted"></i>
                    <span class="text-muted small">{{ course.moduleCount || 0 }} Modules</span>
                  </div>
                </div>
              </div>
              
              <div v-if="course.progress !== undefined" class="progress mb-3" style="height: 8px;">
                <div 
                  class="progress-bar" 
                  role="progressbar" 
                  :style="`width: ${course.progress}%`"
                  :aria-valuenow="course.progress" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              
              <div class="course-actions d-flex justify-content-between mt-auto">
                <button 
                  class="btn btn-outline-primary btn-sm"
                  @click="navigateToCourse(course.id)"
                >
                  <i class="bi bi-box-arrow-in-right me-1"></i>
                  {{ course.isEnrolled ? 'View Course' : 'Details' }}
                </button>
                
                <div class="btn-group">
                  <button 
                    v-if="canManageCourse(course)" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="editCourse(course)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    v-if="canDeleteCourse(course)" 
                    class="btn btn-outline-danger btn-sm"
                    @click="confirmDeleteCourse(course)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div 
              v-if="course.role" 
              class="card-footer text-muted d-flex justify-content-between align-items-center py-2"
            >
              <span 
                class="badge"
                :class="course.role === 'teacher' ? 'bg-success' : 'bg-primary'"
              >
                {{ course.role === 'teacher' ? 'Teaching' : 'Enrolled' }}
              </span>
              
              <span v-if="course.progress !== undefined" class="small">
                {{ Math.round(course.progress) }}% Complete
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <nav v-if="totalPages > 1" aria-label="Courses pagination" class="my-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          <li 
            v-for="page in displayedPages" 
            :key="page" 
            class="page-item" 
            :class="{ active: currentPage === page, 'page-break': page === '...' }"
          >
            <a 
              v-if="page !== '...'" 
              class="page-link" 
              href="#" 
              @click.prevent="changePage(page)"
            >
              {{ page }}
            </a>
            <span v-else class="page-link">{{ page }}</span>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Create/Edit Course Modal -->
    <div 
      class="modal fade" 
      id="courseFormModal" 
      tabindex="-1" 
      aria-labelledby="courseFormModalLabel" 
      aria-hidden="true"
      ref="courseFormModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="courseFormModalLabel">
              {{ editMode ? 'Edit Course' : 'Create New Course' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCourse">
              <div class="mb-3">
                <label for="courseCode" class="form-label">Course Code *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="courseCode" 
                  v-model="courseForm.code" 
                  required
                >
                <div class="form-text">A unique identifier for the course (e.g., CS101)</div>
              </div>
              
              <div class="mb-3">
                <label for="courseName" class="form-label">Course Name *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="courseName" 
                  v-model="courseForm.name" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="courseDescription" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="courseDescription" 
                  v-model="courseForm.description" 
                  rows="3"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="courseSchedule" class="form-label">Schedule</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="courseSchedule" 
                  v-model="courseForm.schedule"
                  placeholder="e.g., Mon/Wed 2:00 PM - 3:30 PM"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveCourse" 
              :disabled="isSaving"
            >
              <span 
                v-if="isSaving" 
                class="spinner-border spinner-border-sm me-1" 
                role="status" 
                aria-hidden="true"
              ></span>
              {{ editMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      class="modal fade" 
      id="deleteConfirmModal" 
      tabindex="-1" 
      aria-labelledby="deleteConfirmModalLabel" 
      aria-hidden="true"
      ref="deleteConfirmModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteConfirmModalLabel">Confirm Delete</h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the course <strong>{{ courseToDelete?.name }}</strong>?</p>
            <p class="text-danger">This action cannot be undone. All enrollments and content will be permanently deleted.</p>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteCourse" 
              :disabled="isDeleting"
            >
              <span 
                v-if="isDeleting" 
                class="spinner-border spinner-border-sm me-1" 
                role="status" 
                aria-hidden="true"
              ></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'
import { useAuthStore } from '../stores/auth'
import { useProgressStore } from '../stores/progress'
import { Modal } from 'bootstrap'
import type { Course } from '../types/course'

export default defineComponent({
  name: 'CourseListView',
  
  setup() {
    const router = useRouter()
    const courseStore = useCourseStore()
    const authStore = useAuthStore()
    const progressStore = useProgressStore()
    
    // State references
    const loading = ref(true)
    const error = ref('')
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const sortOption = ref('name-asc')
    const currentPage = ref(1)
    const coursesPerPage = 6
    const searchTimeout = ref<number | null>(null)
    
    // Modal state
    const showCreateModal = ref(false)
    const editMode = ref(false)
    const courseForm = ref({
      id: null as number | null,
      code: '',
      name: '',
      description: '',
      schedule: ''
    })
    const isSaving = ref(false)
    const courseFormModal = ref<HTMLElement | null>(null)
    
    // Delete confirmation
    const isDeleting = ref(false)
    const courseToDelete = ref<Course | null>(null)
    const deleteConfirmModal = ref<HTMLElement | null>(null)
    
    // Computed properties
    const isAdmin = computed(() => authStore.isAdmin)
    const isTeacher = computed(() => authStore.isTeacher)
    const canCreateCourse = computed(() => isAdmin.value)
    
    const courses = computed(() => {
      return isAdmin.value ? courseStore.allCourses : courseStore.enrolledCourses
    })
    
    // Filter courses
    const filteredCourses = computed(() => {
      let filtered = [...courses.value]
      
      // Apply status filter
      switch (statusFilter.value) {
        case 'enrolled':
          filtered = filtered.filter(course => course.isEnrolled)
          break
        case 'teaching':
          filtered = filtered.filter(course => course.role === 'teacher')
          break
        case 'active':
          filtered = filtered.filter(course => {
            const progress = progressStore.getCourseProgress(course.id)
            return progress && progress.percentage > 0 && progress.percentage < 100
          })
          break
        case 'upcoming':
          filtered = filtered.filter(course => {
            const progress = progressStore.getCourseProgress(course.id)
            return !progress || progress.percentage === 0
          })
          break
      }
      
      // Apply search filter if query exists
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(course => 
          course.name.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query))
        )
      }
      
      // Apply sorting
      switch (sortOption.value) {
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name))
          break
        case 'code-asc':
          filtered.sort((a, b) => a.code.localeCompare(b.code))
          break
        case 'date-desc':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case 'date-asc':
          filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        case 'students-desc':
          filtered.sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
          break
      }
      
      return filtered
    })
    
    // Pagination
    const paginatedCourses = computed(() => {
      const startIndex = (currentPage.value - 1) * coursesPerPage
      return filteredCourses.value.slice(startIndex, startIndex + coursesPerPage)
    })
    
    const totalPages = computed(() => 
      Math.ceil(filteredCourses.value.length / coursesPerPage)
    )
    
    // Create a pagination array with ellipsis for large page counts
    const displayedPages = computed(() => {
      const total = totalPages.value
      const current = currentPage.value
      
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }
      
      const pages = []
      
      // Always show first page
      pages.push(1)
      
      // Show ellipsis if needed
      if (current > 3) {
        pages.push('...')
      }
      
      // Calculate range around current page
      const startPage = Math.max(2, current - 1)
      const endPage = Math.min(total - 1, current + 1)
      
      // Add range pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Show ellipsis if needed
      if (current < total - 2) {
        pages.push('...')
      }
      
      // Always show last page
      if (total > 1) {
        pages.push(total)
      }
      
      return pages
    })
    
    // Methods
    const fetchCourses = async () => {
      loading.value = true
      error.value = ''
      
      try {
        if (isAdmin.value) {
          await courseStore.fetchAllCourses()
        } else {
          await courseStore.fetchEnrolledCourses()
        }
        
        // Fetch progress data for courses
        await progressStore.fetchUserProgress()
      } catch (err: any) {
        error.value = err.message || 'Failed to load courses'
        console.error('Error fetching courses:', err)
      } finally {
        loading.value = false
      }
    }
    
    const navigateToCourse = (courseId: number) => {
      router.push({ name: 'CourseDetail', params: { id: courseId.toString() } })
    }
    
    const changePage = (page: number | string) => {
      if (typeof page === 'number' && page > 0 && page <= totalPages.value) {
        currentPage.value = page
        // Scroll to top of course list when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    
    const debounceSearch = () => {
      if (searchTimeout.value) {
        window.clearTimeout(searchTimeout.value)
      }
      
      searchTimeout.value = window.setTimeout(() => {
        // Reset to first page when searching
        currentPage.value = 1
      }, 300)
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
      currentPage.value = 1
    }
    
    const canManageCourse = (course: Course) => {
      return isAdmin.value || (isTeacher.value && course.canManage)
    }
    
    const canDeleteCourse = (course: Course) => {
      return isAdmin.value
    }
    
    const getEmptyStateMessage = () => {
      if (searchQuery.value) {
        return `No courses match your search: "${searchQuery.value}"`
      }
      
      switch (statusFilter.value) {
        case 'enrolled':
          return 'You are not enrolled in any courses yet.'
        case 'teaching':
          return 'You are not teaching any courses yet.'
        case 'active':
          return 'No active courses found.'
        case 'upcoming':
          return 'No upcoming courses found.'
        default:
          return isAdmin.value 
            ? 'No courses have been created yet.' 
            : 'No courses are available to you yet.'
      }
    }
    
    // Course creation/editing
    const editCourse = (course: Course) => {
      editMode.value = true
      courseForm.value = {
        id: course.id,
        code: course.code,
        name: course.name,
        description: course.description || '',
        schedule: course.schedule || ''
      }
      
      // Show modal
      if (courseFormModal.value) {
        const modal = new Modal(courseFormModal.value)
        modal.show()
      }
    }
    
    const confirmDeleteCourse = (course: Course) => {
      courseToDelete.value = course
      
      // Show confirmation modal
      if (deleteConfirmModal.value) {
        const modal = new Modal(deleteConfirmModal.value)
        modal.show()
      }
    }
    
    const saveCourse = async () => {
      isSaving.value = true
      
      try {
        const courseData = {
          code: courseForm.value.code,
          name: courseForm.value.name,
          description: courseForm.value.description,
          schedule: courseForm.value.schedule
        }
        
        if (editMode.value && courseForm.value.id) {
          // Update existing course
          await courseStore.updateCourse(courseForm.value.id, courseData)
        } else {
          // Create new course
          await courseStore.createCourse(courseData)
        }
        
        // Close modal
        if (courseFormModal.value) {
          const modal = Modal.getInstance(courseFormModal.value)
          modal?.hide()
        }
        
        // Reset form
        resetCourseForm()
      } catch (err: any) {
        console.error('Error saving course:', err)
        error.value = err.message || 'Failed to save course'
      } finally {
        isSaving.value = false
      }
    }
    
    const deleteCourse = async () => {
      if (!courseToDelete.value) return
      
      isDeleting.value = true
      
      try {
        await courseStore.deleteCourse(courseToDelete.value.id)
        
        // Close modal
        if (deleteConfirmModal.value) {
          const modal = Modal.getInstance(deleteConfirmModal.value)
          modal?.hide()
        }
      } catch (err: any) {
        console.error('Error deleting course:', err)
        error.value = err.message || 'Failed to delete course'
      } finally {
        isDeleting.value = false
        courseToDelete.value = null
      }
    }
    
    const resetCourseForm = () => {
      courseForm.value = {
        id: null,
        code: '',
        name: '',
        description: '',
        schedule: ''
      }
      editMode.value = false
    }
    
    // Watch for filter changes to reset pagination
    watch([statusFilter, sortOption], () => {
      currentPage.value = 1
    })
    
    // Watch for create modal flag
    watch(showCreateModal, (newVal) => {
      if (newVal) {
        resetCourseForm()
        if (courseFormModal.value) {
          const modal = new Modal(courseFormModal.value)
          modal.show()
        }
        // Reset flag after showing modal
        showCreateModal.value = false
      }
    })
    
    // Lifecycle hooks
    onMounted(() => {
      fetchCourses()
    })
    
    return {
      loading,
      error,
      courses,
      filteredCourses,
      paginatedCourses,
      searchQuery,
      statusFilter,
      sortOption,
      currentPage,
      totalPages,
      displayedPages,
      isAdmin,
      isTeacher,
      canCreateCourse,
      fetchCourses,
      navigateToCourse,
      changePage,
      debounceSearch,
      clearSearch,
      canManageCourse,
      canDeleteCourse,
      getEmptyStateMessage,
      showCreateModal,
      editMode,
      courseForm,
      isSaving,
      courseFormModal,
      courseToDelete,
      isDeleting,
      deleteConfirmModal,
      editCourse,
      confirmDeleteCourse,
      saveCourse,
      deleteCourse
    }
  }
})
</script>

<style scoped>
.course-list-view {
  padding: 1.5rem;
  animation: fadeIn 0.5s ease;
}

.header-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.filter-card {
  border-left: 4px solid #20c997;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.filter-card:hover {
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
}

.courses-grid {
  animation: slideUp 0.5s ease;
}

.course-card-container {
  transition: transform 0.3s ease;
}

.course-card-container:hover {
  transform: translateY(-5px);
}

.course-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  border-left: 4px solid #fd7e14;
}

.course-card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.course-title {
  cursor: pointer;
  color: #333;
  transition: color 0.2s ease;
}

.course-title:hover {
  color: #fd7e14;
  text-decoration: underline;
}

.course-description {
  max-height: 4.5rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: #6c757d;
}

.course-meta {
  font-size: 0.85rem;
}

.course-actions {
  margin-top: 1rem;
}

.empty-state {
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

.empty-icon {
  color: #adb5bd;
}

.page-break {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination .page-link {
  color: #fd7e14;
}

.pagination .active .page-link {
  background-color: #fd7e14;
  border-color: #fd7e14;
  color: white;
}

.loading-container {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px); 
  }
  to { 
    opacity: 1;
    transform: translateY(0); 
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .course-list-view {
    padding: 1rem;
  }

  .filter-card .row {
    row-gap: 0.75rem;
  }
}
</style>