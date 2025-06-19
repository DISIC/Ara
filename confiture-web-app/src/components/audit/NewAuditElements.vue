<script lang="ts" setup>
import { ref } from "vue";

// TODO: handle dark mode illustrations: https://www.systeme-de-design.gouv.fr/fondamentaux/pictogramme
import elementForm from "../../assets/images/element-form.svg";
import elementFrame from "../../assets/images/element-frame.svg";
import elementMultimedia from "../../assets/images/element-multimedia.svg";
import elementTable from "../../assets/images/element-table.svg";
import { useAccountStore } from "../../store";
import DsfrRichCheckbox from "../ui/DsfrRichCheckbox.vue";

const emit = defineEmits<{
  (e: "previous"): void;
  (e: "submit", payload: { pages: [] }): void;
}>();

const accountStore = useAccountStore();

function goToPreviousStep() {
  emit("previous");
}

function submitAuditElements() {
  emit("submit", { pages: [] });
}

const elements = ref([
  {
    label: "Multimédia",
    hint: "Vidéo, audio ou animation",
    icon: elementMultimedia,
    value: true
  },
  { label: "Tableau", icon: elementTable, value: true },
  { label: "Formulaire", icon: elementForm, value: true },
  {
    label: "Cadre",
    hint: "Balise <iframe> ou <frame>",
    icon: elementFrame,
    value: true
  }
]);
</script>

<template>
  <form @submit.prevent="submitAuditElements">
    <div class="fr-mb-6w wrapper">
      <p class="fr-mb-1w">Le site ou service à auditer contient :</p>

      <p class="fr-text--xs fr-mb-2w notice">
        Votre sélection rendra certaines thématiques de l’audit non applicables
        sur toutes les pages de votre échantillon. Vous pourrez modifier votre
        choix à tout moment.
      </p>

      <div class="checkboxes">
        <DsfrRichCheckbox
          v-for="(el, i) in elements"
          id="test"
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
        class="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-arrow-left-s-line action-previous"
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

  .action-previous {
    margin-inline-end: auto;
  }
}
</style>
