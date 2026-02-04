<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

import { useNotifications } from "../../composables/useNotifications";
import { useAuditStore } from "../../store";
import DsfrField from "../ui/DsfrField.vue";
import TagListField from "../ui/TagListField.vue";

const auditStore = useAuditStore();

const editing = ref(false);
const tags = ref<string[]>([]);

watch(
  () => auditStore.currentAudit?.transverseElements,
  (transverseElements) => {
    if (transverseElements) {
      tags.value = [...transverseElements];
    }
  },
  {
    immediate: true
  }
);

const editButtonRef = ref<HTMLButtonElement[]>();
const inputRef = ref<InstanceType<typeof DsfrField>>();
const submitButtonRef = ref<HTMLButtonElement>();

async function startEdition() {
  editing.value = true;
  await nextTick();
  inputRef.value?.inputRef?.focus();
}

const notify = useNotifications();

const tagListFieldRef = ref<InstanceType<typeof TagListField>>();

async function submitForm() {
  // Force event emission to update the tags list before proceeding
  tagListFieldRef.value?.flush();

  editing.value = false;

  if (!auditStore.currentAudit) return;

  const uniqueId = auditStore.currentAudit?.editUniqueId;

  auditStore
    .updateAudit(uniqueId, {
      ...auditStore.currentAudit,
      transverseElements: tags.value
    })
    .then(() => {
      editButtonRef.value?.at(0)?.focus();
    })
    .catch((err) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
      );
      throw err;
    });
}

async function cancelEdition() {
  editing.value = false;
  if (auditStore.currentAudit) {
    tags.value = [...auditStore.currentAudit.transverseElements];
  }
  await nextTick();
  editButtonRef.value?.at(0)?.focus();
}
</script>

<template>
  <div>
    <template v-if="!editing">
      <button
        v-if="tags.length === 0"
        class="fr-btn fr-btn--sm fr-btn--tertiary"
        @click="startEdition"
      >
        Lister les éléments transverses
      </button>
      <div>
        <ul class="fr-tags-group">
          <li v-for="(tag, i) in tags" :key="i">
            <p class="fr-tag">{{ tag }}</p>

            <button
              v-if="i === tags.length - 1"
              ref="editButtonRef"
              class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-fill fr-ml-1v edit-tags-button"
              @click="startEdition"
            >
              Modifier <span class="fr-sr-only">les éléments transverses</span>
            </button>
          </li>
        </ul>
      </div>
    </template>

    <template v-else>
      <form @submit.prevent>
        <TagListField
          ref="tagListFieldRef"
          v-model="tags"
          label="Nom de l’élément transverse"
          hint="Exemples : En-tête, pied de page, bandeau cookies"
          class="elements-field"
          add-label="les éléments transverses"
        />
        <ul class="fr-btns-group fr-btns-group--inline-md">
          <li>
            <button
              ref="submitButtonRef"
              type="button"
              class="fr-btn"
              @click="submitForm"
            >
              Enregistrer
            </button>
          </li>
          <li>
            <button
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline"
              @click="cancelEdition"
            >
              Annuler
            </button>
          </li>
        </ul>
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

.elements-field {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0 1rem;

  &:deep(label) {
    grid-column: span 2;
  }

  &:deep(input) {
    max-width: 30rem;
  }
}
</style>
