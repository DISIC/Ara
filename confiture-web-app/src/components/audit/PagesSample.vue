<script lang="ts" setup>
import { nextTick, ref, watch } from "vue";

import { useNotifications } from "../../composables/useNotifications";
import { REQUIRED, URL } from "../../composables/validation";
import { AuditPage } from "../../types";
import { URL_REGEX } from "../../utils";
import DsfrField from "../ui/DsfrField.vue";

const props = defineProps<{
  modelValue: Omit<AuditPage, "id" | "order">[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: Omit<AuditPage, "id" | "order">[]): void;
}>();

// Allow parent to focus last field
defineExpose({
  focusLastField: () => {
    pageNameFieldRefs.value[
      pageNameFieldRefs.value.length - 1
    ].inputRef?.focus();
  },
  validate
});

const notify = useNotifications();

const positionSuccessMessage = ref("");
const pageNameFieldRefs = ref<InstanceType<typeof DsfrField>[]>([]);
const pageUrlFieldRefs = ref<InstanceType<typeof DsfrField>[]>([]);

const pages = ref(props.modelValue);
const pageNameErrors = ref<Array<string | undefined>>(
  props.modelValue.map(() => undefined)
);
const pageUrlErrors = ref<Array<string | undefined>>(
  props.modelValue.map(() => undefined)
);

watch(
  () => props.modelValue,
  (newValue) => {
    pages.value = newValue;
    pageNameErrors.value = newValue.map(() => undefined);
    pageUrlErrors.value = newValue.map(() => undefined);
  }
);

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
  notify(
    "success",
    undefined,
    `La page ${pageName ? pageName : ""} a bien été supprimée`
  );
  previousField.inputRef?.focus();
}

const pageOrderSelectRefs = ref<HTMLSelectElement[]>();

/**
 * Change the order of pages. Swap pages if it is adjacent.
 * Otherwise, insert `startIndex` page at `endIndex` position.
 * @param {number} startIndex
 * @param {number} endIndex
 * @example
 * Given [1, 2, 3, 4] and if updatePageOrder(1, 3), new order will be [1, 4, 2, 3].
 */
function updatePageOrder(startIndex: number, endIndex: number) {
  positionSuccessMessage.value = "";

  const defaultState = [...pages.value];
  const startEl = defaultState[startIndex];

  if (startIndex === endIndex + 1 || startIndex === endIndex - 1) {
    // Swap 2 adjacent pages
    const temp = pages.value[startIndex];
    pages.value[startIndex] = pages.value[endIndex];
    pages.value[endIndex] = temp;
  } else {
    // Insert startIndex and endIndex
    pages.value =
      startIndex < endIndex
        ? [
            ...defaultState.slice(0, startIndex),
            ...defaultState.slice(startIndex + 1, endIndex + 1),
            startEl,
            ...defaultState.slice(endIndex + 1)
          ]
        : [
            ...defaultState.slice(0, endIndex),
            startEl,
            ...defaultState.slice(endIndex, startIndex),
            ...defaultState.slice(startIndex + 1)
          ];
  }

  emit("update:modelValue", pages.value);

  // Focus `endIndex` select
  pageOrderSelectRefs.value?.at(endIndex)?.focus();

  positionSuccessMessage.value = `Page déplacée en  position ${
    endIndex + 1
  } sur ${pages.value.length}`;
}

/** Validate page fields and focus the first invalid one if any. */
function validate(): boolean {
  const nameIsRequired = REQUIRED("Champ obligatoire. Saisissez le nom de la page à auditer.");
  const urlIsRequired = REQUIRED("Champ obligatoire. Saisissez l’URL de la page à auditer.");
  const urlIsValid = URL("URL invalide. Saisissez une URL valide commençant par \"https://\" ou \"http://\".");

  let isValid = true;

  for (let i = pages.value.length - 1; i >= 0; i--) {
    const { name, url } = pages.value[i];

    pageNameErrors.value[i] = nameIsRequired(name) || undefined;
    pageUrlErrors.value[i] = urlIsRequired(url) || urlIsValid(url) || undefined;

    if (pageUrlErrors.value[i]) {
      pageUrlFieldRefs.value.at(i)?.focus();
      isValid = false;
    }

    if (pageNameErrors.value[i]) {
      pageNameFieldRefs.value.at(i)?.focus();
      isValid = false;
    }
  }
  return isValid;
}
</script>

<template>
  <div>
    <fieldset
      v-for="(page, i) in pages"
      :key="i"
      class="fr-p-2w fr-p-md-4w page-card"
      :class="{ 'fr-mb-3w': i !== pages.length - 1 }"
    >
      <legend class="page-legend">
        <h3 class="fr-h6 fr-mb-0">Page {{ i + 1 }}</h3>
      </legend>

      <div class="page-right-actions">
        <button
          class="fr-btn fr-btn--tertiary-no-outline"
          type="button"
          :disabled="pages.length === 1"
          @click="deletePage(i)"
        >
          Supprimer
          <span class="fr-sr-only">la page {{ i + 1 }}</span>
        </button>

        <div class="fr-select-group fr-mb-0">
          <label class="fr-label fr-sr-only" :for="`page-order-${i}`">
            Position de la page {{ i + 1 }}
          </label>
          <select
            :id="`page-order-${i}`"
            ref="pageOrderSelectRefs"
            class="fr-select fr-mt-0"
            :value="i"
            @change="
              updatePageOrder(
                i,
                Number(($event.target as HTMLSelectElement).value)
              )
            "
          >
            <option v-for="(_, j) in pages" :key="j" :value="j">
              Position {{ j + 1 }} sur {{ pages.length }}
            </option>
          </select>

          <div class="fr-sr-only" aria-live="polite" role="alert">
            <p v-if="positionSuccessMessage">{{ positionSuccessMessage }}</p>
          </div>
        </div>
      </div>

      <DsfrField
        :id="`page-name-${i + 1}`"
        ref="pageNameFieldRefs"
        v-model="page.name"
        label="Nom de la page"
        class="fr-mt-7w"
        :error="pageNameErrors[i]"
      />

      <DsfrField
        :id="`page-url-${i + 1}`"
        ref="pageUrlFieldRefs"
        v-model="page.url"
        label="URL de la page"
        type="text"
        required
        :pattern="URL_REGEX"
        :error="pageUrlErrors[i]"
      >
        <template #hint>
          Saisissez une URL commençant par <code>https://</code> ou
          <code>http://</code>
        </template>
      </DsfrField>
    </fieldset>
  </div>
</template>

<style scoped>
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

  @media (width < 36rem) {
    float: none;
    flex-wrap: wrap;
    margin-top: 4rem;
  }
}
</style>
