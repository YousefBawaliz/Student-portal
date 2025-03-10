/**
 * Course Store
 * Manages courses, enrollments, and related information
 * File path: src/stores/course.ts
 */

import { defineStore } from 'pinia'
import courseService from '../services/courseService'
import type { Course, CourseEnrollment } from '../types/course'
import { useAuthStore } from './auth'

interface CourseState {
  allCourses: Course[]
  enrolledCourses: Course[]
  currentCourse: Course | null
  enrollments: Record<number, CourseEnrollment[]> // courseId -> enrollments
  isLoading: boolean
  error: string | null
}

export const useCourseStore = defineStore('course', {
  state: (): CourseState => ({
    allCourses: [],
    enrolledCourses: [],
    currentCourse: null,
    enrollments: {},
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * Returns courses based on user role
     * - Admins see all courses
     * - Others see only enrolled courses
     */
    getCoursesForRole: (state) => {
      const authStore = useAuthStore()
      
      if (authStore.isAdmin) {
        return state.allCourses
      } else {
        return state.enrolledCourses
      }
    },
    
    /**
     * Get a course by its ID
     */
    courseById: (state) => (id: number) => {
      return state.allCourses.find(course => course.id === id) || 
             state.enrolledCourses.find(course => course.id === id) || 
             null
    },
    
    /**
     * Get count of enrolled courses
     */
    enrolledCourseCount: (state) => state.enrolledCourses.length,
    
    /**
     * Get courses where the user is a teacher
     */
    taughtCourses: (state) => {
      const authStore = useAuthStore()
      return authStore.isTeacher 
        ? state.enrolledCourses.filter(course => course.role === 'teacher') 
        : []
    },

    /**
     * Get course enrollments for a specific course
     */
    getCourseEnrollments: (state) => (courseId: number) => {
      return state.enrollments[courseId] || []
    },

    /**
     * Get teachers for a specific course
     */
    getCourseTeachers: (state) => (courseId: number) => {
      return (state.enrollments[courseId] || [])
        .filter(enrollment => enrollment.role === 'teacher')
    },

    /**
     * Get students for a specific course
     */
    getCourseStudents: (state) => (courseId: number) => {
      return (state.enrollments[courseId] || [])
        .filter(enrollment => enrollment.role === 'student')
    },

    /**
     * Get student count for a specific course
     */
    getStudentCount: (state) => (courseId: number) => {
      return (state.enrollments[courseId] || [])
        .filter(enrollment => enrollment.role === 'student')
        .length
    }
  },

  actions: {
    /**
     * Fetch all courses (admin view)
     */
    async fetchAllCourses() {
      this.isLoading = true
      this.error = null
      
      try {
        const courses = await courseService.getAllCourses()
        this.allCourses = courses
        return courses
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch courses'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch courses the current user is enrolled in
     */
    async fetchEnrolledCourses() {
      this.isLoading = true
      this.error = null
      
      try {
        const courses = await courseService.getEnrolledCourses()
        this.enrolledCourses = courses
        return courses
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch enrolled courses'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch a specific course by ID
     */
    async fetchCourse(id: number) {
      this.isLoading = true
      this.error = null
      
      try {
        const course = await courseService.getCourseById(id)
        this.currentCourse = course
        
        // Also add to appropriate list if not already there
        this.updateCourseInLists(course)
        
        return course
      } catch (error: any) {
        this.error = error.message || `Failed to fetch course with ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Create a new course (admin only)
     */
    async createCourse(courseData: Partial<Course>) {
      this.isLoading = true
      this.error = null
      
      try {
        const newCourse = await courseService.createCourse(courseData)
        this.allCourses.push(newCourse)
        return newCourse
      } catch (error: any) {
        this.error = error.message || 'Failed to create course'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Update an existing course
     */
    async updateCourse(id: number, courseData: Partial<Course>) {
      this.isLoading = true
      this.error = null
      
      try {
        const updatedCourse = await courseService.updateCourse(id, courseData)
        
        // Update in current course if it's the active one
        if (this.currentCourse?.id === id) {
          this.currentCourse = updatedCourse
        }
        
        // Update in appropriate lists
        this.updateCourseInLists(updatedCourse)
        
        return updatedCourse
      } catch (error: any) {
        this.error = error.message || `Failed to update course with ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Delete a course
     */
    async deleteCourse(id: number) {
      this.isLoading = true
      this.error = null
      
      try {
        await courseService.deleteCourse(id)
        
        // Remove from lists
        this.allCourses = this.allCourses.filter(c => c.id !== id)
        this.enrolledCourses = this.enrolledCourses.filter(c => c.id !== id)
        
        // Clean up enrollments
        if (this.enrollments[id]) {
          delete this.enrollments[id]
        }
        
        // Clear current course if it was the deleted one
        if (this.currentCourse?.id === id) {
          this.currentCourse = null
        }
        
        return true
      } catch (error: any) {
        this.error = error.message || `Failed to delete course with ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch enrollments for a course
     */
    async fetchCourseEnrollments(courseId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        const enrollments = await courseService.getCourseEnrollments(courseId)
        this.enrollments[courseId] = enrollments
        return enrollments
      } catch (error: any) {
        this.error = error.message || `Failed to fetch enrollments for course ${courseId}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Enroll a user in a course
     */
    async enrollUser(courseId: number, userId: number, role: 'student' | 'teacher') {
      this.isLoading = true
      this.error = null
      
      try {
        const enrollment = await courseService.enrollUser(courseId, userId, role)
        
        // Add to enrollments if we have them loaded
        if (this.enrollments[courseId]) {
          // Check if enrollment already exists
          const existingIndex = this.enrollments[courseId].findIndex(
            e => e.userId === userId
          )
          
          if (existingIndex !== -1) {
            // Update existing enrollment
            this.enrollments[courseId][existingIndex] = enrollment
          } else {
            // Add new enrollment
            this.enrollments[courseId].push(enrollment)
          }
        }
        
        // Update course enrollment counts
        const course = this.courseById(courseId)
        if (course) {
          if (role === 'student') {
            course.studentCount = (course.studentCount || 0) + 1
          } else if (role === 'teacher') {
            course.teacherCount = (course.teacherCount || 0) + 1
          }
        }
        
        return enrollment
      } catch (error: any) {
        this.error = error.message || 'Failed to enroll user in course'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Remove a user from a course
     */
    async unenrollUser(courseId: number, userId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        await courseService.unenrollUser(courseId, userId)
        
        // Remove from enrollments if we have them loaded
        if (this.enrollments[courseId]) {
          const enrollmentToRemove = this.enrollments[courseId].find(
            e => e.userId === userId
          )
          
          this.enrollments[courseId] = this.enrollments[courseId].filter(
            e => e.userId !== userId
          )
          
          // Update course enrollment counts
          if (enrollmentToRemove) {
            const course = this.courseById(courseId)
            if (course) {
              if (enrollmentToRemove.role === 'student' && course.studentCount) {
                course.studentCount--
              } else if (enrollmentToRemove.role === 'teacher' && course.teacherCount) {
                course.teacherCount--
              }
            }
          }
        }
        
        // If current user was unenrolled, remove from enrolledCourses
        const authStore = useAuthStore()
        if (authStore.currentUser?.id === userId) {
          this.enrolledCourses = this.enrolledCourses.filter(c => c.id !== courseId)
        }
        
        return true
      } catch (error: any) {
        this.error = error.message || 'Failed to remove user from course'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Helper method to update a course in both lists if present
     */
    updateCourseInLists(course: Course) {
      // Update in allCourses if present
      const allIndex = this.allCourses.findIndex(c => c.id === course.id)
      if (allIndex !== -1) {
        this.allCourses[allIndex] = course
      } else if (useAuthStore().isAdmin) {
        // Add to allCourses if admin and not already there
        this.allCourses.push(course)
      }
      
      // Update in enrolledCourses if present
      const enrolledIndex = this.enrolledCourses.findIndex(c => c.id === course.id)
      if (enrolledIndex !== -1) {
        this.enrolledCourses[enrolledIndex] = course
      }
    },
    
    /**
     * Add a course to enrolledCourses list if not already present
     * Used when a user is enrolled in a course
     */
    addToEnrolledCourses(course: Course) {
      if (!this.enrolledCourses.some(c => c.id === course.id)) {
        this.enrolledCourses.push(course)
      }
    },
    
    /**
     * Sort courses by a specified field
     */
    sortCourses(field: keyof Course, direction: 'asc' | 'desc' = 'asc') {
      const compareFn = (a: Course, b: Course) => {
        const valueA = a[field]
        const valueB = b[field]
        
        // Handle undefined values
        if (valueA === undefined && valueB === undefined) return 0
        if (valueA === undefined) return direction === 'asc' ? 1 : -1
        if (valueB === undefined) return direction === 'asc' ? -1 : 1
        
        // Compare defined values
        if (valueA < valueB) return direction === 'asc' ? -1 : 1
        if (valueA > valueB) return direction === 'asc' ? 1 : -1
        return 0
      }
      
      this.allCourses.sort(compareFn)
      this.enrolledCourses.sort(compareFn)
    },
    
    /**
     * Filter courses by search term
     */
    filterCoursesByTerm(courses: Course[], term: string): Course[] {
      if (!term.trim()) return courses
      
      const lowerTerm = term.toLowerCase()
      return courses.filter(course => 
        course.name.toLowerCase().includes(lowerTerm) ||
        course.code.toLowerCase().includes(lowerTerm) ||
        (course.description && course.description.toLowerCase().includes(lowerTerm))
      )
    },
    
    /**
     * Clear any error messages
     */
    clearError() {
      this.error = null
    }
  }
})