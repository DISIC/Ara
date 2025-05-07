<script setup lang="ts">
import { useRoute } from "vue-router";

const menuItems = [
  { name: "roadmap", label: "Feuille de route" },
  {
    name: "changelog",
    label: "Notes de version",
    children: ["2025", "2024", "2023", "2022"]
  }
];

const route = useRoute();

function isCurrentPage(routeName: string): boolean {
  return route.name === routeName;
}

function isCurrentAnchor(anchor: string): boolean {
  return route.hash === `#${anchor}`;
}
</script>

<template>
  <nav class="fr-sidemenu news-sidebar" aria-labelledby="fr-sidemenu-title">
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
        <p id="fr-sidemenu-title" class="fr-sidemenu__title fr-sr-only">
          Dans cette rubrique
        </p>
        <ul class="fr-sidemenu__list">
          <li
            v-for="item in menuItems"
            :key="item.name"
            :class="[
              'fr-sidemenu__item',
              { 'fr-sidemenu__item--active': isCurrentPage(item.name) }
            ]"
          >
            <template v-if="item.children && isCurrentPage(item.name)">
              <p
                :id="`${item.name}-nav-title`"
                class="fr-sidemenu__link"
                aria-current
              >
                {{ item.label }}
              </p>

              <ul
                class="fr-sidemenu__list"
                :aria-labelledby="`${item.name}-nav-title`"
              >
                <li
                  v-for="children in item.children"
                  :key="children"
                  class="fr-sidemenu__item"
                >
                  <RouterLink
                    :to="`#${children}`"
                    class="fr-sidemenu__link"
                    :aria-current="
                      isCurrentAnchor(children) ? 'page' : undefined
                    "
                  >
                    {{ children }}
                  </RouterLink>
                </li>
              </ul>
            </template>
            <RouterLink
              v-else
              class="fr-sidemenu__link"
              :to="{ name: item.name }"
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

<style scoped>
.news-sidebar {
  position: sticky;
  top: 1rem;
  height: max-content;

  @media (width < 48rem) {
    position: initial;
  }
}
</style>
