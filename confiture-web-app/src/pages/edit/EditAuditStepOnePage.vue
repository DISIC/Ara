<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

import AuditGeneralInformationsForm from "../../components/AuditGeneralInformationsForm.vue";
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
      ...auditStore.data!,
      ...data,
    })
    .then((audit) => {
      router.push({
        name: "edit-audit-step-three",
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
  <PageMeta
    title="Informations générales sur le site à auditer"
    description="Saisissez les informations de l'entité qui fait la demande d'audit ainsi que du site à auditer."
  />

  <AuditGeneralInformationsForm
    v-if="auditStore.data"
    :default-values="auditStore.data"
    @submit="submitStepOne"
  />
</template>
