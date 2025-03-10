<!--
  Root component for the Student Portal application
  File path: src/App.vue
-->

<template>
  <div id="app">
    <!-- Main navigation when authenticated -->
    <MainNavigation />
    
    <!-- Main content area -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import MainNavigation from './components/navigation/MainNavigation.vue'

export default defineComponent({
  name: 'App',
  components: {
    MainNavigation
  },
  setup() {
    const authStore = useAuthStore()
    const isLoggedIn = computed(() => authStore.isAuthenticated)

    return {
      isLoggedIn
    }
  }
})
</script>

<style>
#app {
  font-family: 'Arial', sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
}

/* TODO: Add transitions and animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>