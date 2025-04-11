<script setup lang="ts">
interface AraTabsPanelSlots {
  default: () => void;
}

defineSlots<AraTabsPanelSlots>();

const { panelId, labelledBy } = defineProps<{
  panelId: string;
  labelledBy: string;
}>();
</script>

<template>
  <div
    :id="panelId"
    :aria-labelledby="labelledBy"
    role="tabpanel"
    tabindex="0"
    class="visible"
  >
    <slot name="default"></slot>
  </div>
</template>
