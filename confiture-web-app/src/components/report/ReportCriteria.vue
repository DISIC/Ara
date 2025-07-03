<script setup lang="ts">
import { useRoute } from "vue-router";

import { StaticTabLabel, TabSlug } from "../../enums";
import type { ReportError } from "./getReportErrors";
import { ReportImprovement } from "./getReportImprovements";

defineProps<{
  count: string;
  pagesData: ReportError[] | ReportImprovement[];
  transverseData: ReportError | ReportImprovement;
  showFilters?: boolean;
  topNotice?: string;
}>();

// Set active side menu link
const route = useRoute();

function isActive(id: string) {
  return route.hash && route.hash === id;
}
</script>

<template>
  <div class="main">
    <div class="sidebar filters-wrapper">
      <nav class="fr-sidemenu fr-mb-3w" aria-label="Liste des pages">
        <div class="fr-sidemenu__inner">
          <button
            class="fr-sidemenu__btn"
            hidden
            :aria-controls="`report_sidemenu-wrapper`"
            aria-expanded="false"
          >
            Pages
          </button>
          <div :id="`report_sidemenu-wrapper`" class="fr-collapse">
            <div class="fr-sidemenu__title fr-mb-2w">Pages</div>
            <ul class="fr-sidemenu__list">
              <li
                v-if="transverseData.topics.length"
                :class="[
                  'fr-sidemenu__item',
                  {
                    'fr-sidemenu__item--active':
                      !route.hash ||
                      isActive(`#${TabSlug.AUDIT_COMMON_ELEMENTS_SLUG}`)
                  }
                ]"
              >
                <RouterLink
                  :to="{ hash: `#${TabSlug.AUDIT_COMMON_ELEMENTS_SLUG}` }"
                  class="fr-sidemenu__link"
                  :aria-current="
                    route.hash
                      ? isActive(`#${TabSlug.AUDIT_COMMON_ELEMENTS_SLUG}`)
                        ? 'true'
                        : undefined
                      : undefined
                  "
                >{{
                  StaticTabLabel.AUDIT_COMMON_ELEMENTS_TAB_LABEL
                }}</RouterLink>
              </li>
              <li
                v-for="page in pagesData"
                :key="page.name"
                class="fr-sidemenu__item"
                :class="{
                  'fr-sidemenu__item--active': isActive(`#page_${page.id}`)
                }"
              >
                <RouterLink
                  class="fr-sidemenu__link"
                  :to="{ hash: `#page_${page.id}` }"
                  :aria-current="
                    isActive(`#page_${page.id}`) ? 'true' : undefined
                  "
                >
                  {{ page.name }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <slot name="filter"></slot>
    </div>
    <div>
      <div class="fr-mb-5w">
        <p v-if="topNotice" class="fr-text--sm fr-mb-3w improvements-notice">
          {{ topNotice }}
        </p>

        <div role="alert" aria-live="polite">
          <p class="fr-mb-0 count">
            {{ count }}
          </p>
        </div>
      </div>

      <slot v-if="transverseData" name="transverse-data" />

      <slot name="pages-data" />
    </div>
  </div>
</template>

<style scoped>
.main {
  display: grid;
  grid-template-columns: 20rem minmax(0, 1fr);
  gap: 2rem;
}

.sidebar {
  box-shadow: inset -1px 0 0 0 var(--border-default-grey);
}

:deep(.page-title) {
  color: var(--text-active-blue-france);
  scroll-margin: 4rem;
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

.count,
.improvements-notice {
  color: var(--text-mention-grey);
}

.filters-wrapper {
  --filters-top-offset: 4.5rem;
  position: sticky;
  top: var(--filters-top-offset, 0);
  max-height: calc(100vh - var(--filters-top-offset, 0));
  max-height: calc(100dvh - var(--filters-top-offset, 0));
  overflow-y: auto;
  overflow-x: hidden;
}

@media (width < 48rem) {
  .filters-wrapper {
    position: static;
    max-height: none;
    overflow-y: initial;
  }
}
</style>
