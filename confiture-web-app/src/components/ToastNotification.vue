<script lang="ts" setup>
import { useNotificationStore } from "../store";

const store = useNotificationStore();
</script>

<template>
  <Teleport to="body">
    <div aria-live="polite">
      <Transition>
        <div
          v-if="store.notification"
          :key="store.notification.id"
          class="toast-notification fr-alert"
          :class="`fr-alert--${store.notification.status}`"
          aria-atomic="true"
          role="alert"
        >
          <p class="fr-alert__title">{{ store.notification.title }}</p>
          <p>{{ store.notification.description }}</p>
          <button
            class="fr-btn--close fr-btn"
            title="Masquer le message"
            aria-hidden="true"
            @click="store.hideNotification"
          >
            Masquer le message
          </button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-notification {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  background-color: var(--background-default-grey);
  max-width: min(50rem, calc(100vw - 2rem));
  z-index: 2;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease, transform 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(2rem);
}
</style>
