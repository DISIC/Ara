<template>
  <ol class="fr-mb-4w">
    <li>
      Organiser une réunion de restitution avec l’auditeur ou l'auditrice qui a réalisé.e cet
      audit
    </li>
    <li>Publier la déclaration d’accessibilité sur votre site</li>
    <li>Prioriser les erreurs à corriger</li>
    <li>Corriger les erreurs et tester vos corrections</li>
    <li>Réaliser un contre-audit (audit de conformité)</li>
  </ol>
  <p>A tout moment vous pouvez trouver de l’aide :</p>
  <ul class="fr-mb-0">
    <li>Auprès de l’auditeur ou auditrice qui à réalisé.e cet audit</li>
    <li>
      Dans les pages
      <RouterLink class="fr-link" :to="{ name: 'help' }">Aide</RouterLink> et
      <RouterLink class="fr-link" :to="{ name: 'resources' }"
        >Ressources</RouterLink
      >
    </li>
    <!-- TODO: what should be the link destination -->
    <!-- <li>
      Auprès de la communauté Slack pour les agents de l’État et prestataire
      externes œuvrant pour l’accessibilité des services numériques publics.
      Rejoindre la communauté
    </li> -->
  </ul>
</template>
