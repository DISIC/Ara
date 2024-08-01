<script lang="ts" setup>
import { uniqWith } from "lodash-es";
import { nextTick, ref, watch } from "vue";

import { Platform } from "../../../enums";
import { AuditEnvironment } from "../../../types";
import DsfrField from "../../ui/DsfrField.vue";
import AuditEnvironmentCheckbox from "../AuditEnvironmentCheckbox.vue";
import {
  desktopCombinations,
  getCustomEnvironments,
  getDesktopCombinations,
  getMobileCombinations,
  mobileCombinations
} from "./combinations";

const props = defineProps<{
  modelValue: Omit<AuditEnvironment, "id">[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: Omit<AuditEnvironment, "id">[]): void;
}>();

/** List of selected desktop environement combinations */
const selectedDesktopEnvironments = ref<string[]>(
  getDesktopCombinations(props.modelValue)
);

/** List of selected mobile environement combinations */
const selectedMobileEnvironments = ref<string[]>(
  getMobileCombinations(props.modelValue)
);

/** List of custom environments */
const customEnvironments = ref([
  ...getCustomEnvironments(props.modelValue),
  ...(props.modelValue.length === 0
    ? [
        {
          platform: "",
          operatingSystem: "",
          assistiveTechnology: "",
          browser: ""
        }
      ]
    : [])
]);

watch(
  [customEnvironments, selectedDesktopEnvironments, selectedMobileEnvironments],
  ([
    customEnvironments,
    selectedDesktopEnvironments,
    selectedMobileEnvironments
  ]) => {
    const result = combineEnvironments(
      customEnvironments,
      selectedDesktopEnvironments,
      selectedMobileEnvironments
    );
    emit("update:modelValue", result);
  },
  {
    deep: true
  }
);

const envPlatformRefs = ref<InstanceType<typeof DsfrField>[]>([]);

/**
 * Create a new environment and focus its platform field.
 */
async function addEnvironment() {
  customEnvironments.value.push({
    platform: "",
    operatingSystem: "",
    assistiveTechnology: "",
    browser: ""
  });
  await nextTick();
  const lastInput = envPlatformRefs.value[envPlatformRefs.value.length - 1];
  lastInput.inputRef?.focus();
}

/**
 * Delete environment at index and focus previous or first platform field.
 * @param {number} i
 */
async function deleteEnvironment(i: number) {
  customEnvironments.value.splice(i, 1);
  await nextTick();
  const previousInput =
    i === 0 ? envPlatformRefs.value[0] : envPlatformRefs.value[i - 1];
  previousInput.inputRef?.focus();
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
    ? desktopCombinations
        .filter((combination) => {
          return selectedDesktopEnvironments.includes(combination.title);
        })
        .map((combination) => {
          return combination.environments.map((c) => {
            return {
              // FIXME: set platform directly in desktopCombinations
              platform: Platform.DESKTOP,
              ...c
            };
          });
        })
        .flat(2)
    : [];

  const mobile = selectedMobileEnvironments.length
    ? mobileCombinations
        .filter((combination) => {
          return selectedMobileEnvironments.includes(combination.title);
        })
        .map((combination) => {
          return combination.environments.map((c) => {
            return {
              platform: Platform.MOBILE,
              ...c
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
        a.platform === b.platform &&
        a.operatingSystem === b.operatingSystem &&
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
      prévus au RGAA. Il appartient à l’auditeur ou l’auditrice, en concertation
      avec les responsables du site audité, de définir les environnements en
      adéquation avec le contexte d’usage du site. Vous pouvez ajouter vos
      propres environnements de test si vous le souhaitez.
    </p>
  </div>

  <div class="fr-mb-3w suggested-environments">
    <AuditEnvironmentCheckbox
      v-for="env in desktopCombinations"
      :key="env.title"
      v-model="selectedDesktopEnvironments"
      :value="env.title"
      :platform="Platform.DESKTOP"
      :title="env.title"
      :combinations="env.environments"
    />
  </div>

  <div class="fr-mb-4w suggested-environments">
    <AuditEnvironmentCheckbox
      v-for="env in mobileCombinations"
      :key="env.title"
      v-model="selectedMobileEnvironments"
      :value="env.title"
      :platform="Platform.MOBILE"
      :title="env.title"
      :combinations="env.environments"
    />
  </div>

  <h3 class="fr-text--lg fr-mb-2w">
    Ajouter un environnement de test personnalisé
  </h3>

  <div class="custom-environment">
    <fieldset
      v-for="(env, i) in customEnvironments"
      :key="i"
      class="fr-p-3w fr-m-0 env-card"
    >
      <legend class="env-legend">
        <h3 class="fr-h6 fr-mb-0">Environnement {{ i + 1 }}</h3>
      </legend>
      <button
        class="fr-btn fr-btn--tertiary-no-outline env-delete-button"
        type="button"
        :disabled="customEnvironments.length === 1"
        @click="deleteEnvironment(i)"
      >
        Supprimer
      </button>

      <DsfrField
        :id="`env-device-${i}`"
        ref="envPlatformRefs"
        v-model="env.platform"
        class="fr-m-0"
        label="Appareil"
        hint="Exemples : mobile, borne interactive"
        type="text"
        :required="customEnvironments.length > 1"
      />

      <DsfrField
        :id="`env-os-${i}`"
        v-model="env.operatingSystem"
        class="fr-m-0"
        label="Logiciel d’exploitation"
        hint="Exemple : macOS"
        type="text"
        :required="customEnvironments.length > 1"
      />

      <DsfrField
        :id="`env-at-${i}`"
        v-model="env.assistiveTechnology"
        class="fr-m-0"
        label="Technologie d’assistance"
        hint="Exemple : VoiceOver"
        type="text"
        :required="customEnvironments.length > 1"
      />

      <DsfrField
        :id="`env-browser-${i}`"
        v-model="env.browser"
        label="Navigateur"
        hint="Exemple : Safari"
        type="text"
        :required="customEnvironments.length > 1"
      />
    </fieldset>
  </div>

  <button
    class="fr-btn fr-btn--tertiary-no-outline fr-mt-2w fr-mb-5w"
    type="button"
    @click="addEnvironment"
  >
    Ajouter un environnement
  </button>
</template>

<style scoped>
.narrow-content {
  max-width: 49.5rem;
}

.custom-environment,
.suggested-environments {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.env-card {
  border: 1px solid var(--border-default-grey);
  display: grid;
  gap: 1rem;
  grid-template-columns: auto auto;
  align-items: center;
}

.env-legend {
  float: left;
}

.env-delete-button {
  justify-self: end;
}

.env-card > *:not(.env-legend, .env-delete-button) {
  grid-column: 1 / -1;
}

@media (width < 48rem) {
  .custom-environment,
  .suggested-environments {
    grid-template-columns: 1fr;
  }
}
</style>
