<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useResultsStore, useAuditStore } from "../store";
import DeleteModal from "./DeleteModal.vue";
import { formatDate } from "../utils";
import Dropdown from "./Dropdown.vue";

defineProps<{
  auditName: string;
  auditPublicationDate?: string;
  keyInfos: {
    label: string;
    value: string | number;
    description?: string;
  }[];
  editUniqueId?: string;
}>();

defineEmits(["validate"]);

const router = useRouter();

const isDeleteModalOpen = ref(false);

function openDeleteModal() {
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
}

const auditStore = useAuditStore();

/**
 * Delete audit and redirect to home page
 */
function confirmDelete() {
  auditStore
    .deleteAudit(uniqueId)
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
  <div v-if="!auditPublicationDate" class="fr-mb-4w">
    <button class="fr-btn" @click="resultsStore.DEV_fillResults(uniqueId)">
      [DEV] Remplir l’audit
    </button>
  </div>

  <p
    :class="`fr-badge ${
      auditPublicationDate
        ? 'fr-badge--success fr-badge--no-icon'
        : 'fr-badge--purple-glycine'
    } fr-mb-1v`"
  >
    {{ auditPublicationDate ? "🎉 audit terminé" : "🔍 Audit en cours" }}
  </p>
  <span v-if="auditPublicationDate" class="fr-text--xs fr-ml-3v">
    Le {{ formatDate(auditPublicationDate) }}
  </span>
  <div class="fr-mb-3w heading">
    <h1 class="fr-mb-0">{{ auditName }}</h1>
    <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-right">
      <li>
        <Dropdown title="Options">
          <!-- TODO: icon left? -->
          <ul class="dropdown-list">
            <li>
              <RouterLink
                :to="{ name: 'report', params: { uniqueId: editUniqueId } }"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-eye-line fr-m-0"
              >
                Prévisusaliser le rapport d’audit
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="{
                  name: 'edit-audit-step-one',
                  params: { uniqueId: editUniqueId },
                }"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-line fr-m-0"
              >
                Modifier les paramètres
              </RouterLink>
            </li>
            <li>
              <button
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-delete-line fr-m-0"
                aria-controls="delete-modal"
                data-fr-opened="true"
                @click="openDeleteModal"
              >
                Supprimer l’audit
              </button>
            </li>
          </ul>
        </Dropdown>
      </li>
      <li>
        <!-- TODO: icon left? -->
        <RouterLink
          v-if="auditPublicationDate"
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
      auditPublicationDate ? 'fr-mb-4w' : 'fr-mb-3v'
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

  <p v-if="!auditPublicationDate" class="fr-text--sm fr-mb-6w mandatory-notice">
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

.dropdown-list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
