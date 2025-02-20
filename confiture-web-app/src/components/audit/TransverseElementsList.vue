<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

import { useNotifications } from "../../composables/useNotifications";
import { useAuditStore } from "../../store";
import DsfrField from "../ui/DsfrField.vue";

let nextUid = 1;
function getUid() {
  return nextUid++;
}

const auditStore = useAuditStore();

const editing = ref(false);
const inputValue = ref("");
// [uid, tag]
const tags = ref<[number, string][]>([]);

watch(
  () => auditStore.currentAudit?.transverseElements,
  (transverseElements) => {
    if (transverseElements) {
      tags.value = transverseElements.map((element) => [getUid(), element]);
    }
  },
  {
    immediate: true
  }
);

const tagButtonsRefs = ref<HTMLButtonElement[]>([]);
const submitButtonRef = ref<HTMLButtonElement>();

function addElements() {
  const tech = inputValue.value.split(",").filter(Boolean);
  tech.forEach((t) => {
    tags.value.push([getUid(), t.trim()]);
  });

  inputValue.value = "";
}

async function removeElement(at: number) {
  tags.value = tags.value.filter((_, i) => {
    return i !== at;
  });

  await nextTick();

  const nextToolButton = tagButtonsRefs.value.at(at);
  if (nextToolButton) {
    nextToolButton.focus();
  } else {
    submitButtonRef.value?.focus();
  }
}

const notify = useNotifications();

function submitForm() {
  editing.value = false;

  if (!auditStore.currentAudit) return;

  const uniqueId = auditStore.currentAudit?.editUniqueId;
  const transverseElements = tags.value.map(([, element]) => element);
  auditStore
    .updateAudit(uniqueId, {
      ...auditStore.currentAudit,
      transverseElements
    })
    .then(() => {
      notify("success", undefined, "Éléments transverses sauvegardés");
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

function cancelEdition() {
  editing.value = false;
  if (auditStore.currentAudit) {
    tags.value = auditStore.currentAudit.transverseElements.map((element) => [
      getUid(),
      element
    ]);
  }
}
</script>

<template>
  <div>
    <template v-if="!editing">
      <button
        v-if="tags.length === 0"
        class="fr-btn fr-btn--sm fr-btn--tertiary"
        @click="editing = true"
      >
        Lister les éléments transverses
      </button>
      <div>
        <ul class="fr-tags-group">
          <li v-for="([uid, tag], i) in tags" :key="uid">
            <p class="fr-tag">{{ tag }}</p>

            <!-- FIXME: find a better way to inline list with trailing button -->
            <button
              v-if="i === tags.length - 1"
              class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-fill fr-ml-1v edit-tags-button"
              @click="editing = true"
            >
              Modifier <span class="fr-sr-only">les éléments transverses</span>
            </button>
          </li>
        </ul>
      </div>
    </template>

    <template v-else>
      <form @submit.prevent>
        <DsfrField
          id="transverse-elements-list"
          v-model="inputValue"
          class="fr-mb-3v elements-field"
          label="Nom de l’élément transverse"
          hint="Exemples : En-tête, pied de page, bandeau cookies, etc."
          type="text"
          @keydown.enter="addElements"
        >
          <template #trailing>
            <button
              type="button"
              class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line"
              @click="addElements"
            >
              Ajouter
            </button>
          </template>
        </DsfrField>
        <ul class="fr-tags-group fr-mb-5v">
          <li v-for="([uid, tag], i) in tags" :key="uid">
            <button
              ref="tagButtonsRefs"
              class="fr-tag fr-icon-close-line fr-tag--icon-left light-blue-button-tags"
              type="button"
              :aria-label="`Retirer ${tag}`"
              @click="removeElement(i)"
            >
              {{ tag }}
            </button>
          </li>
        </ul>
        <button
          ref="submitButtonRef"
          type="button"
          class="fr-btn fr-btn--sm"
          @click="submitForm"
        >
          Enregistrer
        </button>
        <button
          type="button"
          class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
          @click="cancelEdition"
        >
          Annuler
        </button>
      </form>
      <hr v-if="editing" class="fr-mt-3w" />
    </template>
  </div>
</template>

<style scoped>
.edit-tags-button {
  vertical-align: top;
}

.light-blue-button-tags {
  flex-direction: row-reverse;
  gap: 0.25rem;

  &::before {
    margin: 0;
  }
}

.elements-field :deep(input) {
  max-width: 30rem;
}
</style>
