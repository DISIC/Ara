<script lang="ts" setup>
import { computed, ref, useTemplateRef } from "vue";

import { RouterLink } from "vue-router";
import { useNotifications } from "../../../composables/useNotifications";
import { useWindowWidth } from "../../../composables/useWindowWidth";
import { useAuditStore } from "../../../store";
import { AuditStatus, AuditType } from "../../../types";
import { AccountAudit } from "../../../types/account";
import {
  captureWithPayloads,
  formatBytes,
  formatDate,
  getCriteriaCount,
  slugify
} from "../../../utils";
import AuditProgressBar from "../../audit/AuditProgressBar.vue";
import DuplicateModal from "../../audit/DuplicateModal.vue";
import CopyIcon from "../../icons/CopyIcon.vue";
import EditDocumentIcon from "../../icons/EditDocumentIcon.vue";
import Dropdown from "../../ui/Dropdown.vue";

const props = defineProps<{
  audit: AccountAudit;
  zIndex?: number;
}>();

defineEmits(["delete"]);

const notify = useNotifications();
const auditStore = useAuditStore();

const windowWidth = useWindowWidth();

const isNotStarted = computed(
  () => props.audit.status === AuditStatus.NOT_STARTED
);

const isInProgress = computed(
  () => props.audit.status === AuditStatus.IN_PROGRESS
);

const optionsDropdownRef = ref<InstanceType<typeof Dropdown>>();

const duplicateModal = ref<InstanceType<typeof DuplicateModal>>();
const isDuplicationLoading = ref(false);

function duplicateAudit(name: string) {
  isDuplicationLoading.value = true;
  auditStore
    .duplicateAudit(props.audit.editUniqueId, name)
    .then((newAuditId) => {
      duplicateModal.value?.hide();

      notify("success", undefined, `Audit ${name} dupliqué avec succès`, {
        action: {
          label: "Annuler",
          cb() {
            console.log("Cancelled" + newAuditId);
            auditStore
              .deleteAudit(newAuditId)
              .then(() => {
                notify("success", undefined, "Duplication de l’audit annulée.");
              })
              .catch((error) => {
                notify(
                  "error",
                  "Une erreur est survenue",
                  "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
                );
                captureWithPayloads(error);
              });
          }
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
    })
    .finally(() => {
      isDuplicationLoading.value = false;
      duplicateModal.value?.hide();
    });
}

const csvExportUrl = computed(
  () => `/api/audits/${props.audit.editUniqueId}/exports/csv`
);

const csvExportFilename = computed(() => {
  if (!props.audit.procedureName) {
    return "audit.csv";
  }
  return `audit-${slugify(props.audit.procedureName)}.csv`;
});

function copyAuditLink(uniqueId: string) {
  const url = `${window.location.origin}/audits/${uniqueId}/generation`;

  navigator.clipboard.writeText(url).then(() => {
    notify(
      "success",
      undefined,
      `Le lien vers l’audit a bien été copié dans le presse-papier.`
    );
  });
}

function copyReportLink(uniqueId: string) {
  const url = `${window.location.origin}/rapport/${uniqueId}`;

  navigator.clipboard.writeText(url).then(() => {
    notify(
      "success",
      undefined,
      `Le lien vers le rapport a bien été copié dans le presse-papier.`
    );
  });
}

function copyStatementLink(uniqueId: string) {
  const url = `${window.location.origin}/declaration/${uniqueId}`;

  navigator.clipboard.writeText(url).then(() => {
    notify(
      "success",
      undefined,
      `Le lien vers la déclaration d’accessibilité a bien été copié dans le presse-papier.`
    );
  });
}

const auditNameRef = useTemplateRef("auditNameRef");

defineExpose({
  focusAuditName: () => {
    // @ts-expect-error For some reason, the RouterLink type does not list "$el" as one of its props.
    auditNameRef.value?.$el.focus();
  }
});
</script>

<template>
  <div class="fr-p-2w grid">
    <!-- Name -->
    <RouterLink
      ref="auditNameRef"
      :to="{
        name: 'audit-generation',
        params: { uniqueId: audit.editUniqueId }
      }"
      class="fr-link audit-name"
    >
      <strong>{{ audit.procedureName }}</strong>
    </RouterLink>

    <!-- Creation date -->
    <p class="fr-mb-0">
      <span class="fr-sr-only-md">Date de création : </span>
      <time v-if="audit.creationDate" :datetime="audit.creationDate.toString()">
        {{ formatDate(audit.creationDate.toString(), true) }}
      </time>
      <template v-else>Inconnu</template>
    </p>

    <!-- Type -->
    <p class="fr-mb-0">
      <span class="fr-sr-only">Type </span>
      {{ getCriteriaCount(audit.auditType) }} critères
    </p>

    <!-- Compliance level / Progression level -->
    <div v-if="audit.status === AuditStatus.COMPLETED" class="fr-mr-lg-4w">
      <div
        v-if="audit.auditType === AuditType.FULL"
        class="audit-compliance-level"
      >
        <p
          class="fr-badge fr-badge--sm fr-badge--no-icon fr-mb-0"
          :class="
            isInProgress || isNotStarted
              ? null
              : {
                'fr-badge--green-emeraude': audit.complianceLevel === 100,
                'fr-badge--new': audit.complianceLevel >= 50,
                'fr-badge--error': audit.complianceLevel < 50
              }
          "
        >
          <span v-if="!isInProgress" class="fr-sr-only">Taux de conformité</span>
          {{
            isInProgress || isNotStarted
              ? "Audit en cours"
              : `${audit.complianceLevel} %`
          }}
        </p>
        <p
          v-if="!isInProgress && !isNotStarted"
          class="fr-text--xs fr-mb-0 fr-mt-1v"
        >
          {{
            audit.complianceLevel === 100
              ? "Totalement conforme"
              : audit.complianceLevel >= 50
                ? "Partiellement conforme"
                : "Non conforme"
          }}
        </p>
      </div>
      <p v-else class="fr-m-0">
        Non-applicable
        <button
          class="fr-btn--tooltip fr-btn"
          :aria-describedby="`compliance-tooltip-${zIndex}`"
        >
          Information contextuelle
        </button>
        <span
          :id="`compliance-tooltip-${zIndex}`"
          class="fr-tooltip fr-placement"
          role="tooltip"
          aria-hidden="true"
        >
          Seul l'audit 106 critères permet d'obtenir un taux de conformité
        </span>
      </p>
    </div>

    <AuditProgressBar
      v-else
      class="fr-mr-lg-4w"
      label="Progression de l’audit"
      :value="audit.progress"
      :size="8"
      inline
    />

    <!-- Main action -->
    <RouterLink
      :to="{
        name: 'audit-generation',
        params: { uniqueId: audit.editUniqueId }
      }"
      class="fr-btn fr-btn--secondary no-external-icon audit-main-action"
    >
      <EditDocumentIcon class="fr-mr-2v main-action-icon" />
      {{
        isNotStarted
          ? "Commencer l’audit"
          : isInProgress
            ? "Continuer l’audit"
            : "Accéder à l’audit"
      }}
      <span v-if="isInProgress || isNotStarted" class="fr-sr-only">
        {{ audit.procedureName }}</span>
      <span v-else class="fr-sr-only">pour l’audit {{ audit.procedureName }}</span>
    </RouterLink>

    <!-- Secondary action -->
    <RouterLink
      :to="{
        name: 'audit-overview',
        params: { uniqueId: audit.editUniqueId }
      }"
      class="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-file-text-line no-external-icon"
    >
      Livrables
    </RouterLink>

    <!-- Tertiary actions -->
    <div :style="{ zIndex: zIndex }">
      <Dropdown
        ref="optionsDropdownRef"
        title="Actions"
        :align-left="windowWidth < 880"
        :button-props="{
          class: 'fr-btn--tertiary',
          ariaLabel: `Actions de l’audit ${audit.procedureName}`
        }"
      >
        <ul role="list" class="fr-p-0 fr-m-0 dropdown-list">
          <template v-if="!isInProgress && !isNotStarted">
            <li class="dropdown-item">
              <RouterLink
                :to="{
                  name: 'report',
                  params: { uniqueId: audit.consultUniqueId }
                }"
                target="_blank"
                class="fr-btn fr-btn--tertiary-no-outline fr-m-0"
              >Consulter le rapport
                <span class="fr-sr-only"> {{ audit.procedureName }} (nouvelle fenêtre)</span>
              </RouterLink>
            </li>

            <li aria-hidden="true" class="dropdown-separator" />
          </template>

          <li class="dropdown-item">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-m-0"
              @click="duplicateModal?.show()"
            >
              <CopyIcon class="fr-mr-2v" />
              Dupliquer l’audit
              <span class="fr-sr-only"> {{ audit.procedureName }}</span>
            </button>
          </li>
          <li class="dropdown-item">
            <RouterLink
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-settings-5-line fr-m-0"
              :to="{
                name: 'audit-settings',
                params: { uniqueId: audit.editUniqueId }
              }"
            >
              Modifier les paramètres
              <template v-if="windowWidth > 880">de l’audit</template>
            </RouterLink>
          </li>

          <li class="dropdown-item dropdown-item--with-meta">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-link fr-m-0"
              @click="copyAuditLink(audit.editUniqueId)"
            >
              Copier le lien de l’audit
              <span class="fr-sr-only"> {{ audit.procedureName }}</span>
              <span class="fr-text--xs fr-text--regular dropdown-item-meta">
                Ce lien permet de modifier l’audit
              </span>
            </button>
          </li>

          <li aria-hidden="true" class="dropdown-separator" />

          <li class="dropdown-item">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-link fr-m-0"
              @click="copyReportLink(audit.consultUniqueId)"
            >
              Copier le lien du rapport
              <span class="fr-sr-only">de l’audit {{ audit.procedureName }}</span>
            </button>
          </li>

          <li v-if="audit.statementIsPublished" class="dropdown-item">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-link fr-m-0"
              @click="copyStatementLink(audit.consultUniqueId)"
            >
              Copier le lien de la déclaration
            </button>
          </li>

          <li class="dropdown-item dropdown-item--with-meta">
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-download-fill fr-m-0"
              :href="csvExportUrl"
              :download="csvExportFilename"
            >
              Télécharger l’audit
              <span class="fr-sr-only"> {{ audit.procedureName }}</span>
              <span class="fr-text--xs fr-text--regular dropdown-item-meta">
                CSV – {{ formatBytes(audit.estimatedCsvSize, 2) }}
              </span>
            </a>
          </li>
          <li aria-hidden="true" class="dropdown-separator"></li>
          <li class="dropdown-item">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-delete-line fr-m-0 danger-button--secondary"
              @click="$emit('delete')"
            >
              Supprimer l’audit
              <span class="fr-sr-only"> {{ audit.procedureName }}</span>
            </button>
          </li>
        </ul>
      </Dropdown>
    </div>
  </div>

  <DuplicateModal
    :id="audit.editUniqueId"
    ref="duplicateModal"
    :original-audit-name="audit.procedureName"
    :is-loading="isDuplicationLoading"
    @confirm="duplicateAudit"
    @closed="
      optionsDropdownRef?.buttonRef?.focus();
      optionsDropdownRef?.closeOptions();
    "
  />
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1.75fr 0.5fr 0.75fr 1.25fr 1.5fr 0.75fr 0.75fr;
  gap: 1rem;
  align-items: center;
  border: 1px solid var(--border-default-grey);

  @media (width < 55rem) {
    grid-template-columns: 1fr;
  }
}

.audit-name {
  background-image: none;
  color: inherit;
  justify-self: start;

  &:hover {
    color: var(--text-action-high-blue-france);
    text-decoration: underline;
  }
}

.audit-compliance-level {
  @media (width < 62rem) {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
}

/* Make button take full column width */
.audit-main-action {
  justify-content: center;
  width: initial;
}

.main-action-icon {
  flex: 0 0 auto;
}
</style>
