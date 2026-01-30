<script setup lang="ts"></script>

<template>
  <header id="header" role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  République
                  <br />Française
                </p>
              </div>
            </div>
            <div class="fr-header__service">
              <div class="header">
                <div class="logo">
                  <img src="../../assets/images/logo-ara.svg" alt="Logo Ara" />
                </div>
                <div class="title">
                  <p class="fr-header__service-title">
                    Ara
                  </p>
                  <p class="fr-header__service-tagline">
                    Réalisez vos audits d’accessibilité numérique
                  </p>
                </div>
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

.logo {
  height: 2.8125rem;
  margin: auto;
  padding-right: 1rem;

  img {
    height: 100%;
  }
}

.user-dropdown {
  text-align: initial !important;
}
</style>
