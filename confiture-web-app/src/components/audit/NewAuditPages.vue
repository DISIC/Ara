<script lang="ts" setup>
import { nextTick, ref, watch } from "vue";
import { AuditPage } from "../../types";
import PagesSample from "../audit/PagesSample.vue";
import { useDevMode } from "../../composables/useDevMode";
import { useAccountStore } from "../../store";

const props = defineProps<{
  pages: Omit<AuditPage, "id" | "order">[];
}>();

const emit = defineEmits<{
  (e: "previous"): void;
  (e: "submit", payload: Omit<AuditPage, "id" | "order">[]): void;
  (e: "change"): void;
}>();

const accountStore = useAccountStore();

const pages = ref(props.pages);

function goToPreviousStep() {
  emit("previous");
}

const pagesSampleRef = ref<InstanceType<typeof PagesSample>>();
/**
 * Create a new page and focus its name field.
 */
async function addPage() {
  pages.value.push({ name: "", url: "" });
  await nextTick();
  pagesSampleRef.value?.focusLastField();
}

function submitAuditPages() {
  emit("submit", pages.value);
}

watch(
  pages,
  () => {
    emit("change");
  },
  { deep: true }
);

// Dev mode
const isDevMode = useDevMode();

function fillSettings() {
  pages.value = [
    { name: "Accueil", url: "https://example.com" },
    { name: "Contact", url: "https://example.com/contact" }
  ];
}
</script>

<template>
  <form @submit.prevent="submitAuditPages">
    <div v-if="isDevMode" class="fr-mb-4w">
      <button class="fr-btn" type="button" @click="fillSettings">
        [DEV] Remplir les paramètres
      </button>
    </div>

    <p class="fr-text--sm notice">
      Sauf mentions contraires, tous les champs sont obligatoires. Au moins une
      page à auditer doit être renseignée.
    </p>

    <p class="fr-mb-2w">
      Par défaut nous vous proposons les pages obligatoires prévues par le RGAA
      quand elles sont disponibles sur le site à auditer.
    </p>

    <PagesSample ref="pagesSampleRef" v-model="pages" class="fr-mb-3w" />

    <div class="fr-mb-6w add-page-button-wrapper">
      <button
        type="button"
        class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line"
        @click="addPage"
      >
        Ajouter une page
      </button>
    </div>

    <div class="actions">
      <button
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-arrow-left-s-line"
        @click="goToPreviousStep"
      >
        Étape précédente
      </button>
      <button
        type="submit"
        class="fr-btn fr-btn--icon-right fr-icon-arrow-right-s-line"
      >
        {{
          accountStore.account && accountStore.account.name
            ? "Valider les paramètres"
            : "Étape suivante"
        }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.notice {
  color: var(--text-mention-grey);
}

.add-page-button-wrapper {
  text-align: center;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
