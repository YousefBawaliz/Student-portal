 <!--
  Calendar - Interactive calendar showing deadlines and events
  File path: src/components/calendar/Calendar.vue
-->

<template>
    <div class="calendar-component">
      <!-- Calendar Header -->
      <div class="calendar-header d-flex justify-content-between align-items-center mb-3">
        <button class="btn btn-sm btn-outline-secondary" @click="previousMonth">
          <i class="bi bi-chevron-left"></i>
        </button>
        
        <h5 class="calendar-title mb-0">
          {{ currentMonthName }} {{ currentYear }}
        </h5>
        
        <button class="btn btn-sm btn-outline-secondary" @click="nextMonth">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
      
      <!-- Week Days Header -->
      <div class="calendar-weekdays d-flex">
        <div 
          v-for="day in weekdays" 
          :key="day" 
          class="weekday-name text-center"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index" 
          class="calendar-day"
          :class="{
            'inactive': !day.isCurrentMonth,
            'today': day.isToday,
            'has-events': day.events.length > 0,
            'weekend': day.isWeekend
          }"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.day }}</div>
          
          <!-- Event Indicators -->
          <div v-if="day.events.length > 0" class="day-events">
            <div 
              v-for="(event, eventIndex) in day.events.slice(0, 3)" 
              :key="eventIndex"
              class="event-indicator"
              :class="getEventTypeClass(event.type)"
              :title="event.title"
            >
              <span class="event-dot"></span>
              <span class="event-title">{{ event.title }}</span>
            </div>
            
            <!-- More events indicator -->
            <div v-if="day.events.length > 3" class="more-events">
              +{{ day.events.length - 3 }} more
            </div>
          </div>
        </div>
      </div>
      
      <!-- Event Details Modal -->
      <div 
        class="modal fade" 
        id="eventModal" 
        tabindex="-1" 
        aria-labelledby="eventModalLabel" 
        aria-hidden="true"
        ref="eventModal"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="eventModalLabel">
                Events for {{ selectedDate }}
              </h5>
              <button 
                type="button" 
                class="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <ul class="list-group event-list">
                <li 
                  v-for="(event, index) in selectedDayEvents" 
                  :key="index"
                  class="list-group-item event-item"
                  :class="getEventTypeClass(event.type)"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="event-item-title mb-1">{{ event.title }}</h6>
                      <p class="event-item-description mb-1" v-if="event.description">
                        {{ event.description }}
                      </p>
                      <div class="event-item-meta text-muted small">
                        <span v-if="event.time">
                          <i class="bi bi-clock me-1"></i>
                          {{ formatTime(event.time) }}
                        </span>
                        <span v-if="event.course" class="ms-2">
                          <i class="bi bi-book me-1"></i>
                          {{ event.course }}
                        </span>
                        <span v-if="event.location" class="ms-2">
                          <i class="bi bi-geo-alt me-1"></i>
                          {{ event.location }}
                        </span>
                      </div>
                    </div>
                    <button 
                      v-if="event.link"
                      class="btn btn-sm btn-primary"
                      @click="navigateToEvent(event)"
                    >
                      <i class="bi bi-box-arrow-right"></i>
                    </button>
                  </div>
                </li>
              </ul>
              
              <div v-if="selectedDayEvents.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-calendar-x d-block mb-2" style="font-size: 2rem;"></i>
                <p>No events for this day</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { Modal } from 'bootstrap'
  
  // Define the event type
  interface CalendarEvent {
    id: number;
    date: Date;
    title: string;
    description?: string;
    type: 'assignment' | 'announcement' | 'quiz' | 'class' | 'other';
    time?: string;
    course?: string;
    location?: string;
    link?: {
      route: string;
      params: Record<string, string | number>;
    };
  }
  
  // Define the calendar day type
  interface CalendarDay {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
    events: CalendarEvent[];
  }
  
  export default defineComponent({
    name: 'Calendar',
    
    setup() {
      const router = useRouter()
      
      // State
      const currentDate = ref(new Date())
      const events = ref<CalendarEvent[]>([])
      const selectedDay = ref<CalendarDay | null>(null)
      const eventModal = ref<HTMLElement | null>(null)
      
      // Computed properties
      const currentYear = computed(() => currentDate.value.getFullYear())
      const currentMonth = computed(() => currentDate.value.getMonth())
      const currentMonthName = computed(() => {
        return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate.value)
      })
      
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      
      const calendarDays = computed((): CalendarDay[] => {
        const days: CalendarDay[] = []
        
        // Get the first day of the month
        const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
        
        // Get the day of the week of the first day (0-6, where 0 is Sunday)
        const firstDayOfWeek = firstDayOfMonth.getDay()
        
        // Get the last day of the month
        const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0)
        const daysInMonth = lastDayOfMonth.getDate()
        
        // Get the last day of the previous month
        const lastDayOfPrevMonth = new Date(currentYear.value, currentMonth.value, 0)
        const daysInPrevMonth = lastDayOfPrevMonth.getDate()
        
        // Fill in days from previous month
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          const day = daysInPrevMonth - i
          const date = new Date(currentYear.value, currentMonth.value - 1, day)
          days.push({
            date,
            day,
            isCurrentMonth: false,
            isToday: isToday(date),
            isWeekend: isWeekend(date),
            events: getEventsForDate(date)
          })
        }
        
        // Fill in days from current month
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear.value, currentMonth.value, day)
          days.push({
            date,
            day,
            isCurrentMonth: true,
            isToday: isToday(date),
            isWeekend: isWeekend(date),
            events: getEventsForDate(date)
          })
        }
        
        // Calculate how many days we need from the next month
        const totalDays = 42 // 6 rows of 7 days
        const remainingDays = totalDays - days.length
        
        // Fill in days from next month
        for (let day = 1; day <= remainingDays; day++) {
          const date = new Date(currentYear.value, currentMonth.value + 1, day)
          days.push({
            date,
            day,
            isCurrentMonth: false,
            isToday: isToday(date),
            isWeekend: isWeekend(date),
            events: getEventsForDate(date)
          })
        }
        
        return days
      })
      
      const selectedDate = computed(() => {
        if (!selectedDay.value) return ''
        
        const date = selectedDay.value.date
        return date.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })
      
      const selectedDayEvents = computed(() => {
        if (!selectedDay.value) return []
        return selectedDay.value.events
      })
      
      // Methods
      const previousMonth = () => {
        currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
      }
      
      const nextMonth = () => {
        currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
      }
      
      const isToday = (date: Date): boolean => {
        const today = new Date()
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        )
      }
      
      const isWeekend = (date: Date): boolean => {
        const day = date.getDay()
        return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
      }
      
      const isSameDate = (date1: Date, date2: Date): boolean => {
        return (
          date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear()
        )
      }
      
      const getEventsForDate = (date: Date): CalendarEvent[] => {
        return events.value.filter(event => isSameDate(event.date, date))
      }
      
      const getEventTypeClass = (type: string): string => {
        switch (type) {
          case 'assignment':
            return 'event-assignment'
          case 'announcement':
            return 'event-announcement'
          case 'quiz':
            return 'event-quiz'
          case 'class':
            return 'event-class'
          default:
            return 'event-other'
        }
      }
      
      const formatTime = (time: string): string => {
        // This assumes time is in 24-hour format like "14:30"
        try {
          const [hours, minutes] = time.split(':').map(Number)
          const period = hours >= 12 ? 'PM' : 'AM'
          const displayHours = hours % 12 || 12
          return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
        } catch {
          return time
        }
      }
      
      const selectDay = (day: CalendarDay) => {
        selectedDay.value = day
        
        // Show modal with events for selected day
        if (eventModal.value) {
          const modal = new Modal(eventModal.value)
          modal.show()
        }
      }
      
      const navigateToEvent = (event: CalendarEvent) => {
        // Close the modal
        if (eventModal.value) {
          const modal = Modal.getInstance(eventModal.value)
          modal?.hide()
        }
        
        // Navigate to the event page if a link is provided
        if (event.link) {
          router.push({
            name: event.link.route,
            params: event.link.params
          })
        }
      }
      
      // Fetch events (this would typically come from an API)
      const fetchEvents = () => {
        // Mock events for demonstration
        const today = new Date()
        const mockEvents: CalendarEvent[] = [
          {
            id: 1,
            date: today,
            title: 'Database Systems Assignment Due',
            description: 'Submit your ER diagram and SQL queries',
            type: 'assignment',
            time: '23:59',
            course: 'Database Systems',
            link: {
              route: 'Assignment',
              params: { id: '101' }
            }
          },
          {
            id: 2,
            date: today,
            title: 'Web Development Lecture',
            description: 'Topic: Advanced JavaScript Concepts',
            type: 'class',
            time: '10:00',
            course: 'Web Development',
            location: 'Room 302'
          },
          {
            id: 3,
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
            title: 'Midterm Quiz',
            description: 'Covers chapters 1-5',
            type: 'quiz',
            time: '14:30',
            course: 'Data Structures',
            link: {
              route: 'Assignment',
              params: { id: '202' }
            }
          },
          {
            id: 4,
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
            title: 'Important Announcement',
            description: 'Changes to the course schedule',
            type: 'announcement',
            course: 'Software Engineering'
          },
          {
            id: 5,
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
            title: 'Project Milestone Due',
            description: 'Submit your project proposal',
            type: 'assignment',
            time: '23:59',
            course: 'Software Engineering',
            link: {
              route: 'Assignment',
              params: { id: '303' }
            }
          }
        ]
        
        events.value = mockEvents
      }
      
      // Lifecycle hooks
      onMounted(() => {
        fetchEvents()
      })
      
      return {
        currentDate,
        currentYear,
        currentMonth,
        currentMonthName,
        weekdays,
        calendarDays,
        selectedDay,
        selectedDate,
        selectedDayEvents,
        eventModal,
        previousMonth,
        nextMonth,
        getEventTypeClass,
        formatTime,
        selectDay,
        navigateToEvent
      }
    }
  })
  </script>
  
  <style scoped>
  .calendar-component {
    background-color: #fff;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .calendar-header {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
  }
  
  .calendar-title {
    font-weight: 600;
    color: #343a40;
  }
  
  .calendar-weekdays {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }
  
  .weekday-name {
    width: 14.28%;
    padding: 0.5rem;
    font-weight: 600;
    color: #6c757d;
    font-size: 0.85rem;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: minmax(80px, auto);
  }
  
  .calendar-day {
    position: relative;
    border: 1px solid #e9ecef;
    padding: 0.5rem;
    min-height: 80px;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .calendar-day:hover {
    background-color: #f8f9fa;
  }
  
  .day-number {
    font-weight: 500;
    color: #343a40;
    margin-bottom: 0.25rem;
  }
  
  .calendar-day.inactive {
    background-color: #f8f9fa;
  }
  
  .calendar-day.inactive .day-number {
    color: #adb5bd;
  }
  
  .calendar-day.today {
    background-color: rgba(253, 126, 20, 0.05);
  }
  
  .calendar-day.today .day-number {
    color: #fd7e14;
    font-weight: 700;
  }
  
  .calendar-day.today:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: #fd7e14;
  }
  
  .calendar-day.weekend {
    background-color: #f8f9fa;
  }
  
  .day-events {
    margin-top: 0.5rem;
  }
  
  .event-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 0.25rem;
    padding: 0.15rem 0.35rem;
    border-radius: 2px;
    background-color: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .event-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 0.25rem;
    background-color: currentColor;
  }
  
  .event-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .more-events {
    font-size: 0.7rem;
    color: #6c757d;
    text-align: right;
    margin-top: 0.25rem;
  }
  
  /* Event Type Colors */
  .event-assignment {
    background-color: rgba(220, 53, 69, 0.1) !important;
    color: #dc3545 !important;
    border-left: 3px solid #dc3545 !important;
  }
  
  .event-announcement {
    background-color: rgba(255, 193, 7, 0.1) !important;
    color: #ffc107 !important;
    border-left: 3px solid #ffc107 !important;
  }
  
  .event-quiz {
    background-color: rgba(111, 66, 193, 0.1) !important;
    color: #6f42c1 !important;
    border-left: 3px solid #6f42c1 !important;
  }
  
  .event-class {
    background-color: rgba(32, 201, 151, 0.1) !important;
    color: #20c997 !important;
    border-left: 3px solid #20c997 !important;
  }
  
  .event-other {
    background-color: rgba(108, 117, 125, 0.1) !important;
    color: #6c757d !important;
    border-left: 3px solid #6c757d !important;
  }
  
  .event-item {
    border-left-width: 3px !important;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
  }
  
  .event-item-title {
    font-weight: 600;
  }
  
  .event-item-description {
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .event-item-meta {
    color: #6c757d;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .calendar-grid {
      grid-auto-rows: minmax(60px, auto);
    }
    
    .calendar-day {
      min-height: 60px;
      padding: 0.25rem;
    }
    
    .event-indicator {
      padding: 0.1rem 0.25rem;
    }
    
    .event-title {
      display: none;
    }
  }
  </style>