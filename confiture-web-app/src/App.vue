<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { onMounted, ref } from "vue";

import GenericModal from "./components/GenericModal.vue";
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

// Feedback notice display
const feedbackLocalStorageKey = "ara:hide-feedback-notice";
const showFeedbackNotice = ref(!localStorage.getItem(feedbackLocalStorageKey));

function closeFeedbackNotice() {
  showFeedbackNotice.value = false;
  localStorage.setItem(feedbackLocalStorageKey, "true");

  // Focus page h1 and set attributes if needed
  const pageHeading: HTMLHeadingElement | null =
    document.querySelector("main h1");

  const pageHeadingIsFocusable =
    pageHeading?.hasAttribute("tabindex") &&
    pageHeading.getAttribute("tabindex") === "-1";

  if (!pageHeadingIsFocusable) {
    pageHeading?.setAttribute("tabindex", "-1");
  }

  pageHeading?.focus();
}

// TODO: remove this after 12/01/2026 19:00
const today = new Date();
const date = new Date("January 12, 26 19:00:00");
const showMaintenanceNotice = ref(today < date);
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

  <GenericModal />

  <SiteHeader />

  <!-- TODO: remove this after 12/01/2026 19:00 -->
  <div v-if="showMaintenanceNotice" class="fr-notice fr-notice--alert">
    <div class="fr-container">
      <div class="fr-notice__body">
        <p>
          <span class="fr-notice__title">L’accès à Ara sera perturbé le lundi 12 janvier entre 17h et 18h en raison d’une opération de maintenance.</span>
          <span class="fr-notice__desc">Merci de votre compréhension.</span>
        </p>
      </div>
    </div>
  </div>

  <div v-if="showFeedbackNotice" class="fr-notice fr-notice--info">
    <div class="fr-container">
      <div class="fr-notice__body">
        <p>
          <span class="fr-notice__title">
            Vos avis nous sont précieux pour améliorer cet outil, n’hésitez pas
            à nous faire part de vos retours depuis ce
            <RouterLink :to="{ name: 'feedback' }" target="_blank">
              court formulaire
              <span class="fr-sr-only">(nouvelle fenêtre)</span></RouterLink>.
          </span>
        </p>
        <button
          title="Masquer le message"
          class="fr-btn--close fr-btn"
          @click="closeFeedbackNotice"
        >Masquer le message</button>
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

main:has(.top-link) {
  margin-bottom: 4.5rem !important;
}
</style>
