<script setup lang="ts">
import PageMeta from "../../components/PageMeta";
</script>

<template>
  <PageMeta
    title="Contactez-nous ou contribuez !"
    description="Contactez-nous ou contribuez à l'amélioration du site Confiture"
  />

  <section class="fr-mx-auto content">
    <h1>Contact</h1>
    <p>
      Confiture est un outil propulsé par
      <a
        class="fr-link"
        target="_blank"
        href="https://design.numerique.gouv.fr/"
        >DesignGouv</a
      >, le pôle design des services numériques de la
      <a
        class="fr-link"
        target="_blank"
        href="https://www.numerique.gouv.fr/dinum/"
        >direction interministérielle du numérique</a
      >.
    </p>
    <p>
      Vous pouvez nous contacter par e-mail à l’adresse :
      <strong>rgaa@design.numérique.gouv.fr</strong>.
    </p>

    <!-- TODO: what if we're not on an audit page? -->
    <!-- <div class="fr-callout">
      <p class="fr-callout__text">
        Pour toute question relative au rapport d’audit, veuillez contacter
        l’auditeur qui a réalisé cet audit [(si adresse connue) à cette adresse
        e-mail : [adresse e-mail]].
      </p>
    </div> -->

    <h2>Vos contributions sont les bienvenues !</h2>

    <p>Vous pouvez contribuer à l’amélioration de ce site :</p>
    <ul>
      <li>
        En nous écrivant par e-mail à :
        <strong>rgaa@confiture.numerique.gouv.fr</strong>.
      </li>
      <li>
        En créant une issue sur le
        <a
          class="fr-link"
          target="_blank"
          href="https://github.com/DISIC/confiture"
          >dépôt</a
        >.
        <!--
          TODO: create a CONTRIBUTING.md file
          Le guide de contribution est disponible à la racine du dépôt :
          <a
            class="fr-link"
            target="_blank"
            href="https://github.com/DISIC/confiture/blob/main/CONTRIBUTING.md"
            >https://github.com/DISIC/confiture/blob/main/CONTRIBUTING.md</a
          >
         -->
      </li>
    </ul>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
