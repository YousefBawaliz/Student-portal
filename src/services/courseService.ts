 /**
 * Course Service
 * Handles API calls related to courses and enrollments
 * File path: src/services/courseService.ts
 */

import apiService from './api'
import type { 
  Course, 
  CourseEnrollment, 
  CourseCreateRequest, 
  CourseUpdateRequest, 
  EnrollmentRequest 
} from '../types/course'

/**
 * Get all courses (admin access)
 * 
 * @returns Promise with array of courses
 */
const getAllCourses = async (): Promise<Course[]> => {
  const response = await apiService.get('/api/courses')
  return response.data
}

/**
 * Get courses current user is enrolled in
 * 
 * @returns Promise with array of enrolled courses
 */
const getEnrolledCourses = async (): Promise<Course[]> => {
  const response = await apiService.get('/api/courses', { enrolled: true })
  return response.data
}

/**
 * Get course details by ID
 * 
 * @param id - The ID of the course
 * @returns Promise with course details
 */
const getCourseById = async (id: number): Promise<Course> => {
  const response = await apiService.get(`/api/courses/${id}`)
  return response.data
}

/**
 * Create a new course (admin only)
 * 
 * @param courseData - The course data to create
 * @returns Promise with the created course
 */
const createCourse = async (courseData: Partial<Course>): Promise<Course> => {
  const createRequest: CourseCreateRequest = {
    code: courseData.code || '',
    name: courseData.name || '',
    description: courseData.description || '',
    schedule: courseData.schedule || ''
  }
  
  const response = await apiService.post('/api/courses', createRequest)
  return response.data
}

/**
 * Update an existing course
 * 
 * @param id - The ID of the course to update
 * @param courseData - The course data to update
 * @returns Promise with the updated course
 */
const updateCourse = async (id: number, courseData: Partial<Course>): Promise<Course> => {
  const updateRequest: CourseUpdateRequest = {}
  
  if (courseData.code !== undefined) updateRequest.code = courseData.code
  if (courseData.name !== undefined) updateRequest.name = courseData.name
  if (courseData.description !== undefined) updateRequest.description = courseData.description
  if (courseData.schedule !== undefined) updateRequest.schedule = courseData.schedule
  
  const response = await apiService.put(`/api/courses/${id}`, updateRequest)
  return response.data
}

/**
 * Delete a course
 * 
 * @param id - The ID of the course to delete
 * @returns Promise with success status
 */
const deleteCourse = async (id: number): Promise<void> => {
  await apiService.delete(`/api/courses/${id}`)
}

/**
 * Get enrollments for a course
 * 
 * @param courseId - The ID of the course
 * @returns Promise with array of enrollments
 */
const getCourseEnrollments = async (courseId: number): Promise<CourseEnrollment[]> => {
  const response = await apiService.get(`/api/courses/${courseId}/enrollments`)
  return response.data
}

/**
 * Enroll a user in a course
 * 
 * @param courseId - The ID of the course
 * @param userId - The ID of the user to enroll
 * @param role - The role of the user in the course
 * @returns Promise with the created enrollment
 */
const enrollUser = async (
  courseId: number, 
  userId: number, 
  role: 'student' | 'teacher'
): Promise<CourseEnrollment> => {
  const enrollmentRequest: EnrollmentRequest = {
    courseId,
    userId,
    role
  }
  
  const response = await apiService.post(`/api/courses/${courseId}/enrollments`, enrollmentRequest)
  return response.data
}

/**
 * Remove a user from a course
 * 
 * @param courseId - The ID of the course
 * @param userId - The ID of the user to remove
 * @returns Promise with success status
 */
const unenrollUser = async (courseId: number, userId: number): Promise<void> => {
  await apiService.delete(`/api/courses/${courseId}/enrollments/${userId}`)
}

/**
 * Get recent/active courses for dashboard display
 * 
 * @param limit - Number of courses to return (default 5)
 * @returns Promise with array of recent courses
 */
const getRecentCourses = async (limit: number = 5): Promise<Course[]> => {
  const response = await apiService.get('/api/courses/recent', { limit })
  return response.data
}

/**
 * Search for courses by name/code/description
 * 
 * @param query - Search term
 * @returns Promise with array of matching courses
 */
const searchCourses = async (query: string): Promise<Course[]> => {
  const response = await apiService.get('/api/courses/search', { query })
  return response.data
}

export default {
  getAllCourses,
  getEnrolledCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseEnrollments,
  enrollUser,
  unenrollUser,
  getRecentCourses,
  searchCourses
}