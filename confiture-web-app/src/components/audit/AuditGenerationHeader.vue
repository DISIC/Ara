<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useDevMode } from "../../composables/useDevMode";
import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
import {
  useAccountStore,
  useAuditStore,
  useResultsStore,
  useSystemStore
} from "../../store";
import {
  captureWithPayloads,
  formatBytes,
  formatDate,
  slugify
} from "../../utils";
import CopyIcon from "../icons/CopyIcon.vue";
import SummaryCard, { SummaryCardThemes } from "../SummaryCard.vue";
import Dropdown from "../ui/Dropdown.vue";
import AuditProgressBar from "./AuditProgressBar.vue";
import DeleteModal from "./DeleteModal.vue";
import DuplicateModal from "./DuplicateModal.vue";
import NotesModal from "./NotesModal.vue";
import SaveIndicator from "./SaveIndicator.vue";

defineProps<{
  auditName: string;
  auditPublicationDate: string | null;
  auditEditionDate: string | null;
  keyInfos: {
    title: string;
    description: string;
    value: number;
    unit?: string;
    theme?: SummaryCardThemes;
    disabled?: boolean;
  }[];
  editUniqueId?: string;
}>();

const stickyIndicator = ref<HTMLDivElement>();

defineExpose({
  stickyIndicator
});

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

/**
 * Duplicate audit and redirect to new audit page
 */
function confirmDuplicate(name: string) {
  isDuplicationLoading.value = true;
  auditStore
    .duplicateAudit(uniqueId.value, name)
    .then((newAuditId) => {
      auditStore.$reset();
      resultStore.$reset();

      isDuplicationLoading.value = false;

      duplicateModal.value?.hide();

      router.push({
        name: "audit-overview",
        params: {
          uniqueId: newAuditId
        },
        state: {
          showDuplicatedAlert: true
        }
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
  const auditName = auditStore.currentAudit?.procedureName;

  auditStore
    .deleteAudit(uniqueId.value)
    .then(() => {
      resultStore.$reset();

      notify("success", undefined, `Audit ${auditName} supprimé avec succès`);

      if (accountStore.account) {
        router.push({
          name: "account-dashboard"
        });
      } else {
        router.push({
          name: "home",
          state: { deleteAudit: "true" }
        });
      }
    })
    .catch((error) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la suppression de votre audit. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
      );
      captureWithPayloads(error);
    })
    .finally(() => {
      deleteModal.value?.hide();
    });
}

/**
 * Update audit notes
 */
const notesModal = ref<InstanceType<typeof NotesModal>>();
const isNotesLoading = ref(false);

function openNotesModal() {
  notesModal.value?.show();
}

const updateAuditNotes = async (notes: string) => {
  isNotesLoading.value = true;
  try {
    await auditStore.updateAuditNotes(uniqueId.value, {
      notes
    });
  } catch (error) {
    console.error(error);
    notify(
      "error",
      "Une erreur est survenue",
      "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
    );
    auditStore.lastRequestFailed = true;
  } finally {
    isNotesLoading.value = false;
  }
};

const route = useRoute();
const uniqueId = computed(() => route.params.uniqueId as string);

const resultsStore = useResultsStore();

const csvExportUrl = computed(
  () => `/api/audits/${uniqueId.value}/exports/csv`
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

function copyAuditLink(uniqueId: string) {
  const url = `${window.location.origin}/audits/${uniqueId}/generation`;

  navigator.clipboard.writeText(url).then(() => {
    notify(
      "success",
      undefined,
      "Le lien vers l’audit a bien été copié dans le presse-papier."
    );
  });
}

const isDevMode = useDevMode();

const systemStore = useSystemStore();

const showAuditProgressBar = computed(() => {
  return (
    !auditStore.currentAudit?.publicationDate ||
    (auditStore.currentAudit?.publicationDate &&
      resultsStore.auditProgress !== 1)
  );
});

const scrollSentinelRef = ref<HTMLDivElement>();
const showLeftSideBorders = ref(false);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const el = entries.at(0)?.target;
      showLeftSideBorders.value =
        !entries.at(0)?.isIntersecting &&
        !!el &&
        // verify that the sentinel is at the top of the screen
        el.getBoundingClientRect().top <= 64;
    },
    { rootMargin: "-64px" }
  );

  observer.observe(scrollSentinelRef.value!);
});
</script>

<template>
  <div v-if="isDevMode" class="fr-mb-4w">
    <button class="fr-btn" @click="resultsStore.DEV_fillResults(uniqueId)">
      [DEV] Remplir l’audit
    </button>
  </div>

  <h1 class="fr-mb-3v">
    Audit
    <span class="fr-sr-only">
      Ara enregistre automatiquement vos saisies. Vous serez alerté en cas de
      problème lié à l’enregistrement
    </span>
  </h1>
  <p class="fr-text--xl fr-mb-4w">{{ auditName }}</p>

  <div ref="stickyIndicator" class="fr-grid-row fr-mb-3w sticky-indicator">
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

    <div
      class="fr-col-12 fr-col-sm-5 fr-col-md-3 indicator-left-side"
      :class="{ 'with-border': showLeftSideBorders }"
    >
      <AuditProgressBar
        v-if="showAuditProgressBar"
        :value="resultStore.auditProgress"
        label="Progression de l’audit"
        tooltip-label="Informations sur la progression de l’audit"
        :size="8"
        class="progress-bar"
      >
        <template #tooltip-content>
          <p class="fr-text--sm">
            La progression de l'audit se base sur les critères évalués de chaque
            <strong>page de votre échantillon</strong>. Évaluez les critères de
            toutes les pages pour terminer votre audit.
          </p>
          <p class="fr-text--xs fr-mb-0">
            À noter : les critères des
            <strong>éléments transverses</strong> sont optionnels. Ils sont pris
            en compte dans le calcul du taux mais pas dans la progression de
            l’audit.
          </p>
        </template>
      </AuditProgressBar>

      <div
        v-else-if="auditStore.currentAudit?.publicationDate"
        class="audit-status"
      >
        <span
          class="fr-icon-success-line fr-icon--sm audit-status-icon"
          aria-hidden="true"
        ></span>
        <strong>Audit
          {{ auditStore.currentAudit?.editionDate ? "modifié" : "terminé" }}
          le
          <time
            :datetime=" auditStore.currentAudit?.editionDate
              ? auditStore.currentAudit?.editionDate
              : auditStore.currentAudit?.publicationDate
            "
          >{{ auditStore.currentAudit?.editionDate
            ? formatDate(auditStore.currentAudit?.editionDate, true)
            : formatDate(auditStore.currentAudit?.publicationDate, true)
          }}</time></strong>
      </div>
    </div>

    <div class="fr-col-12 fr-col-sm-7 fr-col-md-9 sub-header">
      <SaveIndicator
        v-if="route.name === 'audit-generation-full'"
        class="audit-main-indicator"
      />
      <ul class="fr-my-0 fr-p-0 top-actions" role="list">
        <li class="fr-p-0">
          <Dropdown
            ref="optionsDropdownRef"
            title="Actions"
            :disabled="isOffline"
          >
            <ul role="list" class="fr-p-0 fr-m-0 dropdown-list">
              <li class="fr-hidden-lg dropdown-item">
                <button
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-draft-line"
                  :disabled="isOffline"
                  @click="openNotesModal"
                >
                  Ajouter des observations
                </button>
              </li>
              <li aria-hidden="true" class="fr-hidden-lg dropdown-separator" />
              <li class="fr-p-0 dropdown-item">
                <component
                  :is="isOffline ? 'button' : 'RouterLink'"
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left"
                  :to="isOffline ? undefined : {
                    name: 'report',
                    params: {
                      uniqueId: auditStore.currentAudit?.consultUniqueId
                    }
                  }"
                  target="_blank"
                  :disabled="isOffline ? true : undefined"
                  :rel="isOffline ? undefined : 'noopener'"
                >
                  Consulter le rapport
                  <span v-if="!isOffline" class="fr-sr-only">(nouvelle fenêtre)</span>
                </component>
              </li>
              <li aria-hidden="true" class="dropdown-separator" />
              <li class="fr-p-0 dropdown-item">
                <RouterLink
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-settings-5-line"
                  :to="{
                    name: 'audit-settings',
                    params: { uniqueId: editUniqueId }
                  }"
                >
                  Modifier les paramètres <span class="fr-hidden fr-unhidden-lg">de l’audit</span>
                </RouterLink>
              </li>
              <li class="dropdown-item">
                <button
                  class="fr-btn fr-btn--tertiary-no-outline"
                  @click="duplicateModal?.show()"
                >
                  <CopyIcon class="fr-mr-2v" />
                  Dupliquer l’audit
                </button>
              </li>
              <li
                v-if="editUniqueId"
                class="dropdown-item dropdown-item--with-meta"
              >
                <button
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-link fr-m-0"
                  @click="copyAuditLink(editUniqueId)"
                >
                  Copier le lien de l’audit
                  <span class="fr-sr-only">
                    {{ auditStore.currentAudit?.procedureName }}</span>
                  <span class="fr-text--xs fr-text--regular dropdown-item-meta">
                    Ce lien permet de modifier l’audit
                  </span>
                </button>
              </li>
              <li aria-hidden="true" class="dropdown-separator" />
              <li class="dropdown-item">
                <a
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-download-fill download-link"
                  :href="csvExportUrl"
                  :download="csvExportFilename"
                >
                  Exporter l’audit
                  <span class="fr-text--xs fr-text--regular download-meta">
                    CSV – {{ formatBytes(csvExportSizeEstimation, 2) }}
                  </span>
                </a>
              </li>
              <li aria-hidden="true" class="dropdown-separator" />
              <li class="dropdown-item">
                <button
                  class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-delete-line fr-m-0 danger-button--secondary"
                  @click="deleteModal?.show()"
                >
                  Supprimer l’audit
                </button>
              </li>
            </ul>
          </Dropdown>
        </li>

        <li class="fr-unhidden-lg fr-p-0 notes-desktop-link">
          <button
            class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-draft-line"
            :disabled="isOffline"
            @click="openNotesModal"
          >
            Ajouter des observations
          </button>
        </li>
      </ul>
    </div>
  </div>

  <div class="metrics fr-mb-4w">
    <SummaryCard
      v-for="info in keyInfos"
      :key="info.title"
      :title="info.title"
      :description="info.description"
      :value="info.value"
      :unit="info.unit"
      :theme="info.theme"
      :disabled="info.disabled"
    />
  </div>

  <div ref="scrollSentinelRef" />

  <DuplicateModal
    :id="uniqueId"
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
    v-if="auditStore.currentAudit"
    :id="uniqueId"
    ref="deleteModal"
    :procedure-name="auditStore.currentAudit.procedureName"
    @confirm="confirmDelete"
    @closed="
      optionsDropdownRef?.buttonRef?.focus();
      optionsDropdownRef?.closeOptions();
    "
  />

  <NotesModal
    ref="notesModal"
    :is-loading="isNotesLoading"
    @confirm="updateAuditNotes"
  />
</template>

<style scoped>
.sub-header {
  display: flex;
  column-gap: 1rem;
  align-items: center;
  justify-content: space-between;
  z-index: 3;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.notes-desktop-link {
  display: none;
}

.offline-alert {
  z-index: 4;
  width: 100%;
}

.sticky-indicator {
  position: sticky;
  top: 0;
  z-index: 4;
  gap: 0.5rem 0;
  align-items: center;
  background: var(--background-default-grey);
  min-height: 4rem;
}

.audit-main-indicator {
  margin-left: 0.75rem;
}

@media (width < 36rem) {
  .audit-main-indicator {
    margin-left: 0;
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

.indicator-left-side {
  display: flex;
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid transparent;
  border-right: 1px solid var(--border-default-grey);
  transition: border-color 0.2s ease;
  padding-right: 0.75rem;
}

@media (width < 48rem) {
  .indicator-left-side {
    padding-right: 1rem;
  }
}

@media (width < 36rem) {
  .indicator-left-side {
    border-right: none;
    padding-right: 0;
  }
}

.indicator-left-side.with-border {
  border-color: var(--border-default-grey);
}

.progress-bar {
  flex-grow: 1;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(v-bind("keyInfos.length"), 1fr);
  gap: 0 1rem;

  @media (width < 62rem) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
