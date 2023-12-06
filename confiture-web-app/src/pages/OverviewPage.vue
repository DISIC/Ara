<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import AuditProgressBar from "../components/AuditProgressBar.vue";
import CopyBlock from "../components/CopyBlock.vue";
import { useAuditStore, useResultsStore } from "../store";
import { useWrappedFetch } from "../composables/useWrappedFetch";
import { formatDate, getCriteriaCount } from "../utils";
import { AuditType } from "../types";

const route = useRoute();
const uniqueId = computed(() => route.params.uniqueId as string);
const auditStore = useAuditStore();
const resultsStore = useResultsStore();

useWrappedFetch(async () => {
  resultsStore.$reset();
  await auditStore.fetchAuditIfNeeded(uniqueId.value);
  await resultsStore.fetchResults(uniqueId.value);
}, true);

const audit = computed(() => {
  return auditStore.currentAudit;
});

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});
const auditIsPublishable = computed(() => {
  return !!audit.value?.initiator;
});
</script>

<template>
  <template v-if="audit">
    <h1>{{ audit.procedureName }}</h1>

    <ul class="fr-p-0 fr-m-0 cards">
      <!-- Audit -->
      <li class="card-wrapper">
        <span
          :class="[
            'fr-icon--lg fr-icon-checkbox-circle-fill card-check',
            { 'card-check--success': auditIsReady },
          ]"
          aria-hidden="true"
        ></span>

        <div class="fr-px-4w fr-py-3w card">
          <h2 class="fr-h3 fr-mb-1w card-title">
            Audit
            <p v-if="audit.auditType" class="fr-badge">
              {{ getCriteriaCount(audit.auditType) }}
              critères
            </p>
          </h2>

          <p class="fr-text--sm fr-mb-2w card-date">
            <template v-if="auditIsReady && audit.publicationDate">
              Terminé le
              <time datetime="30/12/2023">{{
                formatDate(audit.publicationDate)
              }}</time>
              <template v-if="audit.editionDate">
                - Mis à jour le
                <time datetime="30/12/2023">{{
                  formatDate(audit.editionDate)
                }}</time></template
              >
            </template>
            <template v-else-if="audit.creationDate">
              Créé le
              <time :datetime="audit.creationDate.toString()">{{
                formatDate(audit.creationDate)
              }}</time>
            </template>
          </p>

          <AuditProgressBar
            v-if="!auditIsReady"
            class="fr-mb-3w card-progress-bar"
          />

          <p v-else class="card-charts">TODO: Graphiques</p>

          <ul
            :class="[
              'fr-btns-group fr-btns-group--icon-left audit-card-actions',
              { 'audit-card-actions--half': auditIsReady },
            ]"
          >
            <li>
              <RouterLink
                :to="{
                  name: 'edit-audit-step-three',
                  params: { uniqueId: uniqueId },
                }"
                class="fr-btn fr-btn--icon-left fr-mb-0"
                :class="
                  auditIsReady
                    ? 'fr-btn--secondary  fr-icon-file-line'
                    : 'fr-icon-edit-fill'
                "
              >
                {{ auditIsReady ? "Accéder" : "Commencer" }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </li>

      <!-- Report -->
      <li class="card-wrapper">
        <span
          :class="[
            'fr-icon--lg fr-icon-checkbox-circle-fill card-check',
            { 'card-check--success': auditIsReady },
          ]"
          aria-hidden="true"
        ></span>
        <div class="fr-px-4w fr-py-3w card">
          <h2 class="fr-h3 fr-mb-1w card-title">
            Rapport d’audit
            <p class="fr-badge fr-badge--info">Généré automatiquement</p>
          </h2>
          <p class="card-description">
            {{
              auditIsReady
                ? "Vous pouvez livrer le rapport d’audit."
                : "Terminez l’audit avant de livrer le rapport d’audit."
            }}
          </p>
          <ul
            class="fr-btns-group fr-btns-group--icon-left fr-mb-3w report-card-actions"
          >
            <li>
              <RouterLink
                :to="{
                  name: 'report',
                  params: {
                    uniqueId: audit.consultUniqueId,
                    tab: 'declaration-daccessibilite',
                  },
                }"
                class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-eye-fill fr-mb-0"
              >
                Consulter
              </RouterLink>
            </li>
          </ul>

          <template v-if="auditIsReady">
            <CopyBlock
              class="fr-m-0 card-copy-block"
              :to="{
                name: 'report',
                params: { uniqueId: audit.consultUniqueId },
              }"
              description="Lien de partage"
              success-message="Le lien du rapport d’audit a bien été copié dans le presse-papier."
            />
          </template>
        </div>
      </li>

      <!-- a11y statement -->
      <li v-if="audit.auditType === AuditType.FULL" class="card-wrapper">
        <span
          :class="[
            'fr-icon--lg fr-icon-checkbox-circle-fill card-check',
            { 'card-check--success': auditIsPublishable },
          ]"
          aria-hidden="true"
        ></span>
        <div class="fr-px-4w fr-py-3w card">
          <h2 class="fr-h3 fr-mb-1w card-title">Déclaration d’accessibilité</h2>
          <p class="card-description">
            {{
              auditIsReady
                ? "La déclaration d’accessibilité est prête à être complétée."
                : "Terminez l’audit avant de compléter et livrer la déclaration d’accessibilité."
            }}
          </p>

          <ul
            class="fr-btns-group fr-btns-group--inline-md fr-btns-group--icon-left fr-mb-3w statement-card-actions"
          >
            <li>
              <RouterLink
                :to="{
                  name: 'report',
                  params: {
                    uniqueId: audit.consultUniqueId,
                  },
                }"
                class="fr-btn fr-btn--icon-left fr-icon-edit-fill fr-mb-md-0"
                :class="{
                  'fr-btn--secondary': !auditIsReady || auditIsPublishable,
                }"
              >
                {{ auditIsPublishable ? "Consulter" : "Compléter" }}
              </RouterLink>
            </li>
            <li v-if="auditIsPublishable">
              <RouterLink
                :to="{
                  name: 'edit-audit-declaration',
                  params: { uniqueId: audit.editUniqueId },
                }"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-fill fr-mb-md-0"
              >
                Modifier
              </RouterLink>
            </li>
          </ul>

          <template v-if="auditIsPublishable">
            <CopyBlock
              class="fr-m-0 card-copy-block"
              :to="{
                name: 'report',
                params: { uniqueId: audit.consultUniqueId },
              }"
              description="Lien de partage"
              success-message="Le lien de la déclaration d’accessibilité a bien été copié dans le presse-papier."
            />
          </template>
        </div>
      </li>
    </ul>
  </template>
</template>

<style scoped>
.cards {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.card-wrapper {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  max-width: 49.5rem;
}

.card-check {
  color: var(--border-default-grey);
  margin: 0 auto;
}

.card-check--success {
  color: var(--text-default-success);
}

.card {
  border: 1px solid var(--border-default-grey);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1rem;
  flex-grow: 1;
}

.card-title {
  grid-column: 1 / -1;
  grid-row: 1;
}

.card-date {
  color: var(--text-mention-grey);
  grid-column: 1 / -1;
  grid-row: 2;
}
.card-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.card-progress-bar {
  grid-column: 1 / -1;
  grid-row: 3;
}

.card-charts {
  grid-column: 1 / -1;
  grid-row: 3;
}

.audit-card-actions {
  grid-column: 1 / -1;
}

.audit-card-actions--half {
  grid-column: 1;
}

.statement-card-actions {
  grid-column: 1 / -1;
}

/* FIXME: overrides fr-btns-group style */
.statement-card-actions > li:first-child {
  width: 50%;
}

.statement-card-actions > li > a {
  width: 100%;
}

.card-copy-block {
  grid-column: 1 / -1;
  grid-row: 4;
}

@media (max-width: 48rem) {
  .card-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .statement-card-actions > li:first-child {
    width: 100%;
  }
}
</style>
