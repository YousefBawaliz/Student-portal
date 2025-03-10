/**
 * Type definitions for Course-related data
 * File path: src/types/course.ts
 */

export interface Course {
  id: number
  code: string
  name: string
  description: string
  schedule: string
  createdBy: number
  createdAt: string
  updatedAt: string
  
  // UI helper properties
  role?: 'teacher' | 'student'
  canManage?: boolean
  isEnrolled?: boolean
  isTeaching?: boolean
  progress?: number
  studentCount?: number
  teacherCount?: number
  moduleCount?: number
  assignmentCount?: number
}

export interface CourseEnrollment {
  id: number
  courseId: number
  userId: number
  role: 'teacher' | 'student'
  enrollmentDate: string
  
  // UI helper properties
  userName?: string
  userEmail?: string
}

export interface CourseCreateRequest {
  code: string
  name: string
  description: string
  schedule: string
}

export interface CourseUpdateRequest {
  code?: string
  name?: string
  description?: string
  schedule?: string
}

export interface EnrollmentRequest {
  courseId: number
  userId: number
  role: 'teacher' | 'student'
}