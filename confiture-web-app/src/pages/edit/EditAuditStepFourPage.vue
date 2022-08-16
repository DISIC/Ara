<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAudit } from "../../api";
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

const headerInfos = [
  { label: "Type d’audit", value: "Complet" },
  { label: "Critères applicables", value: "54", description: "/ 106" },
  {
    label: "Erreurs d’accessibilité",
    value: "34",
    description: "dont 8 bloquantes",
  },
  {
    label: " Taux de conformité au RGAA actuel ",
    value: "0",
    description: "%",
  },
];
</script>

<template>
  <!-- TODO: plug audit status -->
  <template v-if="audit">
    <AuditGenerationHeader
      :audit-name="audit.procedureName"
      audit-status="completed"
      :key-infos="headerInfos"
    />
  </template>

  <section class="content">
    <h2 class="fr-h4">Votre audit est prêt à être envoyé</h2>
    <p class="fr-mb-4w">
      Vous pouvez consulter et vérifier le
      <RouterLink class="fr-link" to="/" target="_blank"
        >rapport d’audit</RouterLink
      >
      ou la
      <RouterLink class="fr-link" to="/" target="_blank"
        >déclaration d’accessibilité</RouterLink
      >
      avant envoi. Pour envoyer le rapport d’audit il suffit de transmettre par
      e-mail le lien ci-dessous.
    </p>

    <div class="fr-callout fr-callout--green-bourgeon fr-mb-4w">
      <p class="fr-callout__title fr-text--xl fr-mb-2w">
        Lien public du rapport d’audit
      </p>
      <p class="fr-callout__text fr-text--md copy-block">
        <a class="fr-link" :href="link" title="lien public du rapport d’audit">
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
