<script lang="ts" setup>
import elementForm from "@gouvfr/dsfr/dist/artwork/pictograms/document/document.svg";
import { ref } from "vue";

import elementFrame from "../../assets/images/element-frame.svg";
import elementMultimedia from "../../assets/images/element-multimedia.svg";
import elementTable from "../../assets/images/element-table.svg";
import { useAccountStore } from "../../store";
import { PageElements } from "../../types";
import DsfrRichCheckbox from "../ui/DsfrRichCheckbox.vue";

const staticElements = [
  {
    label: "Multimédia",
    hint: "Vidéo, audio ou animation",
    icon: elementMultimedia,
    key: "multimedia"
  },
  { label: "Tableau", icon: elementTable, key: "table" },
  { label: "Formulaire", icon: elementForm, key: "form" },
  {
    label: "Cadre",
    hint: "Balise <code>&lt;iframe&gt;</code> ou <code>&lt;frame&gt;</code>",
    icon: elementFrame,
    key: "frame"
  }
];

const props = defineProps<{
  pageElements: PageElements;
}>();

const emit = defineEmits<{
  (e: "previous"): void;
  (e: "submit", payload: { pageElements: PageElements }): void;
}>();

const accountStore = useAccountStore();

function goToPreviousStep() {
  emit("previous");
}

function submitAuditElements() {
  emit("submit", {
    pageElements: pageElements.value.reduce(
      (acc, val) => ({ ...acc, [val.key]: val.value }),
      {}
    )
  });
}

const pageElements = ref(
  Object.entries(props.pageElements).map(([, value], i) => {
    return {
      ...staticElements[i],
      value
    };
  })
);
</script>

<template>
  <form @submit.prevent="submitAuditElements">
    <div class="fr-mb-6w wrapper">
      <p class="fr-mb-1w">Le site ou service à auditer contient</p>

      <ul class="fr-p-0 fr-m-0 checkboxes">
        <li v-for="(el, i) in pageElements" :key="i">
          <DsfrRichCheckbox
            :id="`element-${el.key}`"
            v-model="el.value"
            :label="el.label"
            :hint="el.hint"
            :icon-src="el.icon"
          />
        </li>
      </ul>
    </div>

    <div class="actions">
      <button
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-arrow-left-s-line action-previous"
        @click="goToPreviousStep"
      >
        Étape précédente
      </button>

      <button type="submit" class="fr-btn fr-btn--secondary">
        Ignorer cette étape
      </button>

      <button
        v-if="accountStore.account && accountStore.account.name"
        type="submit"
        class="fr-btn fr-btn--icon-left fr-icon-check-line"
      >
        Valider les paramètres
      </button>

      <button
        v-else
        type="submit"
        class="fr-btn fr-btn--icon-right fr-icon-arrow-right-s-line"
      >
        Étape suivante
      </button>
    </div>
  </form>
</template>

<style scoped>
.wrapper {
  max-width: 30rem;
  margin: 0 auto;
}

.checkboxes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  list-style: none;
}

.actions {
  display: flex;
  justify-content: end;
  gap: 1rem;
  flex-wrap: wrap;

  .action-previous {
    margin-inline-end: auto;
  }
}
</style>
