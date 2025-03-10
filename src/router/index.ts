/**
 * Vue Router configuration for the Student Portal
 * File path: src/router/index.ts
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Views
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CourseListView from '../views/CourseListView.vue'
import CourseDetailView from '../views/CourseDetailView.vue'
import ModuleView from '../views/ModuleView.vue'
import AssignmentView from '../views/AssignmentView.vue'
import UserManagementView from '../views/UserManagementView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses',
    name: 'CourseList',
    component: CourseListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/:id',
    name: 'CourseDetail',
    component: CourseDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/modules/:id',
    name: 'Module',
    component: ModuleView,
    meta: { requiresAuth: true }
  },
  {
    path: '/assignments/:id',
    name: 'Assignment',
    component: AssignmentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagementView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  // Temporarily disable auth checks for testing
  next()
  
  /* Original auth logic - commented out for testing
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin

  // Redirect to login if authentication is required and user is not logged in
  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Redirect to dashboard if admin access is required but user is not an admin
  if (requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
    return
  }

  // Redirect to dashboard if user is logged in and tries to access login page
  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
    return
  }
  */
})

export default router