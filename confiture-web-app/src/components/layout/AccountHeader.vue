<script setup lang="ts">
import Dropdown from "../ui/Dropdown.vue";
import { useAccountStore } from "../../store";
import { useRoute, useRouter } from "vue-router";
import { useNotifications } from "../../composables/useNotifications";

const accountStore = useAccountStore();

const notify = useNotifications();

const router = useRouter();
const currentRoute = useRoute();

function handleDisconnectClick() {
  accountStore.logout();
  if (currentRoute.meta.authRequired) {
    router.push({ name: "login" });
  }
  notify("success", "Vous avez été deconnecté avec succès.");
}
</script>

<template>
  <header class="fr-header">
    <div class="fr-container content">
      <div class="fr-header__service fr-pl-0">
        <p class="fr-header__service-title">
          Ara
          <span class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon"
            >BÊTA</span
          >
        </p>
      </div>

      <RouterLink
        :to="{ name: 'account-dashboard' }"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-home-4-line"
        >Mes audits</RouterLink
      >

      <Dropdown
        v-if="accountStore.account"
        ref="optionsDropdownRef"
        :title="accountStore.account.email"
        class="account-dropdown"
      >
        <ul role="list" class="fr-p-0 fr-m-0">
          <li>
            <RouterLink
              :to="{ name: 'account-settings' }"
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-user-line fr-m-0"
            >
              Mon compte
            </RouterLink>
          </li>
          <li aria-hidden="true" class="dropdown-separator"></li>
          <li>
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
.content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.account-dropdown {
  margin-inline-start: auto;
}
</style>
