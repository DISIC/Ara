<script lang="ts" setup>
import { computed, ref } from "vue";
import { RouteLocationRaw } from "vue-router";

import router from "../../router";

const props = defineProps<{
  label: string;
  title: string;
  to: RouteLocationRaw;
  successMessage: string;
  buttonClass?: string;
}>();

const showCopyAlert = ref(false);

const fullUrl = computed(
  () => window.location.origin + router.resolve(props.to).fullPath
);

async function copyLink() {
  navigator.clipboard.writeText(fullUrl.value).then(() => {
    showCopyAlert.value = true;
  });
}

const copyButtonRef = ref<HTMLButtonElement>();

function onClose() {
  copyButtonRef.value?.focus();
  showCopyAlert.value = false;
}
</script>

<template>
  <div class="copy-block-wrapper">
    <p class="fr-text fr-text--bold fr-mb-3v">{{ label }}</p>

    <div class="fr-px-4w fr-py-3w copy-block">
      <p class="fr-m-0">
        <RouterLink
          class="fr-link copy-block-link"
          :to="to"
          :title="title"
          target="_blank"
        >
          {{ fullUrl }}
          <span class="fr-sr-only">(Nouvelle fenêtre)</span>
        </RouterLink>
      </p>
      <button
        ref="copyButtonRef"
        class="fr-btn fr-icon-file-line fr-btn--icon-left fr-m-0 copy-block-action"
        :class="buttonClass"
        :title="`Copier le ${title}`"
        @click="copyLink"
      >
        Copier le lien
      </button>
    </div>

    <div role="alert" aria-live="polite">
      <div
        v-if="showCopyAlert"
        class="fr-alert fr-alert--success fr-alert--sm fr-mt-2w"
      >
        <p>
          {{ successMessage }}
        </p>
        <button class="fr-link--close fr-link" @click="onClose">
          Masquer le message
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.copy-block-wrapper {
  display: flex;
  flex-direction: column;
}

.copy-block {
  background-color: var(--background-contrast-grey);
  display: flex;
  gap: 1.25rem;
  align-items: center;
  justify-content: space-between;
}

.copy-block-link {
  word-break: break-all;
}

.copy-block-action {
  flex-shrink: 0;
}

@media (width < 36rem) {
  .copy-block {
    align-items: start;
    flex-direction: column;
  }
}
</style>
