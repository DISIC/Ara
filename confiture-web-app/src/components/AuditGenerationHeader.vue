<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { deleteAudit } from "../api/deleteAudit";
import { useResultsStore } from "../store";
import { AuditType } from "../types";
import DeleteModal from "./DeleteModal.vue";

const props = defineProps<{
  auditName: string;
  auditStatus?: string;
  keyInfos: {
    label: string;
    value: string | number;
    description?: string;
  }[];
  editUniqueId?: string;
}>();

defineEmits(["validate"]);

const auditTypes = [
  {
    label: "Rapide",
    value: AuditType.FAST,
    criteriaCount: 25,
  },
  {
    label: "Complémentaire",
    value: AuditType.COMPLEMENTARY,
    criteriaCount: 50,
  },
  {
    label: "Complet",
    value: AuditType.FULL,
    criteriaCount: 106,
  },
];

const router = useRouter();

// TODO: handle options dropdown
function openOptions() {
  console.log("openOptions");
}

const isDeleteModalOpen = ref(false);

function openDeleteModal() {
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
}

/**
 * Delete audit and redirect to home page
 */
function confirmDelete() {
  deleteAudit(uniqueId)
    .then(() => {
      router.push({
        name: "home",
        state: { deleteAudit: "true" },
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

const route = useRoute();
const uniqueId = route.params.uniqueId as string;
const resultsStore = useResultsStore();

const isCompleted = computed(() => {
  return props.auditStatus === "completed";
});
</script>

<template>
  <div v-if="!isCompleted" class="fr-mb-4w">
    <button class="fr-btn" @click="resultsStore.DEV_fillResults(uniqueId)">
      [DEV] Remplir l’audit
    </button>
  </div>

  <p
    :class="`fr-badge ${
      isCompleted
        ? 'fr-badge--success fr-badge--no-icon'
        : 'fr-badge--purple-glycine'
    } fr-mb-1v`"
  >
    {{ isCompleted ? "🎉 audit terminé" : "🔍 Audit en cours" }}
  </p>
  <span v-if="isCompleted" class="fr-text--xs fr-ml-3v">Le 30 juin 2022</span>
  <div class="fr-mb-3w heading">
    <h1 class="fr-mb-0">{{ auditName }}</h1>
    <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-right">
      <li>
        <button
          class="fr-btn fr-btn--secondary fr-icon-arrow-down-s-line fr-btn--icon-right"
          @click="openOptions"
        >
          Options
        </button>
      </li>
      <li>
        <button
          class="fr-btn fr-btn--secondary"
          aria-controls="delete-modal"
          data-fr-opened="true"
          @click="openDeleteModal"
        >
          Supprimer l’audit
        </button>
      </li>
      <li>
        <!-- TODO: icon left? -->
        <RouterLink
          v-if="isCompleted"
          class="fr-btn fr-btn--icon-left fr-icon-eye-line"
          :to="{ name: 'report', params: { uniqueId: editUniqueId } }"
        >
          Consulter le rapport d’audit
        </RouterLink>
        <button v-else class="fr-btn" @click="$emit('validate')">
          Valider l’audit
        </button>
      </li>
    </ul>
  </div>

  <dl
    :class="`fr-grid-row fr-grid-row--gutters ${
      isCompleted ? 'fr-mb-4w' : 'fr-mb-3v'
    }`"
  >
    <div
      v-for="info in keyInfos"
      :key="info.label"
      :class="`fr-col-12 fr-col-md-${12 / keyInfos.length}`"
    >
      <div class="fr-px-3w fr-py-3v info">
        <dt class="fr-text--xs fr-m-0 fr-text--bold info-label">
          {{ info.label }}
        </dt>
        <dd class="fr-m-0 fr-h3 info-value">
          {{ info.value?.toString().toLowerCase() }}
          <template v-if="info.description">
            <span class="fr-text--md info-sub-text">
              {{ info.description }}
            </span>
          </template>
        </dd>
      </div>
    </div>
  </dl>

  <p v-if="!isCompleted" class="fr-text--sm fr-mb-6w mandatory-notice">
    Sauf mention contraire, tous les champs sont obligatoires.
  </p>

  <DeleteModal
    v-if="isDeleteModalOpen"
    @confirm="confirmDelete"
    @cancel="closeDeleteModal"
    v-on="{ 'dsfr.conceal': closeDeleteModal }"
  />
</template>

<style scoped>
.heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.info {
  border: 1px solid var(--border-default-grey);
  min-height: 100%;
}

.info-value {
  text-transform: capitalize;
}

.info-label {
  color: var(--text-mention-grey);
}

.info-sub-text {
  text-transform: none;
}

.mandatory-notice {
  color: var(--text-mention-grey);
}
</style>
