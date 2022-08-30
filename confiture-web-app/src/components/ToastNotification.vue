<script lang="ts" setup>
import { useNotificationStore } from "../store";

const store = useNotificationStore();
</script>

<template>
  <Teleport to="body">
    <Transition>
      <div
        v-if="store.notification"
        class="toast-notification fr-alert"
        :class="`fr-alert--${store.notification.status}`"
        role="alert"
      >
        <p class="fr-alert__title">{{ store.notification.title }}</p>
        <p>{{ store.notification.description }}</p>
        <button
          class="fr-btn--close fr-btn"
          title="Masquer le message"
          @click="store.hideNotification"
        >
          Masquer le message
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-notification {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  background-color: var(--grey-1000-50);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
