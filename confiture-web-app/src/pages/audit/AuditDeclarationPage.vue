<script lang="ts" setup>
import { computed, ref, toRaw, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import TestEnvironmentSelection from "../../components/audit/TestEnvironmentSelection/TestEnvironmentSelection.vue";
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import DsfrField from "../../components/ui/DsfrField.vue";
import TagListField from "../../components/ui/TagListField.vue";
import TopLink from "../../components/ui/TopLink.vue";
import { useDevMode } from "../../composables/useDevMode";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import {
  ARRAY_LENGTH,
  EMAIL,
  REQUIRED,
  URL,
  useFormField,
  validate
} from "../../composables/validation";
import {
  AssistiveTechnology,
  Browsers,
  OperatingSystem,
  Platform
} from "../../enums";
import { useAccountStore, useAuditStore } from "../../store";
import { AuditEnvironment, UpdateAuditRequestData } from "../../types";
import { formatEmail, URL_REGEX } from "../../utils";

const route = useRoute();
const uniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();
const accountStore = useAccountStore();
useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));

// const technologies = ref<string[]>([]);
const technologies = useFormField([] as string[], [ARRAY_LENGTH(1, "Indiquez les technologies utilisées sur le site.")]);

const customTools = ref<string[]>([]);
const defaultTools = ref<string[]>([]);

const tools = computed(() => {
  return [...defaultTools.value, ...customTools.value].filter(Boolean);
});

const toolsSectionRef = ref<HTMLDivElement>();
const toolsSectionError = ref<string>();

function validateTools() {
  toolsSectionError.value = undefined;
  if (tools.value.length === 0) {
    toolsSectionError.value = "Indiquez les outils d’assistance utilisés pour vérifier l’accessibilité.";
    toolsSectionRef.value?.focus();
    return false;
  }
  return true;
}

const AVAILABLE_DEFAULT_TOOLS = [
  { name: "Web Developer Toolbar", lang: "en" },
  { name: "Colour Contrast Analyser", lang: "en" },
  { name: "HeadingsMap", lang: "en" },
  { name: "ArcToolkit", lang: "en" },
  { name: "WCAG Contrast checker", lang: "en" },
  { name: "Inspecteur de composants" },
  { name: "Assistant RGAA" },
  { name: "Validateur HTML du W3C" }
];

const environments = ref<Omit<AuditEnvironment, "id">[]>([]);

// Other data

const auditInitiator = useFormField("" as string, [
  REQUIRED("Champ obligatoire. Saisissez l’entité ayant demandé l’audit.")
]);

const auditorOrganisation = useFormField("" as string, [
  REQUIRED("Champ obligatoire. Saisissez l’entité ayant réalisé l’audit.")
]);

const procedureUrl = useFormField("" as string, [
  REQUIRED(
    "Champ obligatoire. Saisissez l’URL de la page d’accueil du site audité."
  ),
  URL(
    "URL invalide. Saisissez une URL valide commençant par \"https://\" ou \"http://\""
  )
]);

const contactName = ref("");

const contactEmail = useFormField("" as string, [EMAIL("Le format de l’adresse e-mail est incorrect. Veuillez saisir une adresse e-mail au format : nom@domaine.fr")]);
const contactFormUrl = useFormField("" as string, [URL("URL invalide. Saisissez une URL valide commençant par \"https://\" ou \"http://\"")]);
const contactInfoSectionError = ref<string>();
const contactSectionRef = ref<HTMLFieldSetElement>();

function validateContactInfoSection() {
  contactInfoSectionError.value = undefined;
  if (!contactEmail.value.value && !contactFormUrl.value.value) {
    contactInfoSectionError.value = "Champ obligatoire. Saisissez au moins un des deux moyens de contact.";
    contactSectionRef.value?.focus();
    return false;
  }
  return true;
}

const notCompliantContent = ref("");
const derogatedContent = ref("");
const notInScopeContent = ref("");

watch(
  () => auditStore.currentAudit,
  (audit) => {
    if (!audit) {
      return;
    }
    auditInitiator.value.value = audit.initiator ?? "";
    auditorOrganisation.value.value = audit.auditorOrganisation ?? "";
    procedureUrl.value.value = audit.procedureUrl ?? "";
    contactName.value = audit.contactName ?? "";
    contactEmail.value.value = audit.contactEmail ?? "";
    contactFormUrl.value.value = audit.contactFormUrl ?? "";

    technologies.value.value = audit.technologies.length
      ? structuredClone(toRaw(audit.technologies))
      : [];

    defaultTools.value = audit.tools.length
      ? // Cannot use filtered audit.tools because the checkbox array v-model binding wont work with different object refs
        AVAILABLE_DEFAULT_TOOLS.map((t) => t.name).filter((tool) =>
          audit.tools.includes(tool)
        )
      : [];
    customTools.value = audit.tools.length
      ? audit.tools.filter(
          (tool) => !AVAILABLE_DEFAULT_TOOLS.map((t) => t.name).includes(tool)
        )
      : [];

    environments.value = structuredClone(toRaw(audit.environments)) ?? [];

    notCompliantContent.value = audit.notCompliantContent ?? "";
    derogatedContent.value = audit.derogatedContent ?? "";
    notInScopeContent.value = audit.notInScopeContent ?? "";
  },
  {
    immediate: true
  }
);

const notify = useNotifications();
const router = useRouter();

const hasSubmitted = ref(false);

const testEnvironmentSelectionRef =
  ref<InstanceType<typeof TestEnvironmentSelection>>();

function handleSubmit() {
  hasSubmitted.value = true;

  // TODO: validate everything together
  const isValid = [
    testEnvironmentSelectionRef.value?.validate(),
    validateTools(),
    validate(
      auditInitiator,
      auditorOrganisation,
      procedureUrl,
      contactEmail,
      contactFormUrl,
      technologies
    ),
    validateContactInfoSection(),
    validateTools()
  ].every(Boolean);

  if (!isValid) {
    return;
  }

  const data: UpdateAuditRequestData = {
    ...auditStore.currentAudit!,

    initiator: auditInitiator.value.value,
    auditorOrganisation: auditorOrganisation.value.value,
    procedureUrl: procedureUrl.value.value.trim(),

    contactEmail: formatEmail(contactEmail.value.value) || null,
    contactFormUrl: contactFormUrl.value.value.trim() || null,
    contactName: contactName.value,

    technologies: technologies.value.value,
    environments: environments.value,
    tools: tools.value,

    notCompliantContent: notCompliantContent.value,
    derogatedContent: derogatedContent.value,
    notInScopeContent: notInScopeContent.value
  };
  return auditStore
    .updateAudit(uniqueId, data)
    .then(() => {
      router.push({
        name: "audit-overview",
        params: { uniqueId }
      });
    })
    .catch((err) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
      throw err;
    });
}

const auditIsPublishable = computed(() => {
  return !!auditStore.currentAudit?.initiator;
});

/**
 * Dev function to avoid filling all fields manually
 */
function DEBUG_fillFields() {
  auditInitiator.value.value = "Mairie de Tours";
  auditorOrganisation.value.value = "Web Audit Services Corp.";
  procedureUrl.value.value = "https://example.com";
  contactEmail.value.value = "philipinne-jolivet@example.com";
  contactFormUrl.value.value = "https://example.com/contact";

  technologies.value.value = ["HTML", "CSS"];

  defaultTools.value = [AVAILABLE_DEFAULT_TOOLS[2].name];
  customTools.value = ["Firefox Devtools", "AXE Webextension"];

  environments.value = [
    {
      platform: Platform.DESKTOP,
      operatingSystem: OperatingSystem.WINDOWS,
      assistiveTechnology: AssistiveTechnology.NVDA,
      browser: Browsers.FIREFOX
    },
    {
      platform: Platform.DESKTOP,
      operatingSystem: OperatingSystem.MAC_OS,
      assistiveTechnology: AssistiveTechnology.VOICE_OVER,
      browser: Browsers.SAFARI
    }
  ];

  notCompliantContent.value =
    "Sit aliquip velit adipisicing esse cupidatat. Dolor nisi do Lorem laboris cillum anim adipisicing reprehenderit laboris id ullamco. Cillum aute do consectetur et exercitation consequat exercitation sunt sunt id dolore aliquip. Dolor cillum anim do id ipsum occaecat quis voluptate. Commodo adipisicing sit proident consequat ex incididunt. Minim sit esse ad id do pariatur in occaecat proident eiusmod velit.";
  notInScopeContent.value =
    "Non officia voluptate id magna culpa consectetur ex officia quis magna quis sint.";
  derogatedContent.value =
    "Nostrud duis ut sint et et. Consequat fugiat sunt est elit sunt.";
}

const isDevMode = useDevMode();
</script>

<template>
  <PageMeta
    v-if="auditStore.currentAudit"
    :title="`${
      auditStore.currentAudit.initiator ? 'Modification' : 'Saisie'
    } de la déclaration d’accessibilité de ${
      auditStore.currentAudit?.procedureName
    }`"
    description="Saisissez les informations requises pour établir la déclaration d’accessibilité."
  />

  <BackLink
    :label="
      accountStore.account?.email
        ? 'Retourner à mes livrables'
        : 'Retourner au tableau de bord de l’audit'
    "
    :to="{ name: 'audit-overview', params: { uniqueId } }"
  />

  <form
    v-if="auditStore.currentAudit"
    class="content"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <h1 class="fr-mb-6w">Déclaration d’accessibilité</h1>
    <p class="fr-text--sm fr-mb-4w mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <h2 class="fr-h4">Informations générales</h2>

    <DsfrField
      id="initiator"
      :ref="auditInitiator.refFn"
      :model-value="auditInitiator.value.value"
      :error="auditInitiator.error.value"
      label="Entité qui a demandé l’audit"
      hint="Exemples : Ministère de l’intérieur, Mairie de Toulouse"
      type="text"
      required
      @update:model-value="auditInitiator.value.value = $event"
    />

    <DsfrField
      id="auditorOrganisation"
      :ref="auditorOrganisation.refFn"
      :model-value="auditorOrganisation.value.value"
      :error="auditorOrganisation.error.value"
      label="Entité qui a réalisé l’audit"
      hint="L'audit peut être demandé et réalisé par la même entité."
      type="text"
      required
      @update:model-value="auditorOrganisation.value.value = $event"
    />

    <DsfrField
      id="procedure-url"
      :ref="procedureUrl.refFn"
      :model-value="procedureUrl.value.value"
      :error="procedureUrl.error.value"
      label="URL de la page d’accueil du site audité"
      type="text"
      :pattern="URL_REGEX"
      required
      @update:model-value="procedureUrl.value.value = $event"
    >
      <template #hint>
        Saisissez une URL commençant par <code>https://</code> ou <code>http://</code>
      </template>
    </DsfrField>

    <fieldset
      class="fr-fieldset  fr-p-0 fr-mx-0 fr-mt-6w fr-mb-6w contact-fieldset"
    >
      <legend>
        <h2 class="fr-h4 fr-mb-2w">Retour d’information et contact</h2>
      </legend>

      <p>
        Ces informations permettent aux usagers qui rencontrent des difficultés
        pour accéder à du contenu ou à un service d’être orienté vers une
        solution adaptée.
      </p>

      <DsfrField
        id="procedure-manager-name"
        v-model="contactName"
        label="Nom et prénom du contact (optionnel)"
        type="text"
      />

      <p id="contact-section-subtitle" class="fr-mb-2w">
        Vous devez renseigner au moins un des deux moyens de contact suivant :
      </p>

      <div
        ref="contactSectionRef"
        tabindex="-1"
        role="region"
        aria-labelledby="contact-section-subtitle"
        aria-describedby="contact-section-error"
        class="fr-input-group" :class="{ 'fr-input-group--error': contactInfoSectionError }"
      >
        <DsfrField
          id="contact-email"
          :ref="contactEmail.refFn"
          :model-value="contactEmail.value.value"
          label="Adresse e-mail de contact"
          hint="Format attendu : nom@domaine.fr"
          type="email"
          :error="
            contactInfoSectionError || contactEmail.error.value
          "
          :hide-error="!!contactInfoSectionError"
          class="fr-mb-3v"
          @update:model-value="contactEmail.value.value = $event"
        />

        <p class="fr-mb-3v"><em>Ou</em></p>

        <DsfrField
          id="contact-form-url"
          :ref="contactFormUrl.refFn"
          :model-value="contactFormUrl.value.value"
          label="Formulaire de contact en ligne"
          hint="Exemple : contact@ministere.gouv.fr"
          type="url"
          placeholder="https://"
          :error="
            contactInfoSectionError || contactFormUrl.error.value
          "
          :hide-error="!!contactInfoSectionError"
          @update:model-value="contactFormUrl.value.value = $event"
        >
          <template #hint>
            Saisissez une URL commençant par <code>https://</code> ou <code>http://</code>
          </template>
        </DsfrField>
        <p v-if="contactInfoSectionError" id="contact-section-error" class="fr-error-text fr-mt-0">
          {{ contactInfoSectionError }}
        </p>
      </div>
    </fieldset>

    <h2 class="fr-h4">Technologies utilisées sur le site</h2>

    <TagListField
      :ref="technologies.refFn"
      :model-value="technologies.value.value"
      :error="technologies.error.value"
      label="Ajouter des technologies"
      hint="Exemples : HTML, CSS, Javascript"
      add-label="les technologies"
      @update:model-value="technologies.value.value = $event"
    />

    <div
      ref="toolsSectionRef"
      tabindex="-1"
      role="region"
      aria-labelledby="tools-section-title"
      aria-describedby="tools-section-error"
      class="fr-input-group"
      :class="{ 'fr-input-group--error': toolsSectionError }"
    >
      <div class="fr-form-group">
        <fieldset class="fr-fieldset" :class="{ 'fr-fieldset--error': toolsSectionError }">
          <legend class="fr-fieldset__legend fr-text--regular fr-mb-3w">
            <h2 id="tools-section-title" class="fr-h4 fr-mb-0">
              Outils d’assistance utilisés pour vérifier l’accessibilité
            </h2>
          </legend>
          <div class="fr-fieldset__content">
            <div
              v-for="(tool, i) in AVAILABLE_DEFAULT_TOOLS"
              :key="i"
              class="fr-checkbox-group"
            >
              <input
                :id="`tool-${i}`"
                v-model="defaultTools"
                type="checkbox"
                :value="tool.name"
              />
              <label class="fr-label" :for="`tool-${i}`" :lang="tool.lang">
                {{ tool.name }}
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      <TagListField
        v-model="customTools"
        label="Ajouter des outils d’assistance"
        add-label="les outils d’assistance"
      />

      <p v-if="toolsSectionError" id="tools-section-error" class="fr-error-text fr-mt-0">
        {{ toolsSectionError }}
      </p>
    </div>

    <TestEnvironmentSelection ref="testEnvironmentSelectionRef" v-model="environments" />

    <h2 class="fr-h4">Contenus non accessibles</h2>

    <div class="fr-input-group fr-mb-2w">
      <label class="fr-label" for="notCompliantContent">
        Non-conformités (optionnel)
        <span class="fr-hint-text">
          Listez les contenus et fonctionnalités non conformes sur le site, en utilisant un langage simple et clair.<br />Indiquez les alternatives si disponibles.
        </span>
      </label>
      <textarea
        id="notCompliantContent"
        v-model="notCompliantContent"
        class="fr-input"
      />
    </div>

    <h3 class="fr-h6 fr-mb-2w">Dérogations</h3>

    <p>
      Les contenus dérogés doivent être discutés entre l’auditeur ou l’auditrice et le responsable du site audité. C’est le responsable du site qui accepte de prendre le risque juridique de mentionner ces contenus.
    </p>

    <div class="fr-input-group">
      <label class="fr-label" for="derogatedContent">
        Dérogations pour charge disproportionnée (optionnel)
        <span class="fr-hint-text">
          Listez les contenus et fonctionnalités trop coûteuse ou difficile à rendre accessible.<br />Indiquez les alternatives si disponibles.
        </span>
      </label>
      <textarea
        id="derogatedContent"
        v-model="derogatedContent"
        class="fr-input"
      />
    </div>

    <div class="fr-input-group">
      <label class="fr-label" for="notInScopeContent">
        Contenus non soumis à l’obligation d’accessibilité et contenus tiers (optionnel)
        <span class="fr-hint-text">
          Listez les contenus et fonctionnalités non accessibles qui ne sont pas soumis à la législation.<br />Indiquez les alternatives si disponibles.
        </span>
      </label>
      <textarea
        id="notInScopeContent"
        v-model="notInScopeContent"
        class="fr-input"
      />
    </div>

    <div v-if="isDevMode">
      <button
        class="fr-btn fr-mt-4w fr-mb-2w"
        type="button"
        @click="DEBUG_fillFields"
      >
        [DEV] Remplir les champs
      </button>
    </div>

    <div class="fr-mt-4w actions">
      <button class="fr-btn" type="submit">
        {{
          auditIsPublishable
            ? "Enregistrer les modifications"
            : "Valider la déclaration"
        }}
      </button>
      <RouterLink
        :to="{
          name: 'audit-overview',
          params: { uniqueId }
        }"
        class="fr-btn fr-btn--tertiary-no-outline"
        type="button"
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

.contact-fieldset {
  display: block;
}

.narrow-field {
  max-width: 25rem;
}

.mandatory-notice {
  color: var(--text-mention-grey);
}

.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: start;
  gap: 1rem;
}

.top-link {
  display: flex;
  justify-content: end;
}

.light-blue-button-tags {
  flex-direction: row-reverse;
  gap: 0.25rem;

  &::before {
    margin: 0;
  }
}
</style>
