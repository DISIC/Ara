<script setup lang="ts">
import { onMounted, provide, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";

import Breadcrumb, { BreadcrumbLink } from "./components/Breadcrumb.vue";
import ToastNotification from "./components/ToastNotification.vue";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import MarkdownHelpModal from "./components/MarkdownHelpModal.vue";
import { useAccountStore } from "./store/account";

const route = useRoute();

const breadcrumbLinks = ref<BreadcrumbLink[]>([]);

watch(route, () => {
  if (!route.meta || !route.meta.breadcrumbLinks) breadcrumbLinks.value = [];
  if (typeof route.meta.breadcrumbLinks === "function") {
    breadcrumbLinks.value = route.meta.breadcrumbLinks();
  } else {
    breadcrumbLinks.value =
      (route.meta.breadcrumbLinks as BreadcrumbLink[]) || [];
  }
});

// Default meta tags
useHead({
  title: "Audit d’accessibilité numérique",
  titleTemplate: "%s - Ara",
  meta: [
    {
      name: "description",
      content:
        "Ara est l’outil qui vous permet de réaliser, simplement et rapidement, des audits d'accessibilité numérique.",
    },
    { name: "og:title", content: "Audit d’accessibilité numérique" },
    {
      name: "og:description",
      content:
        "Ara est l’outil qui vous permet de réaliser, simplement et rapidement, des audits d'accessibilité numérique.",
    },
    { name: "og:url", content: "URL" },
    { name: "og:image", content: "image" },
    { name: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});

const markdownHelpModal = ref<InstanceType<typeof MarkdownHelpModal>>();

provide("openMarkdownHelp", () => {
  markdownHelpModal.value?.show();
});

const accountStore = useAccountStore();
onMounted(() => {
  if (accountStore.authToken) {
    accountStore.refreshToken();
  }
});
</script>

<template>
  <!-- Page title container, filled on page change -->
  <div id="page-title-alert" class="sr-only" role="alert" aria-live="polite" />

  <div class="fr-skiplinks">
    <nav class="fr-container" role="navigation" aria-label="Accès rapide">
      <ul class="fr-skiplinks__list">
        <li>
          <a class="fr-link" href="#main">Contenu</a>
        </li>
        <li>
          <a class="fr-link" href="#footer">Pied de page</a>
        </li>
      </ul>
    </nav>
  </div>

  <SiteHeader />

  <div class="fr-notice fr-notice--info">
    <div class="fr-container">
      <div class="fr-notice__body">
        <p class="fr-notice__title">
          Vos avis nous sont précieux pour améliorer cet outil, n’hésitez pas à
          nous faire part de vos retours depuis ce
          <RouterLink :to="{ name: 'feedback' }" target="_blank">
            court formulaire
            <span class="sr-only">(nouvelle fenêtre)</span>
          </RouterLink>
        </p>
      </div>
    </div>
  </div>

  <main
    id="main"
    role="main"
    :class="['fr-container fr-mb-12w', { 'fr-mt-9w': !breadcrumbLinks.length }]"
  >
    <Breadcrumb v-if="breadcrumbLinks.length" :links="breadcrumbLinks" />
    <RouterView />
  </main>

  <SiteFooter />

  <MarkdownHelpModal ref="markdownHelpModal" />

  <ToastNotification />
</template>
