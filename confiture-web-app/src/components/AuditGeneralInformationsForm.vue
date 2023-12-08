<script lang="ts" setup>
import { nextTick, ref } from "vue";

import { useDevMode } from "../composables/useDevMode";
import { useNotifications } from "../composables/useNotifications";
import { useRoute } from "vue-router";
import { AuditType, CreateAuditRequestData } from "../types";
import AuditTypeRadio from "./AuditTypeRadio.vue";
import DsfrField from "./DsfrField.vue";
import { formatEmail } from "../utils";
import { useAccountStore } from "../store/account";

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
    description:
      "25 critères du RGAA absolument essentiels. L’évaluation de ces critères nécessite malgré tout une bonne connaissance du RGAA.",
  },
  {
    label: "Complémentaire",
    value: AuditType.COMPLEMENTARY,
    description:
      "50 critères dont les 25 critères de l’audit rapide. Permet de donner une idée plus précise de l’accessibilité numérique de votre service.",
  },
  {
    label: "Complet, de conformité",
    value: AuditType.FULL,
    description:
      "L’audit complet dit de conformité est le seul audit ayant une valeur légale et permettant de générer une <strong>déclaration d’accessibilité</strong>.",
    highlighted: true,
  },
];

const accountStore = useAccountStore();

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
  ],
);
const procedureAuditorName = ref(
  props.defaultValues?.auditorName ?? accountStore.account?.name ?? "",
);
const procedureAuditorEmail = ref(
  props.defaultValues?.auditorEmail ?? accountStore.account?.email ?? "",
);

const pageNameFieldRefs = ref<InstanceType<typeof DsfrField>[]>([]);

/**
 * Create a new page and focus its name field.
 */
async function addPage() {
  pages.value.push({ name: "", url: "" });
  await nextTick();
  const lastField = pageNameFieldRefs.value[pageNameFieldRefs.value.length - 1];
  lastField.inputRef?.focus();
}

/**
 * Delete page at index and focus previous or first name field.
 * @param {number} i
 */
async function deletePage(i: number) {
  const pageName = pages.value[i].name;
  pages.value.splice(i, 1);
  await nextTick();
  const previousField =
    i === 0 ? pageNameFieldRefs.value[0] : pageNameFieldRefs.value[i - 1];
  notify("success", `La page ${pageName ? pageName : ""} a bien été supprimée`);
  previousField.inputRef?.focus();
}

/**
 * Dev function to avoid filling all fields manually
 */
function fillFields() {
  auditType.value = AuditType.FULL;
  procedureName.value = "Ma procédure";
  pages.value = [
    { name: "Accueil", url: "https://example.com" },
    { name: "Contact", url: "https://example.com/contact" },
  ];

  if (!accountStore.account) {
    procedureAuditorName.value = "Etienne Dupont";
    procedureAuditorEmail.value = "etienne-dupont@example.com";
  }
}

function onSubmit() {
  emit("submit", {
    auditType: auditType.value!,
    procedureName: procedureName.value,
    // remove leading/trailing whitespaces from urls, the browser valifation might accept those our backend won't !
    pages: pages.value.map((p) => ({ ...p, url: p.url.trim() })),
    auditorName: procedureAuditorName.value,
    auditorEmail: formatEmail(procedureAuditorEmail.value),
  });
}

const isDevMode = useDevMode();
const notify = useNotifications();
const route = useRoute();
</script>

<template>
  <form @submit.prevent="onSubmit">
    <h1 class="fr-mb-3v">
      <span aria-hidden="true">⚙️</span> Paramètres de l’audit
    </h1>
    <p class="fr-text--sm fr-mb-4w mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <section class="fr-form-group">
      <fieldset class="fr-fieldset">
        <legend id="radio-rich-legend" class="fr-fieldset__legend">
          <h2 class="fr-h4 fr-mb-2w">Type d’audit</h2>
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
            :description="type.description"
            :highlighted="type.highlighted"
          />
        </div>
      </fieldset>
    </section>

    <div class="narrow-content">
      <DsfrField
        id="procedure-name"
        v-model="procedureName"
        class="fr-my-6w"
        label="Nom du site à auditer"
        required
      />

      <h2 class="fr-h4">Les pages et URL à auditer</h2>

      <fieldset
        v-for="(page, i) in pages"
        :key="i"
        class="fr-mt-4w fr-p-4w page-card"
      >
        <legend class="page-legend">
          <h3 class="fr-h6 fr-mb-0">Page {{ i + 1 }}</h3>
        </legend>

        <button
          class="fr-btn fr-btn--tertiary-no-outline page-delete-button"
          type="button"
          :disabled="pages.length === 1"
          @click="deletePage(i)"
        >
          Supprimer
          <span class="sr-only">la page {{ i + 1 }}</span>
        </button>

        <DsfrField
          :id="`page-name-${i + 1}`"
          ref="pageNameFieldRefs"
          v-model="page.name"
          label="Nom de la page"
          class="fr-mt-2w page-field"
        />

        <DsfrField
          :id="`page-url-${i + 1}`"
          v-model="page.url"
          label="URL de la page"
          type="url"
          required
          class="page-field"
        >
          <template #hint>
            L’URL de la page doit commencer par <code>https://</code>
          </template>
        </DsfrField>
      </fieldset>
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-mt-2w fr-mb-6w"
        type="button"
        @click="addPage"
      >
        Ajouter une page
      </button>

      <fieldset
        v-if="!accountStore.account?.name || !accountStore.account?.email"
        class="fr-p-0 auditor-fields"
      >
        <legend>
          <h2 class="fr-h4 fr-mb-2w">Auditeur ou auditrice</h2>
        </legend>

        <DsfrField
          v-if="!accountStore.account?.name"
          id="procedure-auditor-name"
          v-model="procedureAuditorName"
          label="Prénom et nom (optionnel)"
          hint="Sera affiché dans le rappport de l’audit pour aider le demandeur de l’audit à vous identifier s’il a des questions ou besoin d’aide."
        />

        <DsfrField
          v-if="!accountStore.account?.email"
          id="procedure-auditor-email"
          v-model="procedureAuditorEmail"
          class="fr-mb-0"
          label="Adresse e-mail"
          hint="Permet de vous envoyer les liens de l’audit et du rapport d’audit."
          type="email"
          required
        />
      </fieldset>

      <div v-if="isDevMode">
        <button class="fr-btn fr-mt-4w" type="button" @click="fillFields">
          [DEV] Remplir les champs
        </button>
      </div>

      <div>
        <button class="fr-btn fr-mt-4w" type="submit">
          Valider les paramètres
        </button>

        <button
          v-if="route.name !== 'new-audit-step-one'"
          class="fr-btn fr-btn--tertiary-no-outline fr-ml-2w"
          type="button"
          @click="$router.back()"
        >
          Annuler
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.narrow-content {
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
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
}

.page-legend {
  float: left;
}

.page-delete-button {
  justify-self: end;
}

.page-field {
  grid-column: 1 / -1;
}

.auditor-fields {
  border: none;
}
</style>
