<script lang="ts">
let nextId = 1;
</script>

<script setup lang="ts">
import { ref, watch } from "vue";

const uniqueId = nextId++;

defineProps<{
  title: string;
  buttonProps?: object;
}>();

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
      class="fr-btn fr-btn--secondary fr-icon-arrow-down-s-line fr-btn--icon-right"
      aria-haspopup="true"
      :aria-expanded="showContent"
      :aria-controls="`dropdown-${uniqueId}`"
      v-bind="buttonProps"
      @click="toggleOptions"
    >
      {{ title }}
    </button>
    <div
      v-if="showContent"
      :id="`dropdown-${uniqueId}`"
      class="dropdown-content"
      role="menu"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  z-index: 2;
}

.dropdown-content {
  --shadow-color: rgba(0, 0, 0, 0.18);

  background: var(--background-default-grey);
  box-shadow: 0px 4px 12px var(--shadow-color);
  position: absolute;
  top: calc(100% - 1rem);
  right: 0.5rem;
  padding: 1.5rem 2rem;
  width: max-content;
}

/* TODO: shadow color on dark mode? */
@media (prefers-color-scheme: dark) {
  .dropdown-content {
    --shadow-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
