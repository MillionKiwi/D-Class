<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="header-logo">
        <h1>D-Class</h1>
      </router-link>
      <div class="header-actions">
        <button v-if="showSearch" class="header-icon-btn" @click="$emit('search')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <router-link
          v-if="showAddPosting"
          to="/academy/postings/new"
          class="header-icon-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </router-link>
        <button class="header-icon-btn" @click="$emit('notification')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            ></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  showSearch: {
    type: Boolean,
    default: false,
  },
  showAddPosting: {
    type: Boolean,
    default: false,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['search', 'notification'])
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  background-color: var(--color-card);
  border-bottom: 1px solid var(--color-divider);
  z-index: 100;
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo {
  text-decoration: none;
  color: var(--color-primary);
}

.header-logo h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.header-icon-btn {
  position: relative;
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.header-icon-btn:hover {
  background-color: var(--color-divider);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--color-error);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
