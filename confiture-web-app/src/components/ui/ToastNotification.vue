<script lang="ts" setup>
import { useNotificationStore } from "../../store";

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
          :class="[
            `fr-alert--${store.notification.status}`,
            {
              'fr-alert--sm':
                !store.notification.title && store.notification.description
            }
          ]"
          aria-atomic="true"
          role="alert"
        >
          <div>
            <p v-if="store.notification.title" class="fr-alert__title">
              {{ store.notification.title }}
            </p>
            <p
              v-if="store.notification.description"
              :class="{ 'fr-mb-2w': store.notification.link }"
            >
              {{ store.notification.description }}
            </p>

            <!-- FIXME: this link is not accessible with keyboard -->
            <RouterLink
              v-if="store.notification.link"
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              :to="store.notification.link.to"
              @click="store.hideNotification()"
            >
              {{ store.notification.link.label }}
            </RouterLink>
          </div>

          <!-- FIXME: this button is not accessible with keyboard -->
          <button
            v-if="store.notification.action"
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-mb-1v"
            @click="store.notification?.action?.cb"
          >
            {{ store.notification.action.label }}
          </button>

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
  z-index: 2000;

  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.v-enter-active,
.v-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(2rem);
}
</style>
