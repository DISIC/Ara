<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";

const { storageKey, expiration } = defineProps<{
  title: string;
  description?: string;
  /** ISO string of a date from when the announcement will automatically be hidden. */
  expiration?: string;
  storageKey: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const hideAnnouncement = useLocalStorage(
  `ara:announcement:${storageKey}`,
  false
);

const showAnnouncement = computed(
  () =>
    !hideAnnouncement.value &&
    (!expiration || expiration > new Date().toISOString())
);

function closeAnnouncement() {
  hideAnnouncement.value = true;
  emit("close");
}
</script>

<template>
  <div
    v-if="showAnnouncement"
    class="fr-alert fr-alert--info fr-pb-2w announcement"
  >
    <h3 class="fr-alert__title">{{ title }}</h3>

    <p v-if="description">{{ description }}</p>
    <slot v-else name="description" />

    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm announcement-action"
      @click="closeAnnouncement"
    >
      Ne plus afficher
    </button>
  </div>
</template>

<style scoped>
.announcement {
  display: flex;
  flex-direction: column;
}

.announcement-action {
  align-self: end;
}
</style>
