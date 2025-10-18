<script lang="ts" setup>
import { HTTPError } from "ky";
import { nextTick, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";

import { useNotifications } from "../../../composables/useNotifications";
import { EQUAL, REQUIRED } from "../../../composables/validation";
import { useAccountStore } from "../../../store/account";
import { captureWithPayloads } from "../../../utils";
import DsfrPassword from "../../ui/DsfrPassword.vue";
import DsfrFieldWithValidation from "../../validation/DsfrFieldWithValidation.vue";
import FieldValidation from "../../validation/FieldValidation.vue";
import FormWithValidation from "../../validation/form-with-validation/FormWithValidation.vue";

const router = useRouter();
const accountStore = useAccountStore();
const notify = useNotifications();

const VALIDATION_STRING = "je confirme vouloir supprimer mon compte";
const confirmPhraseValidation = [REQUIRED(`Champ obligatoire. Saisissez la phrase « ${VALIDATION_STRING} ».`), EQUAL(VALIDATION_STRING, "Saisie incorecte. Vérifiez votre saisie.")];
const confirmPhrase = ref("");

const passwordField = useTemplateRef("password-field");
const password = ref("");

const displayAccountDeletionForm = ref(false);

async function deleteAccount() {
  accountStore
    .deleteAccount(password.value)
    .then(() => {
      router.push({ name: "account-deletion-feedback" });
    })
    .catch(async (e) => {
      if (e instanceof HTTPError && e.response.status === 401) {
        passwordField.value?.setError("Saisie incorrecte. Vérifiez votre saisie.", true);
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
        Toutes les données liées à votre compte seront définitivement supprimées.<br />Les audits et rapports que vous avez créés resteront accessibles, mais vos données personnelles ne seront plus mentionnées.
      </p>
    </div>
    <FormWithValidation @submit="deleteAccount">
      <DsfrFieldWithValidation
        id="confirm-sentence"
        v-model="confirmPhrase"
        type="text"
        required
        :label="`Saisissez la phrase suivante pour confirmer la suppression de votre compte : ${VALIDATION_STRING}`"
        hint="N’utilisez pas de majuscules, ni d’espace au début ou à la fin de votre saisie."
        :validation="confirmPhraseValidation"
      />

      <FieldValidation
        ref="password-field"
        v-slot="{ error, focusRef }"
        :value="password"
        :validation="[REQUIRED('Champ obligatoire. Saisissez votre mot de passe.')]"
      >
        <DsfrPassword
          id="account-password"
          :ref="focusRef"
          v-model="password"
          :error="error"
          label="Mot de passe"
          required
          autocomplete="current-password"
          show-forgotten-password-link
          skip-forgotten-password-first-step
        />
      </FieldValidation>

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
    </FormWithValidation>
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
