<script lang="ts" setup>
import { computed, ref } from "vue";
import { RouteLocationRaw } from "vue-router";

import router from "../../router";
import CopyIcon from "../icons/CopyIcon.vue";

const props = defineProps<{
  linkHiddenLabel: string;
  copyButtonHiddenLabel: string;
  to: RouteLocationRaw;
  showCopyButton: boolean;
  successMessage: string;
}>();

const showCopyAlert = ref(false);

const fullUrl = computed(
  () => window.location.origin + router.resolve(props.to).fullPath
);

async function copyUrl() {
  navigator.clipboard.writeText(fullUrl.value).then(() => {
    showCopyAlert.value = true;
  });
}

const copyButtonRef = ref<HTMLButtonElement>();

function onAlertClose() {
  copyButtonRef.value?.focus();
  showCopyAlert.value = false;
}
</script>

<template>
  <div class="copy-block">
    <ul
      class="fr-btns-group fr-btns-group--inline-md fr-btns-group--icon-left copy-block-actions"
    >
      <li class="fr-mb-2w fr-mb-md-0">
        <RouterLink
          :to="to"
          target="_blank"
          class="fr-btn fr-btn--tertiary fr-mb-0"
          rel="noopener"
        >
          Consulter
          <span class="fr-sr-only">{{ linkHiddenLabel }} (nouvelle fenêtre)</span>
        </RouterLink>
      </li>
      <li v-if="showCopyButton">
        <button
          ref="copyButtonRef"
          class="fr-btn fr-btn--secondary fr-mb-0"
          @click="copyUrl"
        >
          <CopyIcon class="fr-mr-2v" />
          Copier le lien de partage
          <span class="fr-sr-only">{{ copyButtonHiddenLabel }}</span>
        </button>
      </li>
    </ul>

    <div role="alert" aria-live="polite" class="copy-block-alert">
      <div
        v-if="showCopyAlert"
        class="fr-alert fr-alert--success fr-alert--sm fr-mt-2w"
      >
        <p>{{ successMessage }}</p>
        <button class="fr-link fr-link--close" @click="onAlertClose">
          Masquer le message
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.copy-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.copy-block-actions {
  grid-column: 1 / -1;

  li:first-child {
    width: 50%;

    @media (width < 48rem) {
      width: 100%;
    }
  }

  li:last-child {
    min-width: 18rem;
  }

  li > a,
  li > button {
    width: calc(100% - 1rem);
  }
}

.copy-block-alert {
  grid-column: 1 / -1;
}
</style>
