<script lang="ts" setup>
import { HTTPError } from "ky";
import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";

import { useNotifications } from "../../../composables/useNotifications";
import { EQUAL, REQUIRED, useFormField, validate } from "../../../composables/validation";
import { useAccountStore } from "../../../store/account";
import { captureWithPayloads } from "../../../utils";
import DsfrField from "../../ui/DsfrField.vue";
import DsfrPassword from "../../ui/DsfrPassword.vue";

const router = useRouter();
const accountStore = useAccountStore();
const notify = useNotifications();

const VALIDATION_STRING = "je confirme vouloir supprimer mon compte";

const validation = useFormField("" as string, [REQUIRED(`Champ obligatoire. Saisissez la phrase “${VALIDATION_STRING}”.`), EQUAL(VALIDATION_STRING, `La phrase saisie est incorrect. Saisissez la phrase “${VALIDATION_STRING}”.`)]);
const password = useFormField("" as string, [REQUIRED("Champ obligatoire. Saisissez votre mot de passe")]);

const displayAccountDeletionForm = ref(false);

async function deleteAccount() {
  if (!validate(validation, password)) {
    // Invalid form
    return;
  }

  accountStore
    .deleteAccount(password.value.value)
    .then(() => {
      router.push({ name: "account-deletion-feedback" });
    })
    .catch(async (e) => {
      if (e instanceof HTTPError && e.response.status === 401) {
        password.error.value = "Le mot de passe saisi est incorrect.";
        await nextTick();
        password.focusRef.value?.focus();
      } else {
        notify(
          "error",
          "Impossible de supprimer le compte",
          "Une erreur inconnue empêche la suppression du compte. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
        );
        captureWithPayloads(e, false);
      }
    });
}

// Toggle display
const showButtonRef = ref<HTMLButtonElement>();
const alertRef = ref<HTMLDivElement>();

async function showAccountDeletionForm() {
  displayAccountDeletionForm.value = true;
  await nextTick();
  alertRef.value?.focus();
}

async function hideAccountDeletionForm() {
  displayAccountDeletionForm.value = false;
  await nextTick();
  showButtonRef.value?.focus();
}
</script>

<template>
  <template v-if="displayAccountDeletionForm">
    <div ref="alertRef" class="fr-alert fr-alert--error fr-mb-3w" tabindex="-1">
      <h3 class="fr-alert__title">Vous allez supprimer votre compte</h3>
      <p>
        Toutes les données associées à votre compte seront définitivement
        supprimées. Les audits et rapports que vous avez créés ne seront pas
        supprimés, cependant, votre nom, prénom et adresse e-mail ne seront plus
        mentionnés dans ces audits et rapports.
      </p>
    </div>
    <form class="wrapper" novalidate @submit.prevent="deleteAccount">
      <DsfrField
        id="confirm-sentence" :ref="validation.refFn"
        :model-value="validation.value.value"
        :error="validation.error.value"
        type="text"
        required
        :label="`Pour confirmer la suppression de votre compte veuillez saisir : ${VALIDATION_STRING}`"
        hint="Attention à ne pas utiliser de majuscule ou ajouter d’espace au début ou à la fin de votre saisie."
        @update:model-value="validation.value.value = $event"
      />

      <DsfrPassword
        id="account-password"
        :ref="password.refFn"
        :model-value="password.value.value"
        :error="password.error.value"
        label="Mot de passe"
        required
        autocomplete="current-password"
        show-forgotten-password-link
        skip-forgotten-password-first-step
        @update:model-value="password.value.value = $event"
      />

      <ul
        class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-3w"
      >
        <li>
          <button
            class="fr-btn fr-btn--secondary fr-mb-0"
            type="button"
            @click="hideAccountDeletionForm"
          >
            Annuler
          </button>
        </li>
        <li>
          <button type="submit" class="fr-btn fr-mb-0 danger-button">
            Supprimer mon compte
          </button>
        </li>
      </ul>
    </form>
  </template>
  <button
    v-else
    ref="showButtonRef"
    class="fr-btn fr-btn--tertiary-no-outline danger-button--secondary"
    @click="showAccountDeletionForm"
  >
    Supprimer mon compte
  </button>
</template>

<style scoped>
.wrapper {
  max-width: 24rem;
}
</style>
