<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import { useSystemStore } from "../store";
import AuditProgressBar from "./AuditProgressBar.vue";
import SaveIndicator from "./SaveIndicator.vue";

const systemStore = useSystemStore();

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
    rootMargin: `-${48 + alertHeight.value}px`,
  });
  intersectionObserver.observe(sentinelRef.value!);
}
const resizeObserver = new ResizeObserver(onOfflineAlertResize);

watch(
  () => systemStore.isOnline,
  (isOnline) => {
    resizeObserver.disconnect();

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
    boundingClientRect.top <= 48 + alertHeight.value;
}

let intersectionObserver = new IntersectionObserver(onObservation, {
  rootMargin: `-${48 + alertHeight.value}px`,
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
      <AuditProgressBar />

      <SaveIndicator />
    </div>

    <div ref="sentinelRef" />
  </div>
</template>

<style scoped>
.is-scrolled {
  position: fixed;
  /* top: 0; */
  background: var(--background-default-grey);
  z-index: 3;
  width: calc(
    78rem - calc(1.5rem * 2)
  ); /* main wrapper width - left and right padding */
}

.sticky-thing {
  display: flex;
  align-items: end;
}
</style>
