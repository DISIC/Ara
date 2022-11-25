<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageMeta from "../../components/PageMeta";
import { useDevMode } from "../../composables/useDevMode";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import {
  ASSISTIVE_TECHNOLOGY,
  BROWSERS,
  OPERATING_SYSTEM,
  PLATFORM,
} from "../../enums";
import { useAuditStore } from "../../store";
import { AuditEnvironment, UpdateAuditRequestData } from "../../types";

const route = useRoute();
const uniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();
useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));

// Technologies

const availableTechnologies = ["HTML", "CSS", "JavaScript", "PHP", "MySQL"];
const defaultTechnologies = ref<string[]>([]);
const customTechnologies = ref<string[]>([""]);
const auditTechnologies = computed(() => {
  return [...defaultTechnologies.value, ...customTechnologies.value].filter(
    Boolean
  );
});

const customTechNameRefs = ref<HTMLInputElement[]>([]);

/**
 * Create a new tech and focus its field.
 */
async function addTech() {
  customTechnologies.value.push("");
  await nextTick();
  const lastInput =
    customTechNameRefs.value[customTechNameRefs.value.length - 1];
  lastInput.focus();
}

/**
 * Delete custom tech at index and focus previous or first field.
 * @param {number} i
 */
async function deleteCustomTech(i: number) {
  customTechnologies.value.splice(i, 1);
  await nextTick();
  const lastInput =
    i === 0 ? customTechNameRefs.value[0] : customTechNameRefs.value[i - 1];
  lastInput.focus();
}

// Tools

const defaultTools = ref<
  {
    name: string;
    function: string;
    url: string;
  }[]
>([]);
const customTools = ref([
  {
    name: "",
    function: "",
    url: "",
  },
]);
const tools = computed(() => {
  return [...defaultTools.value, ...customTools.value].filter(
    (t) => t.name !== "" || t.function !== "" || t.url !== ""
  );
});

const customToolNameRefs = ref<HTMLInputElement[]>([]);

const availableTools = [
  {
    name: "Web Accessibility Toolbar",
    function:
      "Barre d’outils Firefox ou Chrome qui peut aider à retrouver visuellement certains éléments dans un document pour en contrôler l’accessibilité",
    url: "https://chrome.google.com/webstore/detail/web-developer/bfbameneiokkgbdmiekhjnmfkcnldhhm?hl=fr",
  },
  {
    name: "Validateur en ligne W3C",
    function:
      "Outils en ligne permettant de détecter des erreurs dans le code source d’un document HTML",
    url: "https://validator.w3.org/nu/",
  },
  {
    name: "WCAG Contrast checker",
    function:
      "Extension Firefox qui permet un contrôle automatique des contrastes de couleurs les textes d’un document",
    url: "https://addons.mozilla.org/fr/firefox/addon/wcag-contrast-checker/",
  },
  {
    name: "Color Contrast Analyser",
    function:
      "Application Windows ou Mac qui permet de contrôler des contrastes de couleurs",
    url: "https://www.tpgi.com/color-contrast-checker/",
  },
  {
    name: "HeadingsMap",
    function:
      "Extension Firefox ou Chrome qui permet de donner un aperçu du plan du document et de son arborescence",
    url: "https://addons.mozilla.org/fr/firefox/addon/headingsmap/",
  },
  {
    name: "PAC (PDF Accessibility Checker)",
    function:
      "Logiciel Windows qui permet de contrôler certains points d’accessibilité des documents PDF",
    url: "https://pdfua.foundation/fr/pdf-accessibility-checker-pac",
  },
  {
    name: "Word Accessibility Plug-in pour Microsoft Office Windows",
    function:
      "Fonctionnalité intégrée à Microsoft Office permettant de valider l’accessibilité d’un document",
    url: "https://support.microsoft.com/fr-fr/office/rendre-vos-documents-word-accessibles-aux-personnes-atteintes-d-un-handicap-d9bf3683-87ac-47ea-b91a-78dcacb3c66d",
  },
  {
    name: "AccessODF pour LibreOffice",
    function:
      "Extension LibreOffice permettant de vérifier l’accessibilité d’un document LibreOffice Writer ; à noter que cette extension n’est plus compatible avec les dernières versions de LibreOffice (supérieures à la version 4.0)",
    url: "https://extensions.libreoffice.org/en/extensions/show/accessodf",
  },
  {
    name: "Ace by DAISY App",
    function: "Utilitaire pour vérifier l’accessibilité d’un fichier EPUB",
    url: "https://inclusivepublishing.org/toolbox/ace-by-daisy-app/",
  },
  {
    name: "PEAT (Photosensitive Epilepsy Analysis Tool)",
    function:
      "Logiciel pour évaluer la potentialité de certains contenus web à causer des crises d’épilepsie",
    url: "https://trace.umd.edu/peat/",
  },
];

/**
 * Create a new tool and focus its field.
 */
async function addTool() {
  customTools.value.push({
    name: "",
    function: "",
    url: "",
  });
  await nextTick();
  const lastInput =
    customToolNameRefs.value[customToolNameRefs.value.length - 1];
  lastInput.focus();
}
/**
 * Delete custom tool at index and focus previous or first field.
 * @param {number} i
 */
async function deleteCustomTool(i: number) {
  customTools.value.splice(i, 1);
  await nextTick();
  const lastInput =
    i === 0 ? customToolNameRefs.value[0] : customToolNameRefs.value[i - 1];
  lastInput.focus();
}

// Environment

const environments = ref([
  {
    platform: "",
    operatingSystem: "",
    operatingSystemVersion: "",
    assistiveTechnology: "",
    assistiveTechnologyVersion: "",
    browser: "",
    browserVersion: "",
  },
]);

function availableOs(platform: string) {
  switch (platform) {
    case PLATFORM.DESKTOP:
      return [OPERATING_SYSTEM.WINDOWS, OPERATING_SYSTEM.MAC_OS];
    case PLATFORM.MOBILE:
      return [OPERATING_SYSTEM.ANDROID, OPERATING_SYSTEM.I_OS];
  }
}

function availableAT(os: string) {
  switch (os) {
    case OPERATING_SYSTEM.WINDOWS:
      return [ASSISTIVE_TECHNOLOGY.NVDA, ASSISTIVE_TECHNOLOGY.JAWS];
    case OPERATING_SYSTEM.MAC_OS:
    case OPERATING_SYSTEM.I_OS:
      return [ASSISTIVE_TECHNOLOGY.VOICE_OVER];
    case OPERATING_SYSTEM.ANDROID:
      return [ASSISTIVE_TECHNOLOGY.TALKBACK];
    default:
      return [BROWSERS.FIREFOX, BROWSERS.CHROME, BROWSERS.EDGE];
  }
}

function availableBrowsers(os: string) {
  switch (os) {
    case OPERATING_SYSTEM.WINDOWS:
      return [BROWSERS.FIREFOX, BROWSERS.CHROME, BROWSERS.EDGE];
    case OPERATING_SYSTEM.MAC_OS:
      return [
        BROWSERS.FIREFOX,
        BROWSERS.CHROME,
        BROWSERS.EDGE,
        BROWSERS.SAFARI,
      ];
    case OPERATING_SYSTEM.I_OS:
      return [BROWSERS.SAFARI, BROWSERS.CHROME];
    case OPERATING_SYSTEM.ANDROID:
      return [BROWSERS.FIREFOX, BROWSERS.CHROME];
    default:
      return [
        BROWSERS.FIREFOX,
        BROWSERS.CHROME,
        BROWSERS.EDGE,
        BROWSERS.SAFARI,
      ];
  }
}

const envSupportRefs = ref<HTMLInputElement[]>([]);

/**
 * Create a new environment and focus its support field.
 */
async function addEnvironment() {
  environments.value.push({
    platform: "",
    operatingSystem: "",
    operatingSystemVersion: "",
    assistiveTechnology: "",
    assistiveTechnologyVersion: "",
    browser: "",
    browserVersion: "",
  });
  await nextTick();
  const lastInput = envSupportRefs.value[envSupportRefs.value.length - 1];
  lastInput.focus();
}

/**
 * Delete environment at index and focus previous or first support field.
 * @param {number} i
 */
async function deleteEnvironment(i: number) {
  environments.value.splice(i, 1);
  await nextTick();
  const previousInput =
    i === 0 ? envSupportRefs.value[0] : envSupportRefs.value[i - 1];
  previousInput.focus();
}

const forceShowEnvFields = ref(false);

async function onPlatformChange(env: Omit<AuditEnvironment, "id">) {
  if (!env.operatingSystem && !env.browser && !env.assistiveTechnology) return;
  if (env.operatingSystem && env.browser && env.assistiveTechnology) {
    forceShowEnvFields.value = true;
  }
  if (env.operatingSystem) env.operatingSystem = "";
  if (env.assistiveTechnology) env.assistiveTechnology = "";
  if (env.browser) env.browser = "";
}

async function onOsChange(env: Omit<AuditEnvironment, "id">) {
  if (!env.browser && !env.assistiveTechnology) return;
  if (env.browser && env.assistiveTechnology) {
    forceShowEnvFields.value = true;
  }
  if (env.assistiveTechnology) env.assistiveTechnology = "";
  if (env.browser) env.browser = "";
}

// Other data

const auditInitiator = ref("");
const procedureUrl = ref("");
const contactName = ref("");
const contactEmail = ref("");
const contactFormUrl = ref("");
const notCompliantContent = ref("");
const derogatedContent = ref("");
const notInScopeContent = ref("");

watch(
  () => auditStore.data,
  (audit) => {
    if (!audit) {
      return;
    }
    auditInitiator.value = audit.initiator ?? "";
    procedureUrl.value = audit.procedureUrl ?? "";
    contactName.value = audit.contactName ?? "";
    contactEmail.value = audit.contactEmail ?? "";
    contactFormUrl.value = audit.contactFormUrl ?? "";

    defaultTechnologies.value = audit.technologies.length
      ? audit.technologies.filter((tech) =>
          availableTechnologies.includes(tech)
        )
      : [];
    customTechnologies.value = audit.technologies.length
      ? audit.technologies.filter(
          (tech) => !availableTechnologies.includes(tech)
        )
      : [];

    const auditToolNames = audit.tools.map((t) => t.name);
    defaultTools.value = audit.tools.length
      ? // Cannot use filtered audit.tools because the checkbox array v-model binding wont work with different object refs
        availableTools.filter((tool) => auditToolNames.includes(tool.name))
      : [];

    customTools.value = audit.tools.length
      ? audit.tools.filter((tool) => {
          return !availableTools.map((t) => t.name).includes(tool.name);
        })
      : [
          {
            name: "",
            function: "",
            url: "",
          },
        ];

    notCompliantContent.value = audit.notCompliantContent ?? "";
    derogatedContent.value = audit.derogatedContent ?? "";
    notInScopeContent.value = audit.notInScopeContent ?? "";
  },
  {
    immediate: true,
  }
);

const notify = useNotifications();
const router = useRouter();

function handleSubmit() {
  const data: UpdateAuditRequestData = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...auditStore.data!,

    initiator: auditInitiator.value,
    procedureUrl: procedureUrl.value,

    contactEmail: contactEmail.value,
    contactFormUrl: contactFormUrl.value,
    contactName: contactName.value,

    technologies: auditTechnologies.value,
    environments: environments.value,
    tools: tools.value,

    // TODO: plug not accessible content
    notCompliantContent: notCompliantContent.value,
    derogatedContent: derogatedContent.value,
    notInScopeContent: notInScopeContent.value,
  };
  return auditStore
    .updateAudit(uniqueId, data)
    .then(() => {
      router.push({
        name: "edit-audit-step-four",
        params: { uniqueId },
      });
    })
    .catch((err) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
      throw err;
    });
}

/**
 * TODO: remove this
 * Dev function to avoid filling all fields manually
 */
function DEBUG_fillFields() {
  console.log(
    "🚀 ~ file: EditAuditDeclarationPage.vue ~ line 339 ~ DEBUG_fillFields ~ DEBUG_fillFields",
    DEBUG_fillFields
  );
  auditInitiator.value = "Mairie de Tours";
  procedureUrl.value = "https://example.com";
  contactEmail.value = "philipinne-jolivet@example.com";
  contactFormUrl.value = "https://example.com/contact";
  defaultTechnologies.value = ["HTML", "CSS"];
  customTechnologies.value = ["WordPress"];

  notCompliantContent.value =
    "Sit aliquip velit adipisicing esse cupidatat. Dolor nisi do Lorem laboris cillum anim adipisicing reprehenderit laboris id ullamco. Cillum aute do consectetur et exercitation consequat exercitation sunt sunt id dolore aliquip. Dolor cillum anim do id ipsum occaecat quis voluptate. Commodo adipisicing sit proident consequat ex incididunt. Minim sit esse ad id do pariatur in occaecat proident eiusmod velit.";
  notInScopeContent.value =
    "Non officia voluptate id magna culpa consectetur ex officia quis magna quis sint.";
  derogatedContent.value =
    "Nostrud duis ut sint et et. Consequat fugiat sunt est elit sunt.";

  defaultTools.value = [availableTools[2]];
  customTools.value = [
    {
      name: "Firefox Devtools",
      function: "Inspecter et débugguer le code d’une page web.",
      url: "https://firefox-dev.tools/",
    },
    {
      name: "AXE Webextension",
      function: "Analyser les problèmes d’accessibilité d’une page web.",
      url: "https://www.deque.com/axe/devtools/",
    },
  ];
  environments.value = [
    {
      platform: PLATFORM.DESKTOP,
      operatingSystem: OPERATING_SYSTEM.WINDOWS,
      operatingSystemVersion: "11",
      assistiveTechnology: ASSISTIVE_TECHNOLOGY.NVDA,
      assistiveTechnologyVersion: "",
      browser: BROWSERS.FIREFOX,
      browserVersion: "104",
    },
    {
      platform: PLATFORM.DESKTOP,
      operatingSystem: OPERATING_SYSTEM.MAC_OS,
      operatingSystemVersion: "12.5",
      assistiveTechnology: ASSISTIVE_TECHNOLOGY.VOICE_OVER,
      assistiveTechnologyVersion: "",
      browser: BROWSERS.SAFARI,
      browserVersion: "15.6",
    },
  ];
}

const isDevMode = useDevMode();
</script>

<template>
  <!-- TODO: update meta -->
  <PageMeta
    title="Paramètres de l’audit"
    description="Saisissez le type d'audit que vous souhaitez réaliser et l'ensemble des paramètres de votre futur audit."
  />

  <form v-if="auditStore.data" @submit.prevent="handleSubmit">
    <h1 ref="stepTitleRef" class="fr-mb-3v">📄 Déclaration d’accessibilité</h1>
    <p class="fr-text--sm mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <div class="content">
      <h2 class="fr-h4">Informations générales</h2>

      <div class="fr-input-group">
        <label class="fr-label" for="initiator">
          Entité qui demande l’audit
          <span class="fr-hint-text">
            Exemple : Ministère de l’intérieur, Mairie de Toulouse, etc
          </span>
        </label>
        <input
          id="initiator"
          v-model="auditInitiator"
          class="fr-input"
          required
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="procedure-url">
          URL de la page d’accueil du site à auditer
          <span class="fr-hint-text">
            Saisissez une url valide, commençant par
            <code>https://</code>
          </span>
        </label>
        <input
          id="procedure-url"
          v-model="procedureUrl"
          class="fr-input"
          type="url"
          required
        />
      </div>

      <fieldset class="fr-fieldset fr-mt-6w">
        <legend>
          <h2 class="fr-h4 fr-mb-2w">Retour d’information et contact</h2>
        </legend>

        <p>
          Ces informations permettent aux usagers qui rencontrent des
          difficultés pour accéder à du contenu ou à un service d’être orienté
          vers une solution adaptée.
        </p>

        <div class="fr-input-group">
          <label class="fr-label" for="procedure-manager-name">
            Nom et prénom du contact (optionnel)
          </label>
          <input
            id="procedure-manager-name"
            v-model="contactName"
            class="fr-input"
          />
        </div>

        <div class="fr-input-group">
          <label class="fr-label" for="procedure-manager-email">
            Adresse e-mail
            <span class="fr-hint-text">
              Exemple : contact@ministere.gouv.fr
            </span>
          </label>
          <input
            id="procedure-manager-email"
            v-model="contactEmail"
            class="fr-input"
            type="email"
            required
          />
        </div>

        <div class="fr-input-group">
          <label class="fr-label" for="procedure-manager-form-url">
            URL vers formulaire de contact
            <span class="fr-hint-text">
              Saisissez une URL valide, commençant par <code>http://</code> ou
              <code>https://</code>
            </span>
          </label>
          <input
            id="procedure-manager-form-url"
            v-model="contactFormUrl"
            class="fr-input"
            type="url"
            required
            placeholder="https://"
          />
        </div>
      </fieldset>

      <fieldset class="fr-fieldset fr-mt-6w">
        <legend class="fr-fieldset__legend">
          <h2 class="fr-h4 fr-mb-0">Technologies utilisées sur le site</h2>
        </legend>

        <div class="fr-fieldset__content">
          <div
            v-for="(tech, i) in availableTechnologies"
            :key="i"
            class="fr-checkbox-group"
          >
            <input
              :id="`tech-${i}`"
              v-model="defaultTechnologies"
              type="checkbox"
              :value="tech"
            />
            <label class="fr-label" :for="`tech-${i}`">
              {{ tech }}
            </label>
          </div>
        </div>
      </fieldset>

      <template v-for="(_, i) in customTechnologies" :key="i">
        <label class="fr-label fr-mb-1w fr-mt-4w" :for="`custom-tech-${i}`">
          Ajouter une technologie
        </label>
        <div class="delete-custom-tech">
          <input
            :id="`custom-tech-${i}`"
            ref="customTechNameRefs"
            v-model="customTechnologies[i]"
            class="fr-input"
            type="text"
          />
          <button
            class="fr-btn fr-btn--tertiary-no-outline fr-ml-3v"
            :disabled="customTechnologies.length === 1"
            type="button"
            @click="deleteCustomTech(i)"
          >
            Supprimer
          </button>
        </div>
      </template>

      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-mt-4w fr-mb-5w"
        type="button"
        @click="addTech"
      >
        Ajouter un outil
      </button>

      <div class="content">
        <div class="fr-form-group">
          <fieldset class="fr-fieldset">
            <legend class="fr-fieldset__legend fr-text--regular">
              <h2 class="fr-h4 fr-mb-0">
                Outils d’assistance utilisés pour vérifier l’accessibilité
              </h2>
            </legend>
            <div class="fr-fieldset__content">
              <div
                v-for="(tool, i) in availableTools"
                :key="i"
                class="fr-checkbox-group"
              >
                <input
                  :id="`tool-${i}`"
                  v-model="defaultTools"
                  type="checkbox"
                  :value="tool"
                />
                <label class="fr-label" :for="`tool-${i}`">
                  {{ tool.name }}
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        <h2 class="fr-h4">Ajouter un outil d’assistance (optionnel)</h2>

        <fieldset
          v-for="(tool, i) in customTools"
          :key="i"
          class="fr-fieldset fr-mt-4w fr-p-4w tools-card"
        >
          <div class="fr-mb-2w tools-header">
            <legend class="fr-legend fr-mb-1w" :for="`custom-tool-${i}`">
              <h3 class="fr-h6 fr-mb-0">Outil {{ i + 1 }}</h3>
            </legend>

            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-ml-3v"
              type="button"
              :disabled="customTools.length === 1"
              @click="deleteCustomTool(i)"
            >
              Supprimer
            </button>
          </div>

          <div class="fr-input-group">
            <label class="fr-label" :for="`tool-name-${i + 1}`">
              Nom de l’outil
            </label>
            <input
              :id="`tool-name-${i + 1}`"
              ref="customToolNameRefs"
              v-model="tool.name"
              class="fr-input"
              required
            />
          </div>

          <div class="fr-input-group">
            <label class="fr-label" :for="`tool-function-${i + 1}`">
              Fonction
            </label>
            <input
              :id="`tool-function-${i + 1}`"
              v-model="tool.function"
              class="fr-input"
              required
            />
          </div>

          <div class="fr-input-group">
            <label class="fr-label" :for="`tool-url-${i + 1}`">
              URL de l’outil
            </label>
            <input
              :id="`tool-url-${i + 1}`"
              v-model="tool.url"
              class="fr-input"
              type="url"
              required
              placeholder="https://"
            />
          </div>
        </fieldset>

        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-mt-4w fr-mb-5w"
          type="button"
          @click="addTool"
        >
          Ajouter un outil
        </button>

        <h2 class="fr-h4 fr-mt-6w">Les environnements de test</h2>
        <fieldset
          v-for="(env, i) in environments"
          :key="i"
          class="fr-fieldset fr-mt-4w fr-p-4w env-card"
        >
          <div class="fr-mb-2w env-header">
            <legend>
              <h3 class="fr-h6 fr-mb-0">Environnement {{ i + 1 }}</h3>
            </legend>
            <button
              class="fr-btn fr-btn--tertiary-no-outline"
              type="button"
              :disabled="environments.length === 1"
              @click="deleteEnvironment(i)"
            >
              Supprimer
            </button>
          </div>
          <div class="fr-form-group">
            <fieldset class="fr-fieldset fr-fieldset--inline">
              <legend class="fr-fieldset__legend fr-text--regular">
                Support
              </legend>
              <div class="fr-fieldset__content">
                <div class="fr-radio-group">
                  <input
                    :id="`env-support-desktop-${i}`"
                    ref="envSupportRefs"
                    v-model="env.platform"
                    type="radio"
                    :name="`env-support-${i}`"
                    :value="PLATFORM.DESKTOP"
                    @change="onPlatformChange(environments[i])"
                  />
                  <label class="fr-label" :for="`env-support-desktop-${i}`"
                    >Ordinateur</label
                  >
                </div>
                <div class="fr-radio-group">
                  <input
                    :id="`env-support-mobile-${i}`"
                    v-model="env.platform"
                    type="radio"
                    :name="`env-support-${i}`"
                    :value="PLATFORM.MOBILE"
                    @change="onPlatformChange(environments[i])"
                  />
                  <label class="fr-label" :for="`env-support-mobile-${i}`">
                    Mobile
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          <div v-if="env.platform" class="fr-select-group">
            <label class="fr-label" :for="`env-os-${i}`">
              Logiciel d’exploitation
            </label>
            <select
              :id="`env-os-${i}`"
              v-model="env.operatingSystem"
              class="fr-select"
              @change="onOsChange(environments[i])"
            >
              <option value="" selected disabled hidden>
                Selectionnez une option
              </option>
              <option
                v-for="os in availableOs(env.platform)"
                :key="os"
                :value="os"
              >
                {{ os }}
              </option>
            </select>
          </div>
          <div
            v-if="env.operatingSystem || forceShowEnvFields"
            class="fr-input-group"
          >
            <label class="fr-label" :for="`env-os-version-${i}`">
              Version du logiciel d’exploitation (optionnel)
            </label>
            <input
              :id="`env-os-version-${i}`"
              v-model="env.operatingSystemVersion"
              class="fr-input"
            />
          </div>

          <div
            v-if="env.operatingSystem || forceShowEnvFields"
            class="fr-select-group"
          >
            <label class="fr-label" :for="`env-at-${i}`">
              Technologie d’assistance
            </label>
            <select
              :id="`env-at-${i}`"
              v-model="env.assistiveTechnology"
              class="fr-select"
            >
              <option value="" selected disabled hidden>
                Selectionnez une option
              </option>
              <option
                v-for="at in availableAT(env.operatingSystem)"
                :key="at"
                :value="at"
              >
                {{ at }}
              </option>
            </select>
          </div>
          <div
            v-if="env.assistiveTechnology || forceShowEnvFields"
            class="fr-input-group"
          >
            <label class="fr-label" :for="`env-at-version-${i}`">
              Version de la technologie d’assistance (optionnel)
            </label>
            <input
              :id="`env-at-version-${i}`"
              v-model="env.assistiveTechnologyVersion"
              class="fr-input"
            />
          </div>

          <div
            v-if="env.assistiveTechnology || forceShowEnvFields"
            class="fr-select-group"
          >
            <label class="fr-label" :for="`env-browser-${i}`">
              Navigateur
            </label>
            <select
              :id="`env-browser-${i}`"
              v-model="env.browser"
              class="fr-select"
            >
              <option value="" selected disabled hidden>
                Selectionnez une option
              </option>
              <option
                v-for="browser in availableBrowsers(env.operatingSystem)"
                :key="browser"
                :value="browser"
              >
                {{ browser }}
              </option>
            </select>
          </div>
          <div v-if="env.browser || forceShowEnvFields" class="fr-input-group">
            <label class="fr-label" :for="`env-browser-version-${i}`">
              Version du navigateur (optionnel)
            </label>
            <input
              :id="`env-browser-version-${i}`"
              v-model="env.browserVersion"
              class="fr-input"
            />
          </div>
        </fieldset>
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-mt-4w fr-mb-5w"
          type="button"
          @click="addEnvironment"
        >
          Ajouter un environnement
        </button>

        <h2 class="fr-h4">Dérogations</h2>
        <p>
          Ces informations doivent faire l’objet d’une discussion entre
          l’auditeur et le responsable du site audité. C’est le responsable du
          site audité qui accepte de prendre le risque juridique de mentionner
          des contenus dérogés. Si aucun contenu n’est à déroger, laissez les
          deux champs vides.
        </p>

        <div class="fr-input-group">
          <label class="fr-label" for="notCompliantContent">
            Non-conformités (optionnel)
            <span class="fr-hint-text">
              Il s’agit d’un résumé des contenus et fonctionnalités non
              conformes identifiés sur le site. Ils doivent être rédigés dans un
              langage simple et compréhensible par toutes et tous.
            </span>
          </label>
          <textarea
            id="notCompliantContent"
            class="fr-input"
            v-model="notCompliantContent"
          />
        </div>

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
            class="fr-input"
            v-model="derogatedContent"
          />
        </div>

        <div class="fr-input-group">
          <label class="fr-label" for="notInScopeContent">
            Contenus non soumis à l’obligation d’accessibilité, contenus tiers
            (optionnel)
            <span class="fr-hint-text">
              Exemple : Cartes interactives, fil d’actualité réseaux social,
              lecteur vidéo, etc
            </span>
          </label>
          <textarea
            id="notInScopeContent"
            class="fr-input"
            v-model="notInScopeContent"
          />
        </div>
      </div>

      <div v-if="isDevMode">
        <button
          class="fr-btn fr-mt-6w fr-mb-1w fr-mr-2w"
          type="button"
          @click="DEBUG_fillFields"
        >
          [DEV] Remplir les champs
        </button>
      </div>

      <div class="fr-mt-6w">
        <button class="fr-btn" type="submit">Enregistrer</button>
      </div>
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

.delete-custom-tool {
  display: flex;
}

.delete-custom-tech {
  display: flex;
}

.tools-card,
.env-card,
.page-card {
  border: 1px solid var(--border-default-grey);
}

.tools-header,
.env-header,
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
