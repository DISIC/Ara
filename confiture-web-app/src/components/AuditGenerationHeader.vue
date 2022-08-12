<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { deleteAudit } from "../api/deleteAudit";
import { useResultsStore } from "../store";
import DeleteModal from "./DeleteModal.vue";

defineProps<{
  auditName: string;
  auditType: string;
  auditRisk: string;
  auditComplianceLevel: number;
}>();

defineEmits(["validate"]);

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
</script>

<template>
  <div class="fr-mb-4w">
    <button class="fr-btn" @click="resultsStore.DEV_fillResults(uniqueId)">
      [DEV] Remplir l’audit
    </button>
  </div>

  <p class="fr-badge fr-badge--purple-glycine fr-mb-1v">🔍 Audit en cours</p>
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
        <button class="fr-btn" @click="$emit('validate')">
          Valider l’audit
        </button>
      </li>
    </ul>
  </div>

  <dl class="fr-grid-row fr-grid-row--gutters fr-mb-3v">
    <div class="fr-col-12 fr-col-md-4">
      <div class="fr-px-3w fr-py-3v info">
        <dt class="fr-text--xs fr-m-0 fr-text--bold info-label">
          Type d’audit
        </dt>
        <dd class="fr-m-0 fr-h3 info-value">{{ auditType.toLowerCase() }}</dd>
      </div>
    </div>
    <div class="fr-col-12 fr-col-md-4">
      <div class="fr-px-3w fr-py-3v info">
        <dt class="fr-text--xs fr-m-0 fr-text--bold info-label">
          Risque de l’audit
        </dt>
        <dd class="fr-m-0 fr-h3 info-value">{{ auditRisk }}</dd>
      </div>
    </div>
    <div class="fr-col-12 fr-col-md-4">
      <div class="fr-px-3w fr-py-3v info">
        <dt class="fr-text--xs fr-m-0 fr-text--bold info-label">
          Taux de conformité au RGAA actuel
        </dt>
        <dd class="fr-m-0 fr-h3 info-value">
          {{ auditComplianceLevel }}&nbsp;<span class="fr-text--md">%</span>
        </dd>
      </div>
    </div>
  </dl>

  <p class="fr-text--sm fr-mb-6w mandatory-notice">
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
}

.info-value {
  text-transform: capitalize;
}

.info-label {
  color: var(--text-mention-grey);
}

.mandatory-notice {
  color: var(--text-mention-grey);
}
</style>
