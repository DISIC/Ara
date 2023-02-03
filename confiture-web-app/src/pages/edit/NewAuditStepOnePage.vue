<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import AuditGeneralInformationsForm from "../../components/AuditGeneralInformationsForm.vue";
import LeaveModal from "../../components/LeaveModal.vue";
import PageMeta from "../../components/PageMeta";
import router from "../../router";
import { CreateAuditRequestData } from "../../types";
import { useAuditStore } from "../../store";
import { useNotifications } from "../../composables/useNotifications";
import { captureException } from "@sentry/core";

const isLeaveModalOpen = ref(false);
const leaveModalDestination = ref<string>("");

function showLeaveModal() {
  isLeaveModalOpen.value = true;
}

function closeLeaveModal() {
  isLeaveModalOpen.value = false;
}

function confirmLeave() {
  router.push(leaveModalDestination.value);
}

// Display leave modal when navigating to another route
onBeforeRouteLeave((to) => {
  if (!isSubmitting.value && !isLeaveModalOpen.value) {
    leaveModalDestination.value = to.fullPath;
    showLeaveModal();
    return false;
  }
});

// Display the native browser confirm modal when leaving site
function onBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = "Rester sur la page";
}

onMounted(() => {
  window.addEventListener("beforeunload", onBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
});

const isSubmitting = ref(false);

const auditStore = useAuditStore();

const notify = useNotifications();

function submitStepOne(data: CreateAuditRequestData) {
  isSubmitting.value = true;
  auditStore
    .createAudit(data)
    .then((audit) => {
      // TODO: replace current history entry with the edit page
      return router.push({
        name: "edit-audit-step-three",
        params: { uniqueId: audit.editUniqueId },
      });
    })
    .catch((err) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
      captureException(err);
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}
</script>

<template>
  <PageMeta
    title="Paramètres de l'audit"
    description="Saisissez les informations de l'entité qui fait la demande d'audit ainsi que du site à auditer."
  />

  <AuditGeneralInformationsForm @submit="submitStepOne" />

  <!-- FIXME: find a proper solution to display the modal -->
  <button
    v-if="isLeaveModalOpen"
    type="button"
    aria-controls="leave-modal"
    data-fr-opened="true"
    class="sr-only"
  />

  <LeaveModal
    v-if="isLeaveModalOpen"
    title="Vous allez quitter l’audit"
    icon="fr-icon-warning-line"
    confirm="Oui, quitter l’audit"
    cancel="Non, poursuivre l’audit"
    danger
    @confirm="confirmLeave"
    @cancel="closeLeaveModal"
    v-on="{ 'dsfr.conceal': closeLeaveModal }"
  >
    <p>
      A ce stade aucune des informations saisies ne sera sauvegardée. C’est à
      partir de l’étape suivante que vous pourrez quitter votre audit et y
      revenir sans perdre vos informations. Souhaitez-vous quitter l’audit ?
    </p>
  </LeaveModal>
</template>
