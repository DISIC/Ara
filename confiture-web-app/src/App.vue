<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

import Breadcrumb from "./components/layout/Breadcrumb.vue";
import FeedbackNotice from "./components/layout/FeedbackNotice.vue";
import Footer from "./components/layout/Footer.vue";
import Header from "./components/layout/Header.vue";
import SkipLinks from "./components/layout/SkipLinks.vue";

const links = ref([]);

const route = useRoute();

/*
  Updates the breadcrumb links to display
  whenever the route changes.
*/
watch(route, () => {
  if (!route.meta) return;
  // TODO: fix TS issues
  try {
    links.value = route.meta.breadcrumbLinks();
  } catch (err) {
    links.value = route.meta.breadcrumbLinks || [];
  }
});
</script>

<template>
  <SkipLinks />
  <Header />
  <FeedbackNotice />

  <main
    id="main"
    :class="['fr-container fr-mb-12w', { 'fr-mt-9w': !links.length }]"
  >
    <Breadcrumb v-if="links.length" class="fr-mb-9w" :links="links" />
    <RouterView />
  </main>

  <Footer />
</template>
