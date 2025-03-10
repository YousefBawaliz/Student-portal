 /**
 * Assignment Service
 * Manages API calls related to assignments and submissions
 * File path: src/services/assignmentService.ts
 */

import apiService from './api'
import type { 
  Assignment, 
  Submission, 
  AssignmentCreateRequest, 
  SubmissionCreateRequest,
  GradeSubmissionRequest 
} from '../types/assignment'

/**
 * Get all assignments for a course
 * 
 * @param courseId - The ID of the course
 * @returns Promise with array of assignments
 */
const getAssignmentsByCourse = async (courseId: number): Promise<Assignment[]> => {
  const response = await apiService.get(`/api/courses/${courseId}/assignments`)
  return response.data
}

/**
 * Get assignment details by ID
 * 
 * @param id - The ID of the assignment
 * @returns Promise with assignment details
 */
const getAssignmentById = async (id: number): Promise<Assignment> => {
  const response = await apiService.get(`/api/assignments/${id}`)
  return response.data
}

/**
 * Create a new assignment
 * 
 * @param assignmentData - The assignment data to create
 * @returns Promise with the created assignment
 */
const createAssignment = async (assignmentData: AssignmentCreateRequest): Promise<Assignment> => {
  const response = await apiService.post(`/api/courses/${assignmentData.courseId}/assignments`, assignmentData)
  return response.data
}

/**
 * Update an existing assignment
 * 
 * @param id - The ID of the assignment to update
 * @param assignmentData - The assignment data to update
 * @returns Promise with the updated assignment
 */
const updateAssignment = async (id: number, assignmentData: Partial<Assignment>): Promise<Assignment> => {
  const response = await apiService.put(`/api/assignments/${id}`, assignmentData)
  return response.data
}

/**
 * Delete an assignment
 * 
 * @param id - The ID of the assignment to delete
 * @returns Promise with success status
 */
const deleteAssignment = async (id: number): Promise<void> => {
  await apiService.delete(`/api/assignments/${id}`)
}

/**
 * Get all submissions for an assignment (teacher/admin only)
 * 
 * @param assignmentId - The ID of the assignment
 * @returns Promise with array of submissions
 */
const getSubmissionsForAssignment = async (assignmentId: number): Promise<Submission[]> => {
  const response = await apiService.get(`/api/assignments/${assignmentId}/submissions`)
  return response.data
}

/**
 * Get a specific user's submission for an assignment
 * 
 * @param assignmentId - The ID of the assignment
 * @param userId - The ID of the user
 * @returns Promise with the user's submission
 */
const getUserSubmission = async (assignmentId: number, userId: number): Promise<Submission | null> => {
  try {
    const response = await apiService.get(`/api/assignments/${assignmentId}/submissions/${userId}`)
    return response.data
  } catch (error: any) {
    // If 404, user hasn't submitted yet
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}

/**
 * Submit an assignment (student only)
 * 
 * @param submissionData - The submission data
 * @returns Promise with the created submission
 */
const submitAssignment = async (submissionData: SubmissionCreateRequest): Promise<Submission> => {
  const response = await apiService.post(
    `/api/assignments/${submissionData.assignmentId}/submissions`, 
    submissionData
  )
  return response.data
}

/**
 * Grade a submission (teacher/admin only)
 * 
 * @param submissionId - The ID of the submission to grade
 * @param grade - The grade to assign (0-100)
 * @returns Promise with the updated submission
 */
const gradeSubmission = async (submissionId: number, grade: number): Promise<Submission> => {
  const gradeData: GradeSubmissionRequest = { submissionId, grade }
  const response = await apiService.put(`/api/submissions/${submissionId}/grade`, gradeData)
  return response.data
}

/**
 * Get upcoming assignments for a student
 * 
 * @returns Promise with array of upcoming assignments
 */
const getUpcomingAssignments = async (): Promise<Assignment[]> => {
  const response = await apiService.get('/api/assignments/upcoming')
  return response.data
}

/**
 * Get recent assignments for a course (created within last 7 days)
 * 
 * @param courseId - The ID of the course
 * @returns Promise with array of recent assignments
 */
const getRecentAssignments = async (courseId: number): Promise<Assignment[]> => {
  const response = await apiService.get(`/api/courses/${courseId}/assignments/recent`)
  return response.data
}

export default {
  getAssignmentsByCourse,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissionsForAssignment,
  getUserSubmission,
  submitAssignment,
  gradeSubmission,
  getUpcomingAssignments,
  getRecentAssignments
}