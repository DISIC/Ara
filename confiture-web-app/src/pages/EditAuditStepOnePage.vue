<script lang="ts" setup>
import { useRoute } from "vue-router";

import { useAudit } from "../api";
import AuditGeneralInformationsForm from "../components/AuditGeneralInformationsForm.vue";
import { CreateAuditRequestData } from "../types";

function submitStepOne(data: CreateAuditRequestData) {
  console.log(
    "🚀 ~ file: EditAuditStepOnePage.vue ~ line 10 ~ submitStepOne ~ data",
    data
  );
}

const route = useRoute();
const auditUniqueId = route.params.uniqueId as string;
const { data } = useAudit(auditUniqueId);
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

  <AuditGeneralInformationsForm
    v-if="data"
    :default-values="data"
    @submit="submitStepOne"
  />
</template>
