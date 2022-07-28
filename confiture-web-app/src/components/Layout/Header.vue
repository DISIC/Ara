<template>
  <header id="header" role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
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
              <RouterLink to="/" title="Accueil - Confiture">
                <p class="fr-header__service-title">
                  Confiture
                  <span
                    class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon"
                    >BETA</span
                  >
                </p>
              </RouterLink>
              <p class="fr-header__service-tagline">
                Précisions sur l'organisation
              </p>
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
              <li class="fr-nav__item">
                <RouterLink class="fr-nav__link" to="/">Accueil</RouterLink>
              </li>
              <li class="fr-nav__item">
                <RouterLink class="fr-nav__link" to="/ressources">
                  Ressources
                </RouterLink>
              </li>
              <li class="fr-nav__item">
                <RouterLink class="fr-nav__link" to="/aide">Aide</RouterLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>
