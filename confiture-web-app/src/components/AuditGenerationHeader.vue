<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useDevMode } from "../composables/useDevMode";
import { useIsOffline } from "../composables/useIsOffline";
import { useNotifications } from "../composables/useNotifications";
import {
  useAuditStore,
  useResultsStore,
  useSystemStore,
  useAccountStore,
} from "../store";
import {
  captureWithPayloads,
  formatDate,
  slugify,
  formatBytes,
} from "../utils";
import AuditProgressBar from "./AuditProgressBar.vue";
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

const isOffline = useIsOffline();

const router = useRouter();

const duplicateModal = ref<InstanceType<typeof DuplicateModal>>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const optionsDropdownRef = ref<InstanceType<typeof Dropdown>>();

const isDuplicationLoading = ref(false);

const auditStore = useAuditStore();
const resultStore = useResultsStore();
const accountStore = useAccountStore();
const notify = useNotifications();

function copyReportLink() {
  const reportUrl = `${window.location.origin}/rapports/${auditStore.currentAudit?.consultUniqueId}`;

  navigator.clipboard.writeText(reportUrl).then(() => {
    notify("success", "", "Le lien vers le rapport a été copié avec succès");
  });
}

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

      router.push({
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
        "Un problème empêche la duplication de l’audit. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste.",
      );
      captureWithPayloads(error);
    });
}

/**
 * Delete audit and redirect to home page
 */
function confirmDelete() {
  const auditName = auditStore.currentAudit?.procedureName;

  auditStore
    .deleteAudit(uniqueId.value)
    .then(() => {
      resultStore.$reset();

      notify("success", undefined, `Audit ${auditName} supprimé avec succès`);

      if (accountStore.account) {
        router.push({
          name: "account-dashboard",
        });
      } else {
        router.push({
          name: "home",
          state: { deleteAudit: "true" },
        });
      }
    })
    .catch((error) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste.",
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
  () => `/api/audits/${uniqueId.value}/exports/csv`,
);

const csvExportFilename = computed(() => {
  if (!auditStore.currentAudit?.procedureName) {
    return "audit.csv";
  }
  return `audit-${slugify(auditStore.currentAudit.procedureName)}.csv`;
});

const csvExportSizeEstimation = computed(() => {
  return 502 + Object.keys(resultsStore.data ?? {}).length * 318;
});

const isDevMode = useDevMode();

const systemStore = useSystemStore();

const unfinishedAudit = computed(() => resultStore.auditProgress < 1);

const showAuditProgressBar = computed(() => {
  return (
    !auditStore.data?.publicationDate ||
    (auditStore.data?.publicationDate && resultsStore.auditProgress !== 1)
  );
});

const scrollSentinelRef = ref<HTMLDivElement>();
const showLeftSideBorders = ref(false);

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    showLeftSideBorders.value = !entries.at(0)?.isIntersecting;
  });

  observer.observe(scrollSentinelRef.value!);
});
</script>

<template>
  <div v-if="isDevMode" class="fr-mb-4w">
    <button class="fr-btn" @click="resultsStore.DEV_fillResults(uniqueId)">
      [DEV] Remplir l’audit
    </button>
  </div>

  <!-- TODO: Link to actions somehow -->
  <slot name="actions-notice" />

  <div ref="scrollSentinelRef" />

  <div id="sticky-indicator" class="sticky-indicator">
    <div
      v-if="!systemStore.isOnline"
      id="offlineAlert"
      class="fr-pt-1w offline-alert"
    >
      <div class="fr-alert fr-alert--error">
        <h3 class="fr-alert__title">Tentative de connexion...</h3>
        <p>
          Vous êtes actuellement hors connexion. Veuillez vérifier votre
          connexion internet.
        </p>
      </div>
    </div>

    <!-- <div class="fr-grid-row sticky-grid"> -->
    <div
      class="indicator-left-side fr-col-3"
      :class="{ 'with-border': showLeftSideBorders }"
    >
      <AuditProgressBar v-if="showAuditProgressBar" class="fr-col-3" />

      <div v-else-if="auditStore.data?.publicationDate" class="audit-status">
        <span
          class="fr-icon-success-line fr-icon--sm audit-status-icon"
          aria-hidden="true"
        ></span>
        <strong
          >Audit {{ auditStore.data?.editionDate ? "modifié" : "terminé" }} le
          <time
            :datetime="
              auditStore.data?.editionDate
                ? auditStore.data?.editionDate
                : auditStore.data?.publicationDate
            "
            >{{
              auditStore.data?.editionDate
                ? formatDate(auditStore.data?.editionDate, true)
                : formatDate(auditStore.data?.publicationDate, true)
            }}</time
          ></strong
        >
      </div>
    </div>

    <!-- <template > -->
    <!-- <div class="fr-ml-2w separator" /> -->
    <SaveIndicator
      v-if="route.name === 'edit-audit-step-three'"
      class="fr-pl-1w"
    />
    <!-- </template> -->

    <div class="sub-header">
      <ul class="top-actions fr-my-0" role="list">
        <li class="fr-mr-2w">
          <RouterLink
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-settings-5-line"
            :to="{
              name: 'edit-audit-step-one',
              params: { uniqueId: editUniqueId },
            }"
          >
            Paramètres
          </RouterLink>
        </li>

        <li class="fr-mr-2w">
          <Dropdown
            ref="optionsDropdownRef"
            title="Actions"
            :disabled="isOffline"
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
    <!-- </div> -->
  </div>

  <h1 class="">{{ auditName }}</h1>

  <div
    :class="`fr-grid-row fr-grid-row--gutters ${
      auditPublicationDate ? 'fr-mb-4w' : 'fr-mb-3v'
    }`"
  >
    <div :class="`fr-col-12 fr-col-md-${12 / keyInfos.length}`">
      <SummaryCard
        :title="keyInfos[0].title"
        :description="
          unfinishedAudit
            ? '(Disponible à la fin de l’audit)'
            : keyInfos[0].description
        "
        :value="unfinishedAudit ? 0 : keyInfos[0].value"
        :total="keyInfos[0].total"
        :unit="keyInfos[0].unit"
        :theme="unfinishedAudit ? undefined : keyInfos[0].theme"
        :disabled="unfinishedAudit"
      />
    </div>
    <div
      v-for="info in keyInfos.slice(1)"
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
    :original-audit-name="auditStore.currentAudit?.procedureName"
    :is-loading="isDuplicationLoading"
    @confirm="confirmDuplicate"
    @closed="
      optionsDropdownRef?.buttonRef?.focus();
      optionsDropdownRef?.closeOptions();
    "
  />

  <DeleteModal
    ref="deleteModal"
    @confirm="confirmDelete"
    @closed="
      optionsDropdownRef?.buttonRef?.focus();
      optionsDropdownRef?.closeOptions();
    "
  />
</template>

<style scoped>
.sub-header {
  display: flex;
  align-items: end;
  justify-content: space-between;

  flex-basis: initial !important;
  flex-direction: column;
  z-index: 3;

  margin-left: auto;
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

.offline-alert {
  z-index: 4;
  width: 100%;
}

.sticky-indicator {
  flex-basis: initial !important;
  align-self: end;
  position: sticky;
  top: 0;
  z-index: 4;

  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 0;
  flex: 1;

  background: var(--background-default-grey);
  min-height: 4rem;
}

@media (min-width: 62em) {
  .sticky-indicator {
    z-index: 3;
  }
}

.audit-status {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.audit-status-icon {
  color: var(--text-default-success);
}

.separator {
  width: 1px;
  /* height: 100%; */
  background-color: var(--border-default-grey);
}

.sticky-grid {
  flex: 1;
}

.indicator-left-side {
  display: flex;
  align-items: center;
  align-self: stretch;
  /* border: 1px solid gold; */
  border-bottom: 1px solid transparent;
  border-right: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.indicator-left-side.with-border {
  border-color: var(--border-default-grey);
}
</style>
