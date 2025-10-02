<script lang="ts" setup>
import { ref } from "vue";

defineEmits<{
  (e: "submit", email: string): void;
}>();

const email = ref("");
const emailFieldRef = ref<HTMLInputElement>();

defineExpose({
  focusEmailField: () => {
    emailFieldRef.value?.focus();
  }
});
</script>

<template>
  <form class="wrapper" @submit.prevent="$emit('submit', email)">
    <h1 class="frw-h3">Réinitialiser votre mot de passe</h1>
    <p class="fr-mb-2w">
      Saisissez l’adresse e-mail liée à votre compte. Vous recevrez un e-mail pour réinitialiser votre mot de passe.
    </p>

    <div class="fr-input-group field-wrapper">
      <label class="fr-label" for="reset-password-email">
        Adresse e-mail
        <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
      </label>
      <input
        id="reset-password-email"
        ref="emailFieldRef"
        v-model="email"
        class="fr-input"
        type="email"
        required
      />
    </div>

    <ul
      class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left"
    >
      <li>
        <RouterLink class="fr-btn fr-btn--secondary" :to="{ name: 'login' }">
          Annuler
        </RouterLink>
      </li>
      <li>
        <button type="submit" class="fr-btn">Valider</button>
      </li>
    </ul>
  </form>
</template>

<style scoped>
.field-wrapper {
  max-width: 25rem;
}
</style>
