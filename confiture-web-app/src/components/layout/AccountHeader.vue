<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

import { useNotifications } from "../../composables/useNotifications";
import { useWindowWidth } from "../../composables/useWindowWidth";
import { useAccountStore } from "../../store";
import Dropdown from "../ui/Dropdown.vue";

const accountStore = useAccountStore();

const notify = useNotifications();

const router = useRouter();
const currentRoute = useRoute();

function handleDisconnectClick() {
  accountStore.logout();
  if (currentRoute.meta.authRequired) {
    router.push({ name: "login" });
  }
  notify("success", undefined, "Vous avez été deconnecté avec succès.");
}

const width = useWindowWidth();
</script>

<template>
  <header id="header" role="banner" class="account-header">
    <div class="fr-p-1w fr-px-md-3w fr-py-md-2w content">

      <div class="logo"></div>

      <RouterLink
        :to="{ name: 'account-dashboard' }"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-home-4-line"
      >
        {{ width < 768 ? "Audits" : "Mes audits" }}
      </RouterLink>

      <Dropdown
        v-if="accountStore.account"
        :title="width < 768 ? 'Compte' : accountStore.account.email"
        class="account-dropdown"
      >
        <ul role="list" class="fr-p-0 fr-m-0 dropdown-list">
          <li class="dropdown-item">
            <RouterLink
              :to="{ name: 'account-settings' }"
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-user-line fr-m-0"
            >
              Mon compte
            </RouterLink>
          </li>
          <li aria-hidden="true" class="dropdown-separator"></li>
          <li class="dropdown-item">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-logout-box-r-line fr-m-0"
              @click="handleDisconnectClick"
            >
              Me déconnecter
            </button>
          </li>
        </ul>
      </Dropdown>
    </div>
  </header>
</template>

<style scoped>
.account-header {
  /* Replicate .fr-header drop shadow */
  filter: drop-shadow(var(--raised-shadow));
  z-index: calc(var(--ground) + 750);
  background-color: var(--background-raised-grey);
}

.content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  max-width: 78rem;
  margin: 0 auto;

  @media (width < 48rem) {
    gap: 0.25rem;
  }
}

.account-dropdown {
  margin-inline-start: auto;
}

.logo {
  margin: auto 0;
  height: 1.75rem;
  width: 5rem;
  background-repeat: no-repeat;
}

[data-fr-theme="dark"] .logo {
  background-image: url("../../assets/images/logo-ara-sombre.svg");
}

[data-fr-theme="light"] .logo {
  background-image: url("../../assets/images/logo-ara-clair.svg");
}
</style>
