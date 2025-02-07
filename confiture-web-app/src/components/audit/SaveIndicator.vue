<script setup lang="ts">
import { debounce } from "lodash-es";
import { computed, ref, watch } from "vue";

import { useAuditStore, useResultsStore, useSystemStore } from "../../store";
import { StoreName } from "../../types";
import Dropdown from "../ui/Dropdown.vue";

/* Change the saving status in a way that it wont "flicker" */

export interface Props {
  storeName?: StoreName;
}

const props = withDefaults(defineProps<Props>(), {
  storeName: StoreName.RESULTS_STORE
});

const store = computed(() => {
  if (props.storeName === StoreName.AUDIT_STORE) {
    return useAuditStore();
  }

  return useResultsStore();
});

const isLoading = ref(store.value.isLoading);

const unsetIsLoadingDebounced = debounce(() => {
  isLoading.value = false;
}, 500);

watch(
  () => store.value.isLoading,
  (newValue) => {
    if (newValue) {
      isLoading.value = true;
    } else {
      unsetIsLoadingDebounced();
    }
  }
);

/* Show an alert when the app is offline */

const systemStore = useSystemStore();

const dropdownTitle = computed(() => {
  if (isLoading.value) {
    return "Enregistrement...";
  }
  if (!systemStore.isOnline) {
    return "Enregistrement impossible";
  }

  return "Enregistré";
});

const dropdownMainText = computed(() => {
  if (isLoading.value) {
    return "Modifications en cours d’enregistrement...";
  }
  if (!systemStore.isOnline) {
    return "L’enregistrement de vos modifications est impossible hors connexion. Veuillez vérifier votre connexion internet.";
  }
  return "Ara enregistre automatiquement votre travail";
});

const dropdownIcon = computed(() => {
  if (isLoading.value) {
    return "fr-icon-refresh-line";
  }
  if (!systemStore.isOnline) {
    return "fr-icon-warning-line";
  }

  return "fr-icon-success-line";
});

/* Display the time since last successful save */

const relativeLastSaveDate = ref<string>();

/**
 *
 * @param seconds
 */
function formatInterval(seconds: number) {
  if (seconds < 60) {
    return `il y a ${seconds} secondes`;
  } else if (seconds < 60 * 60) {
    return `il y a ${Math.floor(seconds / 60)} min`;
  } else {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds - hours * 60 * 60) / 60);
    return `il y a ${hours} h ${minutes} m`;
  }
}

setInterval(() => {
  const timestamp = store.value.lastRequestSuccessEnd;

  if (!timestamp) {
    return;
  }

  const seconds = Math.round((Date.now() - timestamp) / 1000);
  relativeLastSaveDate.value = formatInterval(seconds);
}, 1000);

// Vocally announce when requests are working again after a failure
const saveText = ref("");

watch(
  () => store.value.lastRequestFailed,
  () => {
    if (store.value.lastRequestFailed) {
      saveText.value = "Information : vos saisies sont à nouveau enregistrées.";

      setTimeout(() => {
        saveText.value = "";
        store.value.lastRequestFailed = false;
      }, 5000);
    }
  }
);
</script>

<template>
  <div class="dropdown-container">
    <Dropdown
      :title="dropdownTitle"
      align-left
      icon-left
      :button-props="{
        class: `fr-btn--tertiary-no-outline ${dropdownIcon}`,
        style: !systemStore.isOnline
          ? 'color: var(--text-default-error);'
          : undefined
      }"
    >
      <p class="fr-text--sm fr-mb-1v">
        {{ dropdownMainText }}
      </p>

      <p v-if="relativeLastSaveDate" class="fr-text--xs fr-m-0">
        Dernier enregistrement {{ relativeLastSaveDate }}
      </p>
    </Dropdown>

    <p class="fr-sr-only" aria-live="polite" role="alert">
      {{ saveText }}
    </p>
  </div>
</template>

<style scoped>
.dropdown-container {
  min-width: 10rem;
}
:deep(.fr-btn--tertiary-no-outline) {
  padding: 0;
}
</style>
