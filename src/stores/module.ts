/**
 * Module Store
 * Manages course modules and content organization
 * File path: src/stores/module.ts
 */

import { defineStore } from 'pinia';
import moduleService from '../services/moduleService';
import type { Module, ContentItem, ModuleProgress, ContentProgress } from '../types/module';
import { useAuthStore } from './auth';
import { useProgressStore } from './progress';

interface ModuleState {
  modules: Module[];
  currentModule: Module | null;
  modulesByCourse: Record<number, Module[]>;
  contentItems: Record<number, ContentItem[]>;
  currentContent: ContentItem | null;
  moduleProgress: Record<number, ModuleProgress>;
  contentProgress: Record<number, ContentProgress>;
  isLoading: boolean;
  error: string | null;
}

export const useModuleStore = defineStore('module', {
  state: (): ModuleState => ({
    modules: [],
    currentModule: null,
    modulesByCourse: {},
    contentItems: {},
    currentContent: null,
    moduleProgress: {},
    contentProgress: {},
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * Get modules for a specific course
     */
    getModulesForCourse: (state) => (courseId: number) => {
      return state.modulesByCourse[courseId] || [];
    },
    
    /**
     * Get content items for a specific module
     */
    getContentForModule: (state) => (moduleId: number) => {
      return state.contentItems[moduleId] || [];
    },
    
    /**
     * Get a module by ID
     */
    getModuleById: (state) => (id: number) => {
      return state.modules.find(module => module.id === id) || null;
    },
    
    /**
     * Get content item by ID
     */
    getContentById: (state) => (id: number) => {
      // Search through all content items
      for (const moduleId in state.contentItems) {
        const item = state.contentItems[moduleId].find(content => content.id === id);
        if (item) return item;
      }
      return null;
    },
    
    /**
     * Check if user can manage a module
     */
    canManageModule: () => (module: Module) => {
      const authStore = useAuthStore();
      return authStore.isAdmin || 
             (authStore.isTeacher && module.canManage === true);
    },
    
    /**
     * Get all content items across all modules (for search functionality)
     */
    allContentItems: (state) => {
      const items: ContentItem[] = [];
      for (const moduleId in state.contentItems) {
        items.push(...state.contentItems[moduleId]);
      }
      return items;
    },
    
    /**
     * Get module progress for a specific module
     */
    getModuleProgressById: (state) => (moduleId: number) => {
      return state.moduleProgress[moduleId] || null;
    },
    
    /**
     * Check if a module is completed
     */
    isModuleCompleted: (state) => (moduleId: number) => {
      return state.moduleProgress[moduleId]?.completed || false;
    },
    
    /**
     * Get content progress for a specific content item
     */
    getContentProgressById: (state) => (contentId: number) => {
      return state.contentProgress[contentId] || null;
    },
    
    /**
     * Check if content is completed
     */
    isContentCompleted: (state) => (contentId: number) => {
      return state.contentProgress[contentId]?.completed || false;
    }
  },

  actions: {
    /**
     * Fetch all modules for a course
     */
    async fetchModulesForCourse(courseId: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const modules = await moduleService.getModulesByCourse(courseId);
        
        // Store in modulesByCourse
        this.modulesByCourse[courseId] = modules;
        
        // Add modules to the modules array, updating existing ones
        modules.forEach(module => {
          this.updateModuleInState(module);
        });
        
        // Attempt to fetch progress information
        this.fetchModuleProgressForCourse(courseId).catch(error => {
          console.error('Error fetching module progress:', error);
          // Don't fail the entire operation if progress fetch fails
        });
        
        return modules;
      } catch (error: any) {
        this.error = error.message || `Failed to fetch modules for course ${courseId}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Fetch module progress for a course
     * Uses the progress store but caches the results here for quicker access
     */
    async fetchModuleProgressForCourse(courseId: number) {
      const progressStore = useProgressStore();
      const authStore = useAuthStore();
      
      if (!authStore.currentUser?.id) {
        return; // Can't fetch progress without a user
      }
      
      try {
        // Use the progress store to fetch course progress
        const courseProgress = await progressStore.fetchCourseProgress(courseId);
        
        // Extract module progress and cache it in this store
        if (courseProgress && courseProgress.modules) {
          courseProgress.modules.forEach((moduleProgress: ModuleProgress) => {
            this.moduleProgress[moduleProgress.moduleId] = moduleProgress;
          });
        }
        
        return courseProgress;
      } catch (error) {
        console.error(`Failed to fetch module progress for course ${courseId}:`, error);
        throw error;
      }
    },
    
    /**
     * Fetch a specific module by ID
     */
    async fetchModule(id: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const module = await moduleService.getModuleById(id);
        this.currentModule = module;
        
        // Update in modules array and modulesByCourse
        this.updateModuleInState(module);
        
        // Fetch the module's content
        await this.fetchContentForModule(id);
        
        // Fetch module progress
        try {
          const authStore = useAuthStore();
          if (authStore.currentUser?.id) {
            const progress = await moduleService.getModuleProgress(id, authStore.currentUser.id);
            this.moduleProgress[id] = progress;
          }
        } catch (error) {
          console.error(`Failed to fetch progress for module ${id}:`, error);
          // Don't fail the entire operation if progress fetch fails
        }
        
        return module;
      } catch (error: any) {
        this.error = error.message || `Failed to fetch module with ID ${id}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Fetch content items for a module
     */
    async fetchContentForModule(moduleId: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const contentItems = await moduleService.getContentForModule(moduleId);
        this.contentItems[moduleId] = contentItems;
        
        // Update the module's contentCount property
        const module = this.getModuleById(moduleId);
        if (module) {
          module.contentCount = contentItems.length;
          
          // Calculate total duration
          module.duration = contentItems.reduce((total, item) => {
            return total + (item.duration || 0);
          }, 0);
          
          // Add content items to the module
          module.contentItems = contentItems;
        }
        
        // Fetch content progress for all items
        const authStore = useAuthStore();
        if (authStore.currentUser?.id) {
          contentItems.forEach(item => {
            this.fetchContentProgress(item.id).catch(error => {
              console.error(`Failed to fetch progress for content ${item.id}:`, error);
              // Don't fail the entire operation if progress fetch fails
            });
          });
        }
        
        return contentItems;
      } catch (error: any) {
        this.error = error.message || `Failed to fetch content for module ${moduleId}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Fetch a specific content item by ID
     */
    async fetchContent(id: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const content = await moduleService.getContentById(id);
        this.currentContent = content;
        
        // Add to contentItems if we have the module's content array
        if (this.contentItems[content.moduleId]) {
          const existingIndex = this.contentItems[content.moduleId].findIndex(c => c.id === id);
          if (existingIndex !== -1) {
            this.contentItems[content.moduleId][existingIndex] = content;
          } else {
            this.contentItems[content.moduleId].push(content);
          }
        }
        
        // Fetch content progress
        await this.fetchContentProgress(id);
        
        return content;
      } catch (error: any) {
        this.error = error.message || `Failed to fetch content with ID ${id}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Fetch progress for a specific content item
     */
    async fetchContentProgress(contentId: number) {
      const authStore = useAuthStore();
      if (!authStore.currentUser?.id) {
        return null; // Can't fetch progress without a user
      }
      
      try {
        // Record a view if we don't have progress already
        if (!this.contentProgress[contentId]) {
          // In a real implementation, we would call an API to get existing progress first
          // Here we'll just record a new view
          const progress = await moduleService.recordContentProgress(contentId, false);
          this.contentProgress[contentId] = progress;
          return progress;
        }
        
        return this.contentProgress[contentId];
      } catch (error) {
        console.error(`Failed to fetch content progress for ${contentId}:`, error);
        throw error;
      }
    },
    
    /**
     * Create a new module
     */
    async createModule(courseId: number, moduleData: Partial<Module>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const newModule = await moduleService.createModule(courseId, moduleData);
        
        // Add to modules array
        this.modules.push(newModule);
        
        // Add to course modules
        if (!this.modulesByCourse[courseId]) {
          this.modulesByCourse[courseId] = [];
        }
        this.modulesByCourse[courseId].push(newModule);
        
        return newModule;
      } catch (error: any) {
        this.error = error.message || 'Failed to create module';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Update an existing module
     */
    async updateModule(id: number, moduleData: Partial<Module>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const updatedModule = await moduleService.updateModule(id, moduleData);
        
        // Update in state
        this.updateModuleInState(updatedModule);
        
        return updatedModule;
      } catch (error: any) {
        this.error = error.message || `Failed to update module with ID ${id}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Delete a module
     */
    async deleteModule(id: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await moduleService.deleteModule(id);
        
        // Find the course ID before removing the module
        const module = this.modules.find(m => m.id === id);
        const courseId = module?.courseId;
        
        // Remove from modules array
        this.modules = this.modules.filter(m => m.id !== id);
        
        // Remove from modulesByCourse
        if (courseId && this.modulesByCourse[courseId]) {
          this.modulesByCourse[courseId] = this.modulesByCourse[courseId].filter(m => m.id !== id);
        }
        
        // Clear current module if it was the deleted one
        if (this.currentModule?.id === id) {
          this.currentModule = null;
        }
        
        // Clean up content items
        if (this.contentItems[id]) {
          delete this.contentItems[id];
        }
        
        // Clean up module progress
        if (this.moduleProgress[id]) {
          delete this.moduleProgress[id];
        }
        
        return true;
      } catch (error: any) {
        this.error = error.message || `Failed to delete module with ID ${id}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Create a new content item for a module
     */
    async createContentItem(moduleId: number, contentData: Partial<ContentItem>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const newContent = await moduleService.createContentItem(moduleId, contentData);
        
        // Initialize array if needed
        if (!this.contentItems[moduleId]) {
          this.contentItems[moduleId] = [];
        }
        
        // Add to content items
        this.contentItems[moduleId].push(newContent);
        
        // Update module content count
        const module = this.getModuleById(moduleId);
        if (module) {
          module.contentCount = (module.contentCount || 0) + 1;
          module.duration = (module.duration || 0) + (newContent.duration || 0);
          
          // Add to module's contentItems if it exists
          if (module.contentItems) {
            module.contentItems.push(newContent);
          } else {
            module.contentItems = [newContent];
          }
        }
        
        return newContent;
      } catch (error: any) {
        this.error = error.message || 'Failed to create content item';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Update a content item
     */
    async updateContentItem(id: number, contentData: Partial<ContentItem>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const updatedContent = await moduleService.updateContentItem(id, contentData);
        const moduleId = updatedContent.moduleId;
        
        // Update in contentItems if present
        if (this.contentItems[moduleId]) {
          const index = this.contentItems[moduleId].findIndex(c => c.id === id);
          if (index !== -1) {
            // Calculate duration change for module update
            const oldDuration = this.contentItems[moduleId][index].duration || 0;
            const newDuration = updatedContent.duration || 0;
            const durationDiff = newDuration - oldDuration;
            
            // Update the content item
            this.contentItems[moduleId][index] = updatedContent;
            
            // Update module duration if it changed
            if (durationDiff !== 0) {
              const module = this.getModuleById(moduleId);
              if (module) {
                module.duration = (module.duration || 0) + durationDiff;
              }
            }
          }
        }
        
        // Update current content if it was the updated one
        if (this.currentContent?.id === id) {
          this.currentContent = updatedContent;
        }
        
        return updatedContent;
      } catch (error: any) {
        this.error = error.message || `Failed to update content item with ID ${id}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Delete a content item
     */
    async deleteContentItem(id: number, moduleId: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await moduleService.deleteContentItem(id);
        
        // Get the content item before removing it to update module duration
        let durationToSubtract = 0;
        if (this.contentItems[moduleId]) {
          const contentItem = this.contentItems[moduleId].find(c => c.id === id);
          durationToSubtract = contentItem?.duration || 0;
          
          // Remove from contentItems
          this.contentItems[moduleId] = this.contentItems[moduleId].filter(c => c.id !== id);
        }
        
        // Update module content count and duration
        const module = this.getModuleById(moduleId);
        if (module) {
          module.contentCount = Math.max(0, (module.contentCount || 1) - 1);
          module.duration = Math.max(0, (module.duration || 0) - durationToSubtract);
          
          // Update module contentItems if it exists
          if (module.contentItems) {
            module.contentItems = module.contentItems.filter(c => c.id !== id);
          }
        }
        
        // Clear current content if it was the deleted one
        if (this.currentContent?.id === id) {
          this.currentContent = null;
        }
        
        // Clean up content progress
        if (this.contentProgress[id]) {
          delete this.contentProgress[id];
        }
        
        return true;
      } catch (error: any) {
        this.error = error.message || `Failed to delete content item with ID ${id}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Helper method to update a module in the state
     * This updates the module in both the modules array and modulesByCourse
     */
    updateModuleInState(module: Module) {
      // Update in modules array
      const moduleIndex = this.modules.findIndex(m => m.id === module.id);
      if (moduleIndex !== -1) {
        this.modules[moduleIndex] = { ...this.modules[moduleIndex], ...module };
      } else {
        this.modules.push(module);
      }
      
      // Update in modulesByCourse
      if (!this.modulesByCourse[module.courseId]) {
        this.modulesByCourse[module.courseId] = [];
      }
      
      const coursesModuleIndex = this.modulesByCourse[module.courseId].findIndex(m => m.id === module.id);
      if (coursesModuleIndex !== -1) {
        this.modulesByCourse[module.courseId][coursesModuleIndex] = { 
          ...this.modulesByCourse[module.courseId][coursesModuleIndex], 
          ...module 
        };
      } else {
        this.modulesByCourse[module.courseId].push(module);
      }
      
      // Update currentModule if it's the same module
      if (this.currentModule?.id === module.id) {
        this.currentModule = { ...this.currentModule, ...module };
      }
    },
    
    /**
     * Mark a module as completed
     */
    async markModuleCompleted(moduleId: number) {
      try {
        const progress = await moduleService.markModuleCompleted(moduleId);
        this.moduleProgress[moduleId] = progress;
        return progress;
      } catch (error: any) {
        this.error = error.message || `Failed to mark module ${moduleId} as completed`;
        throw error;
      }
    },
    
    /**
     * Mark a module as incomplete
     */
    async markModuleIncomplete(moduleId: number) {
      try {
        const progress = await moduleService.markModuleIncomplete(moduleId);
        this.moduleProgress[moduleId] = progress;
        return progress;
      } catch (error: any) {
        this.error = error.message || `Failed to mark module ${moduleId} as incomplete`;
        throw error;
      }
    },
    
    /**
     * Record content progress (view or completion)
     */
    async recordContentProgress(contentId: number, completed: boolean = false, timeSpent?: number) {
      try {
        const progress = await moduleService.recordContentProgress(contentId, completed, timeSpent);
        this.contentProgress[contentId] = progress;
        return progress;
      } catch (error: any) {
        this.error = error.message || `Failed to record progress for content ${contentId}`;
        throw error;
      }
    }
  }
});
    
    