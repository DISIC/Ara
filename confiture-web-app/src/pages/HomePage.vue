<template>
  <section>
    <h1>Je démarre un nouvel audit</h1>
    <div class="fr-card fr-enlarge-link fr-card--horizontal">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <p>
            Avant de démarrer l’audit vous passerez par 2 étapes afin de saisir
            :
          </p>
          <ul>
            <li>Les information générales de la démarche à auditer</li>
            <li>Les informations générales de l’audit lui-même</li>
          </ul>
          <p>
            ⏱️ Ces 2 étapes vous prendront environ 15 min. Vous pourrez ensuite
            faire votre audit et le vérifier avant de le livrer à
            l’administration.
          </p>
          <RouterLink to="/audits/nouveau/1" class="fr-btn fr-btn--sm">
            Je démarre mon audit
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
  </section>
</template>
