<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import AuditTypeRadio from "../../components/AuditTypeRadio.vue";
import PageMeta from "../../components/PageMeta";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { usePreviousRoute } from "../../composables/usePreviousRoute";
import { useAuditStore } from "../../store";
import { AuditType, AuditEnvironment } from "../../types";

const router = useRouter();
const route = useRoute();

const uniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();

useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));

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
const availableTools = [
  {
    name: "Web Accessibility Toolbar",
    function: "todo",
    url: "https://example.com",
  },
  {
    name: "Validateur en ligne W3C",
    function: "todo",
    url: "https://example.com",
  },
  {
    name: "WCAG Contrast checker",
    function: "todo",
    url: "https://example.com",
  },
  {
    name: "Color Contrast Analyser",
    function: "todo",
    url: "https://example.com",
  },
  { name: "HeadingsMap", function: "todo", url: "https://example.com" },
  {
    name: "PAC (PDF Accessibility Checker)",
    function: "todo",
    url: "https://example.com",
  },
  {
    name: "Word Accessibility Plug-in pour Microsoft Office Windows",
    function: "todo",
    url: "https://example.com",
  },
  {
    name: "AccessODF pour LibreOffice",
    function: "todo",
    url: "https://example.com",
  },
  { name: "Ace by DAISY App", function: "todo", url: "https://example.com" },
  {
    name: "PEAT (Photosensitive Epilepsy Analysis Tool)",
    function: "todo",
    url: "https://example.com",
  },
];

function availableOs(platform: string) {
  switch (platform) {
    case "desktop":
      return ["Windows", "MacOS"];
    case "mobile":
      return ["Android", "iOS"];
  }
}

function availableAT(os: string) {
  switch (os) {
    case "Windows":
      return ["NVDA", "JAWS"];
    case "MacOS":
    case "iOS":
      return ["VoiceOver"];
    case "Android":
      return ["Talkback"];
    default:
      return ["Firefox", "Google Chrome", "Microsoft Edge"];
  }
}

function availableBrowsers(os: string) {
  switch (os) {
    case "Windows":
      return ["Firefox", "Google Chrome", "Microsoft Edge"];
    case "MacOS":
      return ["Firefox", "Google Chrome", "Microsoft Edge", "Safari"];
    case "iOS":
      return ["Safari", "Google Chrome"];
    case "Android":
      return ["Firefox", "Google Chrome"];
    default:
      return ["Firefox", "Google Chrome", "Microsoft Edge", "Safari"];
  }
}

const auditType = ref<AuditType | null>(null);
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
// FIXME: make required fields inside nested form
const tools = computed(() => {
  return [...defaultTools.value, ...customTools.value].filter(
    (t) => t.name !== "" || t.function !== "" || t.url !== ""
  );
});
const pages = ref([
  {
    name: "",
    url: "",
  },
]);
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
const notCompliantContent = ref("");
const derogatedContent = ref("");
const notInScopeContent = ref("");

const customToolNameRefs = ref<HTMLInputElement[]>([]);
const pageNameRefs = ref<HTMLInputElement[]>([]);
const envSupportRefs = ref<HTMLInputElement[]>([]);

const stepTitleRef = ref<HTMLHeadingElement>();
const showAdminAlert = ref(false);

async function hideAdminAlert() {
  showAdminAlert.value = false;
  await nextTick();
  stepTitleRef.value?.focus();
}

// Show alert only when coming from first step on new audit
const { route: previousRoute } = usePreviousRoute();
if (previousRoute?.name === "new-audit-step-one") {
  showAdminAlert.value = true;
}

const { data: audit } = storeToRefs(auditStore);

watch(
  [audit],
  ([audit]) => {
    if (!audit) {
      return;
    }
    auditType.value = audit.auditType ?? null;
    defaultTools.value = audit.tools.length
      ? audit.tools.filter((tool) => availableTools.includes(tool))
      : [
          {
            name: "",
            function: "",
            url: "",
          },
        ];
    customTools.value = audit.tools.length
      ? audit.tools.filter((tool) => !availableTools.includes(tool))
      : [
          {
            name: "",
            function: "",
            url: "",
          },
        ];
    pages.value = audit.pages.length
      ? audit.pages.map((p) => ({ ...p }))
      : [
          {
            name: "",
            url: "",
          },
        ];
    environments.value = audit.environments.length
      ? audit.environments
      : [
          {
            platform: "",
            operatingSystem: "",
            operatingSystemVersion: "",
            assistiveTechnology: "",
            assistiveTechnologyVersion: "",
            browser: "",
            browserVersion: "",
          },
        ];
    // TODO: prefill values
    notCompliantContent.value = audit.notCompliantContent ?? "";
    derogatedContent.value = audit.derogatedContent ?? "";
    notInScopeContent.value = audit.notInScopeContent ?? "";
  },
  { immediate: true }
);

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

const notify = useNotifications();

function saveAuditChanges() {
  const data = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...auditStore.data!,
    auditType: auditType.value,
    tools: tools.value,
    environments: environments.value,
    pages: pages.value.filter((p) => p.name !== "" || p.url !== ""),
    // TODO: plug not accessible content
    notCompliantContent: notCompliantContent.value,
    derogatedContent: derogatedContent.value,
    notInScopeContent: notInScopeContent.value,
  };

  return auditStore.updateAudit(uniqueId, data).catch((err) => {
    notify(
      "error",
      "Une erreur est survenue",
      "Un problème empêche la sauvegarde de vos données. Contactez nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
    );
    throw err;
  });
}

function toStepOne() {
  saveAuditChanges().then(() => {
    router.push({ name: "edit-audit-step-one", params: { uniqueId } });
  });
}

function toStepThree() {
  saveAuditChanges().then(() => {
    router.push({ name: "edit-audit-step-three", params: { uniqueId } });
  });
}

/**
 * TODO: remove this
 * Dev function to avoid filling all fields manually
 */
function fillFields() {
  auditType.value = AuditType.COMPLEMENTARY;
  defaultTools.value = [
    {
      name: "Color Contrast Analyser",
      function: "Relever les contrastes non conforme au sein d’une page web.",
      url: "https://www.tpgi.com/color-contrast-checker/",
    },
  ];
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
      platform: "desktop",
      operatingSystem: "Windows",
      operatingSystemVersion: "11",
      assistiveTechnology: "NVDA",
      assistiveTechnologyVersion: "",
      browser: "Firefox",
      browserVersion: "104",
    },
    {
      platform: "desktop",
      operatingSystem: "MacOS",
      operatingSystemVersion: "12.5",
      assistiveTechnology: "VoiceOver",
      assistiveTechnologyVersion: "",
      browser: "Safari",
      browserVersion: "15.6",
    },
  ];
  pages.value = [
    { name: "Accueil", url: "https://example.com" },
    { name: "Contact", url: "https://example.com/contact" },
  ];
  notCompliantContent.value =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis, veniam? Rerum laborum eaque fugiat, harum beatae magni quia eius. Aliquam cumque minima facere excepturi et temporibus voluptatibus recusandae animi minus?";
  derogatedContent.value =
    "Rerum tenetur, minima id voluptatem soluta dolor, illo consequatur magni obcaecati, quasi eligendi enim mollitia facere. Itaque provident, perspiciatis nesciunt iure excepturi, dignissimos fugit facilis consequuntur voluptates expedita quae laudantium!";
  notInScopeContent.value =
    "Magnam, consectetur dolorum excepturi, corporis enim pariatur illo eius, rerum inventore aliquam facere sunt voluptate totam asperiores porro dicta? Sit maiores neque esse iure labore illum dicta quaerat eius totam.";
}
</script>

<template>
  <PageMeta
    title="Paramètres de l’audit"
    description="Saisissez le type d'audit que vous souhaitez réaliser et l'ensemble des paramètres de votre futur audit."
  />
  <div
    v-if="showAdminAlert"
    class="fr-alert fr-alert--info fr-alert--sm fr-my-9v"
  >
    <p>
      Nous vous avons envoyé un e-mail avec le lien administrateur de l’audit.
      Conservez-le et ne le partagez-pas, il vous permet de modifier l’audit.
    </p>
    <button
      class="fr-btn--close fr-btn"
      title="Masquer le message"
      @click="hideAdminAlert"
    >
      Masquer le message
    </button>
  </div>
  <div class="fr-stepper">
    <h2 class="fr-stepper__title">
      <span class="fr-stepper__state">Étape 2 sur 2</span>
      Paramètres de l’audit
    </h2>
    <div
      class="fr-stepper__steps"
      data-fr-current-step="2"
      data-fr-steps="2"
    ></div>
  </div>
  <form v-if="auditStore.data" @submit.prevent="toStepThree">
    <h1 ref="stepTitleRef" class="fr-mb-3v">📄 Informations sur l’audit</h1>
    <p class="fr-text--sm mandatory-notice">
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

    <div class="content">
      <div class="fr-form-group">
        <fieldset class="fr-fieldset">
          <legend class="fr-fieldset__legend fr-text--regular">
            <h2 class="fr-h4 fr-mb-0">Les outils d’assistance</h2>
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
            placeholder="http://"
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

      <h2 class="fr-h4">Les environnements de test</h2>
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
                  value="desktop"
                  @change="onPlatformChange(environments[i])"
                />
                <label class="fr-label" :for="`env-support-desktop-${i}`"
                  >Desktop</label
                >
              </div>
              <div class="fr-radio-group">
                <input
                  :id="`env-support-mobile-${i}`"
                  v-model="env.platform"
                  type="radio"
                  :name="`env-support-${i}`"
                  value="mobile"
                  @change="onPlatformChange(environments[i])"
                />
                <label class="fr-label" :for="`env-support-mobile-${i}`"
                  >Mobile</label
                >
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
          <label class="fr-label" :for="`env-browser-${i}`"> Navigateur </label>
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

      <h2 class="fr-h4">Contenus non accessibles</h2>
      <p>
        Mentionnez ici les contenus non accessibles présents sur le site. Ces
        informations seront affichées sur la déclaration d’accessibilité.
      </p>

      <div class="fr-input-group">
        <label class="fr-label" for="notCompliantContent">
          Non-conformités
        </label>
        <textarea
          id="notCompliantContent"
          v-model="notCompliantContent"
          class="fr-input"
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="derogatedContent">
          Dérogations pour charge disproportionnée
          <span class="fr-hint-text"
            >Il s’agit des contenus qu’il serait trop coûteux de rendre
            accessibles.</span
          >
        </label>
        <textarea
          id="derogatedContent"
          v-model="derogatedContent"
          class="fr-input"
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="notInScopeContent">
          Contenus non soumis à l’obligation d’accessibilité
          <span class="fr-hint-text">Exemple : Cartes interactives, etc</span>
        </label>
        <textarea
          id="notInScopeContent"
          v-model="notInScopeContent"
          class="fr-input"
        />
      </div>
    </div>

    <div>
      <button
        class="fr-btn fr-mt-6w fr-mb-1w fr-mr-2w"
        type="button"
        @click="fillFields"
      >
        [DEV] Remplir les champs
      </button>
    </div>

    <div class="fr-mt-6w">
      <button
        class="fr-btn fr-btn--secondary fr-mr-2w"
        type="button"
        @click="toStepOne"
      >
        Précédent
      </button>
      <button class="fr-btn" type="submit">Suivant</button>
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
