<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { onMounted } from "vue";

import SiteFooter from "./components/layout/SiteFooter.vue";
import SiteHeader from "./components/layout/SiteHeader.vue";
import ToastNotification from "./components/ui/ToastNotification.vue";
import { useAccountStore } from "./store/account";

// Default meta tags
useHead({
  title: "Audit d’accessibilité numérique",
  titleTemplate: "%s - Ara",
  meta: [
    {
      name: "description",
      content:
        "Avec Ara, vous évaluez manuellement les 106 critères du RGAA, générez un rapport d’audit et une déclaration d’accessibilité"
    },
    { name: "og:title", content: "Audit d’accessibilité numérique" },
    {
      name: "og:description",
      content:
        "Avec Ara, vous évaluez manuellement les 106 critères du RGAA, générez un rapport d’audit et une déclaration d’accessibilité"
    },
    { name: "og:url", content: "URL" },
    { name: "og:image", content: "image" },
    { name: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" }
  ]
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
  <div
    id="page-title-alert"
    class="fr-sr-only"
    role="alert"
    aria-live="polite"
  />

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
        <p>
          <span class="fr-notice__title">
            Vos avis nous sont précieux pour améliorer cet outil, n’hésitez pas
            à nous faire part de vos retours depuis ce
            <RouterLink :to="{ name: 'feedback' }" target="_blank">
              court formulaire
              <span class="fr-sr-only">(nouvelle fenêtre)</span> </RouterLink
            >.
          </span>
        </p>
      </div>
    </div>
  </div>

  <main id="main" role="main" class="fr-container fr-mb-12w fr-pt-5w">
    <RouterView />
  </main>

  <SiteFooter />

  <ToastNotification />
</template>

<style scoped>
[id="main"]:target {
  scroll-margin: 2rem;
}
</style>
