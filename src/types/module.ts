/**
 * Type definitions for Module-related data
 * File path: src/types/module.ts
 */

/**
 * Represents a module within a course
 */
export interface Module {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  subtitle?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  
  // UI helper properties
  canManage?: boolean;
  locked?: boolean;
  contentCount?: number;
  duration?: number; // in minutes
  contentItems?: ContentItem[];
  progress?: number;
}

/**
 * Represents a content item within a module
 */
export interface ContentItem {
  id: number;
  moduleId: number;
  title: string;
  contentType: ContentType;
  content?: string;
  contentUrl?: string;
  description?: string;
  duration?: number; // in minutes
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  points?: number;
  assignmentId?: number;
  
  // UI helper properties
  completed?: boolean;
  completedAt?: string;
  resources?: Resource[];
}

/**
 * Supported content types
 */
export type ContentType = 'text' | 'pdf' | 'video' | 'quiz' | 'assignment' | 'other';

/**
 * Represents an additional resource attached to content
 */
export interface Resource {
  id: number;
  title: string;
  url: string;
  type: string; // file extension or type identifier
}

/**
 * Request to create a new module
 */
export interface ModuleCreateRequest {
  courseId: number;
  title: string;
  description?: string;
  order: number;
}

/**
 * Request to update an existing module
 */
export interface ModuleUpdateRequest {
  title?: string;
  description?: string;
  order?: number;
}

/**
 * Request to create a new content item
 */
export interface ContentItemCreateRequest {
  moduleId: number;
  title: string;
  contentType: ContentType;
  content?: string;
  contentUrl?: string;
  description?: string;
  duration?: number;
}

/**
 * Request to update an existing content item
 */
export interface ContentItemUpdateRequest {
  title?: string;
  contentType?: ContentType;
  content?: string;
  contentUrl?: string;
  description?: string;
  duration?: number;
}

/**
 * Module progress information
 */
export interface ModuleProgress {
  id: number;
  userId: number;
  moduleId: number;
  courseId?: number;
  completed: boolean;
  completedAt: string | null;
  contentProgress?: ContentProgress[];
}

/**
 * Content item progress information
 */
export interface ContentProgress {
  id: number;
  userId: number;
  contentId: number;
  viewed: boolean;
  completed: boolean;
  completedAt: string | null;
  lastAccessedAt: string;
  timeSpent?: number; // in seconds
}