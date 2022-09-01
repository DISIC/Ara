<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

import AuditGeneralInformationsForm from "../../components/AuditGeneralInformationsForm.vue";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useAuditStore } from "../../store";
import { CreateAuditRequestData } from "../../types";

const router = useRouter();

const route = useRoute();
const auditUniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();

useWrappedFetch(() => auditStore.fetchAuditIfNeeded(auditUniqueId));

const notify = useNotifications();

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
    })
    .catch((err) => {
      console.error(err);
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
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
