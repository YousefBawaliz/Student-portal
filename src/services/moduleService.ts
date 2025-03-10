 /**
 * Module Service
 * Handles API calls related to modules and content
 * File path: src/services/moduleService.ts
 */

import apiService from './api';
import type { 
  Module, 
  ContentItem, 
  ModuleCreateRequest, 
  ModuleUpdateRequest,
  ContentItemCreateRequest,
  ContentItemUpdateRequest,
  ModuleProgress,
  ContentProgress
} from '../types/module';

/**
 * Get all modules for a course
 * 
 * @param courseId - The ID of the course
 * @returns Promise with array of modules
 */
const getModulesByCourse = async (courseId: number): Promise<Module[]> => {
  const response = await apiService.get(`/api/courses/${courseId}/modules`);
  return response.data;
};

/**
 * Get module details by ID
 * 
 * @param id - The ID of the module
 * @returns Promise with module details
 */
const getModuleById = async (id: number): Promise<Module> => {
  const response = await apiService.get(`/api/modules/${id}`);
  return response.data;
};

/**
 * Create a new module
 * 
 * @param courseId - The ID of the course
 * @param moduleData - The module data to create
 * @returns Promise with the created module
 */
const createModule = async (courseId: number, moduleData: Partial<Module>): Promise<Module> => {
  const createRequest: ModuleCreateRequest = {
    courseId,
    title: moduleData.title || '',
    description: moduleData.description,
    order: moduleData.order || 1
  };
  
  const response = await apiService.post(`/api/courses/${courseId}/modules`, createRequest);
  return response.data;
};

/**
 * Update an existing module
 * 
 * @param id - The ID of the module to update
 * @param moduleData - The module data to update
 * @returns Promise with the updated module
 */
const updateModule = async (id: number, moduleData: Partial<Module>): Promise<Module> => {
  const updateRequest: ModuleUpdateRequest = {};
  
  if (moduleData.title !== undefined) updateRequest.title = moduleData.title;
  if (moduleData.description !== undefined) updateRequest.description = moduleData.description;
  if (moduleData.order !== undefined) updateRequest.order = moduleData.order;
  
  const response = await apiService.put(`/api/modules/${id}`, updateRequest);
  return response.data;
};

/**
 * Delete a module
 * 
 * @param id - The ID of the module to delete
 * @returns Promise with success status
 */
const deleteModule = async (id: number): Promise<void> => {
  await apiService.delete(`/api/modules/${id}`);
};

/**
 * Get all content for a module
 * 
 * @param moduleId - The ID of the module
 * @returns Promise with array of content items
 */
const getContentForModule = async (moduleId: number): Promise<ContentItem[]> => {
  const response = await apiService.get(`/api/modules/${moduleId}/content`);
  return response.data;
};

/**
 * Get a specific content item by ID
 * 
 * @param id - The ID of the content item
 * @returns Promise with content item details
 */
const getContentById = async (id: number): Promise<ContentItem> => {
  const response = await apiService.get(`/api/content/${id}`);
  return response.data;
};

/**
 * Create a new content item
 * 
 * @param moduleId - The ID of the module
 * @param contentData - The content data to create
 * @returns Promise with the created content item
 */
const createContentItem = async (moduleId: number, contentData: Partial<ContentItem>): Promise<ContentItem> => {
  const createRequest: ContentItemCreateRequest = {
    moduleId,
    title: contentData.title || '',
    contentType: contentData.contentType || 'text',
    content: contentData.content,
    contentUrl: contentData.contentUrl,
    description: contentData.description,
    duration: contentData.duration
  };
  
  const response = await apiService.post(`/api/modules/${moduleId}/content`, createRequest);
  return response.data;
};

/**
 * Update an existing content item
 * 
 * @param id - The ID of the content item to update
 * @param contentData - The content data to update
 * @returns Promise with the updated content item
 */
const updateContentItem = async (id: number, contentData: Partial<ContentItem>): Promise<ContentItem> => {
  const updateRequest: ContentItemUpdateRequest = {};
  
  if (contentData.title !== undefined) updateRequest.title = contentData.title;
  if (contentData.contentType !== undefined) updateRequest.contentType = contentData.contentType;
  if (contentData.content !== undefined) updateRequest.content = contentData.content;
  if (contentData.contentUrl !== undefined) updateRequest.contentUrl = contentData.contentUrl;
  if (contentData.description !== undefined) updateRequest.description = contentData.description;
  if (contentData.duration !== undefined) updateRequest.duration = contentData.duration;
  
  const response = await apiService.put(`/api/content/${id}`, updateRequest);
  return response.data;
};

/**
 * Delete a content item
 * 
 * @param id - The ID of the content item to delete
 * @returns Promise with success status
 */
const deleteContentItem = async (id: number): Promise<void> => {
  await apiService.delete(`/api/content/${id}`);
};

/**
 * Get module progress for a user
 * 
 * @param moduleId - The ID of the module
 * @param userId - The ID of the user
 * @returns Promise with module progress details
 */
const getModuleProgress = async (moduleId: number, userId: number): Promise<ModuleProgress> => {
  const response = await apiService.get(`/api/modules/${moduleId}/progress/${userId}`);
  return response.data;
};

/**
 * Mark a module as completed
 * 
 * @param moduleId - The ID of the module to mark as completed
 * @returns Promise with the updated module progress
 */
const markModuleCompleted = async (moduleId: number): Promise<ModuleProgress> => {
  const response = await apiService.post(`/api/modules/${moduleId}/progress/complete`);
  return response.data;
};

/**
 * Mark a module as incomplete
 * 
 * @param moduleId - The ID of the module to mark as incomplete
 * @returns Promise with the updated module progress
 */
const markModuleIncomplete = async (moduleId: number): Promise<ModuleProgress> => {
  const response = await apiService.post(`/api/modules/${moduleId}/progress/incomplete`);
  return response.data;
};

/**
 * Record content progress
 * 
 * @param contentId - The ID of the content
 * @param completed - Whether the content is completed
 * @param timeSpent - Time spent on the content (in seconds)
 * @returns Promise with the updated content progress
 */
const recordContentProgress = async (
  contentId: number, 
  completed: boolean = false, 
  timeSpent?: number
): Promise<ContentProgress> => {
  const progressData = {
    completed,
    timeSpent
  };
  
  const response = await apiService.post(`/api/content/${contentId}/progress`, progressData);
  return response.data;
};

/**
 * Reorder modules within a course
 * 
 * @param courseId - The ID of the course
 * @param moduleIds - Ordered array of module IDs
 * @returns Promise with the updated modules
 */
const reorderModules = async (courseId: number, moduleIds: number[]): Promise<Module[]> => {
  const reorderData = {
    moduleIds
  };
  
  const response = await apiService.put(`/api/courses/${courseId}/modules/reorder`, reorderData);
  return response.data;
};

/**
 * Get recently accessed modules
 * 
 * @param limit - Number of modules to return (default 5)
 * @returns Promise with array of recently accessed modules
 */
const getRecentModules = async (limit: number = 5): Promise<Module[]> => {
  const response = await apiService.get('/api/modules/recent', { limit });
  return response.data;
};

export default {
  getModulesByCourse,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getContentForModule,
  getContentById,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getModuleProgress,
  markModuleCompleted,
  markModuleIncomplete,
  recordContentProgress,
  reorderModules,
  getRecentModules
};