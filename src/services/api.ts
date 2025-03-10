/**
 * API Service
 * Centralizes API calls and handles authentication, errors, and request/response processing
 * File path: src/services/api.ts
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError, type AxiosResponse } from 'axios'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling common error scenarios
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    
    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401 && originalRequest) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    // Format error messages for consistency
    let errorMessage: string
    
    if (typeof error.response?.data === 'object' && error.response?.data && 'message' in error.response.data) {
      // Use server provided error message if available
      errorMessage = error.response.data.message as string
    } else if (error.message) {
      // Use axios error message
      errorMessage = error.message
    } else {
      // Default error message
      errorMessage = 'An unknown error occurred'
    }
    
    // Create enhanced error object
    const enhancedError = {
      ...error,
      message: errorMessage,
      status: error.response?.status,
      isApiError: true
    }
    
    return Promise.reject(enhancedError)
  }
)

/**
 * Generic GET request
 * 
 * @param url - The endpoint URL
 * @param params - Optional query parameters
 * @param config - Optional axios config overrides
 * @returns Promise with the response data
 */
const get = async <T = any>(
  url: string, 
  params: Record<string, any> = {}, 
  config: Partial<InternalAxiosRequestConfig> = {}
): Promise<AxiosResponse<T>> => {
  return apiClient.get<T>(url, { 
    ...config, 
    params 
  })
}

/**
 * Generic POST request
 * 
 * @param url - The endpoint URL
 * @param data - The data to send in the request body
 * @param config - Optional axios config overrides
 * @returns Promise with the response data
 */
const post = async <T = any>(
  url: string, 
  data: any = {}, 
  config: Partial<InternalAxiosRequestConfig> = {}
): Promise<AxiosResponse<T>> => {
  return apiClient.post<T>(url, data, config)
}

/**
 * Generic PUT request
 * 
 * @param url - The endpoint URL
 * @param data - The data to send in the request body
 * @param config - Optional axios config overrides
 * @returns Promise with the response data
 */
const put = async <T = any>(
  url: string, 
  data: any = {}, 
  config: Partial<InternalAxiosRequestConfig> = {}
): Promise<AxiosResponse<T>> => {
  return apiClient.put<T>(url, data, config)
}

/**
 * Generic PATCH request
 * 
 * @param url - The endpoint URL
 * @param data - The data to send in the request body
 * @param config - Optional axios config overrides
 * @returns Promise with the response data
 */
const patch = async <T = any>(
  url: string, 
  data: any = {}, 
  config: Partial<InternalAxiosRequestConfig> = {}
): Promise<AxiosResponse<T>> => {
  return apiClient.patch<T>(url, data, config)
}

/**
 * Generic DELETE request
 * 
 * @param url - The endpoint URL
 * @param config - Optional axios config overrides
 * @returns Promise with the response data
 */
const del = async <T = any>(
  url: string, 
  config: Partial<InternalAxiosRequestConfig> = {}
): Promise<AxiosResponse<T>> => {
  return apiClient.delete<T>(url, config)
}

export default {
  get,
  post,
  put,
  patch,
  delete: del, // Rename to avoid conflict with JS keyword
  // Expose the underlying axios instance for advanced use cases
  client: apiClient
}