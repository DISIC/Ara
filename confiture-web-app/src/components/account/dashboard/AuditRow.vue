<script lang="ts" setup>
import { ref, computed } from "vue";

import { AuditStatus } from "../../../types";
import { AccountAudit } from "../../../types/account";
import {
  formatDate,
  formatAuditType,
  captureWithPayloads,
  slugify,
} from "../../../utils";
import Dropdown from "../../Dropdown.vue";
import CopyIcon from "../../icons/CopyIcon.vue";
import DuplicateModal from "../../DuplicateModal.vue";
import DeleteModal from "../../DeleteModal.vue";
import { useNotifications } from "../../../composables/useNotifications";
import { useRouter } from "vue-router";
import { useAuditStore, useResultsStore } from "../../../store";

const props = defineProps<{
  audit: AccountAudit;
  zIndex?: number;
}>();

const notify = useNotifications();
const router = useRouter();
const auditStore = useAuditStore();
const resultStore = useResultsStore();

const isInProgress = computed(
  () => props.audit.status === AuditStatus.IN_PROGRESS
);

const rowUrl = isInProgress.value
  ? {
      name: "edit-audit-step-three",
      params: { uniqueId: props.audit.editId },
    }
  : {
      name: "report",
      params: { uniqueId: props.audit.consultId },
    };

const optionsDropdownRef = ref<InstanceType<typeof Dropdown>>();

const duplicateModal = ref<InstanceType<typeof DuplicateModal>>();
const isDuplicationLoading = ref(false);

function duplicateAudit(name: string) {
  isDuplicationLoading.value = true;
  auditStore
    .duplicateAudit(props.audit.editId, name)
    .then((newAuditId) => {
      auditStore.$reset();
      resultStore.$reset();

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
    })
    .finally(() => {
      isDuplicationLoading.value = false;
      duplicateModal.value?.hide();
    });
}

function copyAuditLink() {
  const auditUrl = `${window.location.origin}/audits/${props.audit.editId}/generation`;

  navigator.clipboard.writeText(auditUrl).then(() => {
    notify("success", "", "Le lien vers l’audit a été copié avec succès");
  });
}

function copyReportLink() {
  const reportUrl = `${window.location.origin}/rapports/${props.audit.consultId}`;

  navigator.clipboard.writeText(reportUrl).then(() => {
    notify("success", "", "Le lien vers le rapport a été copié avec succès");
  });
}

const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const isDeletionLoading = ref(false);

function deleteAudit() {
  isDeletionLoading.value = true;
  auditStore
    .deleteAudit(props.audit.editId)
    .then(() => {
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
        "Un problème empêche la suppression de votre audit. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
      );
      captureWithPayloads(error);
    })
    .finally(() => {
      isDeletionLoading.value = false;
      deleteModal.value?.hide();
    });
}
</script>

<template>
  <div class="fr-py-2w grid">
    <RouterLink :to="rowUrl" class="fr-pl-2w audit-name">
      <strong>{{ audit.name }}</strong>
    </RouterLink>

    <p
      class="fr-badge fr-badge--sm audit-status"
      :class="{
        'fr-badge--purple-glycine': isInProgress,
      }"
    >
      {{ isInProgress ? "En cours" : "Terminé" }}
    </p>
    <p class="fr-mb-0 audit-date">
      <time :datetime="audit.creationDate.toString()">
        {{ formatDate(audit.creationDate.toString(), true) }}
      </time>
    </p>
    <p class="fr-mb-0 audit-type">{{ formatAuditType(audit.type) }}</p>
    <div class="audit-compliance-level">
      <p
        class="fr-badge fr-badge--sm fr-badge--no-icon fr-mb-0"
        :class="
          !isInProgress
            ? {
                'fr-badge--green-emeraude': audit.complianceLevel === 100,
                'fr-badge--new': audit.complianceLevel >= 50,
                'fr-badge--error': audit.complianceLevel < 50,
              }
            : null
        "
      >
        {{ isInProgress ? "–" : `${audit.complianceLevel}%` }}
      </p>
      <p v-if="!isInProgress" class="fr-text--xs fr-mb-0 fr-mt-1v">
        {{
          audit.complianceLevel === 100
            ? "Totalement conforme"
            : audit.complianceLevel >= 50
            ? "Partiellement conforme"
            : "Non conforme"
        }}
      </p>
    </div>
    <RouterLink
      :to="rowUrl"
      class="fr-btn fr-btn--secondary fr-btn--icon-left audit-main-action"
      :class="isInProgress ? 'fr-icon-edit-line' : 'fr-icon-eye-line'"
    >
      {{ isInProgress ? "Finaliser l’audit" : "Voir le rapport" }}
    </RouterLink>
    <div class="fr-pr-2w" :style="{ zIndex: zIndex }">
      <Dropdown
        ref="optionsDropdownRef"
        title="Options"
        :button-props="{ class: 'fr-btn--tertiary' }"
      >
        <ul role="list" class="fr-p-0 fr-m-0 dropdown-list">
          <template v-if="!isInProgress">
            <li class="dropdown-item">
              <RouterLink
                :to="{
                  name: 'edit-audit-step-three',
                  params: { uniqueId: audit.editId },
                }"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-line fr-m-0"
              >
                Modifier l’audit
              </RouterLink>
            </li>
          </template>
          <li class="dropdown-item">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-m-0"
              @click="duplicateModal?.show()"
            >
              <CopyIcon class="fr-mr-2v" />
              Créer une copie
            </button>
          </li>

          <li aria-hidden="true" class="dropdown-separator"></li>

          <li class="dropdown-item dropdown-item--with-meta">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-link fr-m-0"
              @click="copyAuditLink"
            >
              Copier le lien de l’audit
              <span class="fr-text--xs fr-text--regular dropdown-item-meta">
                Ce lien permet de modifier l’audit
              </span>
            </button>
          </li>

          <li class="dropdown-item">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-link fr-m-0"
              @click="copyReportLink"
            >
              Copier le lien du rapport
            </button>
          </li>

          <li aria-hidden="true" class="dropdown-separator"></li>

          <li class="dropdown-item dropdown-item--with-meta">
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-download-fill fr-m-0"
              href="#"
              download="file"
            >
              Télécharger l’audit
              <!-- TODO: refactor (3 same methods in 3 ≠ files) -->
              <span class="fr-text--xs fr-text--regular dropdown-item-meta">
                CSV – 61,88 Ko
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
    </div>
  </div>

  <DuplicateModal
    ref="duplicateModal"
    :original-audit-name="audit.name"
    :is-loading="isDuplicationLoading"
    @confirm="duplicateAudit"
    @closed="
      optionsDropdownRef?.buttonRef.focus();
      optionsDropdownRef?.closeOptions();
    "
  />

  <DeleteModal
    ref="deleteModal"
    @confirm="deleteAudit"
    @closed="
      optionsDropdownRef?.buttonRef.focus();
      optionsDropdownRef?.closeOptions();
    "
  />
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 2fr 0.75fr 0.75fr 1.25fr 1.25fr 1.5fr 1fr;
  grid-gap: 1rem;
  align-items: center;
  border: 1px solid var(--border-default-grey);
  position: relative;
}

.grid:hover {
  background: var(--background-raised-grey-hover);
}

.audit-name {
  background-image: none;
  z-index: 1;
}

.audit-name:focus {
  outline: none;
}
.audit-name:focus::before {
  outline: 2px solid #0a76f6;
}

.audit-name::before {
  content: "";
  position: absolute;
  inset: 0;
}

.audit-status,
.audit-date,
.audit-type,
.audit-compliance-level {
  pointer-events: none;
  z-index: 1;
}

.audit-main-action {
  justify-self: end;
}

.delete-button {
  color: var(--error-425-625);
}
</style>
