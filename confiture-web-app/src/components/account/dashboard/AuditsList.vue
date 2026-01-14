<script lang="ts" setup>
import { ref, useTemplateRef } from "vue";

import { useNotifications } from "../../../composables/useNotifications";
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
    .then(() => {
      notify("success", undefined, `Audit « ${deletedAuditName.value} » supprimé`);
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
          @delete="prepareDelete(audit.procedureName, audit.editUniqueId, i)"
        />
      </div>
    </template>

    <NoAudit v-else :label="noAuditLabel" />
  </div>

  <DeleteModal
    :id="deletedAuditId"
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
