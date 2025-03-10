/**
 * Progress Service
 * Handles API calls related to user progress tracking
 * File path: src/services/progressService.ts
 */

import apiService from './api';

/**
 * Get progress for all courses the user is enrolled in
 * 
 * @param userId - The ID of the user
 * @returns Promise with user progress data
 */
const getUserProgress = async (userId: number) => {
  const response = await apiService.get(`/api/users/${userId}/progress`);
  return response.data;
};

/**
 * Get progress for a specific course
 * 
 * @param courseId - The ID of the course
 * @param userId - The ID of the user
 * @returns Promise with course progress data
 */
const getCourseProgress = async (courseId: number, userId: number) => {
  const response = await apiService.get(`/api/courses/${courseId}/progress/${userId}`);
  return response.data;
};

/**
 * Mark a module as completed
 * 
 * @param moduleId - The ID of the module to mark as completed
 * @returns Promise with the updated module progress
 */
const markModuleCompleted = async (moduleId: number) => {
  const response = await apiService.post(`/api/modules/${moduleId}/progress/complete`);
  return response.data;
};

/**
 * Mark a module as incomplete
 * 
 * @param moduleId - The ID of the module to mark as incomplete
 * @returns Promise with the updated module progress
 */
const markModuleIncomplete = async (moduleId: number) => {
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
) => {
  const progressData = {
    completed,
    timeSpent
  };
  
  const response = await apiService.post(`/api/content/${contentId}/progress`, progressData);
  return response.data;
};

/**
 * Record that a user has started a course
 * 
 * @param courseId - The ID of the course
 * @returns Promise with the created course progress
 */
const recordCourseStarted = async (courseId: number) => {
  const response = await apiService.post(`/api/courses/${courseId}/progress/start`);
  return response.data;
};

/**
 * Record an assignment submission
 * 
 * @param assignmentId - The ID of the assignment
 * @returns Promise with the updated assignment progress
 */
const recordAssignmentSubmission = async (assignmentId: number) => {
  const response = await apiService.post(`/api/assignments/${assignmentId}/progress/submit`);
  return response.data;
};

/**
 * Get recent learning activity for a user
 * 
 * @param userId - The ID of the user
 * @param limit - Maximum number of activities to return
 * @returns Promise with list of recent activities
 */
const getRecentActivity = async (userId: number, limit: number = 10) => {
  const response = await apiService.get(`/api/users/${userId}/activity`, { limit });
  return response.data;
};

/**
 * Reset progress for a course (for testing or admin purposes)
 * 
 * @param courseId - The ID of the course
 * @param userId - The ID of the user
 * @returns Promise with success status
 */
const resetCourseProgress = async (courseId: number, userId: number) => {
  const response = await apiService.delete(`/api/courses/${courseId}/progress/${userId}`);
  return response.data;
};

export default {
  getUserProgress,
  getCourseProgress,
  markModuleCompleted,
  markModuleIncomplete,
  recordContentProgress,
  recordCourseStarted,
  recordAssignmentSubmission,
  getRecentActivity,
  resetCourseProgress
};