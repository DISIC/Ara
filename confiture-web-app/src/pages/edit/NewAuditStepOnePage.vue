<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import AuditGeneralInformationsForm from "../../components/AuditGeneralInformationsForm.vue";
import LeaveModal from "../../components/LeaveModal.vue";
import PageMeta from "../../components/PageMeta";
import router from "../../router";
import { CreateAuditRequestData } from "../../types";
import { useAuditStore } from "../../store";
import { useNotifications } from "../../composables/useNotifications";
import { captureWithPayloads } from "../../utils";
import { useAccountStore } from "../../store/account";

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

const auditStore = useAuditStore();

const notify = useNotifications();

const accountStore = useAccountStore();

async function submitStepOne(data: CreateAuditRequestData) {
  isSubmitting.value = true;

  // Update user profile when their name/org is not known.
  if (accountStore.account && data.auditorName && !accountStore.account?.name) {
    // Since this update is not necessary for the audit to be created, we ignore eventual errors.
    accountStore
      .updateProfile({ name: data.auditorName })
      .catch(captureWithPayloads);
  }

  auditStore
    .createAudit(data)
    .then((audit) => {
      auditStore.showAuditEmailAlert = true;
      // TODO: replace current history entry with the edit page
      return router.push({
        name: "overview",
        params: { uniqueId: audit.editUniqueId },
      });
    })
    .catch((err) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste.",
      );
      captureWithPayloads(err);
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}
</script>

<template>
  <PageMeta
    title="Paramètres de l'audit"
    description="Saisissez les informations de l'entité qui fait la demande d'audit ainsi que du site à auditer."
  />

  <AuditGeneralInformationsForm @submit="submitStepOne" />

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
