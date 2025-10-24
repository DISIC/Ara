<script lang="ts" setup>
import { ref } from "vue";
import { LENGTH, REQUIRED } from "../../../composables/validation";
import DsfrPasswordWithValidation from "../../validation/DsfrPasswordWithValidation.vue";
import FormWithValidation from "../../validation/form-with-validation/FormWithValidation.vue";

const emit = defineEmits<{
  (e: "submit", newPassword: string): void;
}>();

const password = ref("");
</script>

<template>
  <FormWithValidation
    class="new-password-wrapper"
    @submit="$emit('submit', password)"
  >
    <h1 class="fr-h3">Changer de mot de passe</h1>

    <DsfrPasswordWithValidation
      id="user-password-input"
      v-model="password"
      class="fr-mb-3w"
      label="Mot de passe"
      required
      autocomplete="new-password"
      :min-length="12"
      :requirements="['12 caractères minimum']"
      :validation="[
        REQUIRED('Champ obligatoire. Saisissez votre nouveau mot de passe. Il doit contenir 12 caractères minimum.'),
        LENGTH(12, 'Le nombre de caractères du mot de passe n’est pas suffisant. Veuillez choisir un mot de passe de 12 caractères minimum.')
      ]"
    />

    <ul
      class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left"
    >
      <li>
        <RouterLink class="fr-btn fr-btn--secondary" :to="{ name: 'login' }">
          Annuler
        </RouterLink>
      </li>
      <li>
        <button type="submit" class="fr-btn">Changer de mot de passe</button>
      </li>
    </ul>
  </FormWithValidation>
</template>

<style scoped>
.new-password-wrapper {
  max-width: 25rem;
  margin: 0 auto;
}
</style>
