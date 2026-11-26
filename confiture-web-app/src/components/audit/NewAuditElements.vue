<script lang="ts" setup>
import elementForm from "@gouvfr/dsfr/dist/artwork/pictograms/document/document.svg?no-inline";
import { ref } from "vue";

import elementFrame from "../../assets/images/element-frame.svg?no-inline";
import elementMultimedia from "../../assets/images/element-multimedia.svg?no-inline";
import elementTable from "../../assets/images/element-table.svg?no-inline";
import { useAccountStore } from "../../store";
import { AuditReference, PageElements } from "../../types";
import DsfrRichCheckbox from "../ui/DsfrRichCheckbox.vue";

const LABEL = {
  [AuditReference.RGAA_4]: "Le site ou le service à auditer contient",
  [AuditReference.RGAA_5_Web]: "Le site ou le service à auditer contient",
  [AuditReference.RGAA_5_Mobile]: "L'application ou le service à auditer contient",
  [AuditReference.RGAA_5_Document]: "Le document à auditer contient"
};

const staticElements = {
  [AuditReference.RGAA_4]: [
    {
      label: "Images",
      icon: elementMultimedia,
      key: "images"
    },
    {
      label: "Cadres",
      hint: "Balise <code>&lt;iframe&gt;</code> ou <code>&lt;frame&gt;</code>",
      icon: elementFrame,
      key: "frame"
    },
    {
      label: "Multimédia",
      hint: "Vidéo, audio ou animation",
      icon: elementFrame,
      key: "multimedia"
    },
    { label: "Tableaux", icon: elementTable, key: "table" },
    { label: "Formulaires", icon: elementForm, key: "form" }

  ],
  [AuditReference.RGAA_5_Web]: [
    {
      label: "Images",
      icon: elementMultimedia,
      key: "images"
    },
    {
      label: "Cadres",
      hint: "Balise <code>&lt;iframe&gt;</code> ou <code>&lt;frame&gt;</code>",
      icon: elementFrame,
      key: "frame"
    },
    {
      label: "Multimédia",
      hint: "Vidéo, audio ou animation",
      icon: elementFrame,
      key: "multimedia"
    },
    { label: "Tableaux", icon: elementTable, key: "table" },
    { label: "Formulaires", icon: elementForm, key: "form" },
    { label: "Documentation \n et fonctionnalités d'accessibilité", icon: elementFrame, key: "documentation" },
    { label: "Outils d'édition", icon: elementFrame, key: "outils" },
    { label: "Authentification et CAPTCHA", icon: elementFrame, key: "authentification" },
    { label: "Communication en temps réel", icon: elementFrame, key: "communication" }
  ],
  [AuditReference.RGAA_5_Mobile]: [
    {
      label: "Images",
      icon: elementMultimedia,
      key: "images"
    },
    {
      label: "Multimédia",
      hint: "Vidéo, audio ou animation",
      icon: elementFrame,
      key: "multimedia"
    },
    { label: "Tableaux", icon: elementTable, key: "table" },
    { label: "Formulaires", icon: elementForm, key: "form" },
    { label: "Documentation \n et fonctionnalités d'accessibilité", icon: elementFrame, key: "documentation" },
    { label: "Outils d'édition", icon: elementFrame, key: "outils" },
    { label: "Services d'assitance", icon: elementFrame, key: "services" },
    { label: "Communication en temps réel", icon: elementFrame, key: "communication" }
  ],
  [AuditReference.RGAA_5_Document]: [
    {
      label: "Images",
      icon: elementMultimedia,
      key: "images"
    },
    { label: "Couleurs", icon: elementFrame, key: "couleurs" },
    {
      label: "Multimédia",
      hint: "Vidéo, audio ou animation",
      icon: elementFrame,
      key: "multimedia"
    },
    { label: "Tableaux", icon: elementTable, key: "table" },
    { label: "Liens", icon: elementTable, key: "liens" },
    { label: "Outils d'édition", icon: elementFrame, key: "outils" }
  ]
};

const props = defineProps<{
  pageElements: PageElements;
  auditReference: AuditReference | null;
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
    pageElements: {
      ...props.pageElements,
      ...Object.fromEntries(pageElements.value.map((el) => [el.key, el.value]))
    } as PageElements
  });
}

const pageElements = ref(
  staticElements[props.auditReference || AuditReference.RGAA_4].map((el) => ({
    ...el,
    value: props.pageElements[el.key as keyof PageElements] ?? false
  }))
);
</script>

<template>
  <form @submit.prevent="submitAuditElements">
    <div class="fr-mb-6w wrapper">
      <p class="fr-mb-2w">{{ LABEL[auditReference || AuditReference.RGAA_4] }}</p>

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

  &:deep(label) {
    white-space: pre-line;
  }
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
