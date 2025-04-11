<script lang="ts" setup>
import { computed, nextTick, ref, toRaw, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import TestEnvironmentSelection from "../../components/audit/TestEnvironmentSelection/TestEnvironmentSelection.vue";
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import DsfrField from "../../components/ui/DsfrField.vue";
import TopLink from "../../components/ui/TopLink.vue";
import { useDevMode } from "../../composables/useDevMode";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
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

// Technologies

const tempTechnologies = ref("");
const validatedTechnologies = ref<string[]>([]);
const validatedTechnologiesRefs = ref<HTMLButtonElement[]>([]);
const validateTechnologiesRef = ref<HTMLButtonElement>();

/**
 * Create technologies tags.
 */
async function validateTechnologies() {
  const tech = tempTechnologies.value.split(",").filter(Boolean);
  tech.forEach((t) => {
    validatedTechnologies.value.push(t.trim());
  });

  tempTechnologies.value = "";
}

/**
 * Remove technology tag and focus next one or validate button.
 */
async function removeTechnology(index: number) {
  validatedTechnologies.value = validatedTechnologies.value.filter((_, i) => {
    return i !== index;
  });

  await nextTick();

  const nextTechnologyButton: HTMLButtonElement =
    validatedTechnologiesRefs.value[index];
  if (nextTechnologyButton) {
    nextTechnologyButton.focus();
  } else {
    validateTechnologiesRef.value?.focus();
  }
}

// Tools

const tempTools = ref("");
const validatedTools = ref<string[]>([]);
const validatedToolsRefs = ref<HTMLButtonElement[]>([]);
const validateToolsRef = ref<HTMLButtonElement>();

const defaultTools = ref<string[]>([]);
const tools = computed(() => {
  return [...defaultTools.value, ...validatedTools.value].filter(Boolean);
});

const availableTools = [
  { name: "Web Developer Toolbar", lang: "en" },
  { name: "Colour Contrast Analyser", lang: "en" },
  { name: "HeadingsMap", lang: "en" },
  { name: "ArcToolkit", lang: "en" },
  { name: "WCAG Contrast checker", lang: "en" },
  { name: "Inspecteur de composants" },
  { name: "Assistant RGAA" },
  { name: "Validateur HTML du W3C" }
];

/**
 * Create tools tags.
 */
async function validateTools() {
  const tech = tempTools.value.split(",").filter(Boolean);
  tech.forEach((t) => {
    validatedTools.value.push(t.trim());
  });

  tempTools.value = "";
}

/**
 * Remove tool tag and focus next one or validate button.
 */
async function removeTool(index: number) {
  validatedTools.value = validatedTools.value.filter((_, i) => {
    return i !== index;
  });

  await nextTick();

  const nextToolButton: HTMLButtonElement = validatedToolsRefs.value[index];
  if (nextToolButton) {
    nextToolButton.focus();
  } else {
    validateToolsRef.value?.focus();
  }
}

const environments = ref<Omit<AuditEnvironment, "id">[]>([]);

// Other data

const auditInitiator = ref("");
const auditorOrganisation = ref("");
const procedureUrl = ref("");
const contactName = ref("");
const contactEmail = ref("");
const contactFormUrl = ref("");
const notCompliantContent = ref("");
const derogatedContent = ref("");
const notInScopeContent = ref("");

watch(
  () => auditStore.currentAudit,
  (audit) => {
    if (!audit) {
      return;
    }
    auditInitiator.value = audit.initiator ?? "";
    auditorOrganisation.value = audit.auditorOrganisation ?? "";
    procedureUrl.value = audit.procedureUrl ?? "";
    contactName.value = audit.contactName ?? "";
    contactEmail.value = audit.contactEmail ?? "";
    contactFormUrl.value = audit.contactFormUrl ?? "";

    validatedTechnologies.value = audit.technologies.length
      ? structuredClone(toRaw(audit.technologies))
      : [];

    defaultTools.value = audit.tools.length
      ? // Cannot use filtered audit.tools because the checkbox array v-model binding wont work with different object refs
        availableTools
          .map((t) => t.name)
          .filter((tool) => audit.tools.includes(tool))
      : [];
    validatedTools.value = audit.tools.length
      ? audit.tools.filter(
          (tool) => !availableTools.map((t) => t.name).includes(tool)
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

const contactEmailRef = ref<HTMLInputElement>();
const hasValidated = ref(false);
const hasNoContactInfo = computed(() => {
  return hasValidated.value && !contactEmail.value && !contactFormUrl.value;
});

function handleSubmit() {
  hasValidated.value = true;

  if (!contactEmail.value && !contactFormUrl.value) {
    contactEmailRef.value?.focus();
    return;
  }

  const data: UpdateAuditRequestData = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...auditStore.currentAudit!,

    initiator: auditInitiator.value,
    auditorOrganisation: auditorOrganisation.value,
    procedureUrl: procedureUrl.value.trim(),

    contactEmail: formatEmail(contactEmail.value) || null,
    contactFormUrl: contactFormUrl.value.trim() || null,
    contactName: contactName.value,

    technologies: validatedTechnologies.value,
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
  auditInitiator.value = "Mairie de Tours";
  auditorOrganisation.value = "Web Audit Services Corp.";
  procedureUrl.value = "https://example.com";
  contactEmail.value = "philipinne-jolivet@example.com";
  contactFormUrl.value = "https://example.com/contact";

  validatedTechnologies.value = ["HTML", "CSS"];

  defaultTools.value = [availableTools[2].name];
  validatedTools.value = ["Firefox Devtools", "AXE Webextension"];

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
    title="Déclaration d’accessibilité"
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
    @submit.prevent="handleSubmit"
  >
    <h1 class="fr-mb-3w">Déclaration d’accessibilité</h1>
    <p class="fr-text--sm fr-mb-4w mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <h2 class="fr-h4">Informations générales</h2>

    <DsfrField
      id="initiator"
      v-model="auditInitiator"
      label="Entité qui a demandé l’audit"
      hint="Exemple : Ministère de l’intérieur, Mairie de Toulouse, etc"
      type="text"
      required
    />

    <DsfrField
      id="auditorOrganisation"
      v-model="auditorOrganisation"
      label="Entité qui a réalisé l’audit"
      hint="L’entité qui a demandé et réalisé l’audit peut être identique dans le cas d’un audit réalisé en interne."
      type="text"
      required
    />

    <DsfrField
      id="procedure-url"
      v-model="procedureUrl"
      label="URL de la page d’accueil du site audité"
      type="text"
      :pattern="URL_REGEX"
      required
    >
      <template #hint>
        Saisissez une URL valide, commençant par
        <code>https://</code> ou <code>http://</code>
      </template>
    </DsfrField>

    <fieldset
      class="fr-fieldset fr-p-0 fr-mx-0 fr-mt-6w fr-mb-6w contact-fieldset"
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
        class="narrow-field"
      />

      <p>
        Vous devez renseigner au moins un des deux moyens de contact suivant :
      </p>

      <DsfrField
        id="contact-email"
        v-model="contactEmail"
        label="Adresse e-mail"
        hint="Exemple : contact@ministere.gouv.fr"
        type="email"
        :error="
          hasNoContactInfo
            ? 'Vous devez renseigner au moins 1 moyen de contact'
            : undefined
        "
        class="narrow-field"
      />

      <DsfrField
        id="contact-form-url"
        v-model="contactFormUrl"
        label="Formulaire de contact en ligne"
        hint="Exemple : contact@ministere.gouv.fr"
        type="text"
        :pattern="URL_REGEX"
        placeholder="https://"
        :error="
          hasNoContactInfo
            ? 'Vous devez renseigner au moins 1 moyen de contact'
            : undefined
        "
      >
        <template #hint>
          Saisissez une URL valide, commençant par <code>https://</code> ou
          <code>http://</code>
        </template>
      </DsfrField>
    </fieldset>

    <h2 class="fr-h4">Technologies utilisées sur le site</h2>

    <DsfrField
      id="temp-technologies"
      v-model="tempTechnologies"
      label="Ajouter des technologies"
      hint="Insérez une virgule pour séparer les technologies. Appuyez sur ENTRÉE ou cliquez sur “Valider les technologies” pour les valider. Exemple de technologies : HTML, CSS, Javascript, etc."
      type="text"
      :required="!validatedTechnologies.length"
      @keydown.enter.prevent="validateTechnologies"
    />

    <ul class="fr-tags-group">
      <li v-for="(techno, i) in validatedTechnologies" :key="i">
        <!-- TODO: generate unique ids for each techno, using i is bugged. See how it's done in TransverseElementsList.vue -->
        <button
          ref="validatedTechnologiesRefs"
          class="fr-tag fr-icon-close-line fr-tag--icon-left light-blue-button-tags"
          type="button"
          @click="removeTechnology(i)"
        >
          <span class="fr-sr-only">Retirer</span>
          {{ techno }}
        </button>
      </li>
    </ul>

    <button
      ref="validateTechnologiesRef"
      class="fr-btn fr-btn--tertiary-no-outline fr-mb-6w"
      type="button"
      @click="validateTechnologies"
    >
      Valider les technologies
    </button>

    <div class="fr-form-group">
      <fieldset class="fr-fieldset fr-mb-4w">
        <legend class="fr-fieldset__legend fr-text--regular">
          <h2 class="fr-h4 fr-mb-0">
            Outils d’assistance utilisés pour vérifier l’accessibilité
          </h2>
        </legend>
        <div class="fr-fieldset__content fr-mt-2w">
          <div
            v-for="(tool, i) in availableTools"
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

    <DsfrField
      id="temp-tools"
      v-model="tempTools"
      label="Ajouter des outils d’assistance"
      hint="Insérez une virgule pour séparer les outils d’assistance. Appuyez sur ENTRÉE ou cliquez sur “Valider les outils” pour les valider."
      type="text"
      :required="!validatedTools.length && !defaultTools.length"
      @keydown.enter.prevent="validateTools"
    />

    <ul class="fr-tags-group">
      <li v-for="(tool, i) in validatedTools" :key="i">
        <button
          ref="validatedToolsRefs"
          class="fr-tag fr-tag--dismiss"
          type="button"
          @click="removeTool(i)"
        >
          <span class="fr-sr-only">Retirer</span>
          {{ tool }}
        </button>
      </li>
    </ul>

    <button
      ref="validateToolsRef"
      class="fr-btn fr-btn--tertiary-no-outline fr-mb-6w"
      type="button"
      @click="validateTools"
    >
      Valider les outils
    </button>

    <TestEnvironmentSelection v-model="environments" />

    <h2 class="fr-h4">Contenus non accessibles</h2>

    <div class="fr-input-group fr-mb-2w">
      <label class="fr-label" for="notCompliantContent">
        Non-conformités (optionnel)
        <span class="fr-hint-text">
          Il s’agit d’un résumé des contenus et fonctionnalités non conformes
          identifiés sur le site. Ils doivent être rédigés dans un langage
          simple et compréhensible par toutes et tous.
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
      Les contenus dérogés doivent faire l’objet d’une discussion entre
      l’auditeur et le responsable du site audité. C’est le responsable du site
      audité qui accepte de prendre le risque juridique de mentionner des
      contenus dérogés.
    </p>

    <div class="fr-input-group">
      <label class="fr-label" for="derogatedContent">
        Dérogations pour charge disproportionnée (optionnel)
        <span class="fr-hint-text">
          Il s’agit des contenus qu’il serait trop coûteux de rendre
          accessibles.
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
        Contenus non soumis à l’obligation d’accessibilité, contenus tiers
        (optionnel)
        <span class="fr-hint-text">
          Exemple : Cartes interactives, fil d’actualité réseaux social, lecteur
          vidéo, etc
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
