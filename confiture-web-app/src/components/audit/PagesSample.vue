<script lang="ts" setup>
import { lowerFirst } from "lodash-es";

import { computed, nextTick, ref, watch } from "vue";
import { useNotifications } from "../../composables/useNotifications";
import { URL } from "../../composables/validation";
import { AuditPage, AuditReference } from "../../types";
import { URL_REGEX } from "../../utils";
import DsfrField from "../ui/DsfrField.vue";
import DsfrFieldWithValidation from "../validation/DsfrFieldWithValidation.vue";

const props = defineProps<{
  modelValue: Omit<AuditPage, "id" | "order">[];
  auditReference: AuditReference | null;

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
  }
});

const notify = useNotifications();

const positionSuccessMessage = ref("");
const pageNameFieldRefs = ref<InstanceType<typeof DsfrField>[]>([]);

const pages = ref(props.modelValue);
const pageNameErrors = ref<Array<string | undefined>>(
  props.modelValue.map(() => undefined)
);
const pageUrlErrors = ref<Array<string | undefined>>(
  props.modelValue.map(() => undefined)
);

const LABEL_FIELD = {
  [AuditReference.RGAA_4]: "Nom de la page",
  [AuditReference.RGAA_5_Web]: "Nom de la page",
  [AuditReference.RGAA_5_Mobile]: "Nom de l'écran",
  [AuditReference.RGAA_5_Document]: "Nom du document"
};

const TYPE_LABEL = {
  [AuditReference.RGAA_4]: "Page",
  [AuditReference.RGAA_5_Web]: "Page",
  [AuditReference.RGAA_5_Mobile]: "Écran",
  [AuditReference.RGAA_5_Document]: "Document"
};

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
    `La ${lowerFirst(TYPE_LABEL[props.auditReference || AuditReference.RGAA_4])} ${pageName ? pageName : ""} a bien été supprimée`
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

  positionSuccessMessage.value = `${TYPE_LABEL[props.auditReference || AuditReference.RGAA_4]} déplacée en position ${
    endIndex + 1
  } sur ${pages.value.length}`;
}

const LABEL = {
  [AuditReference.RGAA_4]: "URL de la page",
  [AuditReference.RGAA_5_Web]: "URL de la page",
  [AuditReference.RGAA_5_Document]: "URL du document si disponible"
};

const urlValidation = computed(() => [
  URL("Format incorrect. Saisissez une URL commençant par https:// ou http://")
]);
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
        <h3 class="fr-h6 fr-mb-0">{{ TYPE_LABEL[auditReference || AuditReference.RGAA_4] }} {{ i + 1 }}</h3>
      </legend>

      <div class="page-right-actions">
        <button
          v-if="pages.length > 1"
          class="fr-btn fr-btn--tertiary-no-outline"
          type="button"
          @click="deletePage(i)"
        >
          Supprimer
          <span class="fr-sr-only">&nbsp;la {{ lowerFirst(TYPE_LABEL[auditReference || AuditReference.RGAA_4]) }} {{ i + 1 }}</span>
        </button>

        <div class="fr-select-group fr-mb-0">
          <label class="fr-label fr-sr-only" :for="`page-order-${i}`">
            Position de la {{ lowerFirst(TYPE_LABEL[auditReference || AuditReference.RGAA_4]) }} {{ i + 1 }}
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
        :label="LABEL_FIELD[auditReference || AuditReference.RGAA_4]"
        class="fr-mt-7w"
      />

      <DsfrFieldWithValidation
        v-if="auditReference !== AuditReference.RGAA_5_Mobile"
        :id="`page-url-${i + 1}`"
        v-model="page.url"
        :label="LABEL[auditReference || AuditReference.RGAA_4]"
        type="text"
        :pattern="URL_REGEX"
        :validation="urlValidation"
      >
        <template #optional>
          <span class="fr-hint-text">&nbsp;(optionnel)</span>
        </template>
        <template #hint>
          Saisissez une URL commençant par <code>https://</code> ou
          <code>http://</code>
        </template>
      </dsfrfieldwithvalidation>
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
