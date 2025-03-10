<!--
  MainNavigation - Top navigation bar with role-specific options
  File path: src/components/navigation/MainNavigation.vue
-->

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <!-- Brand Logo -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <div class="brand-logo me-2">
          <i class="bi bi-mortarboard-fill"></i>
        </div>
        <span>University Portal</span>
      </router-link>
      
      <!-- Mobile Toggle Button -->
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarContent" 
        aria-controls="navbarContent" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <!-- Navigation Links -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">
              <i class="bi bi-speedometer2 me-1"></i> Dashboard
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" to="/courses">
              <i class="bi bi-book me-1"></i> Courses
            </router-link>
          </li>
          
          <!-- Admin-only navigation items -->
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" to="/users">
              <i class="bi bi-people me-1"></i> Users
            </router-link>
          </li>
        </ul>
        
        <!-- Right-aligned items -->
        <ul class="navbar-nav">
          <!-- Notifications Dropdown -->
          <li class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              id="notificationsDropdown" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i class="bi bi-bell position-relative">
                <span 
                  v-if="notificationCount > 0" 
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style="font-size: 0.5rem; padding: 0.2rem 0.35rem;"
                >
                  {{ notificationCount }}
                  <span class="visually-hidden">unread notifications</span>
                </span>
              </i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
              <li v-if="notifications.length === 0">
                <span class="dropdown-item text-muted">No new notifications</span>
              </li>
              <li v-for="notification in notifications" :key="notification.id">
                <a 
                  class="dropdown-item notification-item" 
                  :class="{ 'unread': !notification.read }"
                  href="#" 
                  @click.prevent="markAsRead(notification.id)"
                >
                  <div class="d-flex align-items-center">
                    <div class="notification-icon me-2">
                      <i :class="`bi ${getNotificationIcon(notification.type)}`"></i>
                    </div>
                    <div class="notification-content">
                      <div class="notification-text">{{ notification.message }}</div>
                      <div class="notification-time text-muted small">{{ formatTime(notification.time) }}</div>
                    </div>
                  </div>
                </a>
              </li>
              <li v-if="notifications.length > 0">
                <hr class="dropdown-divider">
              </li>
              <li>
                <a class="dropdown-item text-center" href="#">View all notifications</a>
              </li>
            </ul>
          </li>
          
          <!-- User Dropdown -->
          <li class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              id="userDropdown" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i class="bi bi-person-circle me-1"></i>
              <span class="d-none d-lg-inline">{{ userName }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li>
                <router-link class="dropdown-item" to="/profile">
                  <i class="bi bi-person me-2"></i> Profile
                </router-link>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="showSettingsModal">
                  <i class="bi bi-gear me-2"></i> Settings
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">
                  <i class="bi bi-box-arrow-right me-2"></i> Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

// Define the notification type
interface Notification {
  id: number;
  message: string;
  type: 'assignment' | 'announcement' | 'grade' | 'system';
  time: Date;
  read: boolean;
}

export default defineComponent({
  name: 'MainNavigation',
  
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    // State for notifications
    const notifications = ref<Notification[]>([
      {
        id: 1,
        message: 'New assignment in Database Systems',
        type: 'assignment',
        time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false
      },
      {
        id: 2,
        message: 'Your submission was graded: B+',
        type: 'grade',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        id: 3,
        message: 'New announcement in Web Development',
        type: 'announcement',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      }
    ])
    
    // Computed property for user's name
    const userName = computed(() => {
      return authStore.currentUser?.name || 'User'
    })
    
    // Computed property to check if user is admin
    const isAdmin = computed(() => authStore.isAdmin)
    
    // Computed property for notification count
    const notificationCount = computed(() => {
      return notifications.value.filter(n => !n.read).length
    })
    
    // Methods
    const logout = async () => {
      await authStore.logout()
      router.push('/login')
    }
    
    const markAsRead = (id: number) => {
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read = true
        
        // Here you would typically call an API to mark the notification as read
        console.log(`Marked notification ${id} as read`)
        
        // In a real app, you might navigate to a related page based on notification type
        // For demonstration purposes, we'll just log this action
        console.log(`Navigate to content related to notification ${id}`)
      }
    }
    
    const showSettingsModal = () => {
      // In a real app, you would show a modal for settings
      // For demonstration purposes, we'll just log this action
      console.log('Settings modal would show here')
    }
    
    const getNotificationIcon = (type: string): string => {
      switch (type) {
        case 'assignment':
          return 'bi-clipboard-check'
        case 'announcement':
          return 'bi-megaphone'
        case 'grade':
          return 'bi-award'
        case 'system':
          return 'bi-gear'
        default:
          return 'bi-bell'
      }
    }
    
    const formatTime = (date: Date): string => {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.round(diffMs / 60000)
      const diffHours = Math.round(diffMs / 3600000)
      const diffDays = Math.round(diffMs / 86400000)
      
      if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
      }
    }
    
    // Lifecycle hooks
    onMounted(() => {
      // In a real app, you would fetch notifications from an API
      console.log('MainNavigation component mounted')
    })
    
    return {
      userName,
      isAdmin,
      notifications,
      notificationCount,
      logout,
      markAsRead,
      showSettingsModal,
      getNotificationIcon,
      formatTime
    }
  }
})
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-logo {
  font-size: 1.4rem;
  color: #fd7e14;
}

.navbar-brand {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.nav-link {
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #fd7e14 !important;
}

.router-link-active {
  color: #fd7e14 !important;
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #fd7e14;
  transform-origin: bottom right;
  animation: nav-indicator 0.3s ease forwards;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  border-left-color: #fd7e14;
  background-color: rgba(253, 126, 20, 0.05);
}

.notification-icon {
  color: #6c757d;
}

.notification-time {
  font-size: 0.75rem;
}

@keyframes nav-indicator {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (max-width: 992px) {
  .router-link-active::after {
    display: none;
  }
}
</style>