<script lang="ts" setup>
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import { ref } from "vue";
import AuditSettingsForm from "../../components/audit/AuditSettingsForm.vue";
import LeaveModal from "../../components/audit/LeaveModal.vue";
import PageMeta from "../../components/PageMeta";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useAuditStore } from "../../store";
import { CreateAuditRequestData } from "../../types";

const router = useRouter();
const route = useRoute();
const auditUniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();
const notify = useNotifications();

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

  settingsFormRef.value?.onSubmit();
}

function cancelLeave() {
  // Not closing the modal before route navigation would leave a dangling
  // "trap focus" event handler on the document body, which would break further
  // tab navigation
  leaveModalRef.value?.hide();

  confirmedLeave.value = true;
  router.push(leaveModalDestination.value);
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
function submitSettings(data: CreateAuditRequestData) {
  isSubmitting.value = true;
  auditStore
    .updateAudit(auditUniqueId, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...auditStore.currentAudit!,
      ...data
    })
    .then(() => {
      notify(
        "success",
        undefined,
        "Les paramètres de votre audit ont été mis à jour avec succès"
      );

      if (leaveModalDestination.value) {
        router.push(leaveModalDestination.value);
      } else {
        router.push({
          name: "audit-generation",
          params: { uniqueId: auditUniqueId }
        });
      }
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
    title="Paramètres de l’audit"
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
    title="Vous aller quitter sans enregistrer vos modifications"
    icon="fr-icon-warning-line"
    confirm="Enregistrer et quitter"
    cancel="Quitter sans enregistrer"
    @confirm="confirmLeave"
    @cancel="cancelLeave"
  >
    <p>
      Les modifications de votre audit ne seront pas prises en compte.
      Souhaitez-vous quitter sans enregistrer vos modifications ?
    </p>
  </LeaveModal>
</template>
