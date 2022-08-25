<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@vueuse/head";

import Breadcrumb, { BreadcrumbLink } from "./components/Breadcrumb.vue";

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
  // TODO: change this
  title: "default title",
  titleTemplate: "%s | Confiture",
  meta: [
    { name: "description", content: "description" },
    { name: "og:title", content: "default title" },
    { name: "og:description", content: "description" },
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
              <RouterLink to="/" title="Accueil - Confiture">
                <p class="fr-header__service-title">
                  Confiture
                  <span
                    class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon"
                    >BETA</span
                  >
                </p>
              </RouterLink>
              <p class="fr-header__service-tagline">
                Précisions sur l'organisation
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
              <li class="fr-nav__item">
                <RouterLink class="fr-nav__link" to="/">Accueil</RouterLink>
              </li>
              <li class="fr-nav__item">
                <RouterLink class="fr-nav__link" to="/ressources">
                  Ressources
                </RouterLink>
              </li>
              <li class="fr-nav__item">
                <RouterLink class="fr-nav__link" to="/aide">Aide</RouterLink>
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
          <RouterLink :to="{ name: 'feedback' }">court formulaire</RouterLink>
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
          <RouterLink to="/" title="Retour à l’accueil">
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
            <RouterLink class="fr-footer__bottom-link" to="/plan-du-site">
              Plan du site
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink class="fr-footer__bottom-link" to="/accessibilite">
              Accessibilité : non conforme
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink class="fr-footer__bottom-link" to="/mentions-legales">
              Mentions légales
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink
              class="fr-footer__bottom-link"
              to="/donnees-personnelles"
            >
              Données personnelles
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink
              class="fr-footer__bottom-link"
              to="/gestion-des-cookies"
            >
              Gestion des cookies
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
</template>
