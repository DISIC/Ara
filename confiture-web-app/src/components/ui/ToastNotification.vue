<script lang="ts" setup>
import { ref, useTemplateRef } from "vue";
import { useNotificationStore } from "../../store";

const store = useNotificationStore();

const linkRef = useTemplateRef("linkRef");
const actionRef = ref<HTMLButtonElement>();

function onAction() {
  store.notification?.action?.cb();

  if (store.notification?.action?.hideOnTrigger) {
    store.hideNotification();
  }
}

function focusNotification() {
  if (!store.notification) {
    return;
  }

  if (store.notification.action) {
    actionRef.value?.focus();
    return;
  }

  if (store.notification.link) {
    // @ts-expect-error For some reason, the RouterLink type does not list "$el" as one of its props.
    linkRef.value?.$el.focus();
  }
}
</script>

<template>
  <Teleport to="body">
    <div aria-live="polite">
      <Transition @after-enter="focusNotification">
        <div
          v-if="store.notification"
          :key="store.notification.id"
          class="fr-alert toast-notification"
          :class="[
            `fr-alert--${store.notification.status}`,
            {
              'toast-notification--with-action': store.notification.action,
              'fr-alert--sm':
                !store.notification.title && store.notification.description
            }
          ]"
          aria-atomic="true"
          role="alert"
        >
          <div>
            <p v-if="store.notification.title" class="fr-alert__title fr-text--md">
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
              ref="linkRef"
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
            ref="actionRef"
            class="fr-btn fr-btn--tertiary-no-outline fr-mb-1v"
            @click="onAction"
          >
            {{ store.notification.action.label }}
            <span v-if="store.notification.action.srLabel" class="fr-sr-only">
              &nbsp;{{ store.notification.action.srLabel }}
            </span>
          </button>

          <button
            class="fr-btn--close fr-btn"
            title="Masquer le message"
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

/* Align icon and close button for sm toast with action */
.toast-notification--with-action {
  &.fr-alert--sm::before {
    margin: 1rem 0.5rem;
  }

  .fr-btn--close {
    inset-block-start: auto !important;
  }
}
</style>
