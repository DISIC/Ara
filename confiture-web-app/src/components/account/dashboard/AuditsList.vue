<script lang="ts" setup>
import { ref, useTemplateRef, useId } from "vue";
import { useNotifications } from "../../../composables/useNotifications";
import { DEFAULT_NOTIFICATION_ERROR_DESCRIPTION } from "../../../enums";
import { useAuditStore } from "../../../store";
import { AuditStatus } from "../../../types";
import { AccountAudit } from "../../../types/account";
import { captureWithPayloads, pluralize } from "../../../utils";
import DeleteModal from "../../audit/DeleteModal.vue";
import TransferModal from "../../audit/TransferModal.vue";
import AuditRow from "./AuditRow.vue";
import NoAudit from "./NoAudit.vue";

defineOptions({
  inheritAttrs: false
});

const props = defineProps<{
  audits: AccountAudit[];
  status: AuditStatus.IN_PROGRESS | AuditStatus.COMPLETED;
  noAuditLabel: string;
}>();

const uniqueId = useId();

const notify = useNotifications();
const auditStore = useAuditStore();

const auditStatusHeadingRef = useTemplateRef("auditStatusHeadingRef");
const auditRowsRefs = useTemplateRef<InstanceType<typeof AuditRow>[]>("auditRowsRefs");
const deleteModalRef = useTemplateRef<InstanceType<typeof DeleteModal>>("deleteModalRef");
const transferModalRef = useTemplateRef<InstanceType<typeof TransferModal>>("transferModalRef");

async function deleteAudit() {
  try {
    await auditStore.deleteAudit(selectedAuditId.value);

    deleteModalRef.value?.hide();

    if (selectedAuditIndex.value !== undefined) {
      setFocusAfterAction();
    }

    notify("success", undefined, `Audit « ${selectedAuditName.value} » supprimé`);
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
      selectedAuditId.value,
      newEmail
    );

    transferModalRef.value?.hide();

    if (selectedAuditIndex.value !== undefined) {
      setFocusAfterAction();
    }

    notify("success", `Audit « ${selectedAuditName.value} » transféré`, `Un lien d’accès a été envoyé à : ${newEmail}`);
  } catch (error) {
    notify(
      "error",
      "Échec du transfert de l'audit",
      DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
    );
    captureWithPayloads(error);
  }
}

const selectedAuditName = ref("");
const selectedAuditId = ref("");
const selectedAuditIndex = ref<number>();

// Set up data and open corresponding modal for given action
function prepareAction(
  procedureName: string,
  editUniqueId: string,
  index: number,
  actionType: "delete" | "transfer"
) {
  selectedAuditName.value = procedureName;
  selectedAuditId.value = editUniqueId;
  selectedAuditIndex.value = index;

  if (actionType === "transfer") {
    transferModalRef?.value?.show();
  }

  if (actionType === "delete") {
    deleteModalRef?.value?.show();
  }
}

/**
 * Set the focus after the action has been done:
 * - Previous audit if any
 * - Status heading of there is no audits left in list
 */
async function setFocusAfterAction() {
  if (!props.audits.length) {
    return auditStatusHeadingRef.value?.focus();
  }

  if (selectedAuditIndex.value !== undefined) {
    const indexToFocus = selectedAuditIndex.value <= 0
      ? 0
      : selectedAuditIndex.value - 1;

    auditRowsRefs.value?.at(indexToFocus)?.focusAuditName();
  }
}
</script>

<template>
  <div v-bind="$attrs">
    <h2
      ref="auditStatusHeadingRef"
      class="fr-badge fr-mb-2w audit-status"
      :class="{
        'fr-badge--green-emeraude': status === AuditStatus.COMPLETED,
        'fr-badge--purple-glycine': status === AuditStatus.IN_PROGRESS
      }"
      tabindex="-1"
    >{{
      status === AuditStatus.IN_PROGRESS
        ? `En cours (${audits.length})`
        : `${pluralize("Terminé", "Terminés", audits.length)} (${
          audits.length
        })`
    }}</h2>

    <template v-if="audits.length">
      <div class="fr-mb-1w headers">
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Nom de l’audit
        </p>
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Créé le
        </p>
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Type d’audit
        </p>
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          {{
            status === AuditStatus.COMPLETED
              ? "Taux de conformité"
              : "Progression de l’audit"
          }}
        </p>
      </div>

      <div class="audits-list">
        <!--
          TODO: fix this zIndex thing (dropdown, toast, modal)
          do something like a zIndex map? https://getbootstrap.com/docs/5.0/layout/z-index/
        -->
        <AuditRow
          v-for="(audit, i) in audits"
          ref="auditRowsRefs"
          :key="audit.editUniqueId"
          :audit="audit"
          :z-index="
            status === AuditStatus.IN_PROGRESS
              ? (audits.length - i) * 15
              : (audits.length - i) * 2
          "
          @delete="prepareAction(audit.procedureName, audit.editUniqueId, i, 'delete')"
          @transfer="
            prepareAction(audit.procedureName, audit.editUniqueId, i, 'transfer')
          "
        />
      </div>
    </template>

    <NoAudit v-else :label="noAuditLabel" />
  </div>

  <DeleteModal
    :id="`delete-modal-${uniqueId}`"
    ref="deleteModalRef"
    :procedure-name="selectedAuditName"
    @confirm="deleteAudit"
  />

  <TransferModal
    :id="uniqueId"
    ref="transferModalRef"
    :procedure-name="selectedAuditName"
    @confirm="transferAudit"
  />
</template>

<style scoped>
.sub-heading {
  color: var(--text-mention-grey);
}

.headers {
  display: grid;
  grid-template-columns: 1.75fr 0.5fr 0.75fr 1.25fr 1.5fr 0.75fr 0.75fr;
  gap: 1rem;

  @media (width < 55rem) {
    display: none;
  }
}

.audits-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
</style>
