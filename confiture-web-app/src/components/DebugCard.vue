<script setup lang="ts">
/**
 * Component is shown under "?dev=1" in every env although debug API routes are disabled in production.
 */
import { ref } from "vue";

import { useNotifications } from "../composables/useNotifications";
import router from "../router";
import { useAccountStore, useDebugStore } from "../store";
import { AuditType, CreateDebugAuditRequestData } from "../types";
import { getCriteriaCount } from "../utils";
import DsfrField from "./ui/DsfrField.vue";

const notify = useNotifications();
const accountStore = useAccountStore();
const debugStore = useDebugStore();

const showDebugPanel = ref(false);

enum AuditCompletion {
  PRISTINE = "PRISTINE",
  ALMOST_COMPLETED = "ALMOST_COMPLETED",
  COMPLETED = "COMPLETED"
}

// Form data
const auditTypes = [AuditType.FULL, AuditType.COMPLEMENTARY, AuditType.FAST];
const selectedAuditType = ref(AuditType.FULL);
const auditorEmail = ref(accountStore.account?.email ?? "email@example.com");
const procedureName = ref("Ma procédure");
const auditCompletions = [
  { value: AuditCompletion.PRISTINE, label: "Vierge (0%)" },
  { value: AuditCompletion.ALMOST_COMPLETED, label: "Quasi terminé (99%)" },
  { value: AuditCompletion.COMPLETED, label: "Terminé (100%)" }
];
const selectedAuditCompletion = ref(AuditCompletion.PRISTINE);
const fillStatement = ref(false);

// API call
async function createDebugAudit(isCustom: boolean = false) {
  const data: CreateDebugAuditRequestData = {
    procedureName: isCustom ? procedureName.value : `Audit ${Date.now()}`,
    auditType: isCustom ? selectedAuditType.value : AuditType.FULL,
    auditorEmail: auditorEmail.value,
    isComplete: isCustom
      ? selectedAuditCompletion.value === AuditCompletion.COMPLETED
      : false,
    isPristine: isCustom
      ? selectedAuditCompletion.value === AuditCompletion.PRISTINE
      : false,
    fillStatement: isCustom ? fillStatement.value : true
  };

  const audit = await debugStore.createDebugAudit(data);

  notify("success", "", `Audit de débug « ${audit.procedureName} » créé`);
  return router.push({ name: "audit-generation", params: { uniqueId: audit.editUniqueId } });
}
</script>

<template>
  <div>
    <div class="debug-buttons fr-mb-2w">
      <button class="fr-btn" type="button" @click="createDebugAudit()">Créer un audit de test</button>
      <button :class="`fr-btn ${showDebugPanel ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'}`" @click="showDebugPanel = !showDebugPanel">
        {{ showDebugPanel ? 'Cacher' : 'Afficher' }} les options de création d’audit de test
      </button>
    </div>
    <div v-if="showDebugPanel" class="debug-container">
      <section class="fr-p-2w debug-card">
        <form @submit.prevent="createDebugAudit(true)">
          <DsfrField
            id="debug-audit-procedure-name"
            v-model="procedureName"
            label="Nom du site ou du service audité"
            required
          />

          <fieldset class="fr-fieldset fr-mb-1w" aria-labelledby="debug-audit-type-legend">
            <legend id="debug-audit-type-legend" class="fr-fieldset__legend--regular fr-fieldset__legend">Type d’audit</legend>
            <div v-for="auditType in auditTypes" :key="auditType" class="fr-fieldset__element fr-fieldset__element--inline">
              <div class="fr-radio-group">
                <input
                  :id="`debug-audit-type-${auditType}`"
                  v-model="selectedAuditType"
                  :value="auditType"
                  required
                  type="radio"
                  name="debug-audit-type"
                >
                <label class="fr-label" :for="`debug-audit-type-${auditType}`">{{ getCriteriaCount(auditType) }} critères</label>
              </div>
            </div>
          </fieldset>

          <DsfrField
            id="debug-audit-email"
            v-model="auditorEmail"
            label="Adresse e-mail"
            type="email"
            required
          />

          <fieldset class="fr-fieldset fr-mb-1w" aria-labelledby="debug-audit-completion-legend">
            <legend id="debug-audit-completion-legend" class="fr-fieldset__legend--regular fr-fieldset__legend">Complétion de l’audit</legend>
            <div v-for="auditCompletion in auditCompletions" :key="auditCompletion.value" class="fr-fieldset__element fr-fieldset__element--inline">
              <div class="fr-radio-group">
                <input
                  :id="`debug-audit-completion-${auditCompletion.value}`"
                  v-model="selectedAuditCompletion"
                  :value="auditCompletion.value"
                  required
                  type="radio"
                  name="debug-audit-completion"
                >
                <label class="fr-label" :for="`debug-audit-completion-${auditCompletion.value}`">{{ auditCompletion.label }}</label>
              </div>
            </div>
          </fieldset>

          <div v-if="selectedAuditType === AuditType.FULL" class="fr-toggle fr-mb-3w">
            <input id="debug-audit-declaration" v-model="fillStatement" type="checkbox" class="fr-toggle__input">
            <label class="fr-toggle__label" for="debug-audit-declaration">Rédiger la déclaration</label>
          </div>

          <button class="fr-btn" type="submit">Créer un audit de test</button>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.debug-buttons {
  display: flex;
  gap: 1px;
}

.debug-card {
  border: 1px solid;
  max-width: 40rem;
}
</style>
