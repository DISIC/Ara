<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { onBeforeRouteLeave } from "vue-router";

// import AuditGeneralInformationsForm from "../../components/audit/AuditGeneralInformationsForm.vue";
import LeaveModal from "../../components/audit/LeaveModal.vue";
import PageMeta from "../../components/PageMeta";
import router from "../../router";
// import { CreateAuditRequestData } from "../../types";
// import { useAuditStore } from "../../store";
// import { useNotifications } from "../../composables/useNotifications";
// import { captureWithPayloads } from "../../utils";
// import { useAccountStore } from "../../store/account";
import NewAuditType from "../../components/audit/NewAuditType.vue";
import NewAuditPages from "../../components/audit/NewAuditPages.vue";
import { AuditType } from "../../types";
import NewAuditContactDetails from "../../components/audit/NewAuditContactDetails.vue";

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

// Display leave modal when navigating to another route
// FIXME: it causes bug with links on the page
onBeforeRouteLeave((to) => {
  if (!isSubmitting.value && !confirmedLeave.value) {
    leaveModalDestination.value = to.fullPath;
    showLeaveModal();
    return false;
  }
});

// Display the native browser confirm modal when leaving site
function onBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = "Rester sur la page";
}

onMounted(() => {
  window.addEventListener("beforeunload", onBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
});

const isSubmitting = ref(false);

// const auditStore = useAuditStore();

// const notify = useNotifications();

// const accountStore = useAccountStore();

// async function submitStepOne(data: CreateAuditRequestData) {
//   isSubmitting.value = true;

//   // Update user profile when their name/org is not known.
//   if (accountStore.account && data.auditorName && !accountStore.account?.name) {
//     // Since this update is not necessary for the audit to be created, we ignore eventual errors.
//     accountStore
//       .updateProfile({ name: data.auditorName })
//       .catch(captureWithPayloads);
//   }

//   auditStore
//     .createAudit(data)
//     .then((audit) => {
//       if (!accountStore.account) {
//         auditStore.showAuditEmailAlert = true;
//       }
//       // TODO: replace current history entry with the edit page
//       return router.push({
//         name: "audit-overview",
//         params: { uniqueId: audit.editUniqueId }
//       });
//     })
//     .catch((err) => {
//       notify(
//         "error",
//         "Une erreur est survenue",
//         "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
//       );
//       captureWithPayloads(err);
//     })
//     .finally(() => {
//       isSubmitting.value = false;
//     });
// }

// Steps management
const currentStep = ref(0);
const steps = [
  { title: "Choisissez un type d’audit", component: NewAuditType },
  { title: "Renseignez l’échantillon des pages à auditer", component: null },
  { title: "Indiquez vos coordonnées", component: null }
];
const stepHeadingRef = ref<HTMLHeadingElement>();

// Setup audit object
const audit = ref({
  auditType: AuditType.FAST,
  procedureName: "",
  pages: [{ name: "", url: "" }],
  auditorEmail: "",
  auditorName: ""
});

// Audit type step
async function submitAuditTypeStep(data) {
  audit.value.auditType = data.auditType;
  audit.value.procedureName = data.procedureName;

  currentStep.value = 1;

  await nextTick();
  stepHeadingRef.value?.focus();
}

// Pages step
async function submitAuditPages(pages) {
  audit.value.pages = pages;

  currentStep.value = 2;

  await nextTick();
  stepHeadingRef.value?.focus();
}

// Personal infos and final step
function submitContactDetailsStep({ email, name }) {
  audit.value.auditorEmail = email;
  audit.value.auditorName = name;
}

// Previous button
async function goToPreviousStep() {
  currentStep.value -= 1;

  await nextTick();
  stepHeadingRef.value?.focus();
}
</script>

<template>
  <PageMeta
    title="Paramètres de l'audit"
    description="Saisissez les informations de l'entité qui fait la demande d'audit ainsi que du site à auditer."
  />

  <div class="content">
    <h1 class="fr-mb-6w">Démarrer un audit</h1>
    <div class="fr-stepper fr-mb-9v">
      <h2 ref="stepHeadingRef" tabindex="-1" class="fr-stepper__title fr-h2">
        {{ steps[currentStep].title }}
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
      :audit-type="audit.auditType"
      :procedure-name="audit.procedureName"
      @submit="submitAuditTypeStep"
    />
    <NewAuditPages
      v-else-if="currentStep === 1"
      :audit-type="audit.auditType"
      :pages="audit.pages"
      @previous="goToPreviousStep"
      @submit="submitAuditPages"
    />
    <NewAuditContactDetails
      v-else-if="currentStep === 2"
      :email="audit.auditorEmail"
      :name="audit.auditorName"
      @previous="goToPreviousStep"
      @submit="submitContactDetailsStep"
    />
  </div>

  <LeaveModal
    ref="leaveModalRef"
    title="Vous allez quitter l’audit"
    icon="fr-icon-warning-line"
    confirm="Oui, quitter l’audit"
    cancel="Non, poursuivre l’audit"
    danger
    @confirm="confirmLeave"
  >
    <p>
      A ce stade aucune des informations saisies ne sera sauvegardée. C’est à
      partir de l’étape suivante que vous pourrez quitter votre audit et y
      revenir sans perdre vos informations. Souhaitez-vous quitter l’audit ?
    </p>
  </LeaveModal>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
  margin: 0 auto;
}
</style>
