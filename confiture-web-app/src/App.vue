<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

import Breadcrumb, { BreadcrumbLink } from "./components/layout/Breadcrumb.vue";
import FeedbackNotice from "./components/layout/FeedbackNotice.vue";
import Footer from "./components/layout/Footer.vue";
import Header from "./components/layout/Header.vue";
import SkipLinks from "./components/layout/SkipLinks.vue";

const breadcrumbLinks = ref<BreadcrumbLink[]>([]);

const route = useRoute();

/*
  Updates the breadcrumb links to display
  whenever the route changes.
*/
watch(route, () => {
  if (!route.meta) return;

  if (typeof route.meta.breadcrumbLinks === "function") {
    breadcrumbLinks.value = route.meta.breadcrumbLinks();
  } else {
    breadcrumbLinks.value =
      (route.meta.breadcrumbLinks as BreadcrumbLink[]) || [];
  }
});
</script>

<template>
  <SkipLinks />
  <Header />
  <FeedbackNotice />

  <main
    id="main"
    :class="['fr-container fr-mb-12w', { 'fr-mt-9w': !breadcrumbLinks.length }]"
  >
    <Breadcrumb
      v-if="breadcrumbLinks.length"
      class="fr-mb-9w"
      :links="breadcrumbLinks"
    />
    <RouterView />
  </main>

  <Footer />
</template>
