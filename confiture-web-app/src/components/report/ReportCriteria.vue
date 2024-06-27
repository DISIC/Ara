<script setup lang="ts">
import { computed } from "vue";
import { pluralize } from "../../utils";

// FIXME: type things
const props = defineProps<{
  pagesData: any;
  transverseData: any;
  showFilters?: boolean;
}>();

const dataCount = computed(() => {
  return (
    props.pagesData
      .map((page: any) => page.topics.map((topic: any) => topic.improvements))
      .flat(2).length + props.transverseData.length
  );
});
</script>

<template>
  <div class="main">
    <div class="sidebar">
      <nav class="fr-sidemenu fr-mb-3w" aria-label="Liste des pages">
        <div class="fr-sidemenu__inner">
          <button
            class="fr-sidemenu__btn"
            hidden
            aria-controls="fr-sidemenu-wrapper"
            aria-expanded="false"
          >
            Pages
          </button>
          <div id="fr-sidemenu-wrapper" class="fr-collapse">
            <div class="fr-sidemenu__title fr-mb-2w">Pages</div>
            <ul class="fr-sidemenu__list">
              <li
                v-if="transverseData.length"
                :class="[
                  'fr-sidemenu__item',
                  {
                    'fr-sidemenu__item--active': Boolean(transverseData.length)
                  }
                ]"
              >
                <a
                  class="fr-sidemenu__link"
                  href="#all-pages"
                  :aria-current="Boolean(transverseData.length)"
                  >Toutes les pages</a
                >
              </li>
              <li
                :class="[
                  'fr-sidemenu__item',
                  {
                    'fr-sidemenu__item--active': !Boolean(transverseData.length)
                  }
                ]"
              >
                <a
                  class="fr-sidemenu__link"
                  :href="`#${pagesData[0].id}`"
                  :aria-current="!transverseData.length ? 'true' : undefined"
                  >{{ pagesData[0].name }}</a
                >
              </li>
              <li
                v-for="page in pagesData.slice(1)"
                :key="page.name"
                class="fr-sidemenu__item"
              >
                <a class="fr-sidemenu__link" :href="`#${page.id}`">
                  {{ page.name }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <slot name="filter" />
    </div>

    <div>
      <div class="fr-mb-6w header">
        <div role="alert" aria-live="polite">
          <p class="fr-mb-0 fr-text--xl fr-text--bold">
            {{ dataCount }}
            {{ pluralize("résultat", "résultats", dataCount) }}
          </p>
        </div>
      </div>

      <slot v-if="transverseData.length" name="transverse-data" />

      <slot name="pages-data" />
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.main {
  display: grid;
  grid-template-columns: 20rem 1fr;
  gap: 2rem;
}

.sidebar {
  box-shadow: inset -1px 0 0 0 var(--border-default-grey);
}

.page-title {
  color: var(--text-active-blue-france);
}

.page-url {
  word-break: break-all;
}

.fr-sidemenu__inner {
  box-shadow: none !important;
}

@media (width < 48rem) {
  .main {
    grid-template-columns: 1fr;
  }

  .sidebar {
    box-shadow: none;
  }
}
</style>
