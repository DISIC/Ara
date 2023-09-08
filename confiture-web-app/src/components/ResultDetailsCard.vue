<script lang="ts" setup>
import { ref } from "vue";

import { slugify } from "../utils";

defineProps<{
  title: string;
  tableData: string[][];
}>();

const currentDisplay = ref("chart");

function updateCurrentDisplay(display: string) {
  currentDisplay.value = display;
}
</script>

<template>
  <div>
    <h3 :id="slugify(title)" class="fr-h4 fr-mb-3w">{{ title }}</h3>

    <div class="fr-tabs">
      <ul
        class="fr-tabs__list"
        role="tablist"
        :aria-label="`Format d’affichage pour ${title}`"
      >
        <li role="presentation">
          <button
            :id="`tabpanel-chart-${slugify(title)}`"
            class="fr-tabs__tab"
            tabindex="0"
            role="tab"
            aria-selected="true"
            :aria-controls="`tabpanel-chart-${slugify(title)}-panel`"
          >
            Graphique
          </button>
        </li>
        <li role="presentation">
          <button
            :id="`tabpanel-table-${slugify(title)}`"
            class="fr-tabs__tab"
            tabindex="-1"
            role="tab"
            aria-selected="false"
            :aria-controls="`tabpanel-table-${slugify(title)}-panel`"
          >
            Tableau
          </button>
        </li>
      </ul>
      <div
        :id="`tabpanel-chart-${slugify(title)}-panel`"
        class="fr-tabs__panel"
        :class="{ 'fr-tabs__panel--selected': currentDisplay === 'chart' }"
        role="tabpanel"
        :aria-labelledby="`tabpanel-chart-${slugify(title)}`"
        tabindex="0"
        v-on="{ 'dsfr.disclose': () => updateCurrentDisplay('chart') }"
      >
        <slot />
      </div>
      <div
        :id="`tabpanel-table-${slugify(title)}-panel`"
        class="fr-tabs__panel"
        :class="{ 'fr-tabs__panel--selected': currentDisplay === 'table' }"
        role="tabpanel"
        :aria-labelledby="`tabpanel-table-${slugify(title)}`"
        tabindex="0"
        v-on="{ 'dsfr.disclose': () => updateCurrentDisplay('table') }"
      >
        <div class="fr-table fr-table--no-caption fr-mb-0">
          <table>
            <caption>
              {{
                title
              }}
            </caption>
            <thead>
              <tr>
                <th v-for="header in tableData[0]" :key="header" scope="col">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in tableData.slice(1)" :key="i">
                <td v-for="data in row" :key="data">{{ data }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
