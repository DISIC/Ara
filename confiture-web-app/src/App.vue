<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute, RouteLocationRaw } from "vue-router";
import { useHead } from "@vueuse/head";

import Breadcrumb, { BreadcrumbLink } from "./components/Breadcrumb.vue";
import ToastNotification from "./components/ToastNotification.vue";
import { useAuditStore, useReportStore } from "./store";

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

const reportStore = useReportStore();
const auditStore = useAuditStore();

const homeLocation = { label: "Accueil", to: { name: "home" } };
const helpLocation = { label: "Aide", to: { name: "help" } };
const resourcesLocation = { label: "Ressources", to: { name: "resources" } };

const menuItems = computed<Array<{ to: RouteLocationRaw; label: string }>>(
  () => {
    if (reportStore.data) {
      const reportLocation = {
        to: {
          name: "report",
          params: { uniqueId: reportStore.data.consultUniqueId },
        },
        label: "Rapport d’audit",
      };
      return [reportLocation, resourcesLocation, helpLocation];
    }

    if (auditStore.data) {
      const auditLocation = {
        label: `Audit ${auditStore.data.procedureName}`,
        to: auditStore.lastVisitedStepLocation ?? {
          name: "edit-audit-step-one",
          params: { uniqueId: auditStore.data.editUniqueId },
        },
      };
      return [homeLocation, auditLocation, resourcesLocation];
    }

    return [homeLocation, resourcesLocation, helpLocation];
  }
);

const logoLink = computed(() => {
  if (reportStore.data) {
    return {
      route: {
        name: "report",
        params: { uniqueId: reportStore.data.consultUniqueId },
      },
      title: "Rapport d’audit - Ara",
    };
  }
  return {
    route: { name: "home" },
    title: "Accueil - Ara",
  };
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

  <header id="header" role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  République
                  <br />Française
                </p>
              </div>
              <div class="fr-header__navbar">
                <button
                  id="fr-btn-menu-mobile"
                  class="fr-btn--menu fr-btn"
                  data-fr-opened="false"
                  aria-controls="modal-navigation-header"
                  aria-haspopup="menu"
                  title="Menu"
                >
                  Menu
                </button>
              </div>
            </div>
            <div class="fr-header__service">
              <RouterLink :to="logoLink.route" :title="logoLink.title">
                <p class="fr-header__service-title">
                  ARA
                  <span
                    class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon"
                    >BETA</span
                  >
                </p>
              </RouterLink>
              <p class="fr-header__service-tagline">
                Audit RGAA & Accessibilité
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        id="modal-navigation-header"
        class="fr-header__menu fr-modal"
        aria-labelledby="fr-btn-menu-mobile"
      >
        <div class="fr-container">
          <button
            class="fr-link--close fr-link"
            aria-controls="modal-navigation-header"
          >
            Fermer
          </button>
          <div class="fr-header__menu-links"></div>
          <nav class="fr-nav" role="navigation" aria-label="Menu principal">
            <ul class="fr-nav__list">
              <li
                v-for="item in menuItems"
                :key="item.label"
                class="fr-nav__item"
              >
                <RouterLink class="fr-nav__link" :to="item.to">
                  {{ item.label }}
                </RouterLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
  <div class="fr-notice fr-notice--info">
    <div class="fr-container">
      <div class="fr-notice__body">
        <p class="fr-notice__title">
          Vos avis nous sont précieux pour améliorer cet outil, n’hésitez pas à
          nous faire part de vos retours depuis ce
          <RouterLink :to="{ name: 'feedback' }" title="court formulaire - nouvelle fenêtre" target="_blank">court formulaire</RouterLink>
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
            <a href="https://design.numerique.gouv.fr/" target="_blank"
              >DesignGouv</a
            >, le pôle Design des services numériques de la
            <a href="https://www.numerique.gouv.fr/dinum/" target="_blank"
              >direction interministérielle du numérique</a
            >.
          </p>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://legifrance.gouv.fr"
                target="_blank"
                >legifrance.gouv.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://gouvernement.fr"
                target="_blank"
                >gouvernement.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://service-public.fr"
                target="_blank"
                >service-public.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://data.gouv.fr"
                target="_blank"
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
              >licence etalab-2.0</a
            >
          </p>
        </div>
      </div>
    </div>
  </footer>

  <ToastNotification />
</template>
