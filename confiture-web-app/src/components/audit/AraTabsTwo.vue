<script setup lang="ts">
import { ref, useId, useTemplateRef, watch } from "vue";
import {
  RouterLink,
  useRoute,
  useRouter,
  type RouteLocationRaw
} from "vue-router";

export interface TabItem {
  label: string;
  hiddenLabelSuffix?: string;
  /** If present, the tab is rendered as a `<RouterLing>` */
  to: RouteLocationRaw;
  icon?: string;
}

const props = withDefaults(defineProps<{
  tabs: TabItem[];
  /**
   * - "sameCriteria" tries to scroll page to the same
   *   criteria as previous tab (e.g. for Audit)
   * - "tabsTop" always scrolls to push the tabs panel at the top
   *   of the screen (e.g. for Report)
   */
  panelScrollBehavior?: "tabsTop" | "sameCriteria";
  /** CSS top value (e.g. "0", "4px" or "1rem"). Default is "0" */
  stickyTop?: string;
}>(), {
  stickyTop: "0",
  panelScrollBehavior: "tabsTop"
});

const selectedTabIndex = ref<number>(0);
const tabButtonsRef =
  useTemplateRef<Array<HTMLButtonElement | InstanceType<typeof RouterLink>>>(
    "tab-button"
  );

const uniqueId = useId();

const emit = defineEmits<{
  (e: "selectedTabChange", selectedTabIndex: number): void;
}>();

watch(selectedTabIndex, (tabIndex) => {
  emit("selectedTabChange", tabIndex);
});

function tabId(i: number) {
  return `tab-${uniqueId}-${i}`;
}

function panelId(i: number) {
  return `panel-${uniqueId}-${i}`;
}

function selectTab(i: number) {
  if (i === selectedTabIndex.value) {
    return;
  }

  selectedTabIndex.value = i;

  // tab can be buttons or RouterLink, the focusable element is either
  // the tab itself (if it’s a button) or tab.$el (if it’s a RouterLink)
  const tab = tabButtonsRef.value?.[i];
  const focusElement: HTMLButtonElement | HTMLAnchorElement | undefined =
    (tab as any)?.$el ?? tab;

  // Focus the new tab element
  focusElement?.click();
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

// select the correct tab based on current route and each tab’s target route
const route = useRoute();
const router = useRouter();
watch(() => route.path, path => {
  const tabToSelectIndex = props.tabs.findIndex(t =>
    t.to && router.resolve(t.to).path === path
  );
  if (tabToSelectIndex !== -1) {
    selectTab(tabToSelectIndex);
  }
}, { immediate: true });

defineExpose({ selectTab });
</script>

<template>
  <div
    class="tabs-wrapper"
    :data-panel-scroll-behavior="panelScrollBehavior"
    :style="{ '--tabs-top-offset': stickyTop }"
  >
    <ul role="tablist" class="tabs">
      <li v-for="(tab, i) in tabs" :key="i" role="presentation" class="fr-p-0">
        <component
          :is="tab.to ? RouterLink : 'button'"
          :id="tabId(i)"
          ref="tab-button"
          role="tab"
          class="tab-button"
          :to="tab.to"
          :aria-controls="i === selectedTabIndex ? panelId(i) : undefined"
          :aria-selected="i === selectedTabIndex ? 'true' : 'false'"
          :tabindex="i === selectedTabIndex ? undefined : '-1'"
          @click="selectTab(i)"
          @keydown.right.down.prevent="selectNextTab"
          @keydown.left.up.prevent="selectPreviousTab"
          @keydown.home.prevent="selectFirstTab"
          @keydown.end.prevent="selectLastTab"
        >
          <span
            v-if="tabs[i].icon"
            :class="`${tabs[i].icon} fr-icon--sm fr-mr-2v`"
            aria-hidden="true"
          />
          <span data-cy="tab-label">{{ tab.label }}</span>
          <span v-if="tabs[i].hiddenLabelSuffix" class="fr-sr-only">{{ tabs[i].hiddenLabelSuffix }}</span>
        </component>
      </li>
    </ul>
  </div>
  <div class="panel-container">
    <div
      :id="panelId(selectedTabIndex)"
      :aria-labelledby="tabId(selectedTabIndex)"
      role="tabpanel"
      tabindex="0"
    >
      <slot :selected-tab-index="selectedTabIndex" />
    </div>
  </div>
</template>

<style scope>
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

.tabs .tab-button {
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
  width: fit-content;
  z-index: 1;
}

.tabs .tab-button:hover {
  background-color: var(--hover-tint);
}

.tabs .tab-button:active {
  background-color: var(--active-tint);
}

.tabs .tab-button:focus-visible {
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

.panel-container {
  border: 1px solid var(--border-default-grey);
  border-top: none;
  padding: 2rem;

  /* Allow tabs to stick to the top of the screen
   * even if content is not high enough: */
  min-height: var(--min-height);
}
</style>
