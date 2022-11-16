<script setup lang="ts">
import { computed } from "vue";
import { RouteLocationRaw } from "vue-router";

import { useAuditStore, useReportStore } from "../store";

const reportStore = useReportStore();
const auditStore = useAuditStore();

const logoLink = computed(() => {
  if (reportStore.data) {
    return {
      route: {
        name: "report",
        params: { uniqueId: reportStore.data.consultUniqueId },
      },
      title: "Rapport d’audit - Confiture",
    };
  }
  return {
    route: { name: "home" },
    title: "Accueil - Confiture",
  };
});

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
</script>

<template>
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
                  Ara
                  <span
                    class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon"
                    >BÊTA</span
                  >
                </p>
              </RouterLink>
              <p class="fr-header__service-tagline">
                Réalisez simplement vos audits d’accessibilité numérique
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
</template>
