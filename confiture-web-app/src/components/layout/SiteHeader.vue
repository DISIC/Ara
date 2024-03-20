<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import DeliverableHeader from "./DeliverableHeader.vue";
import MarketingHeader from "./MarketingHeader.vue";
import AccountHeader from "./AccountHeader.vue";
import { useAccountStore } from "../../store/account";

const accountStore = useAccountStore();
const route = useRoute();

/**
 * Determine which header to display depending:
 * - on the current route
 * - if the user is connected
 */
const headerComponent = computed(() => {
  if (route.name === "report" || route.name === "context") {
    return DeliverableHeader;
  }

  if (accountStore.account) {
    return AccountHeader;
  }

  return MarketingHeader;
});
</script>

<template>
  <component :is="headerComponent" />
</template>
