<script setup lang="ts">
import { ref } from "vue";

import { useNotifications } from "../composables/useNotifications";
import { AssistiveTechnology, Browsers, OperatingSystem, Platform } from "../enums";
import router from "../router";
import { useAccountStore, useAuditStore } from "../store";
import { AuditType } from "../types";
import { getCriteriaCount } from "../utils";
import DsfrField from "./ui/DsfrField.vue";

/**
 * TODO:
 * - organize default data (in store?)
 * - handle audit completion
 * - add component on homepage
 */

const notify = useNotifications();
const accountStore = useAccountStore();
const auditStore = useAuditStore();

// Toggle debug panel
const showDebugPanel = ref(false);

// Debug audit creation
// enum AuditCompletion {
//   PRISTINE = "PRISTINE",
//   ALMOST_COMPLETED = "ALMOST_COMPLETED",
//   COMPLETED = "COMPLETED"
// }
const auditTypes = [AuditType.FULL, AuditType.COMPLEMENTARY, AuditType.FAST];
const selectedAuditType = ref(AuditType.FULL);
const auditorEmail = ref(accountStore.account?.email ?? "");
const procedureName = ref("Ma procédure");
// const auditCompletions = [
//   { value: AuditCompletion.PRISTINE, label: "Vierge (0%)" },
//   { value: AuditCompletion.ALMOST_COMPLETED, label: "Quasi terminé (99%)" },
//   { value: AuditCompletion.COMPLETED, label: "Terminé (100%)" }
// ];
// const selectedAuditCompletion = ref(AuditCompletion.PRISTINE);
const fillStatement = ref(false);

async function createDebugAudit() {
  const auditCreationData = {
    procedureName: procedureName.value,
    pages: [{ name: "Accueil", url: "https://example.com" }, { name: "Contact", url: "https://example.com/contact" }],
    pageElements: { multimedia: true, table: true, form: true, frame: true },
    auditorName: accountStore.account?.name ?? "Etienne Dupont",
    auditType: selectedAuditType.value,
    auditorEmail: auditorEmail.value
    // completion: selectedAuditCompletion.value,
  };

  const auditStatementData = {
    initiator: "Mairie de Tours",
    auditorOrganisation: "Web Audit Services Corp.",
    procedureUrl: "https://example.com",

    contactEmail: "philipinne-jolivet@example.com",
    contactFormUrl: "https://example.com/contact",

    technologies: ["HTML", "CSS"],
    tools: ["Web Developer Toolbar", "Firefox Devtools"],
    environments: [
      {
        platform: Platform.DESKTOP,
        operatingSystem: OperatingSystem.WINDOWS,
        assistiveTechnology: AssistiveTechnology.NVDA,
        browser: Browsers.FIREFOX
      },
      {
        platform: Platform.DESKTOP,
        operatingSystem: OperatingSystem.MAC_OS,
        assistiveTechnology: AssistiveTechnology.VOICE_OVER,
        browser: Browsers.SAFARI
      }
    ],

    notCompliantContent:
    "Sit aliquip velit adipisicing esse cupidatat. Dolor nisi do Lorem laboris cillum anim adipisicing reprehenderit laboris id ullamco. Cillum aute do consectetur et exercitation consequat exercitation sunt sunt id dolore aliquip. Dolor cillum anim do id ipsum occaecat quis voluptate. Commodo adipisicing sit proident consequat ex incididunt. Minim sit esse ad id do pariatur in occaecat proident eiusmod velit.",
    notInScopeContent:
    "Non officia voluptate id magna culpa consectetur ex officia quis magna quis sint.",
    derogatedContent:
    "Nostrud duis ut sint et et. Consequat fugiat sunt est elit sunt."
  };

  const audit = await auditStore.createAudit(auditCreationData);

  if (fillStatement.value) {
    auditStore.updateAuditStatement(audit.editUniqueId, auditStatementData);
  }

  notify("success", "", `Audit de débug « ${audit.procedureName} » créé`);
  return router.push({ name: "audit-generation", params: { uniqueId: audit.editUniqueId } });
}
</script>

<template>
  <div>
    <button class="fr-btn fr-btn--icon-right fr-icon-arrow-down-s-line fr-mb-2w" @click="showDebugPanel = !showDebugPanel">
      {{ showDebugPanel ? 'Cacher' : 'Afficher' }} les options de débug
    </button>
    <div v-if="showDebugPanel" class="debug-container">
      <section class="fr-p-2w debug-card">
        <h2 class="fr-h4">Créer un audit</h2>
        <form @submit.prevent="createDebugAudit">
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
            label="Adresse email"
            type="email"
            required
          />

          <!-- <fieldset class="fr-fieldset fr-mb-1w" aria-labelledby="debug-audit-completion-legend">
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
          </fieldset> -->

          <div v-if="selectedAuditType === AuditType.FULL" class="fr-toggle fr-mb-3w">
            <input id="debug-audit-declaration" v-model="fillStatement" type="checkbox" class="fr-toggle__input">
            <label class="fr-toggle__label" for="debug-audit-declaration">Rédiger la déclaration</label>
          </div>

          <button class="fr-btn" type="submit">Créer un audit</button>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.debug-card {
  border: 1px solid;
  max-width: 40rem;
}
</style>
