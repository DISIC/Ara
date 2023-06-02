<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useDevMode } from "../composables/useDevMode";
import { useNotifications } from "../composables/useNotifications";
import { useAuditStore, useResultsStore } from "../store";
import { captureWithPayloads, formatBytes, slugify } from "../utils";
import DeleteModal from "./DeleteModal.vue";
import Dropdown from "./Dropdown.vue";
import DuplicateModal from "./DuplicateModal.vue";
import SaveIndicator from "./SaveIndicator.vue";
import SummaryCard from "./SummaryCard.vue";
import CopyIcon from "./icons/CopyIcon.vue";
import GearIcon from "./icons/GearIcon.vue";

defineProps<{
  auditName: string;
  auditPublicationDate: string | null;
  auditEditionDate: string | null;
  keyInfos: {
    title: string;
    description: string;
    value: number;
    total: number;
    unit?: string;
    theme?: string;
  }[];
  editUniqueId?: string;
}>();

const router = useRouter();

const duplicateModal = ref<InstanceType<typeof DuplicateModal>>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const optionsDropdownRef = ref<InstanceType<typeof Dropdown>>();

const isDuplicationLoading = ref(false);

const auditStore = useAuditStore();
const resultStore = useResultsStore();
const notify = useNotifications();

/**
 * Duplicate audit and redirect to new audit page
 */
function confirmDuplicate(name: string) {
  console.log("Duplicating...", name);
  isDuplicationLoading.value = true;
  auditStore
    .duplicateAudit(uniqueId.value, name)
    .then((newAuditId) => {
      auditStore.$reset();
      resultStore.$reset();

      isDuplicationLoading.value = false;

      duplicateModal.value?.hide();

      return router.push({
        name: "edit-audit-step-three",
        params: {
          uniqueId: newAuditId,
        },
        state: {
          showDuplicatedAlert: true,
        },
      });
    })
    .catch((error) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la duplication de l’audit. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
      );
      captureWithPayloads(error);
    });
}

/**
 * Delete audit and redirect to home page
 */
function confirmDelete() {
  auditStore
    .deleteAudit(uniqueId.value)
    .then(() => {
      // Clear pinia stores
      auditStore.$reset();
      resultStore.$reset();

      router.push({
        name: "home",
        state: { deleteAudit: "true" },
      });
    })
    .catch((error) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
      );
      captureWithPayloads(error);
    })
    .finally(() => {
      deleteModal.value?.hide();
    });
}

const route = useRoute();
const uniqueId = computed(() => route.params.uniqueId as string);

const resultsStore = useResultsStore();

const csvExportUrl = computed(
  () => `/api/audits/${uniqueId.value}/exports/csv`
);

const csvExportFilename = computed(() => {
  if (!auditStore.data?.procedureName) {
    return "audit.csv";
  }
  return `audit-${slugify(auditStore.data.procedureName)}.csv`;
});

const csvExportSizeEstimation = computed(() => {
  return 502 + Object.keys(resultsStore.data ?? {}).length * 318;
});

const isDevMode = useDevMode();
</script>

<template>
  <div v-if="isDevMode" class="fr-mb-4w">
    <button class="fr-btn" @click="resultsStore.DEV_fillResults(uniqueId)">
      [DEV] Remplir l’audit
    </button>
  </div>

  <div class="fr-mb-1v sub-header">
    <SaveIndicator />

    <div>
      <slot name="actions-notice" />

      <ul class="top-actions fr-my-0" role="list">
        <li class="fr-mr-2w">
          <Dropdown
            ref="optionsDropdownRef"
            title="Options"
            :align-left="route.name === 'edit-audit-step-three'"
          >
            <ul role="list" class="fr-p-0 fr-m-0 dropdown-list">
              <template v-if="!!auditPublicationDate">
                <li class="dropdown-item">
                  <RouterLink
                    :to="{
                      name: 'edit-audit-step-three',
                      params: { uniqueId: editUniqueId },
                    }"
                    class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-line fr-m-0"
                  >
                    Modifier l’audit
                  </RouterLink>
                </li>
              </template>
              <li class="dropdown-item">
                <RouterLink
                  :to="{
                    name: 'edit-audit-step-one',
                    params: { uniqueId: editUniqueId },
                  }"
                  class="fr-btn fr-btn--tertiary-no-outline fr-m-0"
                >
                  <GearIcon class="fr-mr-2v" />
                  Modifier les paramètres
                </RouterLink>
              </li>
              <li class="dropdown-item">
                <button
                  class="fr-btn fr-btn--tertiary-no-outline fr-m-0"
                  @click="duplicateModal?.show()"
                >
                  <CopyIcon class="fr-mr-2v" />
                  Créer une copie
                </button>
              </li>
              <li class="dropdown-item">
                <a
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-download-fill fr-m-0 download-link"
                  :href="csvExportUrl"
                  :download="csvExportFilename"
                >
                  Exporter l’audit
                  <span class="fr-text--xs fr-text--regular download-meta">
                    CSV – {{ formatBytes(csvExportSizeEstimation, 2) }}
                  </span>
                </a>
              </li>
              <li aria-hidden="true" class="dropdown-separator"></li>
              <li class="dropdown-item">
                <button
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-delete-line fr-m-0 delete-button"
                  @click="deleteModal?.show()"
                >
                  Supprimer l’audit
                </button>
              </li>
            </ul>
          </Dropdown>
        </li>

        <slot name="actions" />
      </ul>
    </div>
  </div>

  <h1 class="">{{ auditName }}</h1>

  <div
    :class="`fr-grid-row fr-grid-row--gutters ${
      auditPublicationDate ? 'fr-mb-4w' : 'fr-mb-3v'
    }`"
  >
    <div
      v-for="info in keyInfos"
      :key="info.title"
      :class="`fr-col-12 fr-col-md-${12 / keyInfos.length}`"
    >
      <SummaryCard
        :title="info.title"
        :description="info.description"
        :value="info.value"
        :total="info.total"
        :unit="info.unit"
        :theme="info.theme"
      />
    </div>
  </div>

  <DuplicateModal
    ref="duplicateModal"
    :original-audit-name="auditStore.data?.procedureName"
    :is-loading="isDuplicationLoading"
    @confirm="confirmDuplicate"
    @closed="
      optionsDropdownRef?.buttonRef.focus();
      optionsDropdownRef?.closeOptions();
    "
  />

  <DeleteModal
    ref="deleteModal"
    @confirm="confirmDelete"
    @closed="
      optionsDropdownRef?.buttonRef.focus();
      optionsDropdownRef?.closeOptions();
    "
  />
</template>

<style scoped>
.sub-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.top-actions {
  display: flex;
  list-style: none;
}

.download-link {
  display: flex;
  flex-wrap: wrap;
}

.download-meta {
  flex-basis: 100%;
  color: var(--text-mention-grey);
}
:deep(.top-actions > li) {
  padding-bottom: 0;
}

.delete-button {
  color: var(--error-425-625);
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
</style>
