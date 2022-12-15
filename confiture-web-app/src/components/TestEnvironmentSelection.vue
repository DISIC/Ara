<script lang="ts" setup>
import { uniqWith } from "lodash-es";
import { nextTick, ref, watch } from "vue";

import {
  AssistiveTechnology,
  Browsers,
  OperatingSystem,
  Platform,
} from "../enums";
import { AuditEnvironment } from "../types";
import AuditEnvironmentCheckbox from "./AuditEnvironmentCheckbox.vue";

const props = defineProps<{
  modelValue: Omit<AuditEnvironment, "id">[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: Omit<AuditEnvironment, "id">[]): void;
}>();

const customEnvironments = ref([
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

const selectedDesktopEnvironments = ref<string[]>([]);
const selectedMobileEnvironments = ref<string[]>([]);

watch(
  [customEnvironments, selectedDesktopEnvironments, selectedMobileEnvironments],
  ([
    customEnvironments,
    selectedDesktopEnvironments,
    selectedMobileEnvironments,
  ]) => {
    const result = combineEnvironments(
      customEnvironments,
      selectedDesktopEnvironments,
      selectedMobileEnvironments
    );
    emit("update:modelValue", result);
  },
  {
    deep: true,
  }
);

const desktopEnvironments = [
  {
    title: "Combinaison 1",
    combinations: [
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.FIREFOX,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.NVDA,
        assistiveTechnologyVersion: "",
      },
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.FIREFOX,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.JAWS,
        assistiveTechnologyVersion: "",
      },
      {
        operatingSystem: OperatingSystem.MAC_OS,
        operatingSystemVersion: "",
        browser: Browsers.SAFARI,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        assistiveTechnologyVersion: "",
      },
    ],
  },
  {
    title: "Combinaison 2",
    combinations: [
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.FIREFOX,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.NVDA,
        assistiveTechnologyVersion: "",
      },
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.EDGE,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.JAWS,
        assistiveTechnologyVersion: "",
      },
      {
        operatingSystem: OperatingSystem.MAC_OS,
        operatingSystemVersion: "",
        browser: Browsers.SAFARI,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        assistiveTechnologyVersion: "",
      },
    ],
  },
  {
    title: "Combinaison 3",
    combinations: [
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.EDGE,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.NVDA,
        assistiveTechnologyVersion: "",
      },
      {
        operatingSystem: OperatingSystem.WINDOWS,
        operatingSystemVersion: "",
        browser: Browsers.FIREFOX,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.JAWS,
        assistiveTechnologyVersion: "",
      },
      {
        operatingSystem: OperatingSystem.MAC_OS,
        operatingSystemVersion: "",
        browser: Browsers.SAFARI,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        assistiveTechnologyVersion: "",
      },
    ],
  },
];
const mobileEnvironments = [
  {
    title: "Combinaison 1",
    combinations: [
      {
        operatingSystem: OperatingSystem.I_OS,
        operatingSystemVersion: "",
        browser: Browsers.SAFARI,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        assistiveTechnologyVersion: "",
      },
    ],
  },
  {
    title: "Combinaison 2",
    combinations: [
      {
        operatingSystem: OperatingSystem.ANDROID,
        operatingSystemVersion: "",
        browser: Browsers.CHROME,
        browserVersion: "",
        assistiveTechnology: AssistiveTechnology.TALKBACK,
        assistiveTechnologyVersion: "",
      },
    ],
  },
];

function availableOs(platform: string) {
  switch (platform) {
    case Platform.DESKTOP:
      return [OperatingSystem.WINDOWS, OperatingSystem.MAC_OS];
    case Platform.MOBILE:
      return [OperatingSystem.ANDROID, OperatingSystem.I_OS];
  }
}

function availableAT(os: string) {
  switch (os) {
    case OperatingSystem.WINDOWS:
      return [AssistiveTechnology.NVDA, AssistiveTechnology.JAWS];
    case OperatingSystem.MAC_OS:
    case OperatingSystem.I_OS:
      return [AssistiveTechnology.VOICE_OVER];
    case OperatingSystem.ANDROID:
      return [AssistiveTechnology.TALKBACK];
    default:
      return [Browsers.FIREFOX, Browsers.CHROME, Browsers.EDGE];
  }
}

function availableBrowsers(os: string) {
  switch (os) {
    case OperatingSystem.WINDOWS:
      return [Browsers.FIREFOX, Browsers.CHROME, Browsers.EDGE];
    case OperatingSystem.MAC_OS:
      return [
        Browsers.FIREFOX,
        Browsers.CHROME,
        Browsers.EDGE,
        Browsers.SAFARI,
      ];
    case OperatingSystem.I_OS:
      return [Browsers.SAFARI, Browsers.CHROME];
    case OperatingSystem.ANDROID:
      return [Browsers.FIREFOX, Browsers.CHROME];
    default:
      return [
        Browsers.FIREFOX,
        Browsers.CHROME,
        Browsers.EDGE,
        Browsers.SAFARI,
      ];
  }
}

const envSupportRefs = ref<HTMLInputElement[]>([]);

/**
 * Create a new environment and focus its support field.
 */
async function addEnvironment() {
  customEnvironments.value.push({
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
  customEnvironments.value.splice(i, 1);
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

/**
 * Combine suggested desktop and mobile environments with custom ones.
 */
function combineEnvironments(
  customEnvironments: Omit<AuditEnvironment, "id">[],
  selectedDesktopEnvironments: string[],
  selectedMobileEnvironments: string[]
): Omit<AuditEnvironment, "id">[] {
  const desktop = selectedDesktopEnvironments.length
    ? desktopEnvironments
        .filter((env) => {
          return selectedDesktopEnvironments.includes(env.title);
        })
        .map((env) => {
          return env.combinations.map((c) => {
            return {
              platform: Platform.DESKTOP,
              ...c,
            };
          });
        })
        .flat(2)
    : [];

  const mobile = selectedMobileEnvironments.length
    ? mobileEnvironments
        .filter((env) => {
          return selectedMobileEnvironments.includes(env.title);
        })
        .map((env) => {
          return env.combinations.map((c) => {
            return {
              platform: Platform.MOBILE,
              ...c,
            };
          });
        })
        .flat(2)
    : [];

  const filteredCustomEnvironments = customEnvironments.filter(
    (env) =>
      env.assistiveTechnology &&
      env.browser &&
      env.platform &&
      env.operatingSystem
  );

  return uniqWith(
    [...filteredCustomEnvironments, ...desktop, ...mobile],
    (a, b) => {
      return (
        a.browser === b.browser &&
        a.assistiveTechnology === b.assistiveTechnology
      );
    }
  );
}
</script>

<template>
  <div class="narrow-content">
    <h2 class="fr-h4">Les environnements de test</h2>
    <p>
      Nous vous proposons par défaut les combinaisons d’environnements de test
      prévus au RGAA. Il appartient à l’auditeur, en concertation avec les
      responsables du site audité, de définir les environnements en adéquation
      avec le contexte d’usage du site. Vous pouvez ajouter vos propres
      environnements de test si vous le souhaitez.
    </p>
  </div>

  <div class="fr-mb-3w suggested-environments">
    <AuditEnvironmentCheckbox
      v-for="env in desktopEnvironments"
      :key="env.title"
      v-model="selectedDesktopEnvironments"
      :value="env.title"
      :platform="Platform.DESKTOP"
      :title="env.title"
      :combinations="env.combinations"
    />
  </div>

  <div class="suggested-environments">
    <AuditEnvironmentCheckbox
      v-for="env in mobileEnvironments"
      :key="env.title"
      v-model="selectedMobileEnvironments"
      :value="env.title"
      :platform="Platform.MOBILE"
      :title="env.title"
      :combinations="env.combinations"
    />
  </div>

  <div class="narrow-content">
    <fieldset
      v-for="(env, i) in customEnvironments"
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
          :disabled="customEnvironments.length === 1"
          @click="deleteEnvironment(i)"
        >
          Supprimer
        </button>
      </div>
      <div class="fr-form-group">
        <fieldset class="fr-fieldset fr-fieldset--inline">
          <legend class="fr-fieldset__legend fr-text--regular">Support</legend>
          <div class="fr-fieldset__content">
            <div class="fr-radio-group">
              <input
                :id="`env-support-desktop-${i}`"
                ref="envSupportRefs"
                v-model="env.platform"
                type="radio"
                :name="`env-support-${i}`"
                :value="Platform.DESKTOP"
                @change="onPlatformChange(customEnvironments[i])"
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
                :value="Platform.MOBILE"
                @change="onPlatformChange(customEnvironments[i])"
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
          @change="onOsChange(customEnvironments[i])"
        >
          <option value="" selected disabled hidden>
            Selectionnez une option
          </option>
          <option v-for="os in availableOs(env.platform)" :key="os" :value="os">
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
  </div>
</template>

<style scoped>
.narrow-content {
  max-width: 49.5rem;
}

.suggested-environments {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.env-card {
  border: 1px solid var(--border-default-grey);
}

.env-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 992px) {
  .suggested-environments {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 576px) {
  .suggested-environments {
    grid-template-columns: 1fr;
  }
}
</style>
