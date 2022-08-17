<script lang="ts" setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import AuditGeneralInformationsForm from "../../components/AuditGeneralInformationsForm.vue";
import { useAuditStore } from "../../store";
import { CreateAuditRequestData } from "../../types";

const router = useRouter();

const route = useRoute();
const auditUniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();

onMounted(() => {
  auditStore.fetchAuditIfNeeded(auditUniqueId).catch((error) => {
    const errorStatus: number = error?.response?.status || 404;

    if ([404, 410].includes(errorStatus)) {
      router.replace({
        name: "Error",
        params: { pathMatch: route.path.substring(1).split("/") },
        query: route.query,
        hash: route.hash,
        state: {
          errorStatus,
        },
      });
    }
  });
});

function submitStepOne(data: CreateAuditRequestData) {
  auditStore
    .updateAudit(auditUniqueId, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...auditStore.data!,
      ...data,
    })
    .then((audit) => {
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
    v-if="auditStore.data"
    :default-values="auditStore.data"
    @submit="submitStepOne"
  />
</template>
