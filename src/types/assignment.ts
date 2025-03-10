/**
 * Type definitions for Assignment-related data
 * File path: src/types/assignment.ts
 */

export interface Assignment {
    id: number
    courseId: number
    title: string
    description: string
    dueDate: string
    createdBy: number
    createdAt: string
    updatedAt: string
    creatorName?: string
    
    // UI helper properties
    isSubmitted?: boolean
    canManage?: boolean
    submissionCount?: number
  }
  
  export interface Submission {
    id: number
    assignmentId: number
    userId: number
    submissionUrl: string
    submittedAt: string
    grade?: number
    gradedBy?: number
    gradedAt?: string
    feedback?: string
    studentName?: string
  }
  
  export interface AssignmentCreateRequest {
    courseId: number
    title: string
    description: string
    dueDate: string
  }
  
  export interface SubmissionCreateRequest {
    assignmentId: number
    submissionUrl: string
  }
  
  export interface GradeSubmissionRequest {
    submissionId: number
    grade: number
  }