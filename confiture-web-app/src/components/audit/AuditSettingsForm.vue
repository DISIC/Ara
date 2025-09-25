<script lang="ts" setup>
import { computed, nextTick, ref, toRaw, watch } from "vue";
import { useRoute } from "vue-router";

import { usePreviousRoute } from "../../composables/usePreviousRoute";
import { EMAIL, REQUIRED, useFormField, validate } from "../../composables/validation";
import router from "../../router";
import { useAccountStore } from "../../store/account";
import { AuditPage, AuditType, CreateAuditRequestData } from "../../types";
import { formatEmail } from "../../utils";
import BackLink from "../ui/BackLink.vue";
import DsfrField from "../ui/DsfrField.vue";
import TopLink from "../ui/TopLink.vue";
import AuditTypeRadio from "./AuditTypeRadio.vue";
import PagesSample from "./PagesSample.vue";

const props = defineProps<{
  audit: CreateAuditRequestData;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    payload: {
      auditType: AuditType;
      procedureName: string;
      pages: Omit<AuditPage, "id" | "order">[];
      auditorName: string;
      auditorEmail: string;
    }
  ): void;
  (e: "change"): void;
}>();

defineExpose({
  onSubmit
});

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

const route = useRoute();
const previousRoute = usePreviousRoute();
const accountStore = useAccountStore();

const auditType = ref(props.audit?.auditType);
const procedureName = useFormField(props.audit?.procedureName || "", [REQUIRED("Champ obligatoire. Saisissez le nom du site ou du service à auditer.")]);
const pages = ref(structuredClone(toRaw(props.audit?.pages)));
const auditorEmail = useFormField(props.audit?.auditorEmail || "", [
  REQUIRED("Champ obligatoire. Saisissez votre adresse e-mail."),
  EMAIL(
    "Le format de l’adresse e-mail est incorrect. Veuillez saisir une adresse e-mail au format : nom@domaine.fr"
  )
]);
const auditorName = ref(props.audit?.auditorName ?? "");

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
  const isValid = [
    validate(auditorEmail),
    pagesSampleRef.value?.validate(),
    validate(procedureName)
  ].every(Boolean);
  if (!isValid) {
    return;
  }

  emit("submit", {
    auditType: auditType.value!,
    procedureName: procedureName.value.value,
    pages: pages.value.map((p) => ({ ...p, url: p.url })),
    auditorName: auditorName.value,
    auditorEmail: formatEmail(auditorEmail.value.value)
  });
}

watch(
  pages,
  () => {
    emit("change");
  },
  { deep: true }
);
const backLinkLabel = computed(() => {
  switch (previousRoute.route?.name) {
    case "account-dashboard":
      return "Retourner à mes audits";
    case "audit-overview":
      return "Retourner au tableau de bord de l’audit";
    default:
      return "Retourner à mon audit";
  }
});
</script>

<template>
  <BackLink
    :label="backLinkLabel"
    :to="{
      name: previousRoute.route?.name || 'audit-generation',
      params: {
        ...previousRoute.route?.params,
        uniqueId: route.params.uniqueId
      }
    }"
  />

  <form class="content" novalidate @submit.prevent="onSubmit">
    <h1 class="fr-mb-6w">Paramètres de l’audit</h1>
    <p class="fr-text--sm fr-mb-4w notice">
      Sauf mentions contraires, tous les champs sont obligatoires.
    </p>

    <DsfrField
      id="procedure-name"
      :ref="procedureName.refFn"
      class="fr-mb-6w"
      label="Nom du site ou du service audité"
      hint="Exemples : Service-Public, Demande de permis de conduire"
      required
      :model-value="procedureName.value.value"
      :error="procedureName.error.value"
      @update:model-value="emit('change'); procedureName.value.value = $event"
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
        @update:model-value="emit('change')"
      />
    </div>

    <h2 class="fr-h4">Échantillon des pages à auditer</h2>
    <PagesSample ref="pagesSampleRef" v-model="pages" class="fr-mb-3w" />

    <div class="fr-mb-6w add-page-button-wrapper">
      <button
        type="button"
        class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line fr-px-8w"
        @click="addPage"
      >
        Ajouter une page
      </button>
    </div>

    <fieldset
      v-if="!accountStore.account"
      class="fr-p-0 fr-mt-4w auditor-fields"
    >
      <legend>
        <h2 class="fr-h4">Informations personnelles</h2>
      </legend>

      <DsfrField
        id="procedure-auditor-name"
        v-model="auditorName"
        label="Prénom et nom (optionnel)"
        hint="Sera affiché dans le rapport d’audit pour permettre à la personne qui a demandé l’audit de vous identifier en cas de question."
        @update:model-value="emit('change')"
      />

      <DsfrField
        id="procedure-auditor-email"
        :ref="auditorEmail.refFn"
        :model-value="auditorEmail.value.value"
        class="fr-mb-0"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        :error="auditorEmail.error.value"
        @update:model-value="emit('change'); auditorEmail.value.value = $event"
      />
    </fieldset>

    <div>
      <button class="fr-btn fr-mt-6w" type="submit">
        Enregistrer les modifications
      </button>

      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-ml-2w"
        @click="router.back()"
      >
        Annuler
      </button>
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

.notice {
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

.add-page-button-wrapper {
  text-align: center;
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
