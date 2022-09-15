<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { AuditType } from "../../types";
import { useAuditStats } from "../../composables/useAuditStats";
import { useResultsStore, useAuditStore } from "../../store";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import PageMeta from "../../components/PageMeta";
import { formatAuditType, getCriteriaCount } from "../../utils";
import { useWrappedFetch } from "../../composables/useWrappedFetch";

const route = useRoute();
const router = useRouter();

const uniqueId = route.params.uniqueId as string;

const auditStore = useAuditStore();

useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));

const showCopyAlert = ref(false);

const reportRouteLocation = computed(() => ({
  name: "report",
  params: { uniqueId: auditStore.data?.consultUniqueId },
}));
const accessibilityStatementLocation = computed(() => ({
  name: "report",
  params: {
    uniqueId: auditStore.data?.consultUniqueId,
    tab: "declaration-daccessibilite",
  },
}));

const fullReportUrl = computed(() => {
  return (
    window.location.origin + router.resolve(reportRouteLocation.value).fullPath
  );
});

async function copyLink() {
  navigator.clipboard
    .writeText(fullReportUrl.value)
    .then(() => {
      showCopyAlert.value = true;
    })
    .catch((err) => {
      console.error(
        `Error copying report public URL to the clipboard: ${err}.`
      );
    });
}

function hideCopyAlert() {
  showCopyAlert.value = false;
}

const resultsStore = useResultsStore();

onMounted(() => {
  resultsStore.fetchResults(uniqueId);
});

const { applicableCriteriaCount, errorsCount, complianceLevel } = useAuditStats(
  auditStore.data?.pages.length
);

const headerInfos = computed(() => [
  {
    label: "Type d’audit",
    value: formatAuditType(auditStore.data!.auditType as AuditType),
  },
  {
    label: "Critères applicables",
    value: applicableCriteriaCount.value,
    description: `/ ${getCriteriaCount(
      auditStore.data!.auditType as AuditType
    )}`,
  },
  {
    label: "Erreurs d’accessibilité",
    value: errorsCount.value?.total,
    description: `dont ${errorsCount.value?.blocking} bloquantes`,
  },
  ...(auditStore.data?.auditType === AuditType.FULL
    ? [
        {
          label: "Taux de conformité au RGAA actuel",
          value: complianceLevel.value,
          description: "%",
        },
      ]
    : []),
]);

const hasA11yStatement = computed(() => {
  return auditStore.data?.auditType === AuditType.FULL;
});
</script>

<template>
  <PageMeta
    title="Audit terminé"
    description="Votre audit est maintenant terminé. Vous pouvez le vérifier et partager le lien du rapport d'audit à l'entité qui a fait la demande d'audit."
  />

  <!-- TODO: plug audit status -->
  <template v-if="auditStore.data && resultsStore.data">
    <AuditGenerationHeader
      :audit-name="auditStore.data.procedureName"
      :key-infos="headerInfos"
      :edit-unique-id="auditStore.data.editUniqueId"
      :audit-publication-date="auditStore.data.publicationDate"
      :audit-edition-date="auditStore.data.editionDate"
    />

    <section class="content">
      <h2 class="fr-h4">Votre audit est prêt à être envoyé</h2>
      <p class="fr-mb-4w">
        Vous pouvez consulter et vérifier le
        <RouterLink class="fr-link" :to="reportRouteLocation" target="_blank">
          rapport d’audit</RouterLink
        >
        <template v-if="hasA11yStatement">
          ou la
          <!-- TODO: link to page + selected tab -->
          <RouterLink
            class="fr-link"
            :to="accessibilityStatementLocation"
            target="_blank"
            >déclaration d’accessibilité</RouterLink
          ></template
        >
        avant envoi. Pour envoyer le rapport d’audit il suffit de transmettre
        par e-mail le lien ci-dessous.
      </p>

      <div class="fr-callout fr-mb-4w">
        <p class="fr-callout__title fr-text--xl fr-mb-2w">
          Lien public du rapport d’audit
        </p>
        <p class="fr-callout__text fr-text--md copy-block">
          <RouterLink
            class="fr-link"
            :to="reportRouteLocation"
            title="lien public du rapport d’audit"
          >
            {{ fullReportUrl }}
          </RouterLink>
          <!-- FIXME: icon "copy" does not seem to exist -->
          <button
            class="fr-btn fr-btn--secondary fr-icon-file-line fr-btn--icon-left fr-m-0"
            @click="copyLink"
            @blur="hideCopyAlert"
          >
            Copier
          </button>
        </p>
        <div role="alert" aria-live="polite">
          <div
            v-if="showCopyAlert"
            class="fr-alert fr-alert--success fr-alert--sm fr-mt-2w"
          >
            <p>
              Le lien public du rapport d’audit a bien été copié dans le
              presse-papier.
            </p>
          </div>
        </div>
      </div>
    </section>
  </template>

  <section class="content">
    <h2 class="fr-h4">Bon à savoir</h2>
    <p>Indiquez à vos destinataires les prochaines étapes qui les attends :</p>
    <ul>
      <li v-if="hasA11yStatement">
        Mettre en ligne la déclaration d’accessibilité
      </li>
      <li>Corriger les erreurs relevées</li>
      <li>Demander un contre-audit</li>
    </ul>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}

.copy-block {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}
</style>
