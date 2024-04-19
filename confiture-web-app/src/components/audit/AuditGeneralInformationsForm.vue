<script lang="ts" setup>
import { nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useAccountStore } from "../../store/account";
import { AuditType, CreateAuditRequestData } from "../../types";
import { formatEmail } from "../../utils";
import BackLink from "../ui/BackLink.vue";
import DsfrField from "../ui/DsfrField.vue";
import TopLink from "../ui/TopLink.vue";
import AuditTypeRadio from "./AuditTypeRadio.vue";
import PagesSample from "./PagesSample.vue";

const props = defineProps<{
  defaultValues?: CreateAuditRequestData;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CreateAuditRequestData): void;
}>();

const audits = [
  {
    value: AuditType.FULL,
    goals: [
      "Identifier toutes les erreurs d’accessibilité",
      "Obtenir un taux global de conformité au RGAA ",
      "Générer une déclaration d’accessibilité"
    ],
    documentation:
      "https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/"
  },
  {
    value: AuditType.FAST,
    goals: ["Identifier les principales erreurs d’accessibilité"],
    documentation: "https://design.numerique.gouv.fr/outils/audit-rapide/"
  },
  {
    value: AuditType.COMPLEMENTARY,
    goals: ["Approfondir l’audit 25 critères avec 25 critères supplémentaires"],
    documentation:
      "https://design.numerique.gouv.fr/outils/audit-complementaire/"
  }
];

const fullDefaultPages = [
  { name: "Accueil", url: "" },
  { name: "Contact", url: "" },
  { name: "Mentions légales", url: "" },
  { name: "Accessibilité", url: "" },
  { name: "Plan du site", url: "" },
  { name: "Aide", url: "" },
  { name: "Authentification", url: "" }
];

const fastAndComplementaryDefaultPages = [
  { name: "Accueil", url: "" },
  { name: "Contact", url: "" }
];

const pagesArePristine = ref(!props.defaultValues?.pages);

const accountStore = useAccountStore();

const auditType = ref(props.defaultValues?.auditType ?? null);
const procedureName = ref(props.defaultValues?.procedureName ?? "");
const pages = ref(props.defaultValues?.pages ?? fullDefaultPages);
const procedureAuditorName = ref(
  props.defaultValues?.auditorName ?? accountStore.account?.name ?? ""
);
const procedureAuditorEmail = ref(
  props.defaultValues?.auditorEmail ?? accountStore.account?.email ?? ""
);

// Update default pages except if pages has been changed by user
watch(auditType, (newValue) => {
  if (
    (newValue === AuditType.FAST || newValue === AuditType.COMPLEMENTARY) &&
    pagesArePristine.value
  ) {
    pages.value = [...fastAndComplementaryDefaultPages];
  }

  if (newValue === AuditType.FULL && pagesArePristine.value) {
    pages.value = [...fullDefaultPages];
  }
});

const pagesSampleRef = ref<InstanceType<typeof PagesSample>>();
/**
 * Create a new page and focus its name field.
 */
async function addPage() {
  pages.value.push({ name: "", url: "" });
  await nextTick();
  pagesSampleRef.value?.focusLastField();
}

function onSubmit() {
  emit("submit", {
    auditType: auditType.value!,
    procedureName: procedureName.value,
    pages: pages.value.map((p) => ({ ...p, url: p.url })),
    auditorName: procedureAuditorName.value,
    auditorEmail: formatEmail(procedureAuditorEmail.value)
  });
}

const route = useRoute();
</script>

<template>
  <BackLink
    label="Retourner à mon audit"
    :to="{
      name: 'audit-generation',
      params: { uniqueId: route.params.uniqueId }
    }"
  />

  <form class="content" @submit.prevent="onSubmit">
    <h1 class="fr-mb-6w">Paramètres de l’audit</h1>

    <DsfrField
      id="procedure-name"
      v-model="procedureName"
      class="fr-mb-6w"
      label="Nom du site audité"
      required
    />

    <h2 class="fr-h4 fr-mb-3w">Type d’audit</h2>
    <div class="fr-mb-4w audits">
      <AuditTypeRadio
        v-for="type in audits"
        :key="type.value"
        v-model="auditType"
        class="audit-type"
        :value="type.value"
        :checked="auditType === type.value"
        :goals="type.goals"
        :documentation-link="type.documentation"
      />
    </div>

    <h2 class="fr-h4">Échantillon des pages à auditer</h2>
    <PagesSample ref="pagesSampleRef" v-model="pages" />
    <button
      class="fr-btn fr-btn--icon-left fr-icon-add-line fr-btn--secondary fr-mt-4w fr-mb-6w"
      type="button"
      @click="addPage"
    >
      Ajouter une page
    </button>

    <fieldset
      v-if="!accountStore.account"
      class="fr-p-0 fr-mt-4w auditor-fields"
    >
      <legend>
        <h2 class="fr-h4">Informations personnelles</h2>
      </legend>

      <DsfrField
        id="procedure-auditor-name"
        v-model="procedureAuditorName"
        label="Prénom et nom (optionnel)"
        hint="Sera affiché dans le rappport de l’audit pour aider le demandeur de l’audit à vous identifier s’il a des questions ou besoin d’aide."
      />

      <DsfrField
        id="procedure-auditor-email"
        v-model="procedureAuditorEmail"
        class="fr-mb-0"
        label="Adresse e-mail"
        hint="Permet de vous envoyer les liens de l’audit et du rapport d’audit."
        type="email"
        required
      />
    </fieldset>

    <div>
      <button class="fr-btn fr-mt-6w" type="submit">
        Enregistrer les modifications
      </button>

      <RouterLink
        v-if="route.name !== 'create-audit'"
        class="fr-btn fr-btn--tertiary-no-outline fr-ml-2w"
        :to="{
          name: 'audit-generation',
          params: { uniqueId: route.params.uniqueId }
        }"
      >
        Annuler
      </RouterLink>
    </div>

    <div class="top-link">
      <TopLink class="fr-ml-auto" />
    </div>
  </form>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
  margin: 0 auto;
}

.mandatory-notice {
  color: var(--text-mention-grey);
}

.audits {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.audit-type {
  flex: 1 1 0;
}

.page-card {
  border: 1px solid var(--border-default-grey);
}

.page-legend {
  float: left;
  /* FIXME: hack to align */
  margin-top: 0.375rem;
}

.page-right-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  float: right;
}

.auditor-fields {
  border: none;
  max-width: 33rem;
}

.top-link {
  display: flex;
  justify-content: end;
}
</style>
