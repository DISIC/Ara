<script lang="ts" setup>
import { nextTick, ref, useTemplateRef, useId } from "vue";
import { useNotifications } from "../../../composables/useNotifications";
import { DEFAULT_NOTIFICATION_ERROR_DESCRIPTION } from "../../../enums";
import { useAuditStore } from "../../../store";
import { AuditStatus } from "../../../types";
import { AccountAudit } from "../../../types/account";
import { captureWithPayloads, pluralize } from "../../../utils";
import DeleteModal from "../../audit/DeleteModal.vue";
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

// Focus audit list heading when deleting an audit
const auditStatusHeadingRef = useTemplateRef("auditStatusHeadingRef");
const auditRowsRefs = useTemplateRef<InstanceType<typeof AuditRow>[]>("auditRowsRefs");

const deletedAuditName = ref("");
const deletedAuditId = ref("");
const deletedAuditIndex = ref<number>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();

function prepareDelete(name: string, editAuditId: string, index: number) {
  deletedAuditName.value = name;
  deletedAuditId.value = editAuditId;
  deletedAuditIndex.value = index;
  deleteModal.value?.show();
}

function deleteAudit() {
  auditStore
    .deleteAudit(deletedAuditId.value)
    .then(async () => {
      notify("success", undefined, `Audit « ${deletedAuditName.value} » supprimé`);
      await nextTick();
      setFocusAfterDeletion();
    })
    .catch((error) => {
      notify(
        "error",
        "Échec de la supression de l'audit",
        DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
      );
      captureWithPayloads(error);
    })
    .finally(() => {
      deleteModal.value?.hide();
    });
}

// Either focus previous audit or status heading after deleting
async function setFocusAfterDeletion() {
  if (!props.audits.length) {
    auditStatusHeadingRef.value?.focus();
  } else {
    if (deletedAuditIndex.value) {
      auditRowsRefs.value?.at(deletedAuditIndex.value - 1)?.focusAuditName();
    }
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
      <div class="fr-mb-1w headers audits-list-grid">
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
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Partage
        </p>

        <!-- FIXME: these are fake buttons to align columns -->
        <button
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-file-edit-line fake-hidden-headers"
          aria-hidden="true"
        >
          {{ status === AuditStatus.COMPLETED ? 'Accéder à l’audit' : 'Commencer l’audit' }}
        </button>
        <button
          class="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-file-text-line fake-hidden-headers"
          aria-hidden="true"
        >
          Livrables
        </button>
        <button
          class="fr-btn fr-btn--tertiary fr-icon-more-2-line fake-hidden-headers"
          aria-hidden="true"
        />
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
          @delete="prepareDelete(audit.procedureName, audit.editUniqueId, i)"
        />
      </div>
    </template>

    <NoAudit v-else :label="noAuditLabel" />
  </div>

  <DeleteModal
    :id="`delete-modal-${uniqueId}`"
    ref="deleteModal"
    :procedure-name="deletedAuditName"
    @confirm="deleteAudit"
    @closed="setFocusAfterDeletion"
  />
</template>

<style scoped>
.sub-heading {
  color: var(--text-mention-grey);
}

:deep(.audits-list-grid) {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1.75fr 0.7fr 0.75fr 1.2fr 0.6fr 1.65fr 0.75fr 0.25fr;

  @media (width < 55rem) {
    grid-template-columns: 1fr;
  }
}

.headers {
  @media (width < 55rem) {
    display: none;
  }
}

.audits-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Make button take full column width */
.audit-main-action {
  /* justify-content: center;
  width: initial; */
}

.fake-hidden-headers {
  visibility: hidden !important;
  pointer-events: none !important;
  min-height: 0 !important;
  height: 0 !important;
}
</style>
