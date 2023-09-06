<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, RouteLocationRaw } from "vue-router";

import { useAuditStore, useReportStore } from "../store";
import { useAccountStore } from "../store/account";
import Dropdown from "./Dropdown.vue";
// import GearIcon from "./icons/GearIcon.vue";
import LogoutIcon from "./icons/LogoutIcon.vue";

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
const resourcesLocation = {
  label: "Ressources",
  to: { name: "resources" },
  match: "/ressources",
};

const menuItems = computed<
  Array<{ to: RouteLocationRaw; label: string; match?: string }>
>(() => {
  if (auditStore.currentAudit) {
    const auditLocation = {
      label: `Audit ${auditStore.currentAudit.procedureName}`,
      to: auditStore.lastVisitedStepLocation ?? {
        name: "edit-audit-step-one",
        params: { uniqueId: auditStore.currentAudit.editUniqueId },
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
    return [homeLocation, reportLocation, resourcesLocation];
  }

  return [homeLocation, resourcesLocation];
});

const newsSubMenu = ref<HTMLButtonElement>();

function closeNewsSubMenu() {
  dsfr(newsSubMenu.value).collapse.conceal();
}
const accountStore = useAccountStore();

function handleDisconnectClick() {
  accountStore.logout();
  // TODO: announce successful disconnection with live zone
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
          <div class="fr-header__tools">
            <div class="fr-header__tools-links">
              <ul v-if="!accountStore.account" class="fr-btns-group">
                <li>
                  <RouterLink class="fr-btn" :to="{ name: 'login' }">
                    Se connecter
                  </RouterLink>
                </li>
                <li>
                  <RouterLink
                    class="fr-btn fr-btn--secondary"
                    :to="{ name: 'new-account' }"
                  >
                    Créer un compte
                  </RouterLink>
                </li>
              </ul>
              <!-- FIXME: correct dropdown style when #377 is merged -->
              <Dropdown
                v-else
                ref="optionsDropdownRef"
                :title="accountStore.account.email"
              >
                <ul role="list" class="fr-p-0 fr-m-0 user-dropdown">
                  <li>
                    <RouterLink
                      :to="{ name: 'account-settings' }"
                      class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-user-line fr-m-0"
                    >
                      Mon compte
                    </RouterLink>
                  </li>
                  <!-- <li>
                    <RouterLink
                      to="#"
                      class="fr-btn fr-btn--tertiary-no-outline fr-m-0"
                    >
                      <GearIcon class="fr-mr-2v" />
                      Paramètres d’affichage
                    </RouterLink>
                  </li> -->
                  <li aria-hidden="true" class="dropdown-separator"></li>
                  <li>
                    <button
                      class="fr-btn fr-btn--tertiary-no-outline fr-m-0"
                      @click="handleDisconnectClick"
                    >
                      <LogoutIcon class="fr-mr-2v" />
                      Me déconnecter
                    </button>
                  </li>
                </ul>
              </Dropdown>
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

.user-dropdown {
  text-align: initial !important;
}
</style>
