/**
 * Assignment Store
 * Manages assignments, submissions, and grading
 * File path: src/stores/assignment.ts
 */

import { defineStore } from 'pinia'
import assignmentService from '../services/assignmentService'
import { useAuthStore } from './auth'
import type { 
  Assignment, 
  Submission, 
  AssignmentCreateRequest, 
  SubmissionCreateRequest,
  GradeSubmissionRequest 
} from '../types/assignment'

interface AssignmentState {
  assignments: Assignment[]
  currentAssignment: Assignment | null
  assignmentsByCourse: Record<number, Assignment[]>
  submissions: Record<number, Submission[]>
  userSubmissions: Record<number, Submission | null>
  isLoading: boolean
  error: string | null
}

export const useAssignmentStore = defineStore('assignment', {
  state: (): AssignmentState => ({
    assignments: [],
    currentAssignment: null,
    assignmentsByCourse: {},
    submissions: {},
    userSubmissions: {},
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * Get assignments for a specific course
     */
    getAssignmentsForCourse: (state) => (courseId: number) => {
      return state.assignmentsByCourse[courseId] || []
    },
    
    /**
     * Get submissions for a specific assignment
     */
    getSubmissionsForAssignment: (state) => (assignmentId: number) => {
      return state.submissions[assignmentId] || []
    },
    
    /**
     * Get current user's submission for an assignment
     */
    getUserSubmissionForAssignment: (state) => (assignmentId: number) => {
      return state.userSubmissions[assignmentId] || null
    },
    
    /**
     * Get assignment by ID
     */
    getAssignmentById: (state) => (id: number) => {
      return state.assignments.find(assignment => assignment.id === id) || null
    },
    
    /**
     * Check if user can manage assignment
     */
    canManageAssignment: () => (assignment: Assignment) => {
      const authStore = useAuthStore()
      return authStore.isAdmin || 
             (authStore.isTeacher && assignment.canManage === true)
    },
    
    /**
     * Get upcoming assignments (due in the future)
     */
    upcomingAssignments: (state) => {
      const now = new Date()
      return state.assignments
        .filter(assignment => {
          const dueDate = new Date(assignment.dueDate)
          return dueDate > now
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    }
  },

  actions: {
    /**
     * Fetch all assignments for a course
     */
    async fetchAssignmentsForCourse(courseId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        const assignments = await assignmentService.getAssignmentsByCourse(courseId)
        this.assignmentsByCourse[courseId] = assignments
        
        // Add to assignments array if not already present
        assignments.forEach(assignment => {
          if (!this.assignments.some(a => a.id === assignment.id)) {
            this.assignments.push(assignment)
          } else {
            // Update if already exists
            const index = this.assignments.findIndex(a => a.id === assignment.id)
            if (index !== -1) {
              this.assignments[index] = assignment
            }
          }
        })
        
        return assignments
      } catch (error: any) {
        this.error = error.message || `Failed to fetch assignments for course ${courseId}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Create a new assignment
     */
    async createAssignment(assignmentData: AssignmentCreateRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const newAssignment = await assignmentService.createAssignment(assignmentData)
        
        // Add to assignments array
        this.assignments.push(newAssignment)
        
        // Add to course assignments
        const courseId = newAssignment.courseId
        if (!this.assignmentsByCourse[courseId]) {
          this.assignmentsByCourse[courseId] = []
        }
        this.assignmentsByCourse[courseId].push(newAssignment)
        
        return newAssignment
      } catch (error: any) {
        this.error = error.message || 'Failed to create assignment'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Update an existing assignment
     */
    async updateAssignment(id: number, assignmentData: Partial<Assignment>) {
      this.isLoading = true
      this.error = null
      
      try {
        const updatedAssignment = await assignmentService.updateAssignment(id, assignmentData)
        
        // Update in current assignment if it's the active one
        if (this.currentAssignment?.id === id) {
          this.currentAssignment = updatedAssignment
        }
        
        // Update in assignments array
        const assignmentIndex = this.assignments.findIndex(a => a.id === id)
        if (assignmentIndex !== -1) {
          this.assignments[assignmentIndex] = updatedAssignment
        }
        
        // Update in assignmentsByCourse
        const courseId = updatedAssignment.courseId
        if (courseId && this.assignmentsByCourse[courseId]) {
          const courseAssignmentIndex = this.assignmentsByCourse[courseId].findIndex(a => a.id === id)
          if (courseAssignmentIndex !== -1) {
            this.assignmentsByCourse[courseId][courseAssignmentIndex] = updatedAssignment
          }
        }
        
        return updatedAssignment
      } catch (error: any) {
        this.error = error.message || `Failed to update assignment with ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Delete an assignment
     */
    async deleteAssignment(id: number) {
      this.isLoading = true
      this.error = null
      
      try {
        await assignmentService.deleteAssignment(id)
        
        // Find the course ID before removing the assignment
        const assignment = this.assignments.find(a => a.id === id)
        const courseId = assignment?.courseId
        
        // Remove from assignments array
        this.assignments = this.assignments.filter(a => a.id !== id)
        
        // Remove from assignmentsByCourse
        if (courseId && this.assignmentsByCourse[courseId]) {
          this.assignmentsByCourse[courseId] = this.assignmentsByCourse[courseId].filter(a => a.id !== id)
        }
        
        // Clear current assignment if it was the deleted one
        if (this.currentAssignment?.id === id) {
          this.currentAssignment = null
        }
        
        // Clean up submissions
        if (this.submissions[id]) {
          delete this.submissions[id]
        }
        if (this.userSubmissions[id]) {
          delete this.userSubmissions[id]
        }
        
        return true
      } catch (error: any) {
        this.error = error.message || `Failed to delete assignment with ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Submit an assignment (student only)
     */
    async submitAssignment(submissionData: SubmissionCreateRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const submission = await assignmentService.submitAssignment(submissionData)
        const assignmentId = submission.assignmentId
        
        // Save to userSubmissions
        this.userSubmissions[assignmentId] = submission
        
        // Update submissions array if it exists
        if (this.submissions[assignmentId]) {
          const existingIndex = this.submissions[assignmentId].findIndex(
            s => s.userId === submission.userId
          )
          
          if (existingIndex !== -1) {
            this.submissions[assignmentId][existingIndex] = submission
          } else {
            this.submissions[assignmentId].push(submission)
          }
        }
        
        return submission
      } catch (error: any) {
        this.error = error.message || 'Failed to submit assignment'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Grade a submission (teacher/admin only)
     */
    async gradeSubmission(submissionId: number, grade: number) {
      this.isLoading = true
      this.error = null
      
      try {
        const updatedSubmission = await assignmentService.gradeSubmission(submissionId, grade)
        const assignmentId = updatedSubmission.assignmentId
        
        // Update in submissions if present
        if (this.submissions[assignmentId]) {
          const index = this.submissions[assignmentId].findIndex(s => s.id === submissionId)
          if (index !== -1) {
            this.submissions[assignmentId][index] = updatedSubmission
          }
        }
        
        // Update in userSubmissions if present
        if (this.userSubmissions[assignmentId] && this.userSubmissions[assignmentId].id === submissionId) {
          this.userSubmissions[assignmentId] = updatedSubmission
        }
        
        return updatedSubmission
      } catch (error: any) {
        this.error = error.message || `Failed to grade submission with ID ${submissionId}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch a specific assignment by ID
     */
    async fetchAssignment(id: number) {
      this.isLoading = true
      this.error = null
      
      try {
        const assignment = await assignmentService.getAssignmentById(id)
        this.currentAssignment = assignment
        
        // Update in assignments array
        const existingIndex = this.assignments.findIndex(a => a.id === id)
        if (existingIndex !== -1) {
          this.assignments[existingIndex] = assignment
        } else {
          this.assignments.push(assignment)
        }
        
        // Update in assignmentsByCourse
        if (assignment.courseId) {
          if (!this.assignmentsByCourse[assignment.courseId]) {
            this.assignmentsByCourse[assignment.courseId] = []
          }
          
          const courseAssignmentIndex = this.assignmentsByCourse[assignment.courseId].findIndex(a => a.id === id)
          if (courseAssignmentIndex !== -1) {
            this.assignmentsByCourse[assignment.courseId][courseAssignmentIndex] = assignment
          } else {
            this.assignmentsByCourse[assignment.courseId].push(assignment)
          }
        }
        
        return assignment
      } catch (error: any) {
        this.error = error.message || `Failed to fetch assignment with ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch submissions for an assignment (teacher/admin only)
     */
    async fetchSubmissionsForAssignment(assignmentId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        const submissions = await assignmentService.getSubmissionsForAssignment(assignmentId)
        this.submissions[assignmentId] = submissions
        return submissions
      } catch (error: any) {
        this.error = error.message || `Failed to fetch submissions for assignment ${assignmentId}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch current user's submission for an assignment
     */
    async fetchUserSubmission(assignmentId: number) {
      this.isLoading = true
      this.error = null
      
      const authStore = useAuthStore()
      if (!authStore.currentUser) {
        this.error = 'User not authenticated'
        this.isLoading = false
        throw new Error('User not authenticated')
      }
      
      try {
        const submission = await assignmentService.getUserSubmission(
          assignmentId, 
          authStore.currentUser.id
        )
        
        if (submission) {
          this.userSubmissions[assignmentId] = submission
        }
        
        return submission
      } catch (error: any) {
        // If 404, it means user hasn't submitted yet
        if (error.status === 404) {
          this.userSubmissions[assignmentId] = null
          return null
        }
        
        this.error = error.message || `Failed to fetch submission for assignment ${assignmentId}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Clear any error messages
     */
    clearError() {
      this.error = null
    }
  }
})