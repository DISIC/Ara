<script lang="ts" setup>
import { computed, ref } from "vue";
import { RouteLocationRaw } from "vue-router";
import router from "../router";

const props = defineProps<{
  description: string;
  to: RouteLocationRaw;
  successMessage: string;
}>();

const showCopyAlert = ref(false);

const fullReportUrl = computed(
  () => window.location.origin + router.resolve(props.to).fullPath
);

async function copyLink() {
  navigator.clipboard.writeText(fullReportUrl.value).then(() => {
    showCopyAlert.value = true;
  });
}
</script>

<template>
  <div class="fr-callout">
    <p class="fr-callout__title fr-text--xl fr-mb-2w">
      {{ description }}
    </p>
    <p class="fr-callout__text fr-text--md copy-block">
      <RouterLink class="fr-link" :to="to" :title="description">
        {{ fullReportUrl }}
      </RouterLink>
      <!-- FIXME: icon "copy" does not seem to exist -->
      <button
        class="fr-btn fr-btn--primary fr-icon-file-line fr-btn--icon-left fr-m-0"
        @click="copyLink"
        @blur="showCopyAlert = false"
      >
        Copier le lien
      </button>
    </p>

    <div role="alert" aria-live="polite">
      <div
        v-if="showCopyAlert"
        class="fr-alert fr-alert--success fr-alert--sm fr-mt-2w"
      >
        <p>
          {{ successMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.copy-block {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}
</style>
