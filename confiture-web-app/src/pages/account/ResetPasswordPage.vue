<script lang="ts" setup>
import { ref } from "vue";

import ResetPasswordForm from "../../components/account/password-reset/ResetPasswordForm.vue";
import ResetInstructions from "../../components/account/password-reset/ResetInstructions.vue";

// TODO: condition to show form? param in reset email link?
const showPasswordResetForm = ref(false);
</script>

<template>
  <ResetPasswordForm v-if="showPasswordResetForm" />
  <ResetInstructions v-else />
</template>
