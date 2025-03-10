/**
 * Progress Store
 * Manages user progress tracking in courses and modules
 * File path: src/stores/progress.ts
 */

import { defineStore } from 'pinia'
import progressService from '../services/progressService'
import { useAuthStore } from './auth'
import { useCourseStore } from './course'
import type { Module } from '../types/module'

interface ModuleProgress {
  id: number
  userId: number
  moduleId: number
  courseId: number
  completed: boolean
  completedAt: string | null
  contentProgress?: ContentProgress[]
}

interface ContentProgress {
  id: number
  userId: number
  contentId: number
  viewed: boolean
  completed: boolean
  completedAt: string | null
  lastAccessedAt: string
  timeSpent?: number // in seconds
}

interface CourseProgress {
  courseId: number
  totalModules: number
  completedModules: number
  percentage: number
  modules: ModuleProgress[]
}

interface ProgressState {
  moduleProgress: Record<number, ModuleProgress>  // moduleId -> progress
  courseProgress: Record<number, CourseProgress>  // courseId -> progress
  contentProgress: Record<number, ContentProgress> // contentId -> progress
  recentActivity: ActivityRecord[]
  isLoading: boolean
  error: string | null
}

interface ActivityRecord {
  id: number
  type: 'module' | 'content' | 'assignment' | 'course'
  action: 'started' | 'completed' | 'viewed'
  itemId: number
  courseId: number
  timestamp: string
  itemName: string
  courseName: string
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => ({
    moduleProgress: {},
    courseProgress: {},
    contentProgress: {},
    recentActivity: [],
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * Get progress for a specific module
     */
    getModuleProgress: (state) => (moduleId: number) => {
      return state.moduleProgress[moduleId] || null
    },

    /**
     * Get progress for a specific course
     */
    getCourseProgress: (state) => (courseId: number) => {
      return state.courseProgress[courseId] || null
    },

    /**
     * Get progress for a specific content item
     */
    getContentProgress: (state) => (contentId: number) => {
      return state.contentProgress[contentId] || null
    },

    /**
     * Check if a module is completed
     */
    isModuleCompleted: (state) => (moduleId: number) => {
      return state.moduleProgress[moduleId]?.completed || false
    },

    /**
     * Check if a content item is completed
     */
    isContentCompleted: (state) => (contentId: number) => {
      return state.contentProgress[contentId]?.completed || false
    },

    /**
     * Check if a content item has been viewed
     */
    isContentViewed: (state) => (contentId: number) => {
      return state.contentProgress[contentId]?.viewed || false
    },

    /**
     * Get overall user progress across all courses
     */
    overallProgress: (state) => {
      if (Object.keys(state.courseProgress).length === 0) {
        return 0
      }

      const totalPercentage = Object.values(state.courseProgress).reduce(
        (sum, progress) => sum + progress.percentage, 
        0
      )
      return totalPercentage / Object.keys(state.courseProgress).length
    },

    /**
     * Get the user's most recently active courses (sorted by recent activity)
     */
    recentCourses: (state) => {
      // Get unique courseIds from recent activity
      const seenCourseIds = new Set<number>()
      const recentCourseIds: number[] = []
      
      state.recentActivity.forEach(activity => {
        if (!seenCourseIds.has(activity.courseId)) {
          seenCourseIds.add(activity.courseId)
          recentCourseIds.push(activity.courseId)
        }
      })
      
      return recentCourseIds
    },

    /**
     * Get the next module to continue for a course
     * Returns the first incomplete module
     */
    getNextModuleForCourse: (state) => (courseId: number, modules: Module[]) => {
      if (!modules || modules.length === 0) return null
      
      // Sort modules by order
      const sortedModules = [...modules].sort((a, b) => 
        (a.order || 0) - (b.order || 0)
      )
      
      // Find first incomplete module
      return sortedModules.find(module => 
        !state.moduleProgress[module.id]?.completed
      ) || sortedModules[0] // Default to first module if all completed
    },

    /**
     * Get completion status counts for a course
     * Returns { completed, inProgress, notStarted }
     */
    getCourseCompletionStatus: (state) => (courseId: number, modules: Module[]) => {
      if (!modules) return { completed: 0, inProgress: 0, notStarted: 0 }
      
      let completed = 0
      let inProgress = 0
      let notStarted = 0
      
      modules.forEach(module => {
        const progress = state.moduleProgress[module.id]
        
        if (progress?.completed) {
          completed++
        } else if (progress) {
          inProgress++
        } else {
          notStarted++
        }
      })
      
      return { completed, inProgress, notStarted }
    }
  },

  actions: {
    /**
     * Fetch progress for all user's enrolled courses
     */
    async fetchUserProgress() {
      this.isLoading = true
      this.error = null
      
      const authStore = useAuthStore()
      if (!authStore.currentUser) {
        this.error = 'User not authenticated'
        this.isLoading = false
        throw new Error('User not authenticated')
      }
      
      try {
        const progressData = await progressService.getUserProgress(authStore.currentUser.id)
        
        // Process module progress
        if (progressData.moduleProgress) {
          progressData.moduleProgress.forEach((progress: ModuleProgress) => {
            this.moduleProgress[progress.moduleId] = progress
          })
        }
        
        // Process course progress
        if (progressData.courseProgress) {
          progressData.courseProgress.forEach((progress: CourseProgress) => {
            this.courseProgress[progress.courseId] = progress
          })
        }
        
        // Process content progress
        if (progressData.contentProgress) {
          progressData.contentProgress.forEach((progress: ContentProgress) => {
            this.contentProgress[progress.contentId] = progress
          })
        }
        
        // Process recent activity
        if (progressData.recentActivity) {
          this.recentActivity = progressData.recentActivity
        }
        
        return progressData
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch user progress'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch progress for a specific course
     */
    async fetchCourseProgress(courseId: number) {
      this.isLoading = true
      this.error = null
      
      const authStore = useAuthStore()
      if (!authStore.currentUser) {
        this.error = 'User not authenticated'
        this.isLoading = false
        throw new Error('User not authenticated')
      }
      
      try {
        const courseProgress = await progressService.getCourseProgress(
          courseId,
          authStore.currentUser.id
        )
        
        // Update course progress
        this.courseProgress[courseId] = courseProgress
        
        // Update module progress
        if (courseProgress.modules) {
          courseProgress.modules.forEach((module: ModuleProgress) => {
            this.moduleProgress[module.moduleId] = module
            
            // Update content progress if available
            if (module.contentProgress) {
              module.contentProgress.forEach((contentItem: ContentProgress) => {
                this.contentProgress[contentItem.contentId] = contentItem
              })
            }
          })
        }
        
        return courseProgress
      } catch (error: any) {
        this.error = error.message || `Failed to fetch progress for course ${courseId}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Mark a module as completed
     */
    async markModuleCompleted(moduleId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        const progress = await progressService.markModuleCompleted(moduleId)
        
        // Update module progress
        this.moduleProgress[moduleId] = progress
        
        // Update course progress if we have it
        const courseId = progress.courseId
        if (courseId && this.courseProgress[courseId]) {
          await this.fetchCourseProgress(courseId)
        }
        
        // Add to recent activity
        this.addActivity({
          id: Date.now(),
          type: 'module',
          action: 'completed',
          itemId: moduleId,
          courseId: progress.courseId,
          timestamp: new Date().toISOString(),
          itemName: progress.moduleName || `Module ${moduleId}`,
          courseName: progress.courseName || `Course ${progress.courseId}`
        })
        
        return progress
      } catch (error: any) {
        this.error = error.message || `Failed to mark module ${moduleId} as completed`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Mark a module as incomplete
     */
    async markModuleIncomplete(moduleId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        const progress = await progressService.markModuleIncomplete(moduleId)
        
        // Update module progress
        this.moduleProgress[moduleId] = progress
        
        // Update course progress if we have it
        const courseId = progress.courseId
        if (courseId && this.courseProgress[courseId]) {
          await this.fetchCourseProgress(courseId)
        }
        
        return progress
      } catch (error: any) {
        this.error = error.message || `Failed to mark module ${moduleId} as incomplete`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Record content progress (viewed or completed)
     */
    async recordContentProgress(contentId: number, data: { 
      moduleId: number, 
      courseId: number,
      completed?: boolean, 
      timeSpent?: number,
      contentName?: string
    }) {
      this.isLoading = true
      this.error = null
      
      try {
        const progress = await progressService.recordContentProgress(
          contentId, 
          data.completed || false,
          data.timeSpent
        )
        
        // Update content progress
        this.contentProgress[contentId] = progress
        
        // Add to recent activity if content was completed
        if (data.completed) {
          this.addActivity({
            id: Date.now(),
            type: 'content',
            action: 'completed',
            itemId: contentId,
            courseId: data.courseId,
            timestamp: new Date().toISOString(),
            itemName: data.contentName || `Content ${contentId}`,
            courseName: progress.courseName || `Course ${data.courseId}`
          })
        } else {
          // Add to recent activity as viewed
          this.addActivity({
            id: Date.now(),
            type: 'content',
            action: 'viewed',
            itemId: contentId,
            courseId: data.courseId,
            timestamp: new Date().toISOString(),
            itemName: data.contentName || `Content ${contentId}`,
            courseName: progress.courseName || `Course ${data.courseId}`
          })
        }
        
        // If the module or course progress might have changed, refresh
        if (data.completed && data.moduleId) {
          const moduleProgress = this.moduleProgress[data.moduleId]
          if (moduleProgress) {
            // Check if all content is completed for this module
            const allContentCompleted = this.checkAllContentCompleted(data.moduleId)
            if (allContentCompleted) {
              // Auto-mark module as completed
              await this.markModuleCompleted(data.moduleId)
            }
          }
        }
        
        return progress
      } catch (error: any) {
        this.error = error.message || `Failed to record progress for content ${contentId}`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Check if all content items in a module are completed
     */
    checkAllContentCompleted(moduleId: number): boolean {
      // This would normally use the content store to get all content items
      // For this implementation, we'll make a simpler check using the module's content progress
      
      const moduleProgress = this.moduleProgress[moduleId]
      if (!moduleProgress || !moduleProgress.contentProgress || moduleProgress.contentProgress.length === 0) {
        return false
      }
      
      return moduleProgress.contentProgress.every(item => item.completed)
    },
    
    /**
     * Record that a user has started a course
     */
    async recordCourseStarted(courseId: number, courseName: string) {
      this.isLoading = true
      this.error = null
      
      try {
        // Call service to record course started
        const result = await progressService.recordCourseStarted(courseId)
        
        // Add to recent activity
        this.addActivity({
          id: Date.now(),
          type: 'course',
          action: 'started',
          itemId: courseId,
          courseId: courseId,
          timestamp: new Date().toISOString(),
          itemName: courseName,
          courseName: courseName
        })
        
        return result
      } catch (error: any) {
        this.error = error.message || `Failed to record course ${courseId} as started`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Record assignment submission and update related progress
     */
    async recordAssignmentSubmission(assignmentId: number, data: {
      courseId: number,
      moduleId?: number,
      assignmentName: string,
      courseName: string
    }) {
      this.isLoading = true
      this.error = null
      
      try {
        // Call service to record assignment submission
        const result = await progressService.recordAssignmentSubmission(assignmentId)
        
        // Add to recent activity
        this.addActivity({
          id: Date.now(),
          type: 'assignment',
          action: 'completed',
          itemId: assignmentId,
          courseId: data.courseId,
          timestamp: new Date().toISOString(),
          itemName: data.assignmentName,
          courseName: data.courseName
        })
        
        // If assignment is tied to a module, refresh module progress
        if (data.moduleId) {
          await this.fetchCourseProgress(data.courseId)
        }
        
        return result
      } catch (error: any) {
        this.error = error.message || `Failed to record assignment ${assignmentId} submission`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Calculate progress for a course based on completed modules
     * This is a client-side calculation based on the current state
     */
    calculateCourseProgress(courseId: number, modules: { id: number }[]) {
      const totalModules = modules.length
      let completedModules = 0
      
      modules.forEach(module => {
        if (this.isModuleCompleted(module.id)) {
          completedModules++
        }
      })
      
      const percentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0
      
      // Update the course progress in state
      this.courseProgress[courseId] = {
        courseId,
        totalModules,
        completedModules,
        percentage,
        modules: [] // This would normally be populated from the server
      }
      
      return this.courseProgress[courseId]
    },
    
    /**
     * Add an activity record to recent activity
     * Keeps only the most recent activities (max 20)
     */
    addActivity(activity: ActivityRecord) {
      // Add to the beginning of the array
      this.recentActivity.unshift(activity)
      
      // Keep only the last 20 activities
      if (this.recentActivity.length > 20) {
        this.recentActivity = this.recentActivity.slice(0, 20)
      }
    },
    
    /**
     * Get recent activities for a specific course
     */
    getActivitiesForCourse(courseId: number): ActivityRecord[] {
      return this.recentActivity.filter(activity => activity.courseId === courseId)
    },
    
    /**
     * Clear any error messages
     */
    clearError() {
      this.error = null
    },
    
    /**
     * Reset progress store state (used for logout)
     */
    resetState() {
      this.moduleProgress = {}
      this.courseProgress = {}
      this.contentProgress = {}
      this.recentActivity = []
      this.isLoading = false
      this.error = null
    }
  }
})