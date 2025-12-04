<script lang="ts" setup>
import { isEqual } from "lodash-es";
import { computed, ref, toRaw, watch } from "vue";

import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import TestEnvironmentSelection from "../../components/audit/TestEnvironmentSelection/TestEnvironmentSelection.vue";
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import DsfrField from "../../components/ui/DsfrField.vue";
import TagListField from "../../components/ui/TagListField.vue";
import TopLink from "../../components/ui/TopLink.vue";
import DsfrFieldWithValidation from "../../components/validation/DsfrFieldWithValidation.vue";
import FieldValidation from "../../components/validation/FieldValidation.vue";
import FormWithValidation from "../../components/validation/form-with-validation/FormWithValidation.vue";
import { useDevMode } from "../../composables/useDevMode";
import { useDialog } from "../../composables/useDialog";
import { useNotifications } from "../../composables/useNotifications";
import { usePreviousRoute } from "../../composables/usePreviousRoute";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import {
  ARRAY_LENGTH,
  EMAIL,
  REQUIRED,
  URL,
  ValidationRule
} from "../../composables/validation";
import {
  AssistiveTechnology,
  Browsers,
  OperatingSystem,
  Platform
} from "../../enums";
import { useAccountStore, useAuditStore } from "../../store";
import { AuditEnvironment, UpdateAuditRequestData } from "../../types";
import { formatEmail, URL_REGEX, formatDate } from "../../utils";

const route = useRoute();
const previousRoute = usePreviousRoute();
const uniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();
const accountStore = useAccountStore();
useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));

const technologies = ref<string[]>([]);

const customTools = ref<string[]>([]);
const defaultTools = ref<string[]>([]);

const tools = computed(() => {
  return [...defaultTools.value, ...customTools.value].filter(Boolean);
});

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

const auditInitiator = ref("");
const auditorOrganisation = ref("");
const procedureUrl = ref("");
const contactName = ref("");

const contactEmail = ref("");
const contactFormUrl = ref("");

const contactValidationRule: ValidationRule<[string, string]> =
  ([email, formUrl]) => !email && !formUrl && "Champ obligatoire. Saisissez au moins un des deux moyens de contact.";

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

    technologies.value = audit.technologies.length
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

const dataToBeSubmitted = computed<UpdateAuditRequestData>(() => {
  return {
    ...auditStore.currentAudit!,

    initiator: auditInitiator.value,
    auditorOrganisation: auditorOrganisation.value,
    procedureUrl: procedureUrl.value.trim(),

    contactEmail: formatEmail(contactEmail.value) || null,
    contactFormUrl: contactFormUrl.value.trim() || null,
    contactName: contactName.value,

    technologies: technologies.value,
    environments: environments.value,
    tools: tools.value,

    notCompliantContent: notCompliantContent.value,
    derogatedContent: derogatedContent.value,
    notInScopeContent: notInScopeContent.value
  };
});

const isSubmitting = ref(false);

function handleSubmit() {
  isSubmitting.value = true;

  const isStatementUpdate = !!auditStore.currentAudit?.initiator;

  return auditStore
    .updateAudit(uniqueId, dataToBeSubmitted.value)
    .then(() => {
      notify("success", undefined, isStatementUpdate ? "Déclaration d’accessibilité mise à jour" : "Déclaration d’accessibilité enregistrée");
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
    })
    .finally(() => isSubmitting.value = false);
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

  technologies.value = ["HTML", "CSS"];

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

const dialog = useDialog();
const confirmedLeave = ref(false);
const leaveModalDestination = ref<string>("");

onBeforeRouteLeave((to) => {
  const currentAudit = auditStore.currentAudit;
  const editedAudit = dataToBeSubmitted.value;

  if (!confirmedLeave.value &&
    !isEqual(currentAudit, editedAudit) &&
    !isSubmitting.value
  ) {
    leaveModalDestination.value = to.fullPath;

    dialog.showConfirm({
      title: "Quitter sans enregistrer vos modifications ?",
      message: "Les modifications de votre déclaration d’accessibilité ne seront pas enregistrées.",
      confirmLabel: "Quitter sans enregistrer",
      cancelLabel: "Reprendre les modifications",
      titleIcon: "fr-icon-warning-line",
      confirmAction: {
        cb: () => confirmLeave()
      }
    });
    return false;
  }
});

function confirmLeave() {
  confirmedLeave.value = true;
  notify("info", undefined, "Modifications de la déclaration annulées");
  router.push(leaveModalDestination.value);
}
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
        ? 'Retour à mes livrables'
        : 'Retour au tableau de bord de l’audit'
    "
    :to="{ name: 'audit-overview', params: { uniqueId } }"
  />

  <FormWithValidation
    v-if="auditStore.currentAudit"
    class="content"
    @submit="handleSubmit"
  >
    <h1 class="fr-mb-3v">Déclaration d’accessibilité</h1>
    <p class="fr-text--xl fr-mb-2w">{{ auditStore.currentAudit.procedureName }}</p>
    <p v-if="auditStore.currentAudit.statementPublicationDate" class="fr-text--sm fr-mb-4w dates">
      Rédigée le {{ formatDate(auditStore.currentAudit.statementPublicationDate) }}<template v-if="auditStore.currentAudit.statementEditionDate"> - Mise à jour le {{ formatDate(auditStore.currentAudit.statementEditionDate) }}</template>
    </p>
    <p class="fr-text--xs fr-mb-2w mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <h2 class="fr-h4 fr-mb-2w">Informations générales</h2>

    <DsfrFieldWithValidation
      id="initiator"
      v-model="auditInitiator"
      label="Entité qui a demandé l’audit"
      hint="Exemples : Ministère de l’intérieur, Mairie de Toulouse"
      type="text"
      required
      :validation="[
        REQUIRED('Champ obligatoire. Saisissez l’entité ayant demandé l’audit.')
      ]"
      class="fr-mb-2w"
    />

    <DsfrFieldWithValidation
      id="auditorOrganisation"
      v-model="auditorOrganisation"
      label="Entité qui a réalisé l’audit"
      hint="L'audit peut être demandé et réalisé par la même entité."
      type="text"
      required
      :validation="[
        REQUIRED('Champ obligatoire. Saisissez l’entité ayant réalisé l’audit.')
      ]"
      class="fr-mb-2w"
    />

    <DsfrFieldWithValidation
      id="procedure-url"
      v-model="procedureUrl"
      label="URL de la page d’accueil du site audité"
      type="text"
      :pattern="URL_REGEX"
      required
      :validation="[
        REQUIRED('Champ obligatoire. Saisissez l’URL de la page d’accueil du site audité.'),
        URL('Format incorrect. Saisissez une URL commençant par https:// ou http://')
      ]"
    >
      <template #hint>
        Saisissez une URL commençant par <code>https://</code> ou <code>http://</code>
      </template>
    </DsfrFieldWithValidation>

    <fieldset
      class="fr-fieldset fr-p-0 fr-mx-0 fr-mt-6w fr-mb-6w contact-fieldset"
    >
      <legend>
        <h2 class="fr-h4 fr-mb-2w">Retour d’information et contact</h2>
      </legend>

      <p class="fr-mb-2w">
        Ces informations permettent aux usagers qui rencontrent des difficultés
        pour accéder à du contenu ou à un service d’être orienté vers une
        solution adaptée.
      </p>

      <DsfrField
        id="procedure-manager-name"
        v-model="contactName"
        label="Nom et prénom du contact (optionnel)"
        type="text"
        class="fr-mb-2w"
      />

      <p id="contact-section-subtitle" class="fr-mb-2w">
        Vous devez renseigner au moins un des deux moyens de contact suivant :
      </p>

      <FieldValidation
        v-slot="{ error: sectionError, focusRef: sectionRef }"
        :validation="[contactValidationRule]"
        :value="[contactEmail, contactFormUrl]"
      >
        <div
          :ref="sectionRef"
          tabindex="-1"
          role="region"
          aria-labelledby="contact-section-subtitle"
          aria-describedby="contact-section-error"
          class="fr-input-group fr-pl-4w contact-optionnal-fields"
          :class="{ 'fr-input-group--error': !!sectionError }"
        >
          <FieldValidation
            v-slot="{ error, focusRef }"
            :validation="[EMAIL('Format incorrect. Utilisez le format : nom@domaine.fr.')]"
            :value="contactEmail"
          >
            <DsfrField
              id="contact-email"
              :ref="focusRef"
              v-model="contactEmail"
              label="Adresse e-mail de contact"
              hint="Format attendu : nom@domaine.fr"
              type="email"
              :error="
                sectionError || error
              "
              :hide-error="!!sectionError"
              class="fr-mb-3v"
            />
          </FieldValidation>

          <p class="fr-mb-3v"><em>Ou</em></p>

          <FieldValidation
            v-slot="{ error, focusRef }"
            :validation="[URL('Format incorrect. Saisissez une URL commençant par https:// ou http://e')]"
            :value="contactFormUrl"
          >
            <DsfrField
              id="contact-form-url"
              :ref="focusRef"
              v-model="contactFormUrl"
              label="Formulaire de contact en ligne"
              hint="Exemple : contact@ministere.gouv.fr"
              type="url"
              placeholder="https://"
              :error="
                sectionError || error
              "
              :hide-error="!!sectionError"
            >
              <template #hint>
                Saisissez une URL commençant par <code>https://</code> ou <code>http://</code>
              </template>
            </DsfrField>
          </FieldValidation>
          <p v-if="sectionError" id="contact-section-error" class="fr-error-text fr-mt-0">
            {{ sectionError }}
          </p>
        </div>
      </FieldValidation>
    </fieldset>

    <h2 class="fr-h4 fr-mb-2w">Technologies utilisées sur le site</h2>

    <FieldValidation
      v-slot="{ error, focusRef }"
      :value="technologies"
      :validation="[ARRAY_LENGTH(1, 'Indiquez les technologies utilisées sur le site.')]"
    >
      <TagListField
        :ref="focusRef"
        v-model="technologies"
        :error="error"
        label="Ajouter des technologies"
        hint="Exemples : HTML, CSS, Javascript"
        add-label="les technologies"
      />
    </FieldValidation>

    <FieldValidation
      v-slot="{ error: sectionError, focusRef: sectionRef }"
      :value="tools"
      :validation="[ARRAY_LENGTH(1, 'Indiquez les outils d’assistance utilisés pour vérifier l’accessibilité.')]"
    >
      <div
        :ref="sectionRef"
        tabindex="-1"
        role="region"
        aria-labelledby="tools-section-title"
        aria-describedby="tools-section-error"
        class="fr-input-group fr-my-6w"
        :class="{ 'fr-input-group--error': sectionError }"
      >
        <div class="fr-form-group">
          <fieldset class="fr-fieldset fr-mb-3v" :class="{ 'fr-fieldset--error': sectionError }">
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

        <p v-if="sectionError" id="tools-section-error" class="fr-error-text fr-mt-0">
          {{ sectionError }}
        </p>
      </div>
    </FieldValidation>

    <TestEnvironmentSelection v-model="environments" />

    <h2 class="fr-h4 fr-mb-2w">Contenus non accessibles</h2>

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

    <p class="fr-mb-2w">
      Les contenus dérogés doivent être discutés entre l’auditeur ou l’auditrice et le responsable du site audité. C’est le responsable du site qui accepte de prendre le risque juridique de mentionner ces contenus.
    </p>

    <div class="fr-input-group fr-mb-2w">
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
        Contenus non soumis à l’obligation d’accessibilité (optionnel)
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

    <div class="fr-mt-6w actions">
      <button class="fr-btn" type="submit">
        {{
          auditIsPublishable
            ? "Enregistrer les modifications"
            : "Valider la déclaration"
        }}
      </button>
      <RouterLink
        :to="previousRoute.route ?? {
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
      <TopLink class="fr-ml-auto" top-margin="3rem" />
    </div>
  </FormWithValidation>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
  margin: 0 auto;
}

.contact-fieldset {
  display: block;
}

/* Hack to visually merge the left error red line of field and section */
.contact-optionnal-fields::before {
  left: calc(2rem - 0.75rem);
}

.narrow-field {
  max-width: 25rem;
}

.mandatory-notice,
.dates {
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
