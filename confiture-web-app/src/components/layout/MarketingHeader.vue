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
              <div class="fr-header__navbar">
                <button
                  id="fr-btn-menu-mobile"
                  class="fr-btn--menu fr-btn"
                  data-fr-opened="false"
                  aria-controls="modal-navigation-header"
                  aria-haspopup="menu"
                  title="Menu"
                >
                  Menu
                </button>
              </div>
            </div>
          </div>
          <div class="fr-header__tools">
            <div class="fr-header__tools-links">
              <ul class="fr-btns-group">
                <li>
                  <RouterLink
                    class="fr-btn fr-btn--tertiary-no-outline"
                    :to="{ name: 'login' }"
                  >
                    Se connecter
                  </RouterLink>
                </li>
                <li>
                  <RouterLink
                    class="fr-btn fr-btn--secondary"
                    :to="{ name: 'new-account' }"
                  >
                    Créer un compte
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu mobile : le DSFR y recopie les liens de `fr-header__tools-links`.
           Le conteneur doit exister même sans navigation, sinon l’initialisation
           du composant HeaderLinks échoue et coupe tout le JS du DSFR. -->
      <div
        id="modal-navigation-header"
        class="fr-header__menu fr-modal"
        aria-labelledby="fr-btn-menu-mobile"
      >
        <div class="fr-container">
          <button
            class="fr-link--close fr-link"
            aria-controls="modal-navigation-header"
          >
            Fermer
          </button>
          <div class="fr-header__menu-links"></div>
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
</style>
