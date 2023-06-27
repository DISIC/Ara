<script lang="ts" setup>
import { ref } from "vue";

import PasswordForm from "../../components/account/password-reset/PasswordForm.vue";
import ResetInstructions from "../../components/account/password-reset/ResetInstructions.vue";

// TODO: condition to show form? param in reset email link?
const showPasswordResetForm = ref(true);
</script>

<template>
  <PasswordForm v-if="showPasswordResetForm" />
  <ResetInstructions v-else />
</template>
