<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from "vue";

import { useSystemStore, useAuditStore } from "../store";
import AuditProgressBar from "./AuditProgressBar.vue";
import SaveIndicator from "./SaveIndicator.vue";
import { formatDate } from "../utils";

const systemStore = useSystemStore();
const auditStore = useAuditStore();

/*
Make the indicator `fixed` whenever the user scrolls past the sentinel div.

WARNING: this is extremely hacky
*/

const isScrolled = ref(false);
const sentinelRef = ref<HTMLDivElement>();

// When the `isOnline` state becomes `false`, an alert is displayed which should displace the save indicator fixed position.
const alertHeight = ref(0);
function onOfflineAlertResize(entries: ResizeObserverEntry[]) {
  alertHeight.value = entries[0].target.clientHeight;

  // Re-initialize the intersection observer with new `rootMargin` value.
  intersectionObserver.disconnect();
  intersectionObserver = new IntersectionObserver(onObservation, {
    rootMargin: `-${40 + alertHeight.value}px`,
  });
  intersectionObserver.observe(sentinelRef.value!);
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

function onObservation(entries: IntersectionObserverEntry[]) {
  const { isIntersecting, boundingClientRect } = entries[0];
  isScrolled.value =
    !isIntersecting &&
    // dont "fix" the indicator when scrolling upwards past the sentinel
    boundingClientRect.top <= 40 + alertHeight.value;
}

let intersectionObserver = new IntersectionObserver(onObservation, {
  rootMargin: `-${40 + alertHeight.value}px`,
});

onMounted(() => {
  if (sentinelRef.value) {
    intersectionObserver.observe(sentinelRef.value);
  }
});
</script>

<template>
  <div>
    <div
      class="sticky-thing"
      :class="{
        'is-scrolled': isScrolled,
      }"
      :style="{
        top: alertHeight + 'px',
      }"
    >
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

      <div class="fr-ml-2w separator" />

      <SaveIndicator />
    </div>

    <div ref="sentinelRef" />
  </div>
</template>

<style scoped>
.is-scrolled {
  position: fixed;
  background: var(--background-default-grey);
  z-index: 3;
  width: calc(
    78rem - calc(1.5rem * 2)
  ); /* main wrapper width - left and right padding */
}

.sticky-thing {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
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
