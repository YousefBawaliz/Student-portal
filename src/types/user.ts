 /**
 * Type definitions for User-related data
 * File path: src/types/user.ts
 */

export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id: number
  username: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  lastLogin?: string
}

export interface UserCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}