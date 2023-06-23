<script lang="ts" setup>
import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "../../../store/account";
import { HTTPError } from "ky";
import { useNotifications } from "../../../composables/useNotifications";

const router = useRouter();
const accountStore = useAccountStore();
const notify = useNotifications();

const VALIDATION_STRING = "je confirme vouloir supprimer mon compte";

// const validation = ref("");
const validation = ref(VALIDATION_STRING);
const password = ref("");

const displayAccountDeletionForm = ref(false);

// Form submission
const validationFieldRef = ref<HTMLInputElement>();
const passwordFieldRef = ref<HTMLInputElement>();
const showValidationError = ref(false);
const showPasswordError = ref(false);

async function deleteAccount() {
  showValidationError.value = false;
  showPasswordError.value = false;

  if (validation.value !== VALIDATION_STRING) {
    showValidationError.value = true;
    await nextTick();
    validationFieldRef.value?.focus();
  }

  accountStore
    .deleteAccount(password.value)
    .then(() => {
      router.push({ name: "account-deletion-feedback" });
    })
    .catch(async (e) => {
      if (e instanceof HTTPError && e.response.status === 401) {
        showPasswordError.value = true;
        await nextTick();
        passwordFieldRef.value?.focus();
      } else {
        notify(
          "error",
          "Impossible de supprimer le compte",
          "Une erreur inconnue empêche la suppression du compte. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
        );
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
    <div class="wrapper">
      <div
        ref="alertRef"
        class="fr-alert fr-alert--error fr-mb-3w"
        tabindex="-1"
      >
        <h3 class="fr-alert__title">Vous allez supprimer votre compte</h3>
        <p>
          Toutes les données associées à votre compte seront définitivement
          supprimées. Les audits et rapports que vous avez créés ne seront pas
          supprimés, cependant, votre nom, prénom et adresse e-mail ne seront
          plus mentionnés dans ces audits et rapports.
        </p>
      </div>
    </div>
    <form class="wrapper-sm" @submit.prevent="deleteAccount">
      <div
        class="fr-input-group"
        :class="{ 'fr-input-group--error': showValidationError }"
      >
        <label class="fr-label" for="confirm-sentence"
          >Pour confirmer la suppression de votre compte veuillez saisir : je
          confirme vouloir supprimer mon compte
          <span class="fr-hint-text"
            >Attention à ne pas utiliser de majuscule ou ajouter d’espace au
            début ou à la fin de votre saisie.
          </span>
        </label>
        <input
          id="confirm-sentence"
          ref="validationFieldRef"
          v-model="validation"
          class="fr-input"
          :class="{ 'fr-input--error': showValidationError }"
          :aria-describedby="
            showValidationError ? 'validation-error' : undefined
          "
          type="text"
          required
        />
        <p
          v-if="showValidationError"
          id="validation-error"
          class="fr-error-text"
        >
          La phrase saisie est incorrect. Veuillez vérifier votre saisie.
        </p>
      </div>
      <div
        class="fr-password"
        :class="{ 'fr-input-group--error': showPasswordError }"
      >
        <label class="fr-label" for="password">Mot de passe</label>
        <div class="fr-input-wrap">
          <input
            id="password"
            ref="passwordFieldRef"
            v-model="password"
            class="fr-password__input fr-input"
            :class="{ 'fr-input--error': showPasswordError }"
            :aria-describedby="showPasswordError ? 'password-error' : undefined"
            autocomplete="current-password"
            type="password"
            required
          />
        </div>
        <p v-if="showPasswordError" id="password-error" class="fr-error-text">
          Le mot de passe saisi est incorrect.
        </p>

        <div
          class="fr-password__checkbox fr-checkbox-group fr-checkbox-group--sm"
        >
          <input
            id="toggle-password"
            aria-label="Afficher le mot de passe"
            type="checkbox"
          />
          <label class="fr-password__checkbox fr-label" for="toggle-password">
            Afficher
          </label>
        </div>
        <!-- TODO: uncomment this once the forgot password page is done. -->
        <!-- <p>
          <a
            href="[À MODIFIER - url de la page de récupération]"
            class="fr-link"
            >Mot de passe oublié ?</a
          >
        </p> -->
      </div>
      <ul
        class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-3w"
      >
        <li>
          <button
            class="fr-btn fr-btn--secondary fr-mb-0"
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
    class="fr-btn fr-btn--tertiary-no-outline danger-button-outline"
    @click="showAccountDeletionForm"
  >
    Supprimer mon compte
  </button>
</template>

<style scoped>
.wrapper {
  max-width: 36.25rem;
}

.wrapper-sm {
  max-width: 24rem;
}

.danger-button-outline {
  color: var(--background-action-high-error);
}

.danger-button {
  background-color: var(--background-action-high-error);
}

.danger-button:hover {
  background-color: var(--background-action-high-error-hover);
}

.danger-button:focus {
  background-color: var(--background-action-high-error-active);
}
</style>
