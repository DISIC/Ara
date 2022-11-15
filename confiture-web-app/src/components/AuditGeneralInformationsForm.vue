<script lang="ts" setup>
import { nextTick, ref } from "vue";
import { useDevMode } from "../composables/useDevMode";
import { AuditType, CreateAuditRequestData } from "../types";
import AuditTypeRadio from "./AuditTypeRadio.vue";

const props = defineProps<{
  defaultValues?: CreateAuditRequestData;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CreateAuditRequestData): void;
}>();

const availableAuditTypes = [
  {
    label: "Rapide",
    value: AuditType.FAST,
  },
  {
    label: "Complémentaire",
    value: AuditType.COMPLEMENTARY,
  },
  {
    label: "Complet",
    value: AuditType.FULL,
  },
];

const auditType = ref(props.defaultValues?.auditType ?? null);
const procedureName = ref(props.defaultValues?.procedureName ?? "");
const pages = ref(
  props.defaultValues?.pages ?? [
    { name: "Accueil", url: "" },
    { name: "Contact", url: "" },
    { name: "Mentions légales", url: "" },
    { name: "Accessibilité", url: "" },
    { name: "Plan du site", url: "" },
    { name: "Aide", url: "" },
    { name: "Authentification", url: "" },
  ]
);
const procedureAuditorName = ref(props.defaultValues?.auditorName ?? "");
const procedureAuditorEmail = ref(props.defaultValues?.auditorEmail ?? "");
const procedureAuditorOrganisation = ref(
  props.defaultValues?.auditorOrganisation ?? ""
);
const pageNameRefs = ref<HTMLInputElement[]>([]);

/**
 * Create a new page and focus its name field.
 */
async function addPage() {
  pages.value.push({ name: "", url: "" });
  await nextTick();
  const lastInput = pageNameRefs.value[pageNameRefs.value.length - 1];
  lastInput.focus();
}

/**
 * Delete page at index and focus previous or first name field.
 * @param {number} i
 */
async function deletePage(i: number) {
  pages.value.splice(i, 1);
  await nextTick();
  const previousInput =
    i === 0 ? pageNameRefs.value[0] : pageNameRefs.value[i - 1];
  previousInput.focus();
}

/**
 * TODO: remove this
 * Dev function to avoid filling all fields manually
 */
function fillFields() {
  auditType.value = AuditType.FULL;
  procedureName.value = "Ma procédure";
  pages.value = [
    { name: "Accueil", url: "https://example.com" },
    { name: "Contact", url: "https://example.com/contact" },
  ];
  procedureAuditorName.value = "Etienne Dupont";
  procedureAuditorEmail.value = "etienne-dupont@example.com";
  procedureAuditorOrganisation.value = "Example Organisation";
}

function onSubmit() {
  emit("submit", {
    auditType: auditType.value!,
    procedureName: procedureName.value,
    pages: pages.value,
    auditorName: procedureAuditorName.value,
    auditorEmail: procedureAuditorEmail.value,
    auditorOrganisation: procedureAuditorOrganisation.value,
  });
}

const isDevMode = useDevMode();
</script>

<template>
  <form class="content" @submit.prevent="onSubmit">
    <h1 class="fr-mb-3v"><span aria-hidden="true">⚙️</span> Paramètres de l’audit</h1>
    <p class="fr-text--sm fr-mb-4w mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <section class="fr-form-group">
      <fieldset class="fr-fieldset">
        <legend id="radio-rich-legend" class="fr-fieldset__legend">
          <h2 class="fr-h4 fr-mb-0">Type d’audit</h2>
        </legend>
        <div class="fr-fieldset__content audit-types">
          <AuditTypeRadio
            v-for="type in availableAuditTypes"
            :key="type.value"
            v-model="auditType"
            class="audit-type"
            :value="type.value"
            :label="type.label"
            :checked="auditType === type.value"
          />
        </div>
      </fieldset>
    </section>

    <div class="fr-input-group">
      <label class="fr-label" for="procedure-name">
        Nom du site à auditer
      </label>
      <input
        id="procedure-name"
        v-model="procedureName"
        class="fr-input"
        type="text"
        required
      />
    </div>

    <h2 class="fr-h4">Les pages et URL à auditer</h2>

    <fieldset
      v-for="(page, i) in pages"
      :key="i"
      class="fr-fieldset fr-mt-4w fr-p-4w page-card"
    >
      <div class="fr-mb-2w page-header">
        <legend>
          <h3 class="fr-h6 fr-mb-0">Page {{ i + 1 }}</h3>
        </legend>

        <button
          class="fr-btn fr-btn--tertiary-no-outline"
          type="button" 
          :disabled="pages.length === 1"
           :aria-label="`Supprimer page ${i + 1}`" 
          @click="deletePage(i)"
        >
          Supprimer
        </button>
      </div>

      <div class="fr-input-group">
        <label class="fr-label" :for="`page-name-${i + 1}`">
          Nom de la page
        </label>
        <input
          :id="`page-name-${i + 1}`"
          ref="pageNameRefs"
          v-model="page.name"
          class="fr-input"
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" :for="`page-url-${i + 1}`">
          URL de la page
        </label>
        <input
          :id="`page-url-${i + 1}`"
          v-model="page.url"
          class="fr-input"
          type="url"
          required
          placeholder="http://"
        />
      </div>
    </fieldset>
    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-mt-4w fr-mb-5w"
      type="button"
      @click="addPage"
    >
      Ajouter une page
    </button>

    <fieldset class="fr-fieldset fr-mt-6w fr-mb-4w">
      <legend>
        <h2 class="fr-h4 fr-mb-2w">Auditeur</h2>
      </legend>

      <div class="fr-input-group">
        <label for="procedure-auditor-organisation" class="fr-label">
          Nom de la structure qui réalise l'audit
        </label>
        <input
          id="procedure-auditor-organisation"
          v-model="procedureAuditorOrganisation"
          class="fr-input"
          required
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="procedure-auditor-name">
          Nom et prénom de l’auditeur (optionnel)
          <span class="fr-hint-text">
            Permet au demandeur de l’audit de plus facilement vous identifier s'il a des questions ou besoin d’aide.
            <br />
          </span>
        </label>
        <input
          id="procedure-auditor-name"
          v-model="procedureAuditorName"
          class="fr-input"
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="procedure-auditor-email">
          Adresse e-mail de la structure ou de l’auditeur
          <span class="fr-hint-text">
            Permet de vous envoyer le futur lien administrateur de l’audit et le
            lien du rapport d’audit.
            <br />
          </span>
        </label>
        <input
          id="procedure-auditor-email"
          v-model="procedureAuditorEmail"
          class="fr-input"
          type="email"
          required
        />
      </div>
    </fieldset>

    <div v-if="isDevMode">
      <button
        class="fr-btn fr-mt-6w fr-mr-2w"
        type="button"
        @click="fillFields"
      >
        [DEV] Remplir les champs
      </button>
    </div>

    <div>
      <button class="fr-btn fr-mt-6w" type="submit">Commencer l'audit</button>
    </div>
  </form>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}

.mandatory-notice {
  color: var(--text-mention-grey);
}

.audit-types {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.audit-type {
  flex: 1 1 0;
}

.page-card {
  border: 1px solid var(--border-default-grey);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
