<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useUniqueId } from "../composables/useUniqueId";

defineProps<{
  title: string;
  buttonProps?: object;
  alignLeft?: boolean;
  iconLeft?: boolean;
  disabled?: boolean;
}>();

const uniqueId = useUniqueId();

const showContent = ref(false);
const buttonRef = ref();
const containerRef = ref();

function toggleOptions() {
  showContent.value = !showContent.value;
}

function closeOptions() {
  showContent.value = false;
  buttonRef.value?.focus();
}

// Handle clicks outside of container
function handleGoOutside(e: Event) {
  if (!(e.target as HTMLElement).closest(".dropdown-container")) {
    showContent.value = false;
  }
}

watch(showContent, () => {
  if (showContent.value) {
    window.addEventListener("click", handleGoOutside);
  } else {
    window.removeEventListener("click", handleGoOutside);
  }
});

const route = useRoute();

// Close dropdown when changing route
watch(route, () => {
  if (showContent.value) {
    showContent.value = false;
  }
});

defineExpose({ buttonRef, closeOptions });
</script>

<template>
  <div
    ref="containerRef"
    class="dropdown-container"
    @keydown.esc="closeOptions"
  >
    <slot name="button" />
    <button
      ref="buttonRef"
      class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-down-s-line"
      :class="[iconLeft ? 'fr-btn--icon-left' : 'fr-btn--icon-right']"
      aria-haspopup="true"
      :aria-expanded="showContent"
      :aria-controls="`dropdown-${uniqueId}`"
      :disabled="disabled"
      v-bind="buttonProps"
      @click="toggleOptions"
    >
      {{ title }}
    </button>
    <Transition>
      <div
        v-if="showContent"
        :id="`dropdown-${uniqueId}`"
        :class="[
          'fr-p-2w dropdown-content',
          { 'dropdown-content-left': alignLeft },
        ]"
        role="menu"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  z-index: 2;
}

.dropdown-content {
  background: var(--background-default-grey);
  filter: drop-shadow(var(--lifted-shadow));
  position: absolute;
  top: 100%;
  right: 0;
  width: max-content;
}

.dropdown-content-left {
  left: 0;
  right: initial;
}

.dropdown-content :deep(.dropdown-list) {
  display: flex;
  flex-direction: column;
  list-style: none;
}

.dropdown-content :deep(.dropdown-separator) {
  background-color: var(--border-default-grey);
  height: 1px;
  margin: 0.75rem 0;
  padding: 0;
}

.dropdown-content :deep(.dropdown-item) {
  padding-bottom: 0;
}

/* Transition */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Make actions hover full width */
.dropdown-content :deep(.dropdown-item > a),
.dropdown-content :deep(.dropdown-item > button) {
  width: 100%;
}

/* Custom `.fr-btn` with sub text */
.dropdown-content :deep(.dropdown-item--with-meta > a),
.dropdown-content :deep(.dropdown-item--with-meta > button) {
  display: grid;
  grid-template-columns: auto 1fr;
}

.dropdown-content :deep(.dropdown-item-meta) {
  grid-column: 1 / -1;
  color: var(--text-mention-grey);
}
</style>
