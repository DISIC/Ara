<script setup lang="ts">
import { computed, ref } from "vue";

import router from "../../router";
import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import CopyIcon from "../icons/CopyIcon.vue";
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
  return !!props.audit.initiator;
});

const statementUrl = computed(
  () =>
    window.location.origin +
    router.resolve({
      name: "audit-declaration",
      params: { uniqueId: props.audit.editUniqueId }
    }).fullPath
);

const showCopyAlert = ref(false);
const copyButtonRef = ref<HTMLButtonElement>();

function copyStatementUrl() {
  navigator.clipboard.writeText(statementUrl.value).then(() => {
    showCopyAlert.value = true;
  });
}

function onStatementAlertClose() {
  copyButtonRef.value?.focus();
  showCopyAlert.value = false;
}
</script>

<template>
  <StepCard>
    <div class="fr-mb-2w step-card-heading">
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
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-line statement-step-settings-link"
        :to="{
          name: 'audit-declaration',
          params: { uniqueId: audit.editUniqueId }
        }"
      >
        Modifier
      </RouterLink>
    </div>

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

    <ul
      class="fr-btns-group fr-btns-group--inline-md fr-btns-group--icon-left statement-step-actions"
    >
      <li class="fr-mb-2w fr-mb-md-0">
        <RouterLink
          :to="
            auditIsPublishable
              ? {
                  name: 'a11y-statement',
                  params: {
                    uniqueId: audit.consultUniqueId
                  }
                }
              : {
                  name: 'audit-declaration',
                  params: { uniqueId: audit.editUniqueId }
                }
          "
          :target="auditIsPublishable ? '_blank' : null"
          class="fr-btn fr-btn--icon-left fr-mb-0"
          :class="{
            'fr-btn--tertiary': !auditIsReady || auditIsPublishable,
            'fr-icon-edit-line no-external-icon': !auditIsPublishable
          }"
          :title="
            auditIsPublishable
              ? 'Consulter la déclaration - nouvelle fenêtre'
              : null
          "
        >
          {{ auditIsPublishable ? "Consulter" : "Compléter" }}
          <span v-if="auditIsPublishable" class="fr-sr-only"
            >(nouvelle fenêtre)</span
          >
        </RouterLink>
      </li>
      <li v-if="auditIsPublishable">
        <button
          ref="copyButtonRef"
          class="fr-btn fr-btn--secondary fr-mb-0"
          @click="copyStatementUrl"
        >
          <CopyIcon class="fr-mr-2v" />
          Copier le lien de partage
          <span class="fr-sr-only">de la déclaration</span>
        </button>
      </li>
    </ul>

    <div role="alert" aria-live="polite" class="statement-step-alert">
      <div
        v-if="showCopyAlert"
        class="fr-alert fr-alert--success fr-alert--sm fr-mt-2w"
      >
        <p>
          Le lien vers la déclaration d’accessibilité a bien été copié dans le
          presse-papier.
        </p>
        <button class="fr-link--close fr-link" @click="onStatementAlertClose">
          Masquer le message
        </button>
      </div>
    </div>
  </StepCard>
</template>

<style scoped>
.statement-step-settings-link {
  margin-inline-start: auto;

  @media (width < 36rem) {
    margin-inline-start: initial;
  }
}

.statement-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

/* FIXME: overrides fr-btns-group style */
.statement-step-actions {
  grid-column: 1 / -1;

  li:first-child {
    width: 50%;

    @media (width < 48rem) {
      width: 100%;
    }
  }

  li:last-child {
    min-width: 18rem;
  }

  li > a,
  li > button {
    width: calc(100% - 1rem);
  }
}

.statement-step-alert {
  grid-column: 1 / -1;
}
</style>
