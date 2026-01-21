<script lang="ts" setup>
import { ref } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import AuditSettingsForm from "../../components/audit/AuditSettingsForm.vue";
import LeaveModal from "../../components/audit/LeaveModal.vue";
import PageMeta from "../../components/PageMeta";
import { useNotifications } from "../../composables/useNotifications";
import { usePreviousRoute } from "../../composables/usePreviousRoute";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useAuditStore, useResultsStore } from "../../store";
import { AuditPage, AuditType } from "../../types";

const router = useRouter();
const route = useRoute();
const previousRoute = usePreviousRoute();
const auditUniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();
const notify = useNotifications();
const resultsStore = useResultsStore();

useWrappedFetch(() => auditStore.fetchAuditIfNeeded(auditUniqueId));

// Before leave modal
const isPristine = ref(true);
const isSubmitting = ref(false);
const leaveModalRef = ref<InstanceType<typeof LeaveModal>>();
const leaveModalDestination = ref<string>("");
const confirmedLeave = ref(false);

function showLeaveModal() {
  leaveModalRef.value?.show();
}

const settingsFormRef = ref<InstanceType<typeof AuditSettingsForm>>();

function confirmLeave() {
  leaveModalRef.value?.hide();
  confirmedLeave.value = true;

  notify("info", undefined, "Modifications des paramètres annulées");
  router.push(leaveModalDestination.value);
}

function cancelLeave() {
  leaveModalRef.value?.hide();
}

// Display leave modal when navigating to another route
// FIXME: it causes bug with links on the page
onBeforeRouteLeave((to) => {
  if (!isSubmitting.value && !confirmedLeave.value && !isPristine.value) {
    leaveModalDestination.value = to.fullPath;
    showLeaveModal();
    return false;
  }
});

// Form submission
function submitSettings(data: {
  auditType: AuditType;
  procedureName: string;
  pages: Omit<AuditPage, "id" | "order">[];
  auditorName: string;
  auditorEmail: string;
}) {
  isSubmitting.value = true;

  const procedureNameChanged =
    data.procedureName !== auditStore.currentAudit?.procedureName;
  const auditTypeChanged =
    data.auditType !== auditStore.currentAudit?.auditType;

  auditStore
    .updateAudit(auditUniqueId, {
      ...auditStore.currentAudit!,
      ...data
    })
    .then(() => {
      if (previousRoute.route?.name === "account-dashboard") {
        notify(
          "success",
          undefined,
          `Paramètres de l’audit « ${data.procedureName} » mis à jour`,
          { action:
              {
                label: "Accéder à l’audit",
                cb() {
                  router.push({ name: "audit-generation", params: { uniqueId: auditUniqueId } });
                }
              } }
        );
      } else {
        notify("success", undefined, "Paramètres de l’audit mis à jour");
      }

      if (auditTypeChanged) {
        resultsStore.$reset();
      }

      router.push(previousRoute.route ?? {
        name: "audit-overview",
        params: { uniqueId: auditUniqueId }
      });
    })
    .catch((err) => {
      console.error(err);
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
      isSubmitting.value = false;
    });
}
</script>

<template>
  <PageMeta
    :title="`Paramètres - Audit ${auditStore.currentAudit?.procedureName}`"
    description="Vous pouvez modifier les paramètres d'un audit comme le type d'audit, l'échantillon des pages à auditer, le nom de votre audit et vos coordonnées pour recevoir les liens de votre audit, de votre rapport d'audit généré automatiquement et de votre déclaration d'accessibilité"
  />

  <AuditSettingsForm
    v-if="auditStore.currentAudit"
    ref="settingsFormRef"
    :audit="auditStore.currentAudit"
    @submit="submitSettings"
    @change="isPristine = false"
  />

  <LeaveModal
    ref="leaveModalRef"
    title="Quitter sans enregistrer vos modifications ?"
    icon="fr-icon-warning-line"
    confirm="Quitter sans enregistrer"
    cancel="Reprendre les modifications"
    @confirm="confirmLeave"
    @cancel="cancelLeave"
  >
    <p>
      Les modifications de votre audit ne seront pas enregistrées.
    </p>
  </LeaveModal>
</template>
