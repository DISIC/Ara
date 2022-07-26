<script lang="ts" setup>
import { ref, nextTick } from "vue";
import router from "../router";
import AuditType from "../components/AuditType.vue";
import LeaveModal from "../components/LeaveModal.vue";

const availableAuditTypes = [
  { label: "Rapide", value: "fast", badge: "25 critères" },
  { label: "Complémentaire", value: "complementary", badge: "50 critères" },
  { label: "Complet", value: "full", badge: "106 critères" },
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

const auditType = ref<string>("");
const tools = ref<string[]>([]);
const pages = ref([
  {
    name: "",
    url: "",
  },
]);
const environments = ref([
  {
    support: "",
    at: "",
    browser: "",
  },
]);
const isLeaveModalOpen = ref(false);

const pageNameRefs = ref<HTMLInputElement[]>([]);
const envSupportRefs = ref<HTMLInputElement[]>([]);

/**
 * Add or remove a tool from the list.
 * @param {string} tool
 */
async function toggleTool(tool: string) {
  const toolIndex = tools.value.indexOf(tool);

  if (toolIndex === -1) {
    tools.value.push(tool);
  } else {
    tools.value.splice(toolIndex, 1);
  }
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
    support: "",
    at: "",
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

async function showLeaveModal() {
  isLeaveModalOpen.value = true;
}

async function confirmLeave() {
  router.push({ name: "home" });
}

function submitStepTwo() {
  // TODO: complete
  const data = {
    auditType: auditType.value,
    tools: tools.value,
    environments: environments.value,
    pages: pages.value,
  };
  console.log(data);
}

function toStepOne() {
  router.push({ name: "new-audit-step-one" });
}

/**
 * TODO: remove this
 * Dev function to avoid filling all fields manually
 */
function fillFields() {
  auditType.value = "complementary";
  tools.value = [
    "WCAG Contrast checker",
    "Firefox Devtools",
    "Web Accessibility Toolbar",
  ];
  environments.value = [
    {
      support: "desktop",
      at: "jaws-latest",
      browser: "edge",
    },
    {
      support: "mobile",
      at: "nvda-previous",
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
  <form @submit.prevent="submitStepTwo">
    <h1 class="fr-mb-3v">📄 Informations sur l’audit</h1>
    <p class="fr-text--sm mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <section class="fr-form-group">
      <fieldset class="fr-fieldset">
        <legend id="radio-rich-legend" class="fr-fieldset__legend">
          <h2 class="fr-h4 fr-mb-0">Type d’audit</h2>
        </legend>
        <div class="fr-fieldset__content audit-types">
          <AuditType
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
        <h2 class="fr-h4">Les outils d’audit</h2>
        <ul class="fr-tags-group">
          <li v-for="(tool, i) in availableTools" :key="i">
            <button
              type="button"
              class="fr-tag"
              aria-pressed="false"
              @click="toggleTool(tool)"
            >
              {{ tool }}
            </button>
          </li>
        </ul>
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
                  v-model="env.support"
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
                  v-model="env.support"
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
        <div v-if="env.support" class="fr-select-group">
          <label class="fr-label" :for="`env-at-${i}`">
            Technologie d’assistance
          </label>
          <select :id="`env-at-${i}`" v-model="env.at" class="fr-select">
            <option value="" selected disabled hidden>
              Selectionnez une option
            </option>
            <option v-for="at in availableAT" :key="at.value" :value="at.value">
              {{ at.label }}
            </option>
          </select>
        </div>
        <div v-if="env.at" class="fr-select-group">
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
        class="fr-link fr-mt-4w fr-mb-5w fr-link--icon-left fr-icon-add-line"
        type="button"
        @click="addEnvironment"
      >
        Ajouter environnement
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
      class="fr-link fr-mt-4w fr-link--icon-left fr-icon-add-line"
      type="button"
      @click="addPage"
    >
      Ajouter page
    </button>

    <div>
      <button
        class="fr-btn fr-mt-6w fr-mb-1w fr-mr-2w"
        type="button"
        @click="fillFields"
      >
        [DEV] Remplir les champs
      </button>
      <button
        class="fr-btn fr-mt-6w fr-mb-1w"
        type="button"
        :data-fr-opened="isLeaveModalOpen"
        aria-controls="leave-modal"
        @click="showLeaveModal"
      >
        [DEV] Afficher la modale
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
  <LeaveModal
    v-if="isLeaveModalOpen"
    title="Vous allez quitter l’audit"
    confirm="Oui, quitter l’audit"
    cancel="Non, poursuivre l’audit"
    @confirm="confirmLeave"
  >
    <p>
      Mais pas de panique, vos informations ont été sauvegardées. Vous pouvez
      revenir sur la création de votre audit en utilisant le lien administrateur
      que vous avez reçu par e-mail.
    </p>
    <p>Souhaitez-vous quitter l’audit ?</p>
  </LeaveModal>
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
