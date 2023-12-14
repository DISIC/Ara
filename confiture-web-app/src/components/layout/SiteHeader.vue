<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuditStore, useReportStore } from "../../store";
import { useAccountStore } from "../../store/account";
import Dropdown from "./Dropdown.vue";
import LogoutIcon from "./icons/LogoutIcon.vue";
import { useNotifications } from "../../composables/useNotifications";

const reportStore = useReportStore();
const auditStore = useAuditStore();
const accountStore = useAccountStore();

const currentRoute = useRoute();

const newsSubMenu = ref<HTMLButtonElement>();

function closeNewsSubMenu() {
  dsfr(newsSubMenu.value).collapse.conceal();
}

const router = useRouter();
const notify = useNotifications();

function handleDisconnectClick() {
  accountStore.logout();
  if (currentRoute.meta.authRequired) {
    router.push({ name: "login" });
  }
  notify("success", "Vous avez été deconnecté avec succès.");
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
              <!-- Home -->
              <li class="fr-nav__item">
                <RouterLink
                  class="fr-nav__link"
                  :to="
                    accountStore.account
                      ? { name: 'account-dashboard' }
                      : { name: 'home' }
                  "
                  :aria-current="
                    accountStore.account
                      ? [
                          'audit-overview',
                          'audit-generation',
                          'report'
                        ].includes(currentRoute.name as string)
                        ? 'true'
                        : null
                      : ['home', 'account-dashboard'].includes(
                            currentRoute.name as string
                          )
                        ? 'true'
                        : null
                  "
                >
                  {{ accountStore.account ? "Mes audits" : "Accueil" }}
                </RouterLink>
              </li>

              <!-- Current audit -->
              <li
                v-if="
                  !accountStore.account &&
                  (auditStore.currentAudit || reportStore.data)
                "
                class="fr-nav__item"
              >
                <RouterLink
                  v-if="auditStore.currentAudit"
                  class="fr-nav__link"
                  :to="
                    auditStore.lastVisitedStepLocation ?? {
                      name: 'audit-settings',
                      params: {
                        uniqueId: auditStore.currentAudit.editUniqueId
                      }
                    }
                  "
                  :aria-current="
                    currentRoute.path.startsWith('/audits') ? 'true' : null
                  "
                >
                  {{ `Audit ${auditStore.currentAudit.procedureName}` }}
                </RouterLink>

                <RouterLink
                  v-else-if="reportStore.data"
                  class="fr-nav__link no-external-icon"
                  :to="{
                    name: 'report',
                    params: { uniqueId: reportStore.data.consultUniqueId }
                  }"
                  target="_blank"
                  :aria-current="
                    ['context', 'report'].includes(currentRoute.name as string)
                      ? 'true'
                      : null
                  "
                >
                  Rapport d’audit
                </RouterLink>
              </li>

              <!-- Ressources -->
              <li class="fr-nav__item">
                <RouterLink
                  class="fr-nav__link"
                  :to="{ name: 'resources' }"
                  :aria-current="
                    currentRoute.path.startsWith('/ressources') ? 'true' : null
                  "
                >
                  Ressources
                </RouterLink>
              </li>

              <!-- Nouveautés -->
              <li class="fr-nav__item">
                <button
                  class="fr-nav__btn"
                  aria-expanded="false"
                  :aria-current="
                    ['changelog', 'roadmap'].includes(
                      currentRoute.name as string
                    )
                      ? 'true'
                      : undefined
                  "
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
