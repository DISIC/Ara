<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { updateAudit, useAudit } from "../../api";
import AuditTypeRadio from "../../components/AuditTypeRadio.vue";
import SaveModal from "../../components/SaveModal.vue";
import { AuditType } from "../../types";

const router = useRouter();

const route = useRoute();
const uniqueId = route.params.uniqueId as string;
const { data: audit, error } = useAudit(uniqueId);

watch(error, (error) => {
  const errorStatus: number = error?.response?.status || 404;

  if ([404, 410].includes(errorStatus)) {
    router.replace({
      name: "Error",
      params: { pathMatch: route.path.substring(1).split("/") },
      query: route.query,
      hash: route.hash,
      state: {
        errorStatus,
      },
    });
  }
});

const availableAuditTypes = [
  {
    label: "Rapide",
    value: AuditType.FAST,
    badge: "25 critères",
  },
  {
    label: "Complémentaire",
    value: AuditType.COMPLEMENTARY,
    badge: "50 critères",
  },
  {
    label: "Complet",
    value: AuditType.FULL,
    badge: "106 critères",
  },
];
const availableTools = [
  "Web Accessibility Toolbar",
  "Validateur en ligne W3C",
  "WCAG Contrast checker",
  "Color Contrast Analyser",
  "HeadingsMap",
  "PAC (PDF Accessibility Checker)",
  "Word Accessibility Plug-in pour Microsoft Office Windows",
  "AccessODF pour LibreOffice",
  "Ace by DAISY App",
  "PEAT (Photosensitive Epilepsy Analysis Tool)",
];
const availableAT = [
  { label: "NVDA (dernière version)", value: "nvda-latest" },
  { label: "JAWS (dernière version)", value: "jaws-latest" },
  { label: "VoiceOver (dernière version)", value: "vo-latest" },
  { label: "NVDA (version précédente)", value: "nvda-previous" },
  { label: "JAWS (version précédente)", value: "jaws-previous" },
  { label: "VoiceOver (version précédente)", value: "vo-previous" },
];
const availableBrowsers = [
  { label: "Firefox", value: "firefox" },
  { label: "Google Chrome", value: "chrome" },
  { label: "Microsoft Edge", value: "edge" },
  { label: "Safari", value: "safari" },
];

const auditType = ref<AuditType | null>(null);
const defaultTools = ref<string[]>([]);
const customTools = ref<string[]>([""]);
const auditTools = computed(() => {
  return [...defaultTools.value, ...customTools.value].filter(Boolean);
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
    assistiveTechnology: "",
    browser: "",
  },
]);
const customToolNameRefs = ref<HTMLInputElement[]>([]);
const pageNameRefs = ref<HTMLInputElement[]>([]);
const envSupportRefs = ref<HTMLInputElement[]>([]);

const isSaveModalVisible = ref(false);
const saveModalRef = ref();
const stepTitleRef = ref<HTMLHeadingElement>();

async function openSaveModal() {
  isSaveModalVisible.value = true;
  await nextTick();
  saveModalRef.value.open();
}

async function closeSaveModal() {
  isSaveModalVisible.value = false;
  await nextTick();
  stepTitleRef.value?.focus();
}

onMounted(async () => {
  // FIXME: find a better way to wait for DSFR to be loaded
  // TODO: define when should the modal be seen
  setTimeout(() => {
    openSaveModal();
  }, 1000);
});

watch(audit, (audit) => {
  if (!audit) {
    return;
  }
  auditType.value = audit.auditType ?? null;
  defaultTools.value = audit.auditTools.length
    ? audit.auditTools.filter((tool) => availableTools.includes(tool))
    : [];
  customTools.value = audit.auditTools.length
    ? audit.auditTools.filter((tool) => !availableTools.includes(tool))
    : [""];
  pages.value = audit.pages.length
    ? audit.pages
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
          assistiveTechnology: "",
          browser: "",
        },
      ];
});

/**
 * Create a new tool and focus its field.
 */
async function addTool() {
  customTools.value.push("");
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
    assistiveTechnology: "",
    browser: "",
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

function saveAuditChanges() {
  const data = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...audit.value!,
    auditType: auditType.value,
    auditTools: auditTools.value,
    environments: environments.value,
    pages: pages.value,
  };

  return updateAudit(uniqueId, data);
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
  defaultTools.value = ["Color Contrast Analyser"];
  customTools.value = ["Firefox Devtools", "AXE Webextension"];
  environments.value = [
    {
      platform: "desktop",
      assistiveTechnology: "jaws-latest",
      browser: "edge",
    },
    {
      platform: "mobile",
      assistiveTechnology: "nvda-previous",
      browser: "chrome",
    },
  ];
  pages.value = [
    { name: "Accueil", url: "https://example.com" },
    { name: "Contact", url: "https://example.com/contact" },
  ];
}
</script>

<template>
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
  <form v-if="audit" @submit.prevent="toStepThree">
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
            :value="type.value"
            :label="type.label"
            :badge="type.badge"
            :checked="auditType === type.value"
          />
        </div>
      </fieldset>
    </section>

    <div class="content">
      <section class="fr-mb-4w">
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
                  {{ tool }}
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        <template v-for="(tool, i) in customTools" :key="i">
          <label class="fr-label fr-mb-1w fr-mt-4w" :for="`custom-tool-${i}`">
            Ajouter un outil d’assistance (optionnel)
          </label>
          <div class="delete-custom-tool">
            <input
              :id="`custom-tool-${i}`"
              ref="customToolNameRefs"
              v-model="customTools[i]"
              class="fr-input"
              type="text"
            />
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-ml-3v"
              :disabled="customTools.length === 1"
              type="button"
              @click="deleteCustomTool(i)"
            >
              Supprimer
            </button>
          </div>
        </template>

        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-mt-4w fr-mb-5w"
          type="button"
          @click="addTool"
        >
          Ajouter un outil
        </button>
      </section>

      <h2 class="fr-h4">Les environnements de test</h2>
      <fieldset
        v-for="(env, i) in environments"
        :key="i"
        class="fr-fieldset fr-mt-4w fr-p-4w env-card"
      >
        <div class="env-header">
          <legend>
            <h3>Environnement {{ i + 1 }}</h3>
          </legend>
          <button
            class="fr-link"
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
                />
                <label class="fr-label" :for="`env-support-mobile-${i}`"
                  >Mobile</label
                >
              </div>
            </div>
          </fieldset>
        </div>
        <div v-if="env.platform" class="fr-select-group">
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
            <option v-for="at in availableAT" :key="at.value" :value="at.value">
              {{ at.label }}
            </option>
          </select>
        </div>
        <div v-if="env.assistiveTechnology" class="fr-select-group">
          <label class="fr-label" :for="`env-browser-${i}`">Navigateur</label>
          <select
            :id="`env-browser-${i}`"
            v-model="env.browser"
            class="fr-select"
          >
            <option value="" selected disabled hidden>
              Selectionnez une option
            </option>
            <option
              v-for="browser in availableBrowsers"
              :key="browser.value"
              :value="browser.value"
            >
              {{ browser.label }}
            </option>
          </select>
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
            <h3 class="fr-text--lg fr-mb-0">Page {{ i + 1 }}</h3>
          </legend>

          <button
            class="fr-link"
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
    </div>
    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-mt-4w"
      type="button"
      @click="addPage"
    >
      Ajouter une page
    </button>

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

  <SaveModal
    v-if="isSaveModalVisible"
    ref="saveModalRef"
    :audit-id="uniqueId"
    v-on="{ close: closeSaveModal, 'dsfr.conceal': closeSaveModal }"
  />
</template>

<style scoped>
.content {
  max-width: 792px;
}

.mandatory-notice {
  color: var(--text-mention-grey);
}

.audit-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.delete-custom-tool {
  display: flex;
}

.env-card,
.page-card {
  border: 1px solid var(--border-default-grey);
}

.env-header,
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
