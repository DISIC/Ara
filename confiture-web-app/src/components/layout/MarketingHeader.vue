<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

const currentRoute = useRoute();

const newsSubMenu = ref<HTMLButtonElement>();

function closeNewsSubMenu() {
  dsfr(newsSubMenu.value).collapse.conceal();
}
</script>

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
          <nav class="fr-nav" role="navigation" aria-label="Menu principal">
            <ul class="fr-nav__list">
              <!-- Home -->
              <li class="fr-nav__item">
                <RouterLink
                  class="fr-nav__link"
                  :to="{ name: 'home' }"
                  :aria-current="
                    currentRoute.name === 'home' ? 'true' : undefined
                  "
                >
                  Accueil
                </RouterLink>
              </li>

              <!-- Nouveautés -->
              <li class="fr-nav__item">
                <button
                  class="fr-nav__btn"
                  aria-expanded="false"
                  :aria-current="
                    ['changelog', 'roadmap'].includes(
                      currentRoute.name as string
                    )
                      ? 'true'
                      : undefined
                  "
                  aria-controls="news-menu-item"
                >
                  Nouveautés
                </button>
                <div
                  id="news-menu-item"
                  ref="newsSubMenu"
                  class="fr-collapse fr-menu"
                >
                  <ul class="fr-menu__list">
                    <li>
                      <RouterLink
                        class="fr-nav__link"
                        :to="{ name: 'roadmap' }"
                        @click="closeNewsSubMenu"
                      >
                        Feuille de route
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink
                        class="fr-nav__link"
                        :to="{ name: 'changelog' }"
                        @click="closeNewsSubMenu"
                      >
                        Notes de version
                      </RouterLink>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>
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
</style>
