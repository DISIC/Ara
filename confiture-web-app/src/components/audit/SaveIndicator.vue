<script setup lang="ts">
import { debounce } from "lodash-es";
import { computed, ref, watch } from "vue";

import { useUniqueId } from "../../composables/useUniqueId";
import { useAuditStore, useResultsStore, useSystemStore } from "../../store";
import { StoreName } from "../../types";
import { formatDate, pluralize } from "../../utils";

const uniqueId = useUniqueId();

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

/* Update tooltip content conditionally */
const systemStore = useSystemStore();

const saveContent = computed(() => {
  if (isLoading.value) {
    return {
      status: "Enregistrement...",
      description: "Modifications en cours d’enregistrement...",
      class: "save-indicator-icon--loading"
    };
  }

  if (!systemStore.isOnline) {
    return {
      status: "Enregistrement impossible",
      description:
        "L’enregistrement de vos modifications est impossible hors connexion. Veuillez vérifier votre connexion internet.",
      class: "save-indicator-icon--error"
    };
  }

  return {
    status: "Enregistré",
    description: "Ara enregistre automatiquement votre travail",
    class: "save-indicator-icon--default"
  };
});

/* Display the time since last successful save */
const relativeLastSaveDate = ref<string>();

function formatInterval(seconds: number) {
  if (seconds < 60) {
    return `il y a quelques secondes`;
  } else if (seconds < 60 * 60) {
    return `il y a ${Math.floor(seconds / 60)} min`;
  } else if (seconds < 60 * 60 * 24) {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds - hours * 60 * 60) / 60);
    return minutes > 0 ? `il y a ${hours} h ${minutes} m` : `il y a ${hours} h`;
  } else if (seconds < 60 * 60 * 24 * 7) {
    const days = Math.floor(seconds / (60 * 60 * 24));
    return `il y a ${days} ${pluralize("jour", "jours", days)}`;
  } else if (store.value.lastRequestSuccessEnd) {
    const date = new Date(store.value.lastRequestSuccessEnd);
    return `le ${formatDate(date.toString())}`;
  } else {
    return "il y a plusieurs jours";
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
      saveText.value = "Information : vos saisies sont à nouveau enregistrées.";

      setTimeout(() => {
        saveText.value = "";
        store.value.lastRequestFailed = false;
      }, 5000);
    }
  }
);
</script>

<template>
  <div class="save-indicator">
    <button
      :class="[`fr-btn--tooltip fr-btn fr-btn--sm ${saveContent.class}`]"
      type="button"
      :aria-describedby="`save-indicator-${uniqueId}`"
    >
      Informations sur l’enregistrement
    </button>
    <span
      :id="`save-indicator-${uniqueId}`"
      class="fr-tooltip fr-placement fr-text--sm"
      role="tooltip"
      aria-hidden="true"
    >
      {{ saveContent.description }}
      <small class="fr-text--xs fr-m-0 save-indicator-relative-time">
        Dernier enregistrement {{ relativeLastSaveDate }}
      </small>
    </span>
    <p class="fr-m-0 save-indicator-label">{{ saveContent.status }}</p>

    <p class="fr-sr-only" aria-live="polite" role="alert">
      {{ saveText }}
    </p>
  </div>
</template>

<style scoped>
.save-indicator {
  align-items: center;
  display: flex;
  gap: 0.125rem;
}

.save-indicator-icon--default::before {
  mask-image: url("../../assets/images/cloud-check.svg");
}

.save-indicator-icon--loading::before {
  mask-image: url("../../assets/images/upload-cloud-2-line.svg");
}

.save-indicator-icon--error::before {
  mask-image: url("../../assets/images/cloud-off-line.svg");
}

.save-indicator-icon--error {
  color: var(--text-default-error);

  & ~ .save-indicator-label {
    color: var(--text-default-error);
  }
}

.save-indicator-label {
  color: var(--text-mention-grey);
}

.save-indicator-relative-time {
  display: block;
  color: var(--text-mention-grey);
}
</style>
