<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

import AuditSettingsForm from "../../components/audit/AuditSettingsForm.vue";
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
        undefined,
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
  <PageMeta
    title="Paramètres de l’audit"
    description="Vous pouvez modifier les paramètres d'un audit comme le type d'audit, l'échantillon des pages à auditer, le nom de votre audit et vos coordonnées pour recevoir les liens de votre audit, de votre rapport d'audit généré automatiquement et de votre déclaration d'accessibilité"
  />

  <AuditSettingsForm
    v-if="auditStore.currentAudit"
    :audit="auditStore.currentAudit"
    @submit="submitStepOne"
  />
</template>
