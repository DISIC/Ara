<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAudit } from "../../api";
import { useResultsStore } from "../../store";
import { CriterionResultUserImpact, CriteriumResultStatus } from "../../types";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";

const route = useRoute();
const router = useRouter();

const uniqueId = route.params.uniqueId as string;
const { data: audit, error } = useAudit(uniqueId);

watch(error, (error) => {
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

const showCopyAlert = ref(false);

const link = computed(() => {
  return `${import.meta.env.VITE_BASE_URL}/audits/${
    route.params.uniqueId
  }/partage`;
});

async function copyLink() {
  navigator.clipboard
    .writeText(link.value)
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

/* TODO: make a `useSomething` to compute:
  - complianceLevel
  - applicableCriteraCount
  - errorsCount
  ?
*/
const complianceLevel = computed(() => {
  const testedCount =
    resultsStore.results?.filter(
      (result) =>
        result.status !== CriteriumResultStatus.NOT_TESTED &&
        result.status !== CriteriumResultStatus.NOT_APPLICABLE
    ).length ?? 0;

  const compliantCount =
    resultsStore.results?.filter(
      (result) => result.status === CriteriumResultStatus.COMPLIANT
    ).length ?? 0;

  if (testedCount === 0) {
    return 0;
  }

  return Math.round((compliantCount / testedCount) * 100);
});

const applicableCriteriaCount = computed(() => {
  return 34;
});

const errorsCount = computed(() => {
  const total =
    resultsStore.results?.filter((r) => {
      return r.status === CriteriumResultStatus.NOT_COMPLIANT;
    }).length || 0;

  const blocking =
    resultsStore.results?.filter((r) => {
      return (
        r.status === CriteriumResultStatus.NOT_COMPLIANT &&
        r.userImpact === CriterionResultUserImpact.BLOCKING
      );
    }).length || 0;

  return { total, blocking };
});

const headerInfos = computed(() => [
  { label: "Type d’audit", value: audit.value?.auditType as string },
  {
    label: "Critères applicables",
    value: applicableCriteriaCount.value,
    description: "/ 106",
  },
  {
    label: "Erreurs d’accessibilité",
    value: errorsCount.value.total,
    description: `dont ${errorsCount.value.blocking} bloquantes`,
  },
  {
    label: "Taux de conformité au RGAA actuel",
    value: complianceLevel.value,
    description: "%",
  },
]);
</script>

<template>
  <!-- TODO: plug audit status -->
  <template v-if="audit">
    <AuditGenerationHeader
      :audit-name="audit.procedureName"
      audit-status="completed"
      :key-infos="headerInfos"
      :edit-unique-id="audit.editUniqueId"
    />

    <section class="content">
      <h2 class="fr-h4">Votre audit est prêt à être envoyé</h2>
      <p class="fr-mb-4w">
        Vous pouvez consulter et vérifier le
        <RouterLink
          class="fr-link"
          :to="{ name: 'report', params: { uniqueId: audit.editUniqueId } }"
          target="_blank"
        >
          rapport d’audit
        </RouterLink>
        ou la
        <!-- TODO: link to page + selected tab -->
        <RouterLink class="fr-link" to="/" target="_blank"
          >déclaration d’accessibilité</RouterLink
        >
        avant envoi. Pour envoyer le rapport d’audit il suffit de transmettre
        par e-mail le lien ci-dessous.
      </p>

      <div class="fr-callout fr-callout--green-bourgeon fr-mb-4w">
        <p class="fr-callout__title fr-text--xl fr-mb-2w">
          Lien public du rapport d’audit
        </p>
        <p class="fr-callout__text fr-text--md copy-block">
          <a
            class="fr-link"
            :href="link"
            title="lien public du rapport d’audit"
          >
            {{ link }}
          </a>
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
      <li>Mettre en ligne la déclaration d’accessibilité</li>
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
