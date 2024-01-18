<script lang="ts" setup>
import { nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useDevMode } from "../../composables/useDevMode";
import { useNotifications } from "../../composables/useNotifications";
import { usePreviousRoute } from "../../composables/usePreviousRoute";
import { useAccountStore } from "../../store/account";
import { AuditType, CreateAuditRequestData } from "../../types";
import { formatEmail } from "../../utils";
import AuditTypeRadio from "./AuditTypeRadio.vue";
import BackLink from "../ui/BackLink.vue";
import DsfrField from "../ui/DsfrField.vue";

const props = defineProps<{
  defaultValues?: CreateAuditRequestData;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CreateAuditRequestData): void;
}>();

const fullAudit = {
  value: AuditType.FULL,
  goals: [
    {
      emoji: "🔎",
      label: "Identifier toutes les erreurs d’accessibilité"
    },
    {
      emoji: "📊",
      label: "Obtenir un taux global de conformité au RGAA "
    },
    {
      emoji: "📄",
      label: "Générer une déclaration d’accessibilité"
    }
  ],
  documentation:
    "https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/"
};
const partialAudits = [
  {
    value: AuditType.FAST,
    goals: [
      {
        emoji: "🔎",
        label: "Identifier les principales erreurs d’accessibilité"
      }
    ],
    documentation: "https://design.numerique.gouv.fr/outils/audit-rapide/"
  },
  {
    value: AuditType.COMPLEMENTARY,
    goals: [
      {
        emoji: "🔎",
        label:
          "Approfondir l’audit 25 critères avec 25 critères supplémentaires"
      }
    ],
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

const pageNameFieldRefs = ref<InstanceType<typeof DsfrField>[]>([]);

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

  if (pagesArePristine.value) {
    pagesArePristine.value = false;
  }
}

/**
 * TODO:
 * Si les pages sont adjacentes : D échange avec A.
    Si D < A, D prend la place de A et toutes le pages entre D et A (A comprise) remontent d'une place.
    Si D > A, D prend la place de A et toutes le pages entre D et A (A comprise) descendent d'une place.
 */
function updatePageOrder(startIndex: number, endIndex: number) {
  console.log(startIndex);
  console.log(endIndex);
}

/**
 * Dev function to avoid filling all fields manually
 */
function fillFields() {
  pagesArePristine.value = false;
  auditType.value = AuditType.FULL;
  procedureName.value = "Ma procédure";
  pages.value = [
    { name: "Accueil", url: "https://example.com" },
    { name: "Contact", url: "https://example.com/contact" }
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
    auditorEmail: formatEmail(procedureAuditorEmail.value)
  });
}

const isDevMode = useDevMode();
const notify = useNotifications();
const route = useRoute();
const previousRoute = usePreviousRoute();
</script>

<template>
  <template v-if="accountStore.account">
    <BackLink
      v-if="previousRoute.route?.name === 'account-dashboard'"
      label="Retourner à mes audits"
      :to="{ name: 'account-dashboard' }"
    />
    <BackLink
      v-if="previousRoute.route?.name === 'audit-generation'"
      label="Retourner à mon audit"
      :to="{
        name: 'audit-generation',
        params: { uniqueId: route.params.uniqueId }
      }"
    />
  </template>

  <form class="narrow-content" @submit.prevent="onSubmit">
    <h1 class="fr-mb-3v">
      <span aria-hidden="true">⚙️</span> Paramètres de l’audit
    </h1>
    <p class="fr-text--sm fr-mb-4w mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <h2 class="fr-h4 fr-mb-3w">Type d’audit</h2>
    <h3 class="fr-text--lg fr-mb-1v">Audit complet</h3>
    <p class="fr-mb-2w">
      Cet audit permet de mesurer la conformité au RGAA d’un site internet, il a
      une <strong>valeur légale</strong>.
    </p>
    <AuditTypeRadio
      :key="fullAudit.value"
      v-model="auditType"
      class="fr-mb-3w audit-type"
      :value="fullAudit.value"
      :checked="auditType === fullAudit.value"
      :goals="fullAudit.goals"
      :documentation-link="fullAudit.documentation"
    />
    <h3 class="fr-text--lg fr-mb-1v">Audits partiels</h3>
    <p class="fr-mb-2w">
      Ces audits permettent d’estimer l’accessibilité d’un site internet, ils
      n’ont <strong>pas de valeur légale</strong>.
    </p>

    <div class="partial-audit-radios">
      <AuditTypeRadio
        v-for="type in partialAudits"
        :key="type.value"
        v-model="auditType"
        class="audit-type"
        :value="type.value"
        :checked="auditType === type.value"
        :goals="type.goals"
        :documentation-link="type.documentation"
      />
    </div>

    <DsfrField
      id="procedure-name"
      v-model="procedureName"
      class="fr-my-6w"
      label="Nom du site à auditer"
      required
    />

    <h2 class="fr-h4">Échantillon des pages à auditer</h2>

    <p v-if="!auditType || auditType === AuditType.FULL" class="fr-mb-2w">
      Par défaut nous vous proposons les pages obligatoires prévues par le RGAA.
    </p>

    <fieldset
      v-for="(page, i) in pages"
      :key="i"
      class="fr-p-4w page-card"
      :class="{ 'fr-mb-4w': i !== pages.length - 1 }"
    >
      <legend class="page-legend">
        <h3 class="fr-h6 fr-mb-0">Page {{ i + 1 }}</h3>
      </legend>

      <div class="page-right-actions">
        <button
          class="fr-btn fr-btn--icon-left fr-icon-delete-line fr-btn--tertiary-no-outline page-delete-button"
          type="button"
          :disabled="pages.length === 1"
          data-cy="delete"
          @click="deletePage(i)"
        >
          Supprimer
          <span class="sr-only">la page {{ i + 1 }}</span>
        </button>

        <div class="fr-select-group fr-mb-0">
          <label class="fr-label sr-only" for="select">
            Position de la page
          </label>
          <select
            id="select"
            class="fr-select fr-mt-0"
            name="select"
            @change="
              updatePageOrder(
                i,
                Number(($event.target as HTMLSelectElement).value) - 1
              )
            "
          >
            <option
              v-for="(_, j) in pages"
              :key="j"
              :value="j + 1"
              :selected="i === j"
            >
              Position {{ j + 1 }} sur {{ pages.length }}
            </option>
          </select>
        </div>
      </div>

      <DsfrField
        :id="`page-name-${i + 1}`"
        ref="pageNameFieldRefs"
        v-model="page.name"
        label="Nom de la page"
        class="fr-mt-7w"
        @change="pagesArePristine = false"
      />

      <DsfrField
        :id="`page-url-${i + 1}`"
        v-model="page.url"
        label="URL de la page"
        type="url"
        required
        @change="pagesArePristine = false"
      >
        <template #hint>
          L’URL de la page doit commencer par <code>https://</code>
        </template>
      </DsfrField>
    </fieldset>
    <button
      class="fr-btn fr-btn--icon-left fr-icon-add-line fr-btn--secondary fr-mt-4w fr-mb-6w"
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
        v-if="route.name !== 'create-audit'"
        class="fr-btn fr-btn--tertiary-no-outline fr-ml-2w"
        type="button"
        @click="$router.back()"
      >
        Annuler
      </button>
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

.partial-audit-radios {
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
}
</style>
