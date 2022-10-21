<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@vueuse/head";

import Breadcrumb, { BreadcrumbLink } from "./components/Breadcrumb.vue";
import ToastNotification from "./components/ToastNotification.vue";
import SiteHeader from "./components/SiteHeader.vue";

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
</script>

<template>
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
          <RouterLink
            :to="{ name: 'feedback' }"
            title="court formulaire - nouvelle fenêtre"
            target="_blank"
            >court formulaire</RouterLink
          >
        </p>
      </div>
    </div>
  </div>

  <main
    id="main"
    :class="['fr-container fr-mb-12w', { 'fr-mt-9w': !breadcrumbLinks.length }]"
  >
    <Breadcrumb v-if="breadcrumbLinks.length" :links="breadcrumbLinks" />
    <RouterView />
  </main>

  <footer id="footer" class="fr-footer" role="contentinfo">
    <div class="fr-container">
      <div class="fr-footer__body">
        <div class="fr-footer__brand fr-enlarge-link">
          <RouterLink :to="{ name: 'home' }" title="Retour à l’accueil">
            <p class="fr-logo" title="république française">
              République<br />
              Française
            </p>
          </RouterLink>
        </div>
        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">
            Ce site est réalisé par
            <a
              href="https://design.numerique.gouv.fr/"
              title="DesignGouv - nouvelle fenêtre"
              target="_blank"
              rel="noreferrer noopener"
              >DesignGouv</a
            >, le pôle Design des services numériques de la
            <a
              href="https://www.numerique.gouv.fr/dinum/"
              title="direction interministérielle du numérique - nouvelle fenêtre"
              rel="noreferrer noopener"
              target="_blank"
              >direction interministérielle du numérique</a
            >.
          </p>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://legifrance.gouv.fr"
                target="_blank"
                rel="noreferrer noopener"
                title="legifrance.gouv.fr - nouvelle fenêtre"
                >legifrance.gouv.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://gouvernement.fr"
                target="_blank"
                rel="noreferrer noopener"
                title="gouvernement.fr - nouvelle fenêtre"
                >gouvernement.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://service-public.fr"
                target="_blank"
                rel="noreferrer noopener"
                title="service-public.fr - nouvelle fenêtre"
                >service-public.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://data.gouv.fr"
                target="_blank"
                rel="noreferrer noopener"
                title="data.gouv.fr - nouvelle fenêtre"
                >data.gouv.fr</a
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="fr-footer__bottom">
        <ul class="fr-footer__bottom-list">
          <li class="fr-footer__bottom-item">
            <RouterLink
              class="fr-footer__bottom-link"
              :to="{ name: 'site-map' }"
            >
              Plan du site
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink
              class="fr-footer__bottom-link"
              :to="{ name: 'accessibility' }"
            >
              Accessibilité : non conforme
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink class="fr-footer__bottom-link" :to="{ name: 'legal' }">
              Mentions légales
            </RouterLink>
          </li>
          <!-- <li class="fr-footer__bottom-item">
            <RouterLink
              class="fr-footer__bottom-link"
              :to="{ name: 'personal-data' }"
            >
              Données personnelles
            </RouterLink>
          </li> -->
          <li class="fr-footer__bottom-item">
            <RouterLink
              class="fr-footer__bottom-link"
              :to="{ name: 'contact' }"
            >
              Contact et contributions
            </RouterLink>
          </li>
        </ul>
        <div class="fr-footer__bottom-copy">
          <p>
            Sauf mention contraire, tous les contenus de ce site sont sous
            <a
              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              target="_blank"
              rel="noreferrer noopener"
              title="licence etalab-2.0 - nouvelle fenêtre"
              >licence etalab-2.0</a
            >
          </p>
        </div>
      </div>
    </div>
  </footer>

  <ToastNotification />
</template>
