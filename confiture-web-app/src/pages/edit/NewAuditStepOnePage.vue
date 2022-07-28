<script lang="ts" setup>
import { ref } from "vue";

import { createAudit } from "../../api/createAudit";
import AuditGeneralInformationsForm from "../../components/AuditGeneralInformationsForm.vue";
import LeaveModal from "../../components/LeaveModal.vue";
import router from "../../router";
import { CreateAuditRequestData } from "../../types";

const isLeaveModalOpen = ref(false);

async function confirmLeave() {
  router.push({ name: "home" });
}

function submitStepOne(data: CreateAuditRequestData) {
  createAudit(data).then((audit) => {
    // TODO: replace current history entry with the edit page
    router.push({
      name: "edit-audit-step-two",
      params: { uniqueId: audit.editUniqueId },
    });
  });
}
</script>

<template>
  <div class="fr-stepper">
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

  <LeaveModal
    v-if="isLeaveModalOpen"
    title="Vous allez quitter l’audit"
    confirm="Oui, quitter l’audit"
    cancel="Non, poursuivre l’audit"
    @confirm="confirmLeave"
  >
    <p>
      A ce stade aucune des informations saisies ne sera sauvegardées. C’est à
      partir de l’étape 2 que vous pourrez quitter votre audit et y revenir sans
      perdre vos informations.
    </p>
    <p>Souhaitez-vous quitter l’audit ?</p>
  </LeaveModal>
</template>
