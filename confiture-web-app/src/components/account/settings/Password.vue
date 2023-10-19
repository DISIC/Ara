<script lang="ts" setup>
import { ref, nextTick } from "vue";
import { useAccountStore } from "../../../store/account";
import { HTTPError } from "ky";
import { useNotifications } from "../../../composables/useNotifications";
import { captureWithPayloads } from "../../../utils";

const currentPasswordFieldRef = ref<HTMLInputElement>();
const newPasswordFieldRef = ref<HTMLInputElement>();

// Toggle display
const showButtonRef = ref<HTMLButtonElement>();

const displayUpdatePasswordForm = ref(false);

async function showUpdatePasswordForm() {
  displaySuccessAlert.value = false;
  displayUpdatePasswordForm.value = true;
  await nextTick();
  currentPasswordFieldRef.value?.focus();
}

async function hideUpdatePasswordForm() {
  displayUpdatePasswordForm.value = false;
  currentPassword.value = "";
  newPassword.value = "";
  currentPasswordError.value = "";
  newPasswordError.value = "";
  await nextTick();
  showButtonRef.value?.focus();
}

// Form submission
const currentPassword = ref("");
const newPassword = ref("");

const displaySuccessAlert = ref(false);

const successAlertRef = ref<HTMLDivElement>();

const currentPasswordError = ref("");
const newPasswordError = ref("");

const accountStore = useAccountStore();
const notify = useNotifications();

async function updatePassword() {
  currentPasswordError.value = "";
  newPasswordError.value = "";

  accountStore
    .updatePassword(currentPassword.value, newPassword.value)
    .then(() => {
      displayUpdatePasswordForm.value = false;
      displaySuccessAlert.value = true;
      currentPassword.value = "";
      newPassword.value = "";
    })
    .catch(async (err) => {
      if (err instanceof HTTPError && err.response.status === 401) {
        // Wrong password
        currentPasswordError.value = "Le mot de passe saisi est incorrect.";
        await nextTick();
        currentPasswordFieldRef.value?.focus();
      } else if (err instanceof HTTPError && err.response.status === 400) {
        // Same password
        newPasswordError.value =
          "Le mot de passe saisi est identique au mot de passe actuel. Veuillez choisir un nouveau mot de passe.";
        await nextTick();
        newPasswordFieldRef.value?.focus();
      } else {
        // Unexpected network error
        notify(
          "error",
          "Echéc de la mise à jour du mot de passe",
          "Une erreur inconnue empêche la mise à jour du mot de passe. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
        );
        captureWithPayloads(err, false);
      }
    });
}

async function hideSuccessAlert() {
  displaySuccessAlert.value = false;
  await nextTick();
  showButtonRef.value?.focus();
}
</script>

<template>
  <h2 class="fr-h6">Mot de passe</h2>
  <form
    v-if="displayUpdatePasswordForm"
    class="wrapper"
    @submit.prevent="updatePassword"
  >
    <!-- Current password -->
    <div
      class="fr-password"
      :class="{ 'fr-input-group--error': currentPasswordError }"
    >
      <label class="fr-label" for="current-password">Mot de passe actuel</label>
      <div class="fr-input-wrap">
        <input
          id="current-password"
          ref="currentPasswordFieldRef"
          v-model="currentPassword"
          class="fr-password__input fr-input"
          :class="{ 'fr-input--error': currentPasswordError }"
          :aria-describedby="
            currentPasswordError ? 'current-password-error' : undefined
          "
          autocomplete="current-password"
          type="password"
          required
        />
      </div>
      <p
        v-if="currentPasswordError"
        id="current-password-error"
        class="fr-error-text"
      >
        {{ currentPasswordError }}
      </p>
      <div
        class="fr-password__checkbox fr-checkbox-group fr-checkbox-group--sm"
      >
        <input
          id="toggle-current-password"
          aria-label="Afficher le mot de passe actuel"
          type="checkbox"
        />
        <label
          class="fr-password__checkbox fr-label"
          for="toggle-current-password"
        >
          Afficher
        </label>
      </div>
      <p>
        <RouterLink :to="{ name: 'password-reset' }" class="fr-link"
          >Mot de passe oublié ?</RouterLink
        >
      </p>
    </div>

    <!-- New password -->
    <div
      class="fr-password fr-mt-3w"
      :class="{ 'fr-input-group--error': newPasswordError }"
    >
      <label class="fr-label" for="new-password">Nouveau mot de passe</label>
      <div class="fr-input-wrap">
        <input
          id="new-password"
          v-model="newPassword"
          class="fr-password__input fr-input"
          :class="{ 'fr-input--error': newPasswordError }"
          :aria-describedby="
            newPasswordError
              ? 'new-password-requirements new-password-error'
              : 'new-password-requirements'
          "
          autocomplete="new-password"
          type="password"
          required
          minlength="12"
        />
      </div>
      <p v-if="newPasswordError" id="new-password-error" class="fr-error-text">
        {{ newPasswordError }}
      </p>
      <div
        id="new-password-requirements"
        class="fr-messages-group"
        aria-live="assertive"
      >
        <p class="fr-message">Votre mot de passe doit contenir :</p>
        <p class="fr-message fr-message--info">12 caractères minimum</p>
      </div>
      <div
        class="fr-password__checkbox fr-checkbox-group fr-checkbox-group--sm"
      >
        <input
          id="toggle-new-password"
          aria-label="Afficher le nouveau mot de passe"
          type="checkbox"
        />
        <label class="fr-password__checkbox fr-label" for="toggle-new-password">
          Afficher
        </label>
      </div>
    </div>

    <!-- Actions -->
    <ul
      class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-3w"
    >
      <li>
        <button
          class="fr-btn fr-btn--secondary fr-mb-0"
          type="button"
          @click="hideUpdatePasswordForm"
        >
          Annuler
        </button>
      </li>
      <li>
        <button type="submit" class="fr-btn fr-mb-0">
          Changer de mot de passe
        </button>
      </li>
    </ul>
  </form>
  <button
    v-else
    ref="showButtonRef"
    class="fr-btn fr-btn--tertiary-no-outline fr-mb-2w"
    @click="showUpdatePasswordForm"
  >
    Changer de mot de passe
  </button>

  <div
    v-if="displaySuccessAlert"
    ref="successAlertRef"
    tabindex="-1"
    class="fr-alert fr-alert--success fr-alert--sm"
  >
    <p>Votre mot de passe a été mis à jour avec succès</p>
    <button class="fr-link--close fr-link" @click="hideSuccessAlert">
      Masquer le message
    </button>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 30rem;
}
</style>
