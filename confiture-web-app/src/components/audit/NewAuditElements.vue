<script lang="ts" setup>
import { ref } from "vue";

// TODO: handle dark mode illustrations: https://www.systeme-de-design.gouv.fr/fondamentaux/pictogramme
import elementForm from "../../assets/images/element-form.svg";
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
    hint: "Balise <iframe> ou <frame>",
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
      <p class="fr-mb-1w">Le site ou service à auditer contient :</p>

      <p class="fr-text--xs fr-mb-2w notice">
        Votre sélection rendra certaines thématiques de l’audit non applicables
        sur toutes les pages de votre échantillon.
      </p>

      <div class="checkboxes">
        <DsfrRichCheckbox
          v-for="(el, i) in pageElements"
          :id="`element-${el.key}`"
          :key="i"
          v-model="el.value"
          :label="el.label"
          :hint="el.hint"
          :icon-src="el.icon"
        />
      </div>
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

.notice {
  color: var(--text-mention-grey);
}

.checkboxes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
