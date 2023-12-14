<script lang="ts" setup>
import { useRoute } from "vue-router";

const route = useRoute();

function isCurrentPage(routeName: string): boolean {
  return route.name === routeName;
}

const menuItems = [
  { name: "account-settings", label: "Mon compte" }
  // { name: "display-settings", label: "Paramètre d’affichage" },
];
</script>

<template>
  <nav class="fr-sidemenu" aria-labelledby="fr-sidemenu-title">
    <div class="fr-sidemenu__inner">
      <button
        class="fr-sidemenu__btn"
        hidden
        aria-controls="fr-sidemenu-wrapper"
        aria-expanded="false"
      >
        Dans cette rubrique
      </button>
      <div id="fr-sidemenu-wrapper" class="fr-collapse">
        <ul class="fr-sidemenu__list">
          <li
            v-for="item in menuItems"
            :key="item.name"
            class="fr-sidemenu__item"
            :class="{ 'fr-sidemenu__item--active': isCurrentPage(item.name) }"
          >
            <RouterLink
              class="fr-sidemenu__link"
              :to="item.name"
              :aria-current="isCurrentPage(item.name) ? 'page' : undefined"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
