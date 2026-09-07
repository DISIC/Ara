<script setup lang="ts">
import AraLogo from "../ui/AraLogo.vue";
</script>

<template>
  <header id="header" role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <AraLogo variant="header" with-introduction />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
}

.title {
  display: flex;
  flex-direction: column;
}

.user-dropdown {
  text-align: initial !important;
}
</style>
