<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { useAuditStats } from "../../composables/useAuditStats";
import { useNotifications } from "../../composables/useNotifications";
import { useWindowWidth } from "../../composables/useWindowWidth";
import { DEFAULT_NOTIFICATION_ERROR_DESCRIPTION } from "../../enums";
import router from "../../router";
import { useAccountStore, useAuditStore, useResultsStore } from "../../store";
import { Audit, AuditType } from "../../types";
import { captureWithPayloads, formatDate, getCriteriaCount, isSameDay } from "../../utils";
import AuditProgressBar from "../audit/AuditProgressBar.vue";
import DeleteModal from "../audit/DeleteModal.vue";
import DuplicateModal from "../audit/DuplicateModal.vue";
import TransferModal from "../audit/TransferModal.vue";
import SummaryCard, { SummaryCardThemes } from "../SummaryCard.vue";
import Dropdown from "../ui/Dropdown.vue";
import StepCard from "./StepCard.vue";

const props = defineProps<{
  audit: Audit;
}>();

const route = useRoute();
const uniqueId = computed(() => route.params.uniqueId as string);
const resultsStore = useResultsStore();
const auditStore = useAuditStore();
const accountStore = useAccountStore();
const windowWidth = useWindowWidth();

const { complianceLevel, compliantCriteriaCount, notCompliantCriteriaCount } =
  useAuditStats();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});

const auditIsInProgress = computed(() => {
  return resultsStore.auditProgress > 0 && resultsStore.auditProgress < 1;
});

const auditProcedureName = computed(() => {
  return props.audit.procedureName || "";
});

const canTransferAudit = computed(() => {
  return !props.audit?.auditor?.isVerified
    || accountStore.account?.email === props.audit?.auditorEmail;
});

const notify = useNotifications();

const deleteModalRef = ref<InstanceType<typeof DeleteModal>>();
const transferModalRef = ref<InstanceType<typeof TransferModal>>();
const duplicateModalRef = ref<InstanceType<typeof DuplicateModal>>();
const isDuplicationLoading = ref(false);

function duplicateAudit(name: string) {
  if (!props.audit) {
    return;
  }
  isDuplicationLoading.value = true;
  auditStore
    .duplicateAudit(props.audit.editUniqueId, name)
    .then((newAuditId) => {
      duplicateModalRef.value?.hide();

      notify("success", undefined, `Audit « ${name} » créé`, {
        action: {
          label: "Accéder à l’audit",
          cb() {
            router.push({ name: "audit-generation", params: { uniqueId: newAuditId } });
          }
        }
      });
    })
    .catch((error) => {
      notify(
        "error",
        "Échec de la duplication de l'audit",
        DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
      );
      captureWithPayloads(error);
    })
    .finally(() => {
      isDuplicationLoading.value = false;
      duplicateModalRef.value?.hide();
    });
}

async function deleteAudit() {
  try {
    await auditStore.deleteAudit(uniqueId.value);

    deleteModalRef.value?.hide();

    notify("success", undefined, `Audit « ${auditProcedureName.value} » supprimé`);

    router.push({
      name: accountStore.account ? "account-dashboard" : "home"
    });
  } catch (error) {
    notify(
      "error",
      "Échec de la supression de l'audit",
      DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
    );
    captureWithPayloads(error);
  }
}

async function transferAudit(newEmail: string) {
  try {
    await auditStore.transferAudit(
      uniqueId.value,
      newEmail
    );

    transferModalRef.value?.hide();

    notify("success", `Audit « ${auditProcedureName.value} » transféré`, `Lien d’accès envoyé à ${newEmail}`);

    router.push({
      name: accountStore.account ? "account-dashboard" : "home"
    });
  } catch (error) {
    notify(
      "error",
      "Échec du transfert de l'audit",
      DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
    );
    captureWithPayloads(error);
  }
}
</script>

<template>
  <StepCard>
    <div class="step-card-heading">
      <span
        v-if="auditIsReady"
        id="audit-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill step-card-check"
      >
        <span class="fr-sr-only">Étape terminée</span>
      </span>

      <h2
        class="fr-h3 fr-mb-0 step-card-title"
        aria-describedby="audit-step-status"
      >
        Audit
        <p
          v-if="audit.auditType"
          class="fr-badge fr-badge--info fr-badge--no-icon"
        >
          {{ getCriteriaCount(audit.auditType) }}
          critères
        </p>
      </h2>

      <!-- Tertiary actions -->
      <div class="audit-step-settings-link">
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
            <li>
              <RouterLink
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-settings-5-line"
                :to="{
                  name: 'audit-settings',
                  params: { uniqueId: audit.editUniqueId }
                }"
              >
                Modifier les paramètres
              </RouterLink>
            </li>

            <li class="dropdown-item">
              <button
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-file-copy-line fr-m-0"
                @click="duplicateModalRef?.show()"
              >
                Dupliquer
                <span class="fr-sr-only"> {{ audit.procedureName }}</span>
              </button>
            </li>
            <li class="dropdown-item dropdown-item--with-meta">
              <button
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-share-forward-line fr-m-0"
                :disabled="!canTransferAudit"
                @click="transferModalRef?.show()"
              >
                Transférer
                <span class="fr-sr-only"> {{ audit.procedureName }}</span>
                <p v-if="!canTransferAudit" class="fr-text--xs fr-text--regular dropdown-item-meta">Seul le propriétaire peut transférer l’audit</p>
              </button>
            </li>
            <li aria-hidden="true" class="dropdown-separator"></li>
            <li class="dropdown-item">
              <button
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-delete-line fr-m-0 danger-button--secondary"
                @click="deleteModalRef?.show()"
              >
                Supprimer l’audit
                <span class="fr-sr-only"> {{ audit.procedureName }}</span>
              </button>
            </li>
          </ul>
        </Dropdown>
      </div>

    </div>

    <p class="fr-text--sm fr-mb-3w audit-step-date">
      <template v-if="auditIsReady && audit.publicationDate">
        Terminé le
        <time :datetime="audit.publicationDate.toString()">{{
          formatDate(audit.publicationDate)
        }}</time>
        <template
          v-if="
            audit.editionDate &&
              !isSameDay(audit.publicationDate, audit.editionDate)
          "
        >
          – Mis à jour le
          <time :datetime="audit.editionDate.toString()">{{
            formatDate(audit.editionDate)
          }}</time></template>
      </template>
      <template v-else-if="audit.creationDate">
        Créé le
        <time :datetime="audit.creationDate.toString()">{{
          formatDate(audit.creationDate)
        }}</time>
      </template>
    </p>

    <div
      v-if="auditIsReady"
      :class="[
        'fr-mb-3w audit-step-charts',
        { 'audit-step-charts--full': audit.auditType === AuditType.FULL }
      ]"
    >
      <SummaryCard
        v-if="audit.auditType === AuditType.FULL"
        title="Taux global<br /> de conformité"
        :value="complianceLevel"
        unit="%"
        :theme="SummaryCardThemes.Blue"
        minimal
      />

      <SummaryCard
        title="Critères<br /> non conformes"
        :value="notCompliantCriteriaCount"
        :theme="SummaryCardThemes.Red"
        minimal
      />

      <SummaryCard
        title="Critères<br /> conformes"
        :value="compliantCriteriaCount"
        :theme="SummaryCardThemes.Green"
        minimal
      />
    </div>

    <AuditProgressBar
      v-else
      :value="resultsStore.auditProgress"
      label="Progression"
      :size="12"
      class="fr-mb-3w audit-step-progress-bar"
    />

    <ul
      class="fr-btns-group fr-btns-group--icon-left audit-step-card-actions"
    >
      <li>
        <RouterLink
          :to="{
            name: 'audit-generation',
            params: { uniqueId: uniqueId }
          }"
          class="fr-btn fr-btn--icon-left fr-mb-0"
          :class="
            auditIsReady
              ? 'fr-btn--tertiary fr-icon-draft-line'
              : 'fr-icon-edit-fill'
          "
        >
          {{
            auditIsReady
              ? "Accéder"
              : auditIsInProgress
                ? "Continuer"
                : "Commencer"
          }}
        </RouterLink>
      </li>
    </ul>
  </StepCard>

  <DuplicateModal
    :id="`duplicate-modal-${uniqueId}`"
    ref="duplicateModalRef"
    :original-audit-name="auditProcedureName"
    :is-loading="isDuplicationLoading"
    @confirm="duplicateAudit"
  />

  <DeleteModal
    :id="`delete-modal-${uniqueId}`"
    ref="deleteModalRef"
    :procedure-name="auditProcedureName"
    @confirm="deleteAudit"
  />

  <TransferModal
    :id="`transfer-modal-${uniqueId}`"
    ref="transferModalRef"
    :procedure-name="auditProcedureName"
    @confirm="transferAudit"
  />
</template>

<style scoped>
.step-card-heading {
  margin-block-end: 0.125rem;
}

.audit-step-settings-link {
  margin-inline-start: auto;

  @media (width < 36rem) {
    margin-inline-start: initial;
  }
}

.audit-step-date {
  color: var(--text-mention-grey);
  grid-column: 1 / -1;
  grid-row: 2;
}

.audit-step-progress-bar {
  grid-column: 1 / -1;
  grid-row: 3;
}

.audit-step-charts {
  grid-column: 1 / -1;
  grid-row: 3;
  gap: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.audit-step-charts--full {
  grid-template-columns: repeat(3, 1fr);
}

.audit-step-chart {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.audit-step-chart-separator {
  width: 1px;
  background: var(--border-default-grey);
  height: 100%;
  margin-left: 0.5rem;
  margin-right: 1rem;
}

.audit-step-card-actions {
  grid-column: 1 / -1;
}

@media (width < 48rem) {
  .audit-step-charts {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .audit-step-chart-separator {
    display: none;
  }
}
</style>
