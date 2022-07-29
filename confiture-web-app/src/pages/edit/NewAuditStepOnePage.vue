<script lang="ts" setup>
import { ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import { createAudit } from "../../api/createAudit";
import AuditGeneralInformationsForm from "../../components/AuditGeneralInformationsForm.vue";
import LeaveModal from "../../components/LeaveModal.vue";
import router from "../../router";
import { CreateAuditRequestData } from "../../types";

const isLeaveModalOpen = ref(false);
const leaveModalRef = ref();
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

const isSubmitting = ref(false);

function submitStepOne(data: CreateAuditRequestData) {
  isSubmitting.value = true;
  createAudit(data)
    .then((audit) => {
      // TODO: replace current history entry with the edit page
      router.push({
        name: "edit-audit-step-two",
        params: { uniqueId: audit.editUniqueId },
      });
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}
</script>

<template>
  <div
    class="fr-stepper"
    aria-controls="leave-modal"
    :data-fr-opened="isLeaveModalOpen"
  >
    <h2 class="fr-stepper__title">
      <span class="fr-stepper__state">Étape 1 sur 2</span>
      Informations générales
    </h2>
    <div
      class="fr-stepper__steps"
      data-fr-current-step="1"
      data-fr-steps="2"
    ></div>
    <p class="fr-stepper__details">
      <span class="fr-text--bold">Étape suivante :</span> Paramètres de l’audit
    </p>
  </div>

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
    ref="leaveModalRef"
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
      A ce stade aucune des informations saisies ne sera sauvegardées. C’est à
      partir de l’étape 2 que vous pourrez quitter votre audit et y revenir sans
      perdre vos informations. Souhaitez-vous quitter l’audit ?
    </p>
  </LeaveModal>
</template>
