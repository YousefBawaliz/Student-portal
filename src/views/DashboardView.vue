<!--
  Dashboard View - Main landing page after login
  File path: src/views/DashboardView.vue
-->

<template>
  <div class="dashboard">
    <div v-if="loading" class="loading-container d-flex justify-content-center align-items-center">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading your dashboard...</p>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <button type="button" class="btn btn-sm btn-outline-danger ms-3" @click="retry">
        <i class="bi bi-arrow-clockwise me-1"></i> Retry
      </button>
    </div>

    <div v-else class="dashboard-content">
      <!-- Welcome section with user greeting and quick stats -->
      <div class="row mb-4 fade-in">
        <div class="col-md-8 mb-3 mb-md-0">
          <div class="card welcome-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="welcome-icon me-3">
                  <i class="bi bi-person-circle fs-1"></i>
                </div>
                <div>
                  <h2 class="card-title">Welcome, {{ user?.name || 'Student' }}</h2>
                  <p class="card-text text-muted">
                    {{ getWelcomeMessage() }}
                  </p>
                </div>
              </div>
              <div class="progress-summary mt-4" v-if="overallProgress !== null">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h5 class="mb-0">Overall Progress</h5>
                  <span class="badge bg-primary">{{ Math.round(overallProgress) }}%</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div 
                    class="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    :style="`width: ${overallProgress}%`" 
                    :aria-valuenow="overallProgress" 
                    aria-valuemin="0" 
                    aria-valuemax="100">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card stats-card h-100">
            <div class="card-body">
              <h3 class="card-title">Quick Stats</h3>
              <div class="stats-list mt-3">
                <div class="stat-item d-flex align-items-center mb-3">
                  <div class="stat-icon me-3 bg-primary-subtle p-2 rounded">
                    <i class="bi bi-book fs-4"></i>
                  </div>
                  <div class="stat-detail">
                    <h6 class="mb-0">Active Courses</h6>
                    <p class="stat-value mb-0">{{ courseCount }}</p>
                  </div>
                </div>
                
                <div class="stat-item d-flex align-items-center mb-3">
                  <div class="stat-icon me-3 bg-warning-subtle p-2 rounded">
                    <i class="bi bi-calendar-check fs-4"></i>
                  </div>
                  <div class="stat-detail">
                    <h6 class="mb-0">Upcoming Assignments</h6>
                    <p class="stat-value mb-0">{{ upcomingAssignments }}</p>
                  </div>
                </div>
                
                <div class="stat-item d-flex align-items-center">
                  <div class="stat-icon me-3 bg-info-subtle p-2 rounded">
                    <i class="bi bi-megaphone fs-4"></i>
                  </div>
                  <div class="stat-detail">
                    <h6 class="mb-0">Recent Announcements</h6>
                    <p class="stat-value mb-0">{{ recentAnnouncements }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main content with courses and calendar -->
      <div class="row slide-up">
        <div class="col-lg-8 col-md-7 mb-4 mb-md-0">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Your Courses</h2>
            <div class="courses-filter">
              <select class="form-select form-select-sm" v-model="courseFilter">
                <option value="all">All Courses</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="teaching" v-if="authStore.isTeacher">Teaching</option>
              </select>
            </div>
          </div>
          
          <div v-if="courses.length === 0" class="alert alert-info fade-in">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle-fill fs-4 me-3"></i>
              <div>
                <h5 class="alert-heading">No Courses Found</h5>
                <p class="mb-0">You are not enrolled in any courses yet. Check with your administrator for enrollment information.</p>
              </div>
            </div>
          </div>
          
          <div v-else class="row g-4">
            <div v-for="course in filteredCourses" :key="course.id" class="col-md-6 course-card-container">
              <transition name="scale">
                <CourseCard :course="course" @click="navigateToCourse(course.id)" />
              </transition>
            </div>
          </div>
          
          <!-- Pagination controls for courses if needed -->
          <nav v-if="filteredCourses.length > coursesPerPage" aria-label="Courses pagination" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                  <i class="bi bi-chevron-left"></i>
                </a>
              </li>
              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                  <i class="bi bi-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div class="col-lg-4 col-md-5">
          <div class="calendar-section mb-4">
            <h2 class="mb-3">Calendar</h2>
            <div class="card calendar-card">
              <div class="card-body p-0">
                <Calendar />
              </div>
            </div>
          </div>
          
          <div class="deadlines-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3>Upcoming Deadlines</h3>
              <button v-if="deadlines.length > 3" class="btn btn-sm btn-link" @click="showAllDeadlines = !showAllDeadlines">
                {{ showAllDeadlines ? 'Show Less' : 'Show All' }}
              </button>
            </div>
            
            <div v-if="deadlines.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-calendar-check fs-2"></i>
              <p class="mt-2">No upcoming deadlines!</p>
            </div>
            
            <transition-group name="list" tag="ul" class="list-group deadlines-list" v-else>
              <li v-for="(deadline, index) in displayedDeadlines" :key="index" 
                  class="list-group-item list-group-item-action"
                  :class="{ 'list-item-urgent': isUrgent(deadline.dueDate) }"
                  @click="navigateToAssignment(deadline.id)">
                <div class="d-flex w-100 justify-content-between align-items-start">
                  <div>
                    <h5 class="mb-1 d-flex align-items-center">
                      <i v-if="isUrgent(deadline.dueDate)" class="bi bi-exclamation-circle-fill text-danger me-2"></i>
                      {{ deadline.title }}
                    </h5>
                    <p class="mb-1 text-muted">{{ deadline.courseName }}</p>
                  </div>
                  <span class="badge" :class="getDueDateBadgeClass(deadline.dueDate)">
                    {{ formatDueDate(deadline.dueDate) }}
                  </span>
                </div>
              </li>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'
import { useAssignmentStore } from '../stores/assignment'
import { useProgressStore } from '../stores/progress'
import CourseCard from '../components/course/CourseCard.vue'
import Calendar from '../components/calendar/Calendar.vue'
import type { Course } from '../types/course'

// Define interfaces for our types
interface Deadline {
  id: number;
  title: string;
  courseName: string;
  dueDate: string;
}

export default defineComponent({
  name: 'DashboardView',
  components: {
    CourseCard,
    Calendar
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const courseStore = useCourseStore()
    const assignmentStore = useAssignmentStore()
    const progressStore = useProgressStore()
    
    // State
    const loading = ref(true)
    const error = ref('')
    const deadlines = ref<Deadline[]>([])
    const refreshInterval = ref<number | null>(null)
    const courseFilter = ref('all')
    const currentPage = ref(1)
    const coursesPerPage = 4
    const showAllDeadlines = ref(false)
    const upcomingAssignments = ref(0)
    const recentAnnouncements = ref(0)
    
    // Computed properties
    const user = computed(() => authStore.currentUser)
    const courses = computed(() => courseStore.enrolledCourses as Course[])
    const courseCount = computed(() => courses.value.length)
    const overallProgress = computed(() => progressStore.overallProgress)
    
    // Filter courses based on selection
    const filteredCourses = computed(() => {
      let filtered = [...courses.value]
      
      switch (courseFilter.value) {
        case 'in-progress':
          filtered = filtered.filter(course => {
            const progress = progressStore.getCourseProgress(course.id)
            return progress ? progress.percentage < 100 : true
          })
          break
        case 'completed':
          filtered = filtered.filter(course => {
            const progress = progressStore.getCourseProgress(course.id)
            return progress ? progress.percentage >= 100 : false
          })
          break
        case 'teaching':
          filtered = filtered.filter(course => course.isTeaching)
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
    
    // Limit displayed deadlines unless showing all
    const displayedDeadlines = computed(() => 
      showAllDeadlines.value ? deadlines.value : deadlines.value.slice(0, 3)
    )
    
    // Methods
    const fetchDashboardData = async () => {
      loading.value = true
      error.value = ''
      
      try {
        await courseStore.fetchEnrolledCourses()
        await progressStore.fetchUserProgress()
        
        const upcomingAssignmentsData = assignmentStore.upcomingAssignments
        deadlines.value = upcomingAssignmentsData.map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          courseName: courseStore.courseById(assignment.courseId)?.name || 'Unknown Course',
          dueDate: assignment.dueDate
        }))
        
        deadlines.value.sort((a, b) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )
        
        upcomingAssignments.value = deadlines.value.length
        recentAnnouncements.value = Math.floor(Math.random() * 5)
        
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        error.value = 'Failed to load dashboard data. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    const getWelcomeMessage = () => {
      const hours = new Date().getHours()
      
      if (hours < 12) {
        return "Good morning! Here's your academic overview for today."
      } else if (hours < 17) {
        return "Good afternoon! Here's your academic overview for today."
      } else {
        return "Good evening! Here's your academic overview for today."
      }
    }
    
    const formatDueDate = (dateString: string): string => {
      const now = new Date()
      const dueDate = new Date(dateString)
      const diffTime = dueDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return 'Overdue'
      } else if (diffDays === 0) {
        return 'Today'
      } else if (diffDays === 1) {
        return 'Tomorrow'
      } else if (diffDays < 7) {
        return `${diffDays} days left`
      } else {
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }
    }
    
    const getDueDateBadgeClass = (dateString: string): string => {
      const now = new Date()
      const dueDate = new Date(dateString)
      const diffTime = dueDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return 'bg-danger'
      } else if (diffDays <= 1) {
        return 'bg-warning'
      } else if (diffDays < 3) {
        return 'bg-info'
      } else {
        return 'bg-primary'
      }
    }
    
    const isUrgent = (dateString: string): boolean => {
      const now = new Date()
      const dueDate = new Date(dateString)
      const diffTime = dueDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays <= 1
    }
    
    const navigateToCourse = (courseId: number): void => {
      router.push({ name: 'CourseDetail', params: { id: courseId.toString() } })
    }
    
    const navigateToAssignment = (assignmentId: number): void => {
      router.push({ name: 'Assignment', params: { id: assignmentId.toString() } })
    }
    
    const changePage = (page: number): void => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
    
    const setupAutoRefresh = () => {
      refreshInterval.value = window.setInterval(() => {
        fetchDashboardData()
      }, 5 * 60 * 1000)
    }
    
    const retry = () => {
      fetchDashboardData()
    }
    
    watch(courseFilter, () => {
      currentPage.value = 1
    })
    
    onMounted(() => {
      fetchDashboardData()
      setupAutoRefresh()
    })
    
    onBeforeUnmount(() => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
      }
    })
    
    return {
      user,
      authStore,
      loading,
      error,
      courses,
      filteredCourses,
      courseCount,
      deadlines,
      displayedDeadlines,
      upcomingAssignments,
      recentAnnouncements,
      overallProgress,
      courseFilter,
      currentPage,
      totalPages,
      showAllDeadlines,
      coursesPerPage,
      getWelcomeMessage,
      formatDueDate,
      getDueDateBadgeClass,
      isUrgent,
      navigateToCourse,
      navigateToAssignment,
      changePage,
      retry
    }
  }
})
</script>

<style scoped>
.dashboard {
  padding: 1.5rem;
  min-height: calc(100vh - 60px);
}

.loading-container {
  min-height: 50vh;
}

.welcome-card {
  background-color: #ffffff;
  border-left: 4px solid #fd7e14;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stats-card {
  background-color: #ffffff;
  border-left: 4px solid #20c997;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.stats-card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 500;
}

.stat-icon {
  color: #fd7e14;
}

.calendar-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.calendar-card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.deadlines-list {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.deadlines-list .list-group-item {
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.deadlines-list .list-group-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.list-item-urgent {
  border-left-color: #dc3545 !important;
}

.course-card-container {
  transition: all 0.3s ease;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

.slide-up {
  animation: slideUp 0.8s ease-in-out;
}

/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Scale transitions for course cards */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.5s ease;
}
.scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  .dashboard {
    padding: 1rem;
  }
  
  .stat-item {
    margin-bottom: 1rem;
  }
}
</style>