<script lang="ts" setup>
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAudit, updateAudit } from "../api";
import AuditGeneralInformationsForm from "../components/AuditGeneralInformationsForm.vue";
import { CreateAuditRequestData } from "../types";

const router = useRouter();

const route = useRoute();
const auditUniqueId = route.params.uniqueId as string;
const { data, error } = useAudit(auditUniqueId);

watch(error, (error) => {
  if (error?.response?.status === 404) {
    router.replace({
      name: "AuditNotFound",
      params: { pathMatch: route.path.substring(1).split("/") },
      query: route.query,
      hash: route.hash,
    });
  }
});

function submitStepOne(data: CreateAuditRequestData) {
  updateAudit(auditUniqueId, data).then((audit) => {
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

  <AuditGeneralInformationsForm
    v-if="data"
    :default-values="data"
    @submit="submitStepOne"
  />
</template>
