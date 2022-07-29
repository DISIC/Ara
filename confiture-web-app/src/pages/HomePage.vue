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

    <RouterLink :to="{ name: 'new-audit-step-one' }" class="fr-btn">
      Je démarre un audit
    </RouterLink>
  </section>
</template>
