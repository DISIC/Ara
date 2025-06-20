<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import LeaveModal from "../../components/audit/LeaveModal.vue";
import NewAuditContactDetails from "../../components/audit/NewAuditContactDetails.vue";
import NewAuditElements from "../../components/audit/NewAuditElements.vue";
import NewAuditPages from "../../components/audit/NewAuditPages.vue";
import NewAuditType from "../../components/audit/NewAuditType.vue";
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import { useNotifications } from "../../composables/useNotifications";
import router from "../../router";
import { useAuditStore } from "../../store";
import { useAccountStore } from "../../store/account";
import { AuditType, CreateAuditRequestData } from "../../types";
import { captureWithPayloads } from "../../utils";

const leaveModalRef = ref<InstanceType<typeof LeaveModal>>();
const leaveModalDestination = ref<string>("");
const confirmedLeave = ref(false);

function showLeaveModal() {
  leaveModalRef.value?.show();
}

function confirmLeave() {
  // Not closing the modal before route navigation would leave a dangling
  // "trap focus" event handler on the document body, which would break further
  // tab navigation
  leaveModalRef.value?.hide();

  confirmedLeave.value = true;
  router.push(leaveModalDestination.value);
}

function cancelLeave() {
  leaveModalRef.value?.hide();
}

const newAuditTypeRef = ref<InstanceType<typeof NewAuditType>>();

// Display leave modal when navigating to another route
// FIXME: it causes bug with links on the page
onBeforeRouteLeave((to) => {
  if (
    !isSubmitting.value &&
    !confirmedLeave.value &&
    (newAuditTypeRef.value?.procedureName || newAuditTypeRef.value?.auditType)
  ) {
    leaveModalDestination.value = to.fullPath;
    showLeaveModal();
    return false;
  }
});

// Display the native browser confirm modal when leaving site
function onBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
}

onMounted(() => {
  window.addEventListener("beforeunload", onBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
});

const accountStore = useAccountStore();

// Steps management
const currentStep = ref(0);
const steps = [
  "Choisissez un type d’audit",
  "Renseignez l’échantillon des pages à auditer",
  "Indiquez la présence d’éléments spécifiques",
  ...(accountStore.account && accountStore.account.name
    ? []
    : ["Indiquez vos coordonnées"])
];
const stepHeadingRef = ref<HTMLHeadingElement>();

// Setup audit object
const audit = ref<CreateAuditRequestData>({
  auditType: null,
  procedureName: "",
  pages: [{ name: "", url: "" }],
  pageElements: { multimedia: true, table: true, form: true, frame: true },
  auditorEmail: accountStore.account?.email ?? "",
  auditorName: accountStore.account?.name ?? ""
});

// Default pages per audit type
const fullDefaultPages = [
  { name: "Accueil", url: "" },
  { name: "Contact", url: "" },
  { name: "Mentions légales", url: "" },
  { name: "Accessibilité", url: "" },
  { name: "Plan du site", url: "" },
  { name: "Aide", url: "" },
  { name: "Authentification", url: "" }
];

const fastAndComplementaryDefaultPages = [{ name: "Accueil", url: "" }];

// Update default pages except if pages has been changed by user
const pagesArePristine = ref(true);

const auditType = computed(() => {
  return audit.value.auditType;
});

watch(auditType, (newValue) => {
  if (
    (newValue === AuditType.FAST || newValue === AuditType.COMPLEMENTARY) &&
    pagesArePristine.value
  ) {
    audit.value.pages = [...fastAndComplementaryDefaultPages];
  }

  if (newValue === AuditType.FULL && pagesArePristine.value) {
    audit.value.pages = [...fullDefaultPages];
  }
});

async function submitStep(payload: Partial<CreateAuditRequestData>) {
  audit.value = {
    ...audit.value,
    ...payload
  };

  if (currentStep.value === steps.length - 1) {
    submitAuditSettings();
  } else {
    currentStep.value += 1;

    await nextTick();
    stepHeadingRef.value?.focus();
  }
}

// Final submission
const isSubmitting = ref(false);
const auditStore = useAuditStore();
const notify = useNotifications();

function submitAuditSettings() {
  isSubmitting.value = true;

  // Update user profile when their name is not known.
  if (
    accountStore.account &&
    audit.value.auditorName &&
    !accountStore.account?.name
  ) {
    // Since this update is not necessary for the audit to be created, we ignore eventual errors.
    accountStore
      .updateProfile({ name: audit.value.auditorName })
      .catch(captureWithPayloads);
  }

  auditStore
    .createAudit(audit.value)
    .then((audit) => {
      if (!accountStore.account) {
        auditStore.showAuditEmailAlert = true;
      }

      return router.push({
        name: accountStore.account?.email
          ? "audit-generation"
          : "audit-overview",
        params: { uniqueId: audit.editUniqueId }
      });
    })
    .catch((err) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
      captureWithPayloads(err);
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}

// Previous step button
async function goToPreviousStep() {
  currentStep.value -= 1;

  await nextTick();
  stepHeadingRef.value?.focus();
}
</script>

<template>
  <PageMeta
    :title="`Démarrer un audit, étape ${currentStep + 1} sur ${steps.length}, ${
      steps[currentStep]
    }`"
    description="Pour paramétrer un nouvel audit indiquez le type d'audit, renseignez l'échantillon des pages à auditer, nommez votre audit et indiquer vos coordonnées pour recevoir les liens de votre audit, de votre rapport d'audit généré automatiquement et de votre déclaration d'accessibilité"
  />

  <BackLink
    :label="`Retourner à ${accountStore.account ? 'mes audits' : 'l’accueil'}`"
    :to="{ name: accountStore.account ? 'account-dashboard' : 'home' }"
  />

  <div class="content">
    <h1 class="fr-mb-6w">Démarrer un audit</h1>
    <div class="fr-stepper fr-mb-9v">
      <h2 ref="stepHeadingRef" tabindex="-1" class="fr-stepper__title fr-h2">
        {{ steps[currentStep] }}
        <span class="fr-stepper__state">
          Étape {{ currentStep + 1 }} sur {{ steps.length }}
        </span>
      </h2>
      <div
        class="fr-stepper__steps"
        :data-fr-current-step="currentStep + 1"
        :data-fr-steps="steps.length"
      />
    </div>

    <NewAuditType
      v-if="currentStep === 0"
      ref="newAuditTypeRef"
      :audit-type="audit.auditType"
      :procedure-name="audit.procedureName"
      @submit="submitStep"
    />
    <NewAuditPages
      v-else-if="currentStep === 1"
      :audit-type="audit.auditType"
      :pages="audit.pages"
      @previous="goToPreviousStep"
      @submit="submitStep"
      @change="pagesArePristine = false"
    />
    <NewAuditElements
      v-else-if="currentStep === 2"
      :page-elements="audit.pageElements"
      @previous="goToPreviousStep"
      @submit="submitStep"
    />
    <NewAuditContactDetails
      v-else-if="currentStep === 3"
      :email="audit.auditorEmail"
      :name="audit.auditorName"
      @previous="goToPreviousStep"
      @submit="submitStep"
    />
  </div>

  <LeaveModal
    ref="leaveModalRef"
    title="Le paramétrage de l’audit n’est pas terminé"
    icon="fr-icon-warning-line"
    confirm="Quitter le paramétrage"
    cancel="Annuler"
    @confirm="confirmLeave"
    @cancel="cancelLeave"
  >
    <p>Aucune des informations saisies ne sera enregistrée.</p>
  </LeaveModal>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
  margin: 0 auto;
}
</style>
