<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import { formatDate } from "../../utils";
import CopyBlock from "../ui/CopyBlock.vue";
import StepCard from "./StepCard.vue";

const props = defineProps<{
  audit: Audit;
  headingLevel: "h2" | "h3";
}>();

const resultsStore = useResultsStore();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});

const auditIsPublishable = computed(() => {
  return !!props.audit.statementPublicationDate;
});
</script>

<template>
  <StepCard>
    <div :class="`step-card-heading ${auditIsPublishable ? 'statement-step-heading' : 'fr-mb-2w'}`">
      <span
        v-if="auditIsPublishable"
        id="statement-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill step-card-check"
      >
        <span class="fr-sr-only">Étape terminée</span>
      </span>
      <component
        :is="headingLevel"
        class="fr-h3 fr-mb-0 step-card-title"
        aria-describedby="statement-step-status"
      >
        Déclaration d’accessibilité
      </component>
      <RouterLink
        v-if="auditIsPublishable"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-line statement-step-settings-link"
        :to="{
          name: 'audit-declaration',
          params: { uniqueId: audit.editUniqueId }
        }"
      >
        Modifier
      </RouterLink>
    </div>

    <p v-if="auditIsPublishable" class="fr-text--sm fr-mb-5v statement-step-date">
      Rédigée le {{ formatDate(audit.statementPublicationDate!) }}<template v-if="audit.statementEditionDate"> - Mise à jour le {{ formatDate(audit.statementEditionDate) }}</template>
    </p>

    <p class="statement-step-description">
      <template v-if="auditIsPublishable">
        Vous pouvez livrer la déclaration d’accessibilité.
      </template>
      <template v-else-if="auditIsReady">
        La déclaration d’accessibilité est prête à être complétée.
      </template>
      <template v-else>
        Terminez l’audit avant de compléter et livrer la déclaration
        d’accessibilité.
      </template>
    </p>

    <CopyBlock
      v-if="auditIsPublishable"
      class="statement-step-copy"
      :to="{
        name: 'a11y-statement',
        params: {
          uniqueId: audit.consultUniqueId
        }
      }"
      :show-copy-button="auditIsPublishable"
      success-message="Le lien vers la déclaration d’accessibilité a bien été copié dans le presse-papier."
      link-hidden-label="la déclaration d’accessibilité"
      copy-button-hidden-label="de la déclaration d’accessibilité"
    />

    <ul
      v-else
      class="fr-btns-group fr-btns-group--inline-md fr-btns-group--icon-left statement-step-main-cta"
    >
      <li class="fr-mb-2w fr-mb-md-0">
        <RouterLink
          :to="{
            name: 'audit-declaration',
            params: { uniqueId: audit.editUniqueId }
          }"
          class="fr-btn fr-btn--icon-left fr-icon-edit-line no-external-icon fr-mb-0"
          :class="{
            'fr-btn--tertiary': !auditIsReady
          }"
        >
          Compléter
        </RouterLink>
      </li>
    </ul>
  </StepCard>
</template>

<style scoped>
.statement-step-heading {
  margin-block-end: 0.125rem;
}

.statement-step-settings-link {
  margin-inline-start: auto;

  @media (width < 36rem) {
    margin-inline-start: initial;
  }
}

.statement-step-date {
  grid-column: 1 / -1;
  grid-row: 2;
  color: var(--text-mention-grey);
}

.statement-step-description {
  grid-column: 1 / -1;
}

.statement-step-main-cta {
  @media (width < 48rem) {
    grid-column: 1 / -1;
  }

  li:first-child {
    width: 100%;

    > a {
      width: calc(100% - 1rem);
    }
  }
}

.statement-step-copy {
  grid-column: 1 / -1;
}
</style>
