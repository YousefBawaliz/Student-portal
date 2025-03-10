<!--
  CourseDetailView - Displays detailed information for a specific course
  File path: src/views/CourseDetailView.vue
-->

<template>
  <div class="course-detail">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading course details...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger my-4">
      <div class="d-flex align-items-center">
        <i class="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
        <div>
          <h5 class="alert-heading mb-1">Error Loading Course</h5>
          <p class="mb-0">{{ error }}</p>
          <button @click="fetchCourseData" class="btn btn-sm btn-outline-danger mt-2">
            <i class="bi bi-arrow-clockwise me-1"></i> Retry
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="course-detail-content">
      <!-- Course Header -->
      <div class="course-header card mb-4 fade-in">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start flex-wrap">
            <div class="course-info">
              <div class="d-flex align-items-center mb-2">
                <router-link :to="{ name: 'CourseList' }" class="btn btn-sm btn-outline-secondary me-3">
                  <i class="bi bi-arrow-left me-1"></i> Back to Courses
                </router-link>
                <span class="badge bg-secondary me-2">{{ course.code }}</span>
              </div>
              <h1 class="card-title">{{ course.name }}</h1>
              <p class="card-text course-description">{{ course.description }}</p>
              <div class="course-meta">
                <div v-if="course.schedule" class="d-flex align-items-center mb-2">
                  <i class="bi bi-calendar3 me-2 text-primary"></i>
                  <span>{{ course.schedule }}</span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-person-fill me-2 text-primary"></i>
                  <span>{{ course.studentCount || 0 }} Students</span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-journal-text me-2 text-primary"></i>
                  <span>{{ moduleCount }} Modules</span>
                </div>
                <div class="d-flex align-items-center">
                  <i class="bi bi-clipboard-check me-2 text-primary"></i>
                  <span>{{ assignmentCount }} Assignments</span>
                </div>
              </div>
            </div>
            
            <div class="course-actions mt-3 mt-md-0">
              <div v-if="courseProgress !== null && courseProgress > 0" class="progress-container text-center mb-3">
                <div class="progress-circle-container">
                  <div class="progress-circle" :style="{ background: `conic-gradient(#fd7e14 ${courseProgress * 3.6}deg, #e9ecef 0deg)` }">
                    <div class="progress-inner">{{ Math.round(courseProgress) }}%</div>
                  </div>
                </div>
                <div class="mt-2">
                  <span class="text-muted">Course Progress</span>
                </div>
              </div>
              
              <div class="btn-group">
                <button 
                  v-if="canManageCourse" 
                  class="btn btn-outline-primary"
                  @click="openEditCourseModal"
                >
                  <i class="bi bi-pencil me-1"></i> Edit
                </button>
                <button 
                  v-if="canManageCourse" 
                  class="btn btn-outline-danger"
                  @click="confirmDeleteCourse"
                >
                  <i class="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Course Navigation -->
      <ul class="nav nav-tabs mb-4 slide-up">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'modules' }" @click.prevent="handleTabChange('modules')">
            <i class="bi bi-journal-text me-1"></i> Modules
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'assignments' }" @click.prevent="handleTabChange('assignments')">
            <i class="bi bi-clipboard-check me-1"></i> Assignments
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'announcements' }" @click.prevent="handleTabChange('announcements')">
            <i class="bi bi-megaphone me-1"></i> Announcements
          </a>
        </li>
        <li class="nav-item" v-if="canManageCourse">
          <a class="nav-link" :class="{ active: activeTab === 'students' }" @click.prevent="handleTabChange('students')">
            <i class="bi bi-people me-1"></i> Students
          </a>
        </li>
      </ul>
      
      <!-- Tab Content -->
      <div class="tab-content slide-up">
        <!-- Modules Tab -->
        <div v-if="activeTab === 'modules'" class="modules-tab">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Course Modules</h2>
            <button v-if="canManageCourse" class="btn btn-primary" @click="openCreateModuleModal">
              <i class="bi bi-plus-circle me-2"></i>Add Module
            </button>
          </div>
          
          <div v-if="tabLoading" class="text-center my-4">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading modules...</p>
          </div>
          
          <div v-else-if="!modules.length" class="alert alert-info">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle-fill me-2 fs-4"></i>
              <div>
                <h5 class="alert-heading mb-1">No Modules Yet</h5>
                <p class="mb-0" v-if="canManageCourse">Get started by adding your first module to this course.</p>
                <p class="mb-0" v-else>No modules have been created for this course yet. Check back later.</p>
              </div>
            </div>
          </div>
          
          <div v-else>
            <ModuleList 
              :modules="modules" 
              :canManage="canManageCourse" 
              @edit-module="openEditModuleModal"
              @delete-module="confirmDeleteModule"
            />
          </div>
        </div>
        
        <!-- Assignments Tab -->
        <div v-else-if="activeTab === 'assignments'" class="assignments-tab">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Assignments</h2>
            <button v-if="canManageCourse" class="btn btn-primary" @click="openCreateAssignmentModal">
              <i class="bi bi-plus-circle me-2"></i>Add Assignment
            </button>
          </div>
          
          <div v-if="tabLoading" class="text-center my-4">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading assignments...</p>
          </div>
          
          <div v-else-if="!assignments.length" class="alert alert-info">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle-fill me-2 fs-4"></i>
              <div>
                <h5 class="alert-heading mb-1">No Assignments Yet</h5>
                <p class="mb-0" v-if="canManageCourse">Get started by adding your first assignment to this course.</p>
                <p class="mb-0" v-else>No assignments have been created for this course yet. Check back later.</p>
              </div>
            </div>
          </div>
          
          <div v-else>
            <div class="row">
              <div class="col-md-6 mb-4" v-for="assignment in assignments" :key="assignment.id">
                <div class="card h-100 assignment-card">
                  <div class="card-body">
                    <h5 class="card-title">{{ assignment.title }}</h5>
                    <p class="card-text assignment-description">{{ assignment.description }}</p>
                    <div class="assignment-meta">
                      <div class="d-flex align-items-center mb-2">
                        <span 
                          class="badge me-2" 
                          :class="getDueDateClass(assignment.dueDate)"
                        >
                          <i class="bi bi-calendar-event me-1"></i>
                          Due: {{ formatDate(assignment.dueDate) }}
                        </span>
                        <span class="badge bg-info" v-if="assignment.submissionCount !== undefined">
                          <i class="bi bi-file-earmark-check me-1"></i>
                          {{ assignment.submissionCount }} submissions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
                    <span v-if="assignment.isSubmitted" class="text-success">
                      <i class="bi bi-check-circle-fill me-1"></i> Submitted
                    </span>
                    <span v-else-if="isPastDue(assignment.dueDate)" class="text-danger">
                      <i class="bi bi-exclamation-circle-fill me-1"></i> Past Due
                    </span>
                    <span v-else class="text-muted">
                      <i class="bi bi-clock me-1"></i> Pending
                    </span>
                    
                    <router-link 
                      :to="{ name: 'Assignment', params: { id: assignment.id } }" 
                      class="btn btn-sm btn-primary"
                    >
                      <i class="bi bi-box-arrow-in-right me-1"></i> View
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Announcements Tab -->
        <div v-else-if="activeTab === 'announcements'" class="announcements-tab">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Announcements</h2>
            <button v-if="canManageCourse" class="btn btn-primary" @click="openCreateAnnouncementModal">
              <i class="bi bi-plus-circle me-2"></i>Add Announcement
            </button>
          </div>
          
          <div v-if="tabLoading" class="text-center my-4">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading announcements...</p>
          </div>
          
          <div v-else-if="!announcements.length" class="alert alert-info">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle-fill me-2 fs-4"></i>
              <div>
                <h5 class="alert-heading mb-1">No Announcements Yet</h5>
                <p class="mb-0" v-if="canManageCourse">Get started by adding your first announcement to this course.</p>
                <p class="mb-0" v-else>No announcements have been posted for this course yet. Check back later.</p>
              </div>
            </div>
          </div>
          
          <div v-else>
            <div class="timeline-container">
              <div v-for="(announcement, index) in announcements" :key="announcement.id" class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content card mb-3">
                  <div class="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">{{ announcement.title }}</h5>
                    <div class="btn-group" v-if="canManageCourse">
                      <button 
                        class="btn btn-sm btn-outline-secondary"
                        @click="editAnnouncement(announcement)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click="confirmDeleteAnnouncement(announcement)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="mb-3 text-muted small">
                      <i class="bi bi-person-fill me-1"></i>
                      Posted by {{ announcement.createdByName || 'Instructor' }} 
                      <i class="bi bi-clock ms-2 me-1"></i>
                      {{ formatDate(announcement.createdAt, true) }}
                    </div>
                    <p class="card-text announcement-content">{{ announcement.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Students Tab (Admin/Teacher only) -->
        <div v-else-if="activeTab === 'students'" class="students-tab">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Enrolled Students</h2>
            <button v-if="isAdmin" class="btn btn-primary" @click="openAddStudentModal">
              <i class="bi bi-person-plus me-2"></i>Add Student
            </button>
          </div>
          
          <div v-if="tabLoading" class="text-center my-4">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading students...</p>
          </div>
          
          <div v-else-if="!students.length" class="alert alert-info">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle-fill me-2 fs-4"></i>
              <div>
                <h5 class="alert-heading mb-1">No Students Enrolled</h5>
                <p class="mb-0" v-if="isAdmin">Get started by adding students to this course.</p>
                <p class="mb-0" v-else>No students are currently enrolled in this course.</p>
              </div>
            </div>
          </div>
          
          <div v-else>
            <div class="card mb-4">
              <div class="card-body">
                <div class="student-search mb-3">
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="bi bi-search"></i>
                    </span>
                    <input 
                      type="text" 
                      class="form-control" 
                      placeholder="Search students by name or email" 
                      v-model="studentSearchQuery"
                    >
                    <button 
                      v-if="studentSearchQuery" 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="studentSearchQuery = ''"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Progress</th>
                        <th>Last Activity</th>
                        <th v-if="isAdmin">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="student in filteredStudents" :key="student.id">
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="student-avatar me-2">
                              <i class="bi bi-person-circle fs-4"></i>
                            </div>
                            <div>{{ student.name }}</div>
                          </div>
                        </td>
                        <td>{{ student.email }}</td>
                        <td>
                          <div class="progress" style="height: 8px">
                            <div
                              class="progress-bar"
                              role="progressbar"
                              :style="{ width: `${student.progress}%` }"
                              :aria-valuenow="student.progress"
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <div class="small text-muted mt-1">{{ student.progress }}%</div>
                        </td>
                        <td>{{ student.lastActivity ? formatDate(student.lastActivity) : 'Never' }}</td>
                        <td v-if="isAdmin">
                          <div class="btn-group">
                            <button 
                              class="btn btn-sm btn-outline-danger" 
                              @click="confirmRemoveStudent(student)"
                              title="Remove from course"
                            >
                              <i class="bi bi-person-x"></i>
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-primary"
                              title="Send message"
                            >
                              <i class="bi bi-envelope"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Course Modal -->
    <div 
      class="modal fade" 
      id="courseModal" 
      tabindex="-1" 
      aria-labelledby="courseModalLabel" 
      aria-hidden="true"
      ref="courseModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="courseModalLabel">Edit Course</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCourse">
              <div class="mb-3">
                <label for="courseCode" class="form-label">Course Code</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="courseCode" 
                  v-model="courseForm.code" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="courseName" class="form-label">Course Name</label>
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveCourse"
              :disabled="isSaving"
            >
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Module Modal -->
    <div 
      class="modal fade" 
      id="moduleModal" 
      tabindex="-1" 
      aria-labelledby="moduleModalLabel" 
      aria-hidden="true"
      ref="moduleModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="moduleModalLabel">
              {{ editingModule ? 'Edit Module' : 'Create Module' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveModule">
              <div class="mb-3">
                <label for="moduleTitle" class="form-label">Title</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="moduleTitle" 
                  v-model="moduleForm.title" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="moduleDescription" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="moduleDescription" 
                  v-model="moduleForm.description" 
                  rows="3"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="moduleOrder" class="form-label">Order</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="moduleOrder" 
                  v-model.number="moduleForm.order" 
                  min="1"
                  required
                >
                <div class="form-text">Determines the position of this module in the course.</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveModule"
              :disabled="isSaving"
            >
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ editingModule ? 'Update Module' : 'Create Module' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Assignment Modal -->
    <div 
      class="modal fade" 
      id="assignmentModal" 
      tabindex="-1" 
      aria-labelledby="assignmentModalLabel" 
      aria-hidden="true"
      ref="assignmentModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="assignmentModalLabel">Create Assignment</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment">
              <div class="mb-3">
                <label for="assignmentTitle" class="form-label">Title</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="assignmentTitle" 
                  v-model="assignmentForm.title" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="assignmentDescription" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="assignmentDescription" 
                  v-model="assignmentForm.description" 
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="assignmentDueDate" class="form-label">Due Date</label>
                <input 
                  type="datetime-local" 
                  class="form-control" 
                  id="assignmentDueDate" 
                  v-model="assignmentForm.dueDate" 
                  required
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveAssignment"
              :disabled="isSaving"
            >
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Create Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Announcement Modal -->
    <div 
      class="modal fade" 
      id="announcementModal" 
      tabindex="-1" 
      aria-labelledby="announcementModalLabel" 
      aria-hidden="true"
      ref="announcementModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="announcementModalLabel">
              {{ editingAnnouncement ? 'Edit Announcement' : 'Create Announcement' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAnnouncement">
              <div class="mb-3">
                <label for="announcementTitle" class="form-label">Title</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="announcementTitle" 
                  v-model="announcementForm.title" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="announcementContent" class="form-label">Content</label>
                <textarea 
                  class="form-control" 
                  id="announcementContent" 
                  v-model="announcementForm.content" 
                  rows="5"
                  required
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveAnnouncement"
              :disabled="isSaving"
            >
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ editingAnnouncement ? 'Update Announcement' : 'Post Announcement' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Student Modal -->
    <div 
      class="modal fade" 
      id="addStudentModal" 
      tabindex="-1" 
      aria-labelledby="addStudentModalLabel" 
      aria-hidden="true"
      ref="addStudentModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addStudentModalLabel">Add Student to Course</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="studentSearch" class="form-label">Search Students</label>
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  id="studentSearch" 
                  v-model="studentSearchModal"
                  placeholder="Type to search by name or email"
                >
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  :disabled="studentSearchModal.length < 2"
                  @click="searchStudents"
                >
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
            
            <div v-if="searchingStudents" class="text-center my-4">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Searching students...</p>
            </div>
            
            <div v-else-if="searchResults.length === 0 && studentSearchModal.length >= 2" class="alert alert-info my-3">
              No students found matching your search.
            </div>
            
            <div v-else-if="searchResults.length > 0" class="search-results mt-3">
              <h6>Search Results</h6>
              <div class="list-group">
                <button 
                  v-for="student in searchResults" 
                  :key="student.id"
                  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  @click="selectStudent(student)"
                >
                  <div>
                    <div>{{ student.name }}</div>
                    <small class="text-muted">{{ student.email }}</small>
                  </div>
                  <span 
                    v-if="student.isEnrolled" 
                    class="badge bg-success"
                  >
                    Enrolled
                  </span>
                </button>
              </div>
            </div>
            
            <div class="selected-students mt-4" v-if="selectedStudents.length > 0">
              <h6>Students to Add</h6>
              <div class="list-group">
                <div 
                  v-for="student in selectedStudents" 
                  :key="student.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div>{{ student.name }}</div>
                    <small class="text-muted">{{ student.email }}</small>
                  </div>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="removeSelectedStudent(student)"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="enrollSelectedStudents"
              :disabled="selectedStudents.length === 0 || isSaving"
            >
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Enroll Students
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
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              This action cannot be undone.
            </div>
            <p v-if="deleteType === 'course'">
              Are you sure you want to delete the course <strong>{{ course.name }}</strong>?
              All modules, assignments, content, and student data associated with this course will be permanently deleted.
            </p>
            <p v-else-if="deleteType === 'module'">
              Are you sure you want to delete the module <strong>{{ moduleToDelete?.title }}</strong>?
              All content associated with this module will be permanently deleted.
            </p>
            <p v-else-if="deleteType === 'announcement'">
              Are you sure you want to delete this announcement?
            </p>
            <p v-else-if="deleteType === 'student'">
              Are you sure you want to remove <strong>{{ studentToRemove?.name }}</strong> from this course?
              Their progress and submissions will be preserved in case they are re-enrolled.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="confirmDelete"
              :disabled="isDeleting"
            >
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'
import { useModuleStore } from '../stores/module'
import { useAssignmentStore } from '../stores/assignment'
import { useProgressStore } from '../stores/progress'
import ModuleList from '../components/course/ModuleList.vue'
import { Modal } from 'bootstrap'
import type { Course } from '../types/course'
import type { Module } from '../types/module'
import type { Assignment } from '../types/assignment'

interface Announcement {
  id: number;
  courseId: number;
  title: string;
  content: string;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
  lastActivity?: string;
  isEnrolled?: boolean;
}

export default defineComponent({
  name: 'CourseDetailView',
  components: {
    ModuleList
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const courseStore = useCourseStore()
    const moduleStore = useModuleStore()
    const assignmentStore = useAssignmentStore()
    const progressStore = useProgressStore()
    
    // Modal refs
    const courseModal = ref<HTMLElement | null>(null)
    const moduleModal = ref<HTMLElement | null>(null)
    const assignmentModal = ref<HTMLElement | null>(null)
    const announcementModal = ref<HTMLElement | null>(null)
    const addStudentModal = ref<HTMLElement | null>(null)
    const deleteConfirmModal = ref<HTMLElement | null>(null)
    
    // State
    const loading = ref(true)
    const tabLoading = ref(false)
    const error = ref('')
    const activeTab = ref('modules')
    const modules = ref<Module[]>([])
    const assignments = ref<Assignment[]>([])
    const announcements = ref<Announcement[]>([])
    const students = ref<Student[]>([])
    const studentSearchQuery = ref('')
    const isSaving = ref(false)
    const isDeleting = ref(false)
    
    // Edit/Create forms
    const courseForm = reactive({
      code: '',
      name: '',
      description: '',
      schedule: ''
    })
    
    const moduleForm = reactive({
      id: null as number | null,
      title: '',
      description: '',
      order: 1
    })
    
    const assignmentForm = reactive({
      title: '',
      description: '',
      dueDate: ''
    })
    
    const announcementForm = reactive({
      id: null as number | null,
      title: '',
      content: ''
    })
    
    // Delete confirmation state
    const deleteType = ref<'course' | 'module' | 'announcement' | 'student'>('course')
    const moduleToDelete = ref<Module | null>(null)
    const announcementToDelete = ref<Announcement | null>(null)
    const studentToRemove = ref<Student | null>(null)
    
    // Student management
    const studentSearchModal = ref('')
    const searchingStudents = ref(false)
    const searchResults = ref<Student[]>([])
    const selectedStudents = ref<Student[]>([])
    
    // Edit states
    const editingModule = ref(false)
    const editingAnnouncement = ref(false)
    
    // Computed properties
    const courseId = computed(() => Number(route.params.id))
    const course = computed(() => courseStore.currentCourse || {} as Course)
    const isAdmin = computed(() => authStore.isAdmin)
    const isTeacher = computed(() => authStore.isTeacher)
    const canManageCourse = computed(() => 
      isAdmin.value || 
      (isTeacher.value && course.value?.canManage)
    )
    
    const courseProgress = computed(() => {
      const progress = progressStore.getCourseProgress(courseId.value)
      return progress ? progress.percentage : null
    })
    
    const moduleCount = computed(() => modules.value.length)
    const assignmentCount = computed(() => assignments.value.length)
    
    const filteredStudents = computed(() => {
      if (!studentSearchQuery.value.trim()) {
        return students.value
      }
      
      const query = studentSearchQuery.value.toLowerCase()
      return students.value.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
      )
    })
    
    // Methods
    const fetchCourseData = async () => {
      loading.value = true
      error.value = ''
      
      try {
        // Fetch course details
        await courseStore.fetchCourse(courseId.value)
        
        // Populate course form with current values
        if (course.value) {
          courseForm.code = course.value.code || ''
          courseForm.name = course.value.name || ''
          courseForm.description = course.value.description || ''
          courseForm.schedule = course.value.schedule || ''
        }
        
        // Fetch progress data
        await progressStore.fetchCourseProgress(courseId.value)
        
        // Load initial tab data
        await loadTabData(activeTab.value)
      } catch (err: any) {
        error.value = err.message || 'Failed to load course details. Please try again.'
        console.error('Error loading course data:', err)
      } finally {
        loading.value = false
      }
    }
    
    const loadTabData = async (tab: string) => {
      if (loading.value) return // Skip if already in main loading state
      
      tabLoading.value = true
      
      try {
        switch (tab) {
          case 'modules':
            // Fetch modules for the course
            const fetchedModules = await moduleStore.fetchModulesForCourse(courseId.value)
            modules.value = fetchedModules
            break
            
          case 'assignments':
            // Fetch assignments for the course
            const fetchedAssignments = await assignmentStore.fetchAssignmentsForCourse(courseId.value)
            assignments.value = fetchedAssignments
            break
            
          case 'announcements':
            // Fetch announcements for the course
            try {
              // In a real implementation, you would use a proper API service
              // This is a mock implementation
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Mock data for announcements
              announcements.value = [
                {
                  id: 1,
                  courseId: courseId.value,
                  title: 'Welcome to the Course',
                  content: 'Welcome to this course! We\'re excited to have you join us for this learning journey. Please take some time to explore the modules and assignments.',
                  createdBy: 1,
                  createdByName: 'Jane Smith',
                  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
                },
                {
                  id: 2,
                  courseId: courseId.value,
                  title: 'First Assignment Due Next Week',
                  content: 'Just a reminder that the first assignment is due next Friday. Make sure to submit it on time. If you have any questions, please reach out.',
                  createdBy: 1,
                  createdByName: 'Jane Smith',
                  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
                }
              ]
            } catch (err) {
              console.error('Error fetching announcements:', err)
              announcements.value = []
            }
            break
            
          case 'students':
            if (canManageCourse.value) {
              try {
                // In a real implementation, you would fetch from the course service
                // This is a mock implementation
                await new Promise(resolve => setTimeout(resolve, 500))
                
                // Mock data for students
                students.value = [
                  {
                    id: 101,
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    progress: 75,
                    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
                  },
                  {
                    id: 102,
                    name: 'Alice Johnson',
                    email: 'alice.johnson@example.com',
                    progress: 92,
                    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
                  },
                  {
                    id: 103,
                    name: 'Bob Williams',
                    email: 'bob.williams@example.com',
                    progress: 45,
                    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
                  }
                ]
              } catch (err) {
                console.error('Error fetching students:', err)
                students.value = []
              }
            }
            break
        }
      } catch (err) {
        console.error(`Error loading ${tab} data:`, err)
      } finally {
        tabLoading.value = false
      }
    }
    
    const handleTabChange = async (newTab: string) => {
      if (newTab !== activeTab.value) {
        activeTab.value = newTab
        await loadTabData(newTab)
      }
    }
    
    // Format helpers
    const formatDate = (dateString: string, includeTime: boolean = false) => {
      if (!dateString) return 'N/A'
      
      const date = new Date(dateString)
      
      if (includeTime) {
        return date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const getDueDateClass = (dueDate: string) => {
      if (!dueDate) return 'bg-secondary'
      
      const now = new Date()
      const due = new Date(dueDate)
      
      if (due < now) {
        return 'bg-danger'
      }
      
      // Due within 48 hours
      const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
      if (hoursUntilDue <= 48) {
        return 'bg-warning'
      }
      
      return 'bg-primary'
    }
    
    const isPastDue = (dueDate: string) => {
      if (!dueDate) return false
      return new Date(dueDate) < new Date()
    }
    
    // Modal handlers
    const openEditCourseModal = () => {
      // Populate form with current values
      courseForm.code = course.value.code
      courseForm.name = course.value.name
      courseForm.description = course.value.description || ''
      courseForm.schedule = course.value.schedule || ''
      
      // Show modal
      if (courseModal.value) {
        new Modal(courseModal.value).show()
      }
    }
    
    const saveCourse = async () => {
      isSaving.value = true
      
      try {
        await courseStore.updateCourse(courseId.value, courseForm)
        
        // Close modal
        if (courseModal.value) {
          const modal = Modal.getInstance(courseModal.value)
          modal?.hide()
        }
      } catch (err: any) {
        console.error('Error updating course:', err)
        error.value = err.message || 'Failed to update course'
      } finally {
        isSaving.value = false
      }
    }
    
    const confirmDeleteCourse = () => {
      deleteType.value = 'course'
      
      // Show modal
      if (deleteConfirmModal.value) {
        new Modal(deleteConfirmModal.value).show()
      }
    }
    
    // Module management
    const openCreateModuleModal = () => {
      editingModule.value = false
      moduleForm.id = null
      moduleForm.title = ''
      moduleForm.description = ''
      moduleForm.order = modules.value.length + 1
      
      // Show modal
      if (moduleModal.value) {
        new Modal(moduleModal.value).show()
      }
    }
    
    const openEditModuleModal = (module: Module) => {
      editingModule.value = true
      moduleForm.id = module.id
      moduleForm.title = module.title
      moduleForm.description = module.description || ''
      moduleForm.order = module.order || 1
      
      // Show modal
      if (moduleModal.value) {
        new Modal(moduleModal.value).show()
      }
    }
    
    const saveModule = async () => {
      isSaving.value = true
      
      try {
        if (editingModule.value && moduleForm.id) {
          // Update existing module
          await moduleStore.updateModule(moduleForm.id, {
            title: moduleForm.title,
            description: moduleForm.description,
            order: moduleForm.order
          })
        } else {
          // Create new module
          await moduleStore.createModule(courseId.value, {
            title: moduleForm.title,
            description: moduleForm.description,
            order: moduleForm.order
          })
        }
        
        // Refresh modules
        await loadTabData('modules')
        
        // Close modal
        if (moduleModal.value) {
          const modal = Modal.getInstance(moduleModal.value)
          modal?.hide()
        }
      } catch (err: any) {
        console.error('Error saving module:', err)
        error.value = err.message || 'Failed to save module'
      } finally {
        isSaving.value = false
      }
    }
    
    const confirmDeleteModule = (module: Module) => {
      deleteType.value = 'module'
      moduleToDelete.value = module
      
      // Show modal
      if (deleteConfirmModal.value) {
        new Modal(deleteConfirmModal.value).show()
      }
    }
    
    // Assignment management
    const openCreateAssignmentModal = () => {
      // Initialize form
      assignmentForm.title = ''
      assignmentForm.description = ''
      
      // Set default due date (2 weeks from now)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)
      
      // Format for datetime-local input
      const year = dueDate.getFullYear()
      const month = String(dueDate.getMonth() + 1).padStart(2, '0')
      const day = String(dueDate.getDate()).padStart(2, '0')
      const hours = String(dueDate.getHours()).padStart(2, '0')
      const minutes = String(dueDate.getMinutes()).padStart(2, '0')
      
      assignmentForm.dueDate = `${year}-${month}-${day}T${hours}:${minutes}`
      
      // Show modal
      if (assignmentModal.value) {
        new Modal(assignmentModal.value).show()
      }
    }
    
    const saveAssignment = async () => {
      isSaving.value = true
      
      try {
        await assignmentStore.createAssignment({
          courseId: courseId.value,
          title: assignmentForm.title,
          description: assignmentForm.description,
          dueDate: new Date(assignmentForm.dueDate).toISOString()
        })
        
        // Refresh assignments
        await loadTabData('assignments')
        
        // Close modal
        if (assignmentModal.value) {
          const modal = Modal.getInstance(assignmentModal.value)
          modal?.hide()
        }
      } catch (err: any) {
        console.error('Error creating assignment:', err)
        error.value = err.message || 'Failed to create assignment'
      } finally {
        isSaving.value = false
      }
    }
    
    // Announcement management
    const openCreateAnnouncementModal = () => {
      editingAnnouncement.value = false
      announcementForm.id = null
      announcementForm.title = ''
      announcementForm.content = ''
      
      // Show modal
      if (announcementModal.value) {
        new Modal(announcementModal.value).show()
      }
    }
    
    const editAnnouncement = (announcement: Announcement) => {
      editingAnnouncement.value = true
      announcementForm.id = announcement.id
      announcementForm.title = announcement.title
      announcementForm.content = announcement.content
      
      // Show modal
      if (announcementModal.value) {
        new Modal(announcementModal.value).show()
      }
    }
    
    const saveAnnouncement = async () => {
      isSaving.value = true
      
      try {
        // In a real implementation, you would call the API
        // This is a mock implementation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (editingAnnouncement.value && announcementForm.id) {
          // Find and update the announcement in the local array
          const index = announcements.value.findIndex(a => a.id === announcementForm.id)
          if (index !== -1) {
            announcements.value[index] = {
              ...announcements.value[index],
              title: announcementForm.title,
              content: announcementForm.content
            }
          }
        } else {
          // Add a new announcement to the local array
          const newId = Math.max(0, ...announcements.value.map(a => a.id)) + 1
          announcements.value.unshift({
            id: newId,
            courseId: courseId.value,
            title: announcementForm.title,
            content: announcementForm.content,
            createdBy: authStore.currentUser?.id || 0,
            createdByName: authStore.currentUser?.name || 'Instructor',
            createdAt: new Date().toISOString()
          })
        }
        
        // Close modal
        if (announcementModal.value) {
          const modal = Modal.getInstance(announcementModal.value)
          modal?.hide()
        }
      } catch (err: any) {
        console.error('Error saving announcement:', err)
        error.value = err.message || 'Failed to save announcement'
      } finally {
        isSaving.value = false
      }
    }
    
    const confirmDeleteAnnouncement = (announcement: Announcement) => {
      deleteType.value = 'announcement'
      announcementToDelete.value = announcement
      
      // Show modal
      if (deleteConfirmModal.value) {
        new Modal(deleteConfirmModal.value).show()
      }
    }
    
    // Student management
    const openAddStudentModal = () => {
      studentSearchModal.value = ''
      searchResults.value = []
      selectedStudents.value = []
      
      // Show modal
      if (addStudentModal.value) {
        new Modal(addStudentModal.value).show()
      }
    }
    
    const searchStudents = async () => {
      if (studentSearchModal.value.length < 2) return
      
      searchingStudents.value = true
      
      try {
        // In a real implementation, you would call the API
        // This is a mock implementation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock search results
        const currentStudentIds = students.value.map(s => s.id)
        
        searchResults.value = [
          {
            id: 104,
            name: 'Emily Davis',
            email: 'emily.davis@example.com',
            progress: 0,
            isEnrolled: currentStudentIds.includes(104)
          },
          {
            id: 105,
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            progress: 0,
            isEnrolled: currentStudentIds.includes(105)
          },
          {
            id: 106,
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            progress: 0,
            isEnrolled: currentStudentIds.includes(106)
          }
        ].filter(student => 
          student.name.toLowerCase().includes(studentSearchModal.value.toLowerCase()) ||
          student.email.toLowerCase().includes(studentSearchModal.value.toLowerCase())
        )
      } catch (err) {
        console.error('Error searching students:', err)
        searchResults.value = []
      } finally {
        searchingStudents.value = false
      }
    }
    
    const selectStudent = (student: Student) => {
      if (student.isEnrolled) return
      
      if (!selectedStudents.value.some(s => s.id === student.id)) {
        selectedStudents.value.push(student)
      }
    }
    
    const removeSelectedStudent = (student: Student) => {
      selectedStudents.value = selectedStudents.value.filter(s => s.id !== student.id)
    }
    
    const enrollSelectedStudents = async () => {
      if (selectedStudents.value.length === 0) return
      
      isSaving.value = true
      
      try {
        // In a real implementation, you would call the API
        // This is a mock implementation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Add selected students to the local array
        selectedStudents.value.forEach(student => {
          students.value.push({
            ...student,
            progress: 0,
            lastActivity: new Date().toISOString()
          })
        })
        
        // Close modal
        if (addStudentModal.value) {
          const modal = Modal.getInstance(addStudentModal.value)
          modal?.hide()
        }
      } catch (err: any) {
        console.error('Error enrolling students:', err)
        error.value = err.message || 'Failed to enroll students'
      } finally {
        isSaving.value = false
      }
    }
    
    const confirmRemoveStudent = (student: Student) => {
      deleteType.value = 'student'
      studentToRemove.value = student
      
      // Show modal
      if (deleteConfirmModal.value) {
        new Modal(deleteConfirmModal.value).show()
      }
    }
    
    // Generic delete handler
    const confirmDelete = async () => {
      isDeleting.value = true
      
      try {
        switch (deleteType.value) {
          case 'course':
            await courseStore.deleteCourse(courseId.value)
            // Redirect to courses list after deletion
            router.push({ name: 'CourseList' })
            break
            
          case 'module':
            if (moduleToDelete.value) {
              await moduleStore.deleteModule(moduleToDelete.value.id)
              await loadTabData('modules')
            }
            break
            
          case 'announcement':
            if (announcementToDelete.value) {
              // In a real implementation, you would call the API
              // This is a mock implementation
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Remove from local array
              announcements.value = announcements.value.filter(a => a.id !== announcementToDelete.value?.id)
            }
            break
            
          case 'student':
            if (studentToRemove.value) {
              // In a real implementation, you would call the API
              // This is a mock implementation
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Remove from local array
              students.value = students.value.filter(s => s.id !== studentToRemove.value?.id)
            }
            break
        }
        
        // Close modal
        if (deleteConfirmModal.value) {
          const modal = Modal.getInstance(deleteConfirmModal.value)
          modal?.hide()
        }
      } catch (err: any) {
        console.error(`Error deleting ${deleteType.value}:`, err)
        error.value = err.message || `Failed to delete ${deleteType.value}`
      } finally {
        isDeleting.value = false
      }
    }
    
    // Lifecycle hooks
    onMounted(() => {
      fetchCourseData()
    })
    
    // Watch for route changes
    watch(() => route.params.id, (newId) => {
      if (newId && Number(newId) !== courseId.value) {
        // Course changed, reload data
        fetchCourseData()
      }
    })
    
    return {
      loading,
      tabLoading,
      error,
      course,
      modules,
      assignments,
      announcements,
      students,
      activeTab,
      isAdmin,
      isTeacher,
      canManageCourse,
      courseProgress,
      moduleCount,
      assignmentCount,
      courseForm,
      moduleForm,
      assignmentForm,
      announcementForm,
      isSaving,
      isDeleting,
      studentSearchQuery,
      filteredStudents,
      editingModule,
      editingAnnouncement,
      deleteType,
      moduleToDelete,
      announcementToDelete,
      studentToRemove,
      studentSearchModal,
      searchingStudents,
      searchResults,
      selectedStudents,
        
      // Methods
      fetchCourseData,
      handleTabChange,
      formatDate,
      getDueDateClass,
      isPastDue,
      openEditCourseModal,
      saveCourse,
      confirmDeleteCourse,
      openCreateModuleModal,
      openEditModuleModal,
      saveModule,
      confirmDeleteModule,
      openCreateAssignmentModal,
      saveAssignment,
      openCreateAnnouncementModal,
      editAnnouncement,
      saveAnnouncement,
      confirmDeleteAnnouncement,
      openAddStudentModal,
      searchStudents,
      selectStudent,
      removeSelectedStudent,
      enrollSelectedStudents,
      confirmRemoveStudent,
      confirmDelete,
      
      // Refs
      courseModal,
      moduleModal,
      assignmentModal,
      announcementModal,
      addStudentModal,
      deleteConfirmModal
    }
  }
})
</script>

<style scoped>
.course-detail {
  padding: 1.5rem;
  animation: fadeIn 0.5s ease;
}

.course-detail-content {
  max-width: 1200px;
  margin: 0 auto;
}

.course-header {
  border-left: 4px solid #fd7e14;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.course-header:hover {
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.course-description {
  max-width: 800px;
  line-height: 1.6;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.course-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-circle-container {
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.progress-circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.progress-inner {
  position: absolute;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fd7e14;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  padding: 0.75rem 1.25rem;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-tabs .nav-link:hover {
  color: #fd7e14;
  background-color: rgba(253, 126, 20, 0.05);
}

.nav-tabs .nav-link.active {
  color: #fd7e14;
  border-bottom-color: #fd7e14;
  background-color: transparent;
}

.tab-content {
  padding-top: 1.5rem;
}

.assignment-card {
  border-left: 3px solid #fd7e14;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.assignment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.assignment-description {
  max-height: 4.5rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.timeline-container {
  position: relative;
  padding-left: 2rem;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #dee2e6;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.75rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #fd7e14;
  border: 2px solid white;
  z-index: 1;
}

.timeline-content {
  width: 100%;
  border-left: 3px solid #fd7e14;
}

.announcement-content {
  white-space: pre-line;
}

.student-avatar {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f8f9fa;
  color: #6c757d;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.5s ease;
}

.slide-up {
  animation: slideUp 0.5s ease;
}

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
  .course-detail {
    padding: 1rem;
  }
  
  .course-actions {
    margin-top: 1.5rem;
  }
  
  .course-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .nav-tabs .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .progress-circle-container {
    width: 80px;
    height: 80px;
  }
  
  .progress-inner {
    font-size: 1.2rem;
  }
  
  .timeline-container {
    padding-left: 1.5rem;
  }
  
  .timeline-marker {
    left: -1.5rem;
  }
}
</style>