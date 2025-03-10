 <!--
  ContentViewer - Display for different types of content
  File path: src/components/content/ContentViewer.vue
-->

<template>
    <div class="content-viewer" :class="{ 'loading': loading }">
      <!-- Loading State -->
      <div v-if="loading" class="content-loader text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading content...</span>
        </div>
        <p class="mt-2">Loading content...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="content-error alert alert-danger">
        <div class="d-flex align-items-start">
          <i class="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
          <div>
            <h5 class="alert-heading">Error Loading Content</h5>
            <p class="mb-1">{{ error }}</p>
            <button class="btn btn-sm btn-outline-danger mt-2" @click="reloadContent">
              <i class="bi bi-arrow-clockwise me-1"></i> Retry
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="content-container">
        <!-- Content Header -->
        <div class="content-header mb-3" v-if="!hideHeader">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h3 class="content-title">{{ content.title }}</h3>
              <div class="content-meta text-muted">
                <span v-if="content.contentType">
                  <i :class="getContentTypeIcon(content.contentType)"></i>
                  {{ getContentTypeLabel(content.contentType) }}
                </span>
                <span v-if="content.duration" class="ms-3">
                  <i class="bi bi-clock"></i>
                  {{ formatDuration(content.duration) }}
                </span>
                <span v-if="content.createdAt" class="ms-3">
                  <i class="bi bi-calendar3"></i>
                  {{ formatDate(content.createdAt) }}
                </span>
              </div>
            </div>
            
            <!-- Content Actions -->
            <div class="content-actions" v-if="canManage">
              <button class="btn btn-sm btn-outline-primary me-2" @click="$emit('edit-content', content)">
                <i class="bi bi-pencil"></i>
                <span class="d-none d-md-inline ms-1">Edit</span>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="$emit('delete-content', content)">
                <i class="bi bi-trash"></i>
                <span class="d-none d-md-inline ms-1">Delete</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Content Body - Text -->
        <div v-if="content.contentType === 'text'" class="content-text">
          <div 
            class="text-content" 
            v-html="sanitizeHTML(content.content || '')"
          ></div>
        </div>
        
        <!-- Content Body - PDF -->
        <div v-else-if="content.contentType === 'pdf'" class="content-pdf">
          <div class="embed-responsive pdf-container">
            <iframe 
              v-if="content.contentUrl"
              class="embed-responsive-item w-100" 
              :src="content.contentUrl"
              allowfullscreen
            ></iframe>
            <div v-else class="alert alert-warning">
              <i class="bi bi-exclamation-circle me-2"></i>
              PDF URL not provided.
            </div>
          </div>
        </div>
        
        <!-- Content Body - Video -->
        <div v-else-if="content.contentType === 'video'" class="content-video">
          <div class="video-container">
            <div v-if="isYouTubeUrl(content.contentUrl)" class="ratio ratio-16x9">
              <iframe 
                :src="getEmbedUrl(content.contentUrl)"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div v-else-if="content.contentUrl" class="ratio ratio-16x9">
              <video 
                controls 
                :src="content.contentUrl"
                class="embed-responsive-item"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div v-else class="alert alert-warning">
              <i class="bi bi-exclamation-circle me-2"></i>
              Video URL not provided.
            </div>
          </div>
        </div>
        
        <!-- Content Body - Quiz -->
        <div v-else-if="content.contentType === 'quiz'" class="content-quiz">
          <div class="card quiz-card">
            <div class="card-body">
              <h5 class="card-title"><i class="bi bi-question-circle me-2"></i>Quiz</h5>
              <p class="card-text">
                This quiz contains {{ quizQuestionCount }} questions.
                {{ quizCompletedText }}
              </p>
              <button class="btn btn-primary" @click="startQuiz">
                <i class="bi bi-play-fill me-1"></i>
                {{ quizButtonText }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Content Body - Assignment -->
        <div v-else-if="content.contentType === 'assignment'" class="content-assignment">
          <div class="card assignment-card">
            <div class="card-body">
              <h5 class="card-title">
                <i class="bi bi-clipboard-check me-2"></i>Assignment
              </h5>
              <p class="card-text" v-if="content.description">
                {{ content.description }}
              </p>
              <div class="assignment-meta d-flex mt-3">
                <div class="me-3">
                  <i class="bi bi-calendar-event me-1"></i>
                  <strong>Due:</strong> {{ formatDate(content.dueDate) || 'No due date' }}
                </div>
                <div>
                  <i class="bi bi-trophy me-1"></i>
                  <strong>Points:</strong> {{ content.points || 'Not specified' }}
                </div>
              </div>
              <div class="mt-3">
                <router-link 
                  :to="{ name: 'Assignment', params: { id: content.assignmentId || 0 }}"
                  class="btn btn-primary"
                >
                  <i class="bi bi-box-arrow-right me-1"></i>
                  View Assignment
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Unsupported Content Type -->
        <div v-else class="content-unknown alert alert-secondary">
          <i class="bi bi-question-circle me-2"></i>
          This content type is not supported: {{ content.contentType || 'Unknown' }}
        </div>
        
        <!-- Additional Resources -->
        <div v-if="content.resources && content.resources.length > 0" class="content-resources mt-4">
          <h5><i class="bi bi-file-earmark-plus me-2"></i>Additional Resources</h5>
          <ul class="list-group">
            <li 
              v-for="(resource, index) in content.resources" 
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-center resource-item"
            >
              <div class="resource-info">
                <i :class="getResourceIcon(resource.type)"></i>
                <span class="ms-2">{{ resource.title }}</span>
              </div>
              <a 
                :href="resource.url" 
                target="_blank" 
                class="btn btn-sm btn-outline-primary"
              >
                <i class="bi bi-download me-1"></i>
                Download
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Mark as Completed -->
        <div v-if="showCompletionControls" class="content-completion mt-4">
          <div class="card">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <span v-if="isCompleted">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  Completed on {{ formatDate(completedDate) }}
                </span>
                <span v-else>
                  <i class="bi bi-circle text-muted me-2"></i>
                  Mark this content as completed when you're done
                </span>
              </div>
              <button 
                v-if="!isCompleted"
                class="btn btn-success"
                @click="markAsCompleted"
              >
                <i class="bi bi-check-circle me-1"></i>
                Mark as Completed
              </button>
              <button 
                v-else
                class="btn btn-outline-secondary"
                @click="markAsIncomplete"
              >
                <i class="bi bi-arrow-counterclockwise me-1"></i>
                Mark as Incomplete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, type PropType, onMounted } from 'vue'
  import DOMPurify from 'dompurify'
  
  interface ContentItem {
    id: number;
    title: string;
    contentType: string;
    content?: string;
    contentUrl?: string;
    description?: string;
    duration?: number;
    createdAt?: string;
    dueDate?: string;
    points?: number;
    assignmentId?: number;
    resources?: {
      title: string;
      url: string;
      type: string;
    }[];
  }
  
  export default defineComponent({
    name: 'ContentViewer',
    
    props: {
      content: {
        type: Object as PropType<ContentItem>,
        required: true
      },
      canManage: {
        type: Boolean,
        default: false
      },
      hideHeader: {
        type: Boolean,
        default: false
      },
      showCompletionControls: {
        type: Boolean,
        default: false
      }
    },
    
    emits: ['edit-content', 'delete-content', 'content-completed', 'content-incomplete'],
    
    setup(props, { emit }) {
      // State
      const loading = ref(false)
      const error = ref('')
      const isCompleted = ref(false)
      const completedDate = ref<string | null>(null)
      
      // Mock values for quiz demo
      const quizQuestionCount = ref(10)
      const quizCompletedText = computed(() => 
        isCompleted.value ? 'You have already completed this quiz.' : 'You have not attempted this quiz yet.')
      const quizButtonText = computed(() => 
        isCompleted.value ? 'Retake Quiz' : 'Start Quiz')
      
      // Methods
      const reloadContent = () => {
        loading.value = true
        error.value = ''
        
        // Simulate API call
        setTimeout(() => {
          loading.value = false
          // For demo purposes, randomly succeed or fail
          if (Math.random() > 0.2) {
            error.value = ''
          } else {
            error.value = 'Failed to load content. Please try again.'
          }
        }, 1000)
      }
      
      const sanitizeHTML = (html: string): string => {
        // Use DOMPurify to sanitize HTML content
        return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code'],
          ALLOWED_ATTR: ['href', 'target', 'rel']
        })
      }
      
      const getContentTypeIcon = (type: string): string => {
        switch (type?.toLowerCase()) {
          case 'video':
            return 'bi bi-play-circle'
          case 'pdf':
            return 'bi bi-file-pdf'
          case 'text':
            return 'bi bi-file-text'
          case 'quiz':
            return 'bi bi-question-circle'
          case 'assignment':
            return 'bi bi-clipboard-check'
          default:
            return 'bi bi-file-earmark'
        }
      }
      
      const getContentTypeLabel = (type: string): string => {
        switch (type?.toLowerCase()) {
          case 'video':
            return 'Video'
          case 'pdf':
            return 'PDF Document'
          case 'text':
            return 'Text Content'
          case 'quiz':
            return 'Quiz'
          case 'assignment':
            return 'Assignment'
          default:
            return 'Content'
        }
      }
      
      const getResourceIcon = (type: string): string => {
        switch (type?.toLowerCase()) {
          case 'pdf':
            return 'bi bi-file-pdf'
          case 'doc':
          case 'docx':
            return 'bi bi-file-word'
          case 'xls':
          case 'xlsx':
            return 'bi bi-file-excel'
          case 'ppt':
          case 'pptx':
            return 'bi bi-file-ppt'
          case 'zip':
          case 'rar':
            return 'bi bi-file-zip'
          case 'jpg':
          case 'png':
          case 'gif':
            return 'bi bi-file-image'
          default:
            return 'bi bi-file-earmark'
        }
      }
      
      const formatDuration = (minutes: number): string => {
        if (!minutes) return ''
        
        if (minutes < 60) {
          return `${minutes} min`
        } else {
          const hours = Math.floor(minutes / 60)
          const remainingMinutes = minutes % 60
          if (remainingMinutes === 0) {
            return `${hours} hr${hours !== 1 ? 's' : ''}`
          } else {
            return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min`
          }
        }
      }
      
      const formatDate = (dateString?: string | null): string => {
        if (!dateString) return ''
        
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
      
      const isYouTubeUrl = (url?: string): boolean => {
        if (!url) return false
        return url.includes('youtube.com') || url.includes('youtu.be')
      }
      
      const getEmbedUrl = (url?: string): string => {
        if (!url) return ''
        
        // Convert YouTube URLs to embed format
        if (url.includes('youtube.com/watch')) {
          const videoId = new URL(url).searchParams.get('v')
          return `https://www.youtube.com/embed/${videoId}`
        } else if (url.includes('youtu.be')) {
          const videoId = url.split('/').pop()
          return `https://www.youtube.com/embed/${videoId}`
        }
        
        return url
      }
      
      const markAsCompleted = () => {
        // In a real app, you would call an API to record completion
        isCompleted.value = true
        completedDate.value = new Date().toISOString()
        emit('content-completed', props.content.id)
      }
      
      const markAsIncomplete = () => {
        // In a real app, you would call an API to record the change
        isCompleted.value = false
        completedDate.value = null
        emit('content-incomplete', props.content.id)
      }
      
      const startQuiz = () => {
        // In a real app, you would navigate to the quiz page or show a modal
        alert('Quiz functionality would be implemented here.')
      }
      
      // Initialize
      onMounted(() => {
        // In a real app, you would fetch the completion status from API
        // For demo purposes, randomly set as completed
        isCompleted.value = Math.random() > 0.7
        if (isCompleted.value) {
          const date = new Date()
          date.setDate(date.getDate() - Math.floor(Math.random() * 30))
          completedDate.value = date.toISOString()
        }
      })
      
      return {
        loading,
        error,
        isCompleted,
        completedDate,
        quizQuestionCount,
        quizCompletedText,
        quizButtonText,
        reloadContent,
        sanitizeHTML,
        getContentTypeIcon,
        getContentTypeLabel,
        getResourceIcon,
        formatDuration,
        formatDate,
        isYouTubeUrl,
        getEmbedUrl,
        markAsCompleted,
        markAsIncomplete,
        startQuiz
      }
    }
  })
  </script>
  
  <style scoped>
  .content-viewer {
    position: relative;
    border-radius: 0.5rem;
    overflow: hidden;
    background-color: #fff;
    transition: all 0.3s ease;
  }
  
  .content-viewer.loading {
    min-height: 200px;
  }
  
  .content-loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  
  .content-header {
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
  }
  
  .content-title {
    margin-bottom: 0.5rem;
    color: #343a40;
  }
  
  .content-meta {
    font-size: 0.875rem;
    color: #6c757d;
  }
  
  .content-text {
    padding: 1rem 0;
    line-height: 1.6;
    color: #343a40;
  }
  
  .pdf-container {
    min-height: 500px;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    overflow: hidden;
  }
  
  .pdf-container iframe {
    height: 500px;
    width: 100%;
    border: none;
  }
  
  .video-container {
    margin-bottom: 1rem;
    border-radius: 0.25rem;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .quiz-card, .assignment-card {
    border-left: 4px solid #fd7e14;
    transition: all 0.3s ease;
  }
  
  .quiz-card:hover, .assignment-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .resource-item {
    transition: background-color 0.2s ease;
  }
  
  .resource-item:hover {
    background-color: #f8f9fa;
  }
  
  .resource-info {
    display: flex;
    align-items: center;
  }
  
  .content-completion .card {
    border-left: 4px solid #20c997;
  }
  
  /* Ensure proper spacing on mobile */
  @media (max-width: 768px) {
    .content-header {
      flex-direction: column;
    }
    
    .content-actions {
      margin-top: 1rem;
    }
    
    .assignment-meta {
      flex-direction: column;
    }
    
    .assignment-meta div {
      margin-bottom: 0.5rem;
    }
  }
  </style>