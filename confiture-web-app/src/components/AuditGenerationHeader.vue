<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useDevMode } from "../composables/useDevMode";
import { useNotifications } from "../composables/useNotifications";
import { useAuditStore, useResultsStore } from "../store";
import { captureWithPayloads, formatDate } from "../utils";
import Dropdown from "./Dropdown.vue";
import SummaryCard from "./SummaryCard.vue";
import DeleteModal from "./DeleteModal.vue";

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

const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const optionsDropdownRef = ref<InstanceType<typeof Dropdown>>();

const auditStore = useAuditStore();
const resultStore = useResultsStore();
const notify = useNotifications();

/**
 * Delete audit and redirect to home page
 */
function confirmDelete() {
  auditStore
    .deleteAudit(uniqueId)
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
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
      captureWithPayloads(error);
    })
    .finally(() => {
      deleteModal.value?.hide();
    });
}

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

const resultsStore = useResultsStore();
const disableSubmission = computed(() => !resultsStore.everyCriteriumAreTested);

const isDevMode = useDevMode();
</script>

<template>
  <div v-if="!auditPublicationDate && isDevMode" class="fr-mb-4w">
    <button class="fr-btn" @click="resultsStore.DEV_fillResults(uniqueId)">
      [DEV] Remplir l’audit
    </button>
  </div>

  <div class="fr-mb-1v sub-header">
    <div>
      <p
        :class="`fr-badge ${
          auditPublicationDate && !auditEditionDate
            ? 'fr-badge--success fr-badge--no-icon'
            : 'fr-badge--purple-glycine'
        }`"
      >
        {{
          auditPublicationDate && !auditEditionDate
            ? "🎉 audit terminé"
            : "🔍 Audit en cours"
        }}
      </p>
      <span v-if="auditPublicationDate" class="fr-text--xs fr-ml-3v">
        Le {{ formatDate(auditPublicationDate) }}
      </span>
    </div>
    <p v-if="disableSubmission" class="fr-text--xs fr-m-0 submit-notice">
      Validation possible à la fin de l’audit
    </p>
  </div>
  <div class="fr-mb-3w heading">
    <h1 class="fr-mb-0">{{ auditName }}</h1>
    <ul class="top-actions" role="list">
      <li class="fr-mr-2w">
        <Dropdown ref="optionsDropdownRef" title="Options">
          <ul role="list" class="fr-p-0 fr-m-0 dropdown-list">
            <template v-if="!!auditPublicationDate">
              <!-- FIXME: would this still be useful? -->
              <!-- <li v-if="hasA11yStatement">
                <RouterLink
                  :to="{
                    name: 'report',
                    params: { uniqueId: auditStore.data?.consultUniqueId },
                  }"
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-file-line fr-m-0"
                >
                  Consulter la déclaration d’accessibilité
                </RouterLink>
              </li> -->
              <li>
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

.dropdown-list {
  display: flex;
  flex-direction: column;
  align-items: end;
  list-style: none;
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

.submit-notice {
  color: var(--text-mention-grey);
}
</style>
