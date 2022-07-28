<template>
  <section>
    <h1>Audit d’accessibilité numérique</h1>
    <p>
      Avant de démarrer un nouvel audit vous passerez par 2 étapes afin de
      saisir :
    </p>
    <ul>
      <li>Les information générales du site à auditer</li>
      <li>Les informations générales de l’audit lui-même</li>
    </ul>
    <p class="fr-mb-4w">
      ⏱️ Ces 2 étapes vous prendront environ 15 min. Vous pourrez ensuite faire
      votre audit.
    </p>

    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-md-6">
        <div class="fr-card fr-card--horizontal fr-card--horizontal-tier">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <p class="fr-h4">Je démarre un nouvel audit</p>
              <RouterLink to="/audits/nouveau" class="fr-btn fr-btn--sm">
                C’est parti !
              </RouterLink>
            </div>
          </div>

          <!-- TODO: Replace with correct illustration -->
          <div class="fr-card__header">
            <div class="fr-card__img">
              <img
                class="fr-responsive-img"
                src="https://picsum.photos/id/123/600/400"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
