<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useAuditStore, useSystemStore } from "../store";
import { formatDate } from "../utils";
import AuditProgressBar from "./AuditProgressBar.vue";
import SaveIndicator from "./SaveIndicator.vue";

const systemStore = useSystemStore();
const auditStore = useAuditStore();

// When the `isOnline` state becomes `false`, an alert is displayed which should displace the save indicator fixed position.
const alertHeight = ref(0);
function onOfflineAlertResize(entries: ResizeObserverEntry[]) {
  alertHeight.value = entries[0].target.clientHeight;
}
const resizeObserver = new ResizeObserver(onOfflineAlertResize);

watch(
  () => systemStore.isOnline,
  async (isOnline) => {
    resizeObserver.disconnect();

    await nextTick();

    if (!isOnline) {
      // The alert element should be displayed in the `AuditGenerationHeader` component.
      const alertEl = document.getElementById("offlineAlert");
      resizeObserver.observe(alertEl!);
    } else {
      alertHeight.value = 0;
    }
  }
);

const route = useRoute();
</script>

<template>
  <div class="sticky-indicator fr-mb-1v" :style="{ top: alertHeight + 'px' }">
    <AuditProgressBar
      v-if="
        !auditStore.data?.publicationDate ||
        (auditStore.data?.publicationDate &&
          auditStore.data?.editionDate &&
          auditStore.data?.editionDate > auditStore.data?.publicationDate)
      "
    />

    <div v-else class="audit-status">
      <span
        class="fr-icon-success-line fr-icon--sm audit-status-icon"
        aria-hidden="true"
      ></span>
      <strong
        >Audit {{ auditStore.data?.editionDate ? "modifié" : "terminé" }} le
        <time
          :datetime="
            auditStore.data?.editionDate
              ? auditStore.data?.editionDate
              : auditStore.data?.publicationDate
          "
          >{{
            auditStore.data?.editionDate
              ? formatDate(auditStore.data?.editionDate)
              : formatDate(auditStore.data?.publicationDate)
          }}</time
        ></strong
      >
    </div>

    <template v-if="route.name === 'edit-audit-step-three'">
      <div class="fr-ml-2w separator" />
      <SaveIndicator />
    </template>
  </div>
</template>

<style scoped>
.sticky-indicator {
  flex-basis: initial !important;
  align-self: end;
  position: sticky;
  top: 0;
  z-index: 3;

  display: flex;
  gap: 0.75rem;
  align-items: stretch;
  padding: 0;
}

.sticky-indicator::before {
  position: absolute;
  content: "";
  top: 0;
  background: var(--background-default-grey);
  left: 0;
  height: 100%;
  z-index: -1;
  overflow: hidden;

  width: calc(100vw - 2rem);
}

@media (min-width: 62em) {
  .sticky-indicator::before {
    width: calc(100vw - 3rem);
  }
}

@media (min-width: 78em) {
  .sticky-indicator::before {
    width: calc(78rem - 3rem);
  }
}

.audit-status {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.audit-status-icon {
  color: var(--text-default-success);
}

.separator {
  width: 1px;
  /* height: 100%; */
  background-color: var(--border-default-grey);
}
</style>
