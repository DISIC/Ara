<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import LeaveModal from "../../components/audit/LeaveModal.vue";
import NewAuditContactDetails from "../../components/audit/NewAuditContactDetails.vue";
import NewAuditElements from "../../components/audit/NewAuditElements.vue";
import NewAuditPages from "../../components/audit/NewAuditPages.vue";
import NewAuditReference from "../../components/audit/NewAuditReference.vue";

import NewAuditType from "../../components/audit/NewAuditType.vue";
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import { useNotifications } from "../../composables/useNotifications";
import { useTopicAccordions } from "../../composables/useTopicAccordionsStatus";
import { DEFAULT_NOTIFICATION_ERROR_DESCRIPTION, DEFAULT_NOTIFICATION_ERROR_TITLE } from "../../enums";
import router from "../../router";
import { useAuditStore } from "../../store";
import { useAccountStore } from "../../store/account";
import { AuditReference, AuditType, CreateAuditRequestData } from "../../types";
import { captureWithPayloads, getRgaaVersion } from "../../utils";

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
onBeforeRouteLeave((to) => {
  if (
    !isSubmitting.value &&
    !confirmedLeave.value &&
    (
      newAuditTypeRef.value?.procedureName ||
      newAuditTypeRef.value?.auditType ||
      currentStep.value > 0
    )
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

interface CreateAuditFormData {
  auditReference: AuditReference | null;
  auditType: AuditType | null;
  procedureName: string;
  pages: { name: string; url: string }[];
  pageElements: {
    multimedia: boolean;
    table: boolean;
    form: boolean;
    frame: boolean;
    images: boolean;
    documentation: boolean;
    outils: boolean;
    authentification: boolean;
    communication: boolean;
    services: boolean;
    liens: boolean;
  };
  auditorEmail: string;
  auditorName: string;
}

function getPageElementsRgaa(auditReference: AuditReference | null) {
  if (auditReference === AuditReference.RGAA_5_Web) {
    return {
      multimedia: true,
      table: true,
      form: true,
      frame: true,
      images: true,
      documentation: true,
      outils: true,
      authentification: true,
      communication: true,
      services: false,
      liens: false,
      couleurs: false
    };
  }

  if (auditReference === AuditReference.RGAA_5_Mobile) {
    return {
      multimedia: true,
      table: true,
      form: true,
      frame: false,
      images: true,
      documentation: true,
      outils: true,
      authentification: false,
      communication: true,
      services: true,
      liens: false,
      couleurs: false
    };
  }

  if (auditReference === AuditReference.RGAA_5_Document) {
    return {
      multimedia: true,
      table: true,
      form: true,
      frame: true,
      images: true,
      documentation: false,
      outils: true,
      authentification: false,
      communication: false,
      services: false,
      liens: true,
      couleurs: true
    };
  }

  return {
    multimedia: true,
    table: true,
    form: true,
    frame: true,
    images: true,
    documentation: false,
    outils: false,
    authentification: false,
    communication: false,
    services: false,
    liens: false,
    couleurs: false
  };
}

// Setup audit object
const audit = ref<CreateAuditFormData>({
  auditReference: null,
  auditType: null,
  procedureName: "",
  pages: [{ name: "", url: "" }],
  pageElements: getPageElementsRgaa(null),
  auditorEmail: accountStore.account?.email ?? "",
  auditorName: accountStore.account?.name ?? ""
});

watch(
  () => audit.value.auditReference,
  (ref) => {
    audit.value.pageElements = getPageElementsRgaa(ref);
  }
);

const stepEchantillonLabel = computed(() => {
  if (audit.value.auditReference === AuditReference.RGAA_5_Mobile) {
    return "Renseigner les écrans de l'échantillon";
  }

  if (audit.value.auditReference === AuditReference.RGAA_5_Document) {
    return "Renseigner les documents de l'échantillon";
  }

  return "Renseignez les pages de l’échantillon";
});

// Steps management
const currentStep = ref(0);
const steps = computed(() => [
  "Choisissez le référentiel",
  "Choisissez un type d’audit",
  stepEchantillonLabel.value,
  "Indiquez la présence d’éléments spécifiques",
  ...(accountStore.account && accountStore.account.name
    ? []
    : ["Indiquez vos coordonnées"])
]);
const stepHeadingRef = ref<HTMLHeadingElement>();

// Default pages per audit type
const fullDefaultPages = {
  [AuditReference.RGAA_4]: [
    { name: "Accueil", url: "" },
    { name: "Contact", url: "" },
    { name: "Mentions légales", url: "" },
    { name: "Accessibilité", url: "" },
    { name: "Plan du site", url: "" },
    { name: "Aide", url: "" },
    { name: "Authentification", url: "" }
  ],
  [AuditReference.RGAA_5_Web]: [
    { name: "Accueil", url: "" },
    { name: "Contact", url: "" },
    { name: "Accessibilité", url: "" },
    { name: "Plan du site", url: "" },
    { name: "Aide", url: "" },
    { name: "Authentification", url: "" }
  ],
  [AuditReference.RGAA_5_Mobile]: [
    { name: "Accueil", url: "" },
    { name: "Contact", url: "" },
    { name: "Mentions légales", url: "" },
    { name: "Accessibilité", url: "" },
    { name: "Aide", url: "" },
    { name: "Authentification", url: "" },
    { name: "Plan du service", url: "" },
    { name: "Recherche", url: "" }
  ],
  [AuditReference.RGAA_5_Document]: [{ name: "", url: "" }]
};

const fastAndComplementaryDefaultPages = [{ name: "", url: "" }];

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
    audit.value.pages = [
      ...fullDefaultPages[audit.value.auditReference || AuditReference.RGAA_4]
    ];
  }
});

async function submitStep(payload: Partial<CreateAuditFormData>) {
  audit.value = {
    ...audit.value,
    ...payload
  };

  if (currentStep.value === steps.value.length - 1) {
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

const {
  toggleStatus,
  saveStatusToLocalStorage
} = useTopicAccordions();

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

  const data: CreateAuditRequestData = {
    auditType: audit.value.auditType!,
    auditReference: audit.value.auditReference!,
    procedureName: audit.value.procedureName,
    pages: audit.value.pages,
    pageElements: audit.value.pageElements,
    auditorEmail: audit.value.auditorEmail,
    auditorName: audit.value.auditorName
  };

  auditStore
    .createAudit(data)
    .then((newAudit) => {
      if (!accountStore.account) {
        auditStore.showAuditEmailAlert = true;
      }

      const topicsToHide = [
        ...(audit.value.pageElements?.images ? [] : [1]),
        ...(audit.value.pageElements?.frame ? [] : [2]),
        ...(audit.value.pageElements?.multimedia ? [] : [4]),
        ...(audit.value.pageElements?.table ? [] : [5]),
        ...(audit.value.pageElements?.form ? [] : [11])
      ];

      setTopicAccordionStatus(
        newAudit.editUniqueId,
        [newAudit.transverseElementsPage.id, ...newAudit.pages.map(p => p.id)],
        topicsToHide
      );

      return router.push({
        name: accountStore.account?.email
          ? "audit-generation"
          : "audit-overview",
        params: { uniqueId: newAudit.editUniqueId }
      });
    })
    .catch((err) => {
      notify(
        "error",
        DEFAULT_NOTIFICATION_ERROR_TITLE,
        DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
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

function setTopicAccordionStatus(
  auditEditId: string,
  pageIds: number[],
  topics: number[]

) {
  pageIds.forEach(pageId => {
    [...Array.from({ length: 13 }).keys()].forEach(topic => {
      toggleStatus(
        auditEditId,
        pageId,
        topic,
        topics.includes(topic)
      );
      saveStatusToLocalStorage();
    });
  });
}
</script>

<template>
  <PageMeta
    :title="`Paramétrer un audit ${audit?.auditReference && currentStep + 1 > 1 ? getRgaaVersion(audit.auditReference) : ''}, étape ${currentStep + 1} sur ${steps.length}, ${
      steps[currentStep]
    }`"
    description="Pour paramétrer un nouvel audit indiquez le type d'audit, renseignez l'échantillon des pages à auditer, nommez votre audit et indiquer vos coordonnées pour recevoir les liens de votre audit, de votre rapport d'audit généré automatiquement et de votre déclaration d'accessibilité"
  />

  <BackLink
    :label="`Retour à ${accountStore.account ? 'mes audits' : 'l’accueil'}`"
    :to="{ name: accountStore.account ? 'account-dashboard' : 'home' }"
  />

  <div class="content">
    <h1 class="fr-mb-3w">Paramétrer un audit {{ audit?.auditReference && currentStep + 1 > 1 ? getRgaaVersion(audit.auditReference) : '' }}</h1>
    <div class="fr-stepper fr-mb-12v">
      <h2 ref="stepHeadingRef" tabindex="-1" class="fr-stepper__title fr-h3">
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
      <p v-if="steps[currentStep + 1]" class="fr-mt-2w fr-text--xs">
        <span class="fr-text--bold">Étape suivante&nbsp;:</span>&nbsp;{{ steps[currentStep + 1].toLowerCase() }}
      </p>
    </div>

    <NewAuditReference
      v-if="currentStep === 0"
      ref="newAuditReferenceRef"
      :audit-reference="audit.auditReference"
      @submit="submitStep"
    />

    <NewAuditType
      v-if="currentStep === 1"
      ref="newAuditTypeRef"
      :audit-type="audit.auditType"
      :audit-reference="audit.auditReference"
      :procedure-name="audit.procedureName"
      @previous="goToPreviousStep"
      @submit="submitStep"
    />
    <NewAuditPages
      v-else-if="currentStep === 2"
      :audit-type="audit.auditType"
      :pages="audit.pages"
      :audit-reference="audit.auditReference"
      @previous="goToPreviousStep"
      @submit="submitStep"
      @change="pagesArePristine = false"
    />
    <NewAuditElements
      v-else-if="currentStep === 3"
      :page-elements="audit.pageElements!"
      :audit-reference="audit.auditReference"
      @previous="goToPreviousStep"
      @submit="submitStep"
    />
    <NewAuditContactDetails
      v-else-if="currentStep === 4"
      :email="audit.auditorEmail"
      :name="audit.auditorName"
      @previous="goToPreviousStep"
      @submit="submitStep"
    />
  </div>

  <LeaveModal
    ref="leaveModalRef"
    title="Quitter avant d’avoir terminé le paramétrage&#8239;?"
    icon="fr-icon-warning-line"
    confirm="Quitter le paramétrage"
    cancel="Annuler"
    @confirm="confirmLeave"
    @cancel="cancelLeave"
  >
    <p>Aucune information saisie ne sera enregistrée.</p>
  </LeaveModal>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
  margin: 0 auto;
}
</style>
