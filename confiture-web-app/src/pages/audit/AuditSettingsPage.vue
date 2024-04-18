<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

import AuditGeneralInformationsForm from "../../components/audit/AuditGeneralInformationsForm.vue";
import PageMeta from "../../components/PageMeta";
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
      ...auditStore.currentAudit!,
      ...data
    })
    .then(() => {
      notify(
        "success",
        "Les paramètres de votre audit ont été mis à jour avec succès"
      );

      router.push({
        name: "audit-generation",
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
    });
}
</script>

<template>
  <!-- TODO: meta -->
  <PageMeta
    title="Informations générales sur le site à auditer"
    description="Saisissez les informations de l'entité qui fait la demande d'audit ainsi que du site à auditer."
  />

  <AuditGeneralInformationsForm
    v-if="auditStore.currentAudit"
    :default-values="auditStore.currentAudit"
    @submit="submitStepOne"
  />
</template>
