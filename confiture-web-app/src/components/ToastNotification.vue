<script lang="ts" setup>
const status = "error";
const title = "Erreur : titre du message";
const description = "Description";
</script>

<template>
  <Teleport to="body">
    <div
      class="toast-notification fr-alert"
      :class="`fr-alert--${status}`"
      role="alert"
    >
      <p class="fr-alert__title">{{ title }}</p>
      <p>{{ description }}</p>
      <button class="fr-btn--close fr-btn" title="Masquer le message">
        Masquer le message
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-notification {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
}
</style>
