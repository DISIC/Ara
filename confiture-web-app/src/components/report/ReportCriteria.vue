<script setup lang="ts">
import { useRoute } from "vue-router";

import type { ReportError } from "./getReportErrors";
import { ReportImprovement } from "./getReportImprovements";

defineProps<{
  count: string;
  pagesData: ReportError[] | ReportImprovement[];
  tabSlug: string;
  transverseData: ReportError | ReportImprovement;
  showFilters?: boolean;
  topNotice?: string;
}>();

// Set active side menu link
const route = useRoute();

function isActive(id: string) {
  return route.hash && route.hash === id;
}

/**
 * Temp fix to allow anchors scrolling by toggling the `overflow` style on the tabs.
 * See: https://github.com/DISIC/Ara/issues/839#issuecomment-2607413187
 */
async function scrollToPage() {
  const tabs = document.querySelector(".fr-tabs") as HTMLDivElement;
  tabs.style.overflow = "visible";

  setTimeout(() => {
    tabs.style.overflow = "hidden";
  }, 10);
}
</script>

<template>
  <div class="main">
    <div class="sidebar">
      <nav class="fr-sidemenu fr-mb-3w" aria-label="Liste des pages">
        <div class="fr-sidemenu__inner">
          <button
            class="fr-sidemenu__btn"
            hidden
            :aria-controls="`report-${tabSlug}_sidemenu-wrapper`"
            aria-expanded="false"
          >
            Pages
          </button>
          <div :id="`report-${tabSlug}_sidemenu-wrapper`" class="fr-collapse">
            <div class="fr-sidemenu__title fr-mb-2w">Pages</div>
            <ul class="fr-sidemenu__list">
              <li
                v-if="transverseData.topics.length"
                :class="[
                  'fr-sidemenu__item',
                  {
                    'fr-sidemenu__item--active':
                      !route.hash || isActive('#elements-transverses')
                  }
                ]"
              >
                <a
                  class="fr-sidemenu__link"
                  :href="`#${tabSlug}_elements-transverses`"
                  :aria-current="
                    route.hash
                      ? isActive(`#${tabSlug}_elements-transverses`)
                        ? 'true'
                        : undefined
                      : 'true'
                  "
                  @click="scrollToPage"
                  >Éléments transverses</a
                >
              </li>
              <li
                v-for="page in pagesData"
                :key="page.name"
                class="fr-sidemenu__item"
                :class="{
                  'fr-sidemenu__item--active': isActive(
                    `#${tabSlug}_${page.id}`
                  )
                }"
              >
                <a
                  class="fr-sidemenu__link"
                  :href="`#${tabSlug}_${page.id}`"
                  :aria-current="
                    isActive(`#${tabSlug}_${page.id}`) ? 'true' : undefined
                  "
                  @click="scrollToPage"
                >
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

.page-title {
  color: var(--text-active-blue-france);
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
</style>
