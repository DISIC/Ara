<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import CopyBlock from "../../components/CopyBlock.vue";
import PageMeta from "../../components/PageMeta";
import { useAuditStats } from "../../composables/useAuditStats";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useAuditStore, useResultsStore } from "../../store";
import { AuditType } from "../../types";
import { formatAuditType, getCriteriaCount } from "../../utils";

const route = useRoute();

const uniqueId = route.params.uniqueId as string;

const auditStore = useAuditStore();

useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));

const reportRouteLocation = computed(() => ({
  name: "report",
  params: { uniqueId: auditStore.data?.consultUniqueId },
}));

const resultsStore = useResultsStore();

onMounted(() => {
  resultsStore.fetchResults(uniqueId);
});

const {
  complianceLevel,
  notApplicableCriteriaCount,
  notCompliantCriteriaCount,
  blockingCriteriaCount,
} = useAuditStats(auditStore.data?.pages.length);

const headerInfos = computed(() => [
  ...(auditStore.data?.auditType === AuditType.FULL
    ? [
        {
          title: "Taux global de conformité",
          description: "RGAA version 4.1",
          value: complianceLevel.value,
          total: 100,
          unit: "%",
          theme: "france",
        },
      ]
    : []),
  {
    title: "Critères non conformes",
    description: `Dont ${blockingCriteriaCount.value} bloquants pour l’usager`,
    value: notCompliantCriteriaCount.value,
    total: getCriteriaCount(auditStore.data?.auditType as AuditType),
    theme: "marianne",
  },
  {
    title: "Critères non applicables",
    description: `Sur un total de ${getCriteriaCount(
      auditStore.data?.auditType as AuditType
    )} critères`,
    value: notApplicableCriteriaCount.value,
    total: getCriteriaCount(auditStore.data?.auditType as AuditType),
  },
]);

const hasA11yStatement = computed(() => {
  return auditStore.data?.auditType === AuditType.FULL;
});

const isStatementFilled = computed(() => {
  // The `initiator` field is requied on the a11y declaration form so we can check that it's not null
  return !!auditStore.data?.initiator;
});

const successAlertContent = computed(() => {
  if (!hasA11yStatement.value) {
    return "L’audit est terminé et le rapport est prêt à être livré.";
  } else if (isStatementFilled.value) {
    return "Votre déclaration d’accessibilité est terminée, vous n’avez plus qu’à l’envoyer au responsable du site.";
  } else {
    return "L’audit est terminé et le rapport est prêt à être livré. Il ne vous reste plus qu’à rédiger la déclaration d’accessibilité.";
  }
});
</script>

<template>
  <!-- TODO: plug audit status -->
  <template v-if="auditStore.data && resultsStore.data">
    <PageMeta
      :title="`Audit ${auditStore.data.procedureName} terminé`"
      description="Votre audit est maintenant terminé. Vous pouvez le vérifier et partager le lien du rapport d'audit à l'entité qui a fait la demande d'audit."
    />

    <div class="fr-alert fr-alert--success fr-mb-4w">
      <p>
        {{ successAlertContent }}
      </p>
    </div>

    <AuditGenerationHeader
      :audit-name="`L’audit ${auditStore.data.procedureName} est terminé`"
      :key-infos="headerInfos"
      :edit-unique-id="auditStore.data.editUniqueId"
      :audit-publication-date="auditStore.data.publicationDate"
      :audit-edition-date="auditStore.data.editionDate"
    />

    <section class="content fr-mb-6w">
      <h2 class="fr-h4">
        <span
          class="fr-icon-checkbox-circle-fill fr-icon--lg ready-icon"
          aria-hidden="true"
        ></span>
        Votre audit est prêt à être envoyé
      </h2>
      <p class="fr-mb-4w">
        Pensez à vérifier le rapport d’audit avant de le livrer. Pour le livrer
        vous pouvez copier le lien ci-dessous et l’envoyer par e-mail au
        responsable du site audité.
      </p>

      <RouterLink
        class="fr-btn fr-btn--secondary fr-mb-5w"
        :to="{
          name: 'report',
          params: { uniqueId: auditStore.data.consultUniqueId },
        }"
        target="_blank"
      >
        Consulter le rapport d'audit
        <span class="sr-only">(Nouvelle fenêtre)</span>
      </RouterLink>

      <CopyBlock
        class="fr-mb-4w"
        :to="reportRouteLocation"
        description="Rapport d’audit"
        success-message="Le lien du rapport d’audit a bien été copié dans le presse-papier."
      />

      <template v-if="!isStatementFilled">
        <h2 class="fr-h4">
          <span
            class="fr-icon-error-warning-fill fr-icon--lg not-ready-icon"
            aria-hidden="true"
          ></span>
          Déclaration d’accessibilité à remplir
        </h2>
        <p class="fr-mb-4w">
          Vous pouvez rédiger dès maintenant la déclaration d’accessibilité
        </p>

        <RouterLink
          class="fr-btn fr-btn--icon-left fr-icon-edit-line"
          :to="{
            name: 'edit-audit-declaration',
            params: { uniqueId: auditStore.data.editUniqueId },
          }"
        >
          Remplir la déclaration d'accessibilité
        </RouterLink>
      </template>

      <template v-else>
        <h2 class="fr-h4">
          <span
            class="fr-icon-error-warning-fill fr-icon--lg ready-icon"
            aria-hidden="true"
          ></span>
          Déclaration d’accessibilité prête à être livrée
        </h2>
        <p class="fr-mb-4w">
          Pensez à vérifier la déclaration d’accessibilité avant de la livrer.
          Pour la livrer vous pouvez copier le lien ci-dessous et l’envoyer par
          e-mail au responsable du site audité.
        </p>

        <RouterLink
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-eye-line fr-mr-5w"
          :to="{
            name: 'report',
            params: {
              uniqueId: auditStore.data.consultUniqueId,
              tab: 'declaration-daccessibilite',
            },
          }"
        >
          Consulter la déclaration d'accessibilité
        </RouterLink>

        <RouterLink
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-line fr-mb-5w"
          :to="{
            name: 'edit-audit-declaration',
            params: { uniqueId: auditStore.data.editUniqueId },
          }"
        >
          Modifier la déclaration d’accessilbilité
        </RouterLink>

        <CopyBlock
          class="fr-mb-4w"
          :to="{
            name: 'report',
            params: {
              uniqueId: auditStore.data.consultUniqueId,
              tab: 'declaration-daccessibilite',
            },
          }"
          description="Déclaration d’accessibilité"
          success-message="Le lien de la déclaration d’accessibilité a bien été copié dans le presse-papier."
        />
      </template>
    </section>
  </template>

  <section class="content">
    <h2 class="fr-h4">Bon à savoir</h2>
    <p>
      Indiquez à vos destinataires les prochaines étapes qui les attendent :
    </p>
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

.ready-icon {
  color: var(--success-425-625);
}

.not-ready-icon {
  color: var(--error-425-625);
}
</style>
