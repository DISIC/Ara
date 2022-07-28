<template>
  <footer id="footer" class="fr-footer" role="contentinfo">
    <div class="fr-container">
      <div class="fr-footer__body">
        <div class="fr-footer__brand fr-enlarge-link">
          <RouterLink to="/" title="Retour à l’accueil">
            <p class="fr-logo" title="république française">
              République<br />
              Française
            </p>
          </RouterLink>
        </div>
        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">
            Ce site est réalisé par
            <a href="https://design.numerique.gouv.fr/" target="_blank"
              >DesignGouv</a
            >, le pôle Design des services numériques de la
            <a href="https://www.numerique.gouv.fr/dinum/" target="_blank"
              >direction interministérielle du numérique</a
            >.
          </p>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://legifrance.gouv.fr"
                target="_blank"
                >legifrance.gouv.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://gouvernement.fr"
                target="_blank"
                >gouvernement.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://service-public.fr"
                target="_blank"
                >service-public.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://data.gouv.fr"
                target="_blank"
                >data.gouv.fr</a
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="fr-footer__bottom">
        <ul class="fr-footer__bottom-list">
          <li class="fr-footer__bottom-item">
            <RouterLink class="fr-footer__bottom-link" to="/plan-du-site">
              Plan du site
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink class="fr-footer__bottom-link" to="/accessibilite">
              Accessibilité : non conforme
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink class="fr-footer__bottom-link" to="/mentions-legales">
              Mentions légales
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink
              class="fr-footer__bottom-link"
              to="/donnees-personnelles"
            >
              Données personnelles
            </RouterLink>
          </li>
          <li class="fr-footer__bottom-item">
            <RouterLink
              class="fr-footer__bottom-link"
              to="/gestion-des-cookies"
            >
              Gestion des cookies
            </RouterLink>
          </li>
        </ul>
        <div class="fr-footer__bottom-copy">
          <p>
            Sauf mention contraire, tous les contenus de ce site sont sous
            <a
              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              target="_blank"
              >licence etalab-2.0</a
            >
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
