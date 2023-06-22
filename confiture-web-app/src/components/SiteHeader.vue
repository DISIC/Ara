<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, RouteLocationRaw } from "vue-router";

import { useAuditStore, useReportStore } from "../store";

const reportStore = useReportStore();
const auditStore = useAuditStore();

const currentRoute = useRoute();
const matchedRoutesNames = computed(() => {
  return currentRoute.matched.map((r) => r.name);
});

/**
 * Determine if the navigation link should has the `aria-current` attribute.
 */
function getAriaCurrentValue(to: RouteLocationRaw, match?: string) {
  if (typeof to === "string") {
    if (match && to.startsWith(match)) {
      return "true";
    }
    return null;
  }

  if ("name" in to && matchedRoutesNames.value.includes(to.name)) {
    return "true";
  }

  if (match && currentRoute.path.startsWith(match)) {
    // Exclude home link to be matched for other routes
    if (match === "/" && currentRoute.fullPath !== "/") {
      return null;
    }
    return "true";
  }
}

const homeLocation = { label: "Accueil", to: { name: "home" }, match: "/" };
const helpLocation = { label: "Aide", to: { name: "help" }, match: "/aide" };
const resourcesLocation = {
  label: "Ressources",
  to: { name: "resources" },
  match: "/ressources",
};

const menuItems = computed<
  Array<{ to: RouteLocationRaw; label: string; match?: string }>
>(() => {
  if (auditStore.data) {
    const auditLocation = {
      label: `Audit ${auditStore.data.procedureName}`,
      to: auditStore.lastVisitedStepLocation ?? {
        name: "edit-audit-step-one",
        params: { uniqueId: auditStore.data.editUniqueId },
      },
      match: "/audits",
    };
    return [homeLocation, auditLocation, resourcesLocation];
  }

  if (reportStore.data) {
    const reportLocation = {
      to: {
        name: "report",
        params: { uniqueId: reportStore.data.consultUniqueId },
      },
      label: "Rapport d’audit",
      match: "/rapports",
    };
    return [homeLocation, reportLocation, resourcesLocation, helpLocation];
  }

  return [homeLocation, resourcesLocation, helpLocation];
});

const newsSubMenu = ref<HTMLButtonElement>();

function closeNewsSubMenu() {
  dsfr(newsSubMenu.value).collapse.conceal();
}
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
              <p class="fr-header__service-title">
                Ara
                <span
                  class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon"
                  >BÊTA</span
                >
              </p>
              <p class="fr-header__service-tagline">
                Réalisez vos audits d’accessibilité numérique
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
                <RouterLink
                  class="fr-nav__link"
                  :to="item.to"
                  :aria-current="getAriaCurrentValue(item.to, item.match)"
                >
                  {{ item.label }}
                </RouterLink>
              </li>
              <li class="fr-nav__item">
                <button
                  class="fr-nav__btn"
                  aria-expanded="false"
                  :aria-current="['changelog', 'roadmap'].includes(currentRoute.name as string) ? 'true' : undefined"
                  aria-controls="news-menu-item"
                >
                  Nouveautés
                </button>
                <div
                  id="news-menu-item"
                  ref="newsSubMenu"
                  class="fr-collapse fr-menu"
                >
                  <ul class="fr-menu__list">
                    <li>
                      <RouterLink
                        class="fr-nav__link"
                        :to="{ name: 'changelog' }"
                        @click="closeNewsSubMenu"
                      >
                        Notes de versions
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink
                        class="fr-nav__link"
                        :to="{ name: 'roadmap' }"
                        @click="closeNewsSubMenu"
                      >
                        Feuille de route
                      </RouterLink>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.fr-header__brand.fr-enlarge-link:hover,
.fr-header__brand.fr-enlarge-link:active {
  background-color: transparent !important; /* Remove link on brand logo */
}
</style>
