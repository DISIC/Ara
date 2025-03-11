<!--
  This component is used to replicate DSFR tabs with:
	- sticky functionality
	- routing behaviour, one nested route per tab
  For "regular" tabs, please use `fr-tabs` instead of this component.
  https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/onglet
 -->

<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useUniqueId } from "../../composables/useUniqueId";
import { TabData } from "../../types";
import { slugify } from "../../utils";

/** Types */
interface TabsRouteParams {
  name: string;
  params: {
    uniqueId: string;
  };
}

/**
 * Props
 * - tabs: array of tab data objects
 * - route: route parameters common to all tabs
 * - stickyTop: CSS top value (e.g. "0", "4px" or "1rem"). Default is "0";
 * - panelScrollBehavior:
 * 		- "sameCriteria" tries to scroll page to the same
 * 			criteria as previous tab (e.g. for Audit)
 *    - "tabsTop" always scrolls to push the tabs panel at the top
 *      of the screen (e.g. for Report)
 */
const props = withDefaults(
  defineProps<{
    tabs: TabData[];
    route: TabsRouteParams;
    stickyTop?: string;
    panelScrollBehavior?: "tabsTop" | "sameCriteria";
  }>(),
  {
    stickyTop: "0",
    panelScrollBehavior: "tabsTop"
  }
);

const tabSlugsArray: string[] = [];
const tabSlugIndexes: { [slug: string]: number } = {};
const tabSlugs: { [slug: string]: TabData } = {};

props.tabs.forEach((t, i) => {
  let slug = slugify(t.label);
  // Avoid duplicates
  let otherTab: TabData;
  let otherSlug: string;
  if (slug in tabSlugs) {
    // Duplicate found: the tab with the highest id will get its slug
    // modified as "[slug]-[id]".
    // That way, reordering tabs will keep the same modified slugs)
    // Note: ids need to be declared for each of the duplicate tabs
    otherTab = tabSlugs[slug];
    if (otherTab.id && t.id) {
      if (otherTab.id > t.id) {
        otherSlug = slug + `-${otherTab.id}`;
        tabSlugs[otherSlug] = otherTab;
        tabSlugIndexes[otherSlug] = tabSlugIndexes[slug];
        tabSlugsArray[tabSlugIndexes[slug]] = otherSlug;
      } else {
        slug += `-${t.id}`;
      }
    }
  }
  tabSlugs[slug] = t;
  tabSlugIndexes[slug] = i;
  tabSlugsArray[i] = slug;
});

// Test if each tab slug is unique
if (new Set(tabSlugsArray).size !== tabSlugsArray.length) {
  throw new Error(
    `\n\n❌ Tab slugs need to be unique. You can pass an id in the TabData object,
		it will be appended to the slug.\n\nCurrent tag slugs are:\n
		${tabSlugsArray.join("  |  ")}`
  );
}

/** Refs */
const selectedTabIndex = ref<number>(0);
const selectedTabSlug = ref<string>("");
const stickyTop = ref(props.stickyTop);
const tabButtonsRef = ref<HTMLButtonElement[]>();
const panelBottomMarkerRef = ref<HTMLDivElement>();
const panelMinHeight = ref<string>("0");

/** Composables */
const uniqueId = useUniqueId();

/** Routing */
const router = useRouter();
const routerRoute = useRoute();

/** Event: "selectedTabChange" */
const emit = defineEmits<{
  (e: "selectedTabChange", selectedTabIndex: number): void;
}>();

/** Computed properties */
const selectedTab = computed(() => {
  return props.tabs[selectedTabIndex.value];
});

/** Functions */

function tabId(i: number) {
  return "tab-" + uniqueId.value + "-" + i;
}

function panelId(i: number) {
  return "panel-" + uniqueId.value + "-" + i;
}

/**
 * Selects the tab at index i
 *
 * Note: `selectedTabIndex` ref is not updated here,
 *       it will be updated **after route update**
 *       See watchEffect
 *
 * @param {number} i New index to focus
 */
function selectTab(i: number) {
  if (i === selectedTabIndex.value) {
    return;
  }

  // Focus the new tab element
  tabButtonsRef.value?.at(i)?.focus();

  // Change route
  router.push({
    ...props.route,
    params: {
      ...props.route.params,
      tabSlug: tabSlugsArray[i]
    }
  });
}

function selectNextTab() {
  selectTab((selectedTabIndex.value + 1) % props.tabs.length);
}

function selectPreviousTab() {
  const len = props.tabs.length;
  selectTab((selectedTabIndex.value - 1 + len) % len);
}

function selectFirstTab() {
  selectTab(0);
}

function selectLastTab() {
  selectTab(props.tabs.length - 1);
}

/** Lifecycle hooks */

onMounted(() => {
  // Dynamic panel minimum height.
  // Allows tabs to stick to the top of the screen
  // even if content is not high enough
  const tabsEl = document.getElementsByClassName(
    "tabs-wrapper"
  )[0] as HTMLElement;
  const bodyEl = document.getElementsByTagName("body")[0] as HTMLElement;
  useResizeObserver(bodyEl, () => {
    panelMinHeight.value = `calc( 100vh - (${stickyTop.value}) - ${
      tabsEl.clientHeight +
      (bodyEl.getBoundingClientRect().bottom -
        panelBottomMarkerRef.value!.getBoundingClientRect().top)
    }px )`;
  });
});

/** Watchers */
watchEffect(() => {
  // stickyTop can change on window resize
  stickyTop.value = props.stickyTop;

  // tabSlug changes on route change
  selectedTabSlug.value = routerRoute.params.tabSlug as string;

  // if slug not found go to Error page (404).
  const tabIndex = tabSlugIndexes[selectedTabSlug.value];
  if (tabIndex === undefined) {
    router.replace({
      name: "Error",
      params: { pathMatch: routerRoute.path.substring(1).split("/") },
      query: routerRoute.query,
      hash: routerRoute.hash,
      state: {
        errorStatus: 404
      }
    });
    return;
  }

  selectedTabIndex.value = tabIndex;

  // other components may be interested by the current selected tab index
  emit("selectedTabChange", selectedTabIndex.value);
});
</script>

<!--
  TODO:
  - ajouter une shadow quand les onglets sont scrollables
-->

<template>
  <div
    class="tabs-wrapper"
    :data-panel-scroll-behavior="panelScrollBehavior"
    :style="{ '--tabs-top-offset': stickyTop }"
  >
    <ul role="tablist" class="tabs">
      <li v-for="(tab, i) in tabs" :key="i" role="presentation">
        <button
          :id="tabId(i)"
          ref="tabButtonsRef"
          role="tab"
          :data-slug="tabSlugsArray[i]"
          :aria-controls="panelId(i)"
          :aria-selected="i === selectedTabIndex ? 'true' : 'false'"
          :tabindex="i === selectedTabIndex ? undefined : '-1'"
          @click="selectTab(i)"
          @keydown.right.down.prevent="selectNextTab"
          @keydown.left.up.prevent="selectPreviousTab"
          @keydown.home.prevent="selectFirstTab"
          @keydown.end.prevent="selectLastTab"
        >
          <component
            :is="props.tabs[i].icon"
            v-if="props.tabs[i].icon && i === 0"
            class="fr-mr-2v"
          ></component
          >{{ tab.label }}
        </button>
      </li>
    </ul>
  </div>
  <div class="panel-container" :style="{ '--min-height': panelMinHeight }">
    <RouterView v-slot="{ Component }">
      <!-- Component should be AraTabsPanel (see router) -->
      <component
        :is="Component"
        :panel-id="panelId(selectedTabIndex)"
        :labelled-by="tabId(selectedTabIndex)"
        :component-params="selectedTab.componentParams"
      >
        <!-- Slot inside AraTabsPanel -->
        <component
          :is="selectedTab.component"
          v-bind="selectedTab.componentParams"
        >
        </component>
      </component>
    </RouterView>
  </div>
  <div ref="panelBottomMarkerRef"></div>
</template>

<style scoped>
/* The styles are mostly copy-pasted from the DSFR tabs component. */
.tabs-wrapper {
  background-color: var(--background-default-grey);
  z-index: 2;
  position: sticky;
  top: var(--tabs-top-offset, 4rem);
}

.tabs-wrapper::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--border-default-grey);
}

.tabs {
  margin: 0;

  display: flex;
  gap: 0.25rem;
  list-style: none;

  padding: 0;
  overflow-x: auto;
}

li {
  padding: 0;
}

.tabs button {
  --text-spacing: 0;
  --title-spacing: 0;
  --underline-img: none;
  --hover-tint: var(--hover);
  align-items: center;
  display: inline-flex;
  flex-direction: row;
  font-size: 1rem;
  font-weight: 700;
  height: 100%;
  line-height: 1.5rem;
  min-height: 2.5rem;
  overflow: visible;
  padding: 0.5rem 1rem;
  position: relative;
  white-space: nowrap;
  width: -moz-fit-content;
  width: fit-content;
  z-index: 1;
}

.tabs button:hover {
  background-color: var(--hover-tint);
}

.tabs button:active {
  background-color: var(--active-tint);
}

.tabs button:focus-visible {
  outline: 2px solid var(--dsfr-outline);
  outline-offset: -2px;
}

[aria-selected="true"] {
  --idle: transparent;
  --hover: var(--background-default-grey-hover);
  --active: var(--background-default-grey-active);
  background-color: var(--background-default-grey);
  color: var(--text-active-blue-france);

  border: 1px solid var(--border-default-grey);
  border-bottom-color: transparent;
  position: relative;
}

[aria-selected="true"]::after {
  content: "";
  left: -1px;
  top: -1px;
  right: -1px;
  height: 2px;
  background-color: var(--text-active-blue-france);
  position: absolute;
  z-index: 1;
}

[aria-selected="false"] {
  --idle: transparent;
  --hover: var(--background-action-low-blue-france-hover);
  --active: var(--background-action-low-blue-france-active);
  background-color: var(--background-action-low-blue-france);
  color: var(--text-action-high-grey);
  border: 1px solid transparent;
  border-bottom-color: var(--border-default-grey);
}

[role="tabpanel"]:not(.visible) {
  display: none;
}

.panel-container {
  border: 1px solid var(--border-default-grey);
  border-top: none;
  padding: 2rem;
  /**
	 * Allow tabs to stick to the top of the screen
	 * even if content is not high enough:
	 */
  min-height: var(--min-height);
}
</style>
