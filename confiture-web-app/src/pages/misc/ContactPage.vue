<script setup lang="ts">
import PageMeta from "../../components/PageMeta";
import { useReportStore } from "../../store";

const reportStore = useReportStore();
</script>

<template>
  <PageMeta
    title="Contactez-nous ou contribuez !"
    description="Contactez-nous ou contribuez à l’amélioration d’Ara"
  />

  <section class="fr-mx-auto content">
    <h1>Contact</h1>
    <p>
      Ara est un outil propulsé par
      <a
        class="fr-link"
        target="_blank"
        href="https://design.numerique.gouv.fr/"
      >DesignGouv <span class="fr-sr-only">(nouvelle fenêtre)</span></a>, le pôle design des services numériques de la
      <a
        class="fr-link"
        target="_blank"
        href="https://www.numerique.gouv.fr/dinum/"
      >direction interministérielle du numérique
        <span class="fr-sr-only">(nouvelle fenêtre)</span></a>.
    </p>
    <p :class="{ 'fr-mb-5w': !reportStore.data }">
      Vous pouvez nous contacter par e-mail à l’adresse :
      <strong>ara@design.numerique.gouv.fr</strong>.
    </p>

    <div v-if="reportStore.data" class="fr-callout fr-mb-5w">
      <p class="fr-callout__text">
        Pour toute question relative au rapport d’audit, veuillez contacter
        l’auditeur ou l’auditrice qui a réalisé cet audit.
      </p>
    </div>

    <h2 class="fr-mb-4w">Vos contributions sont les bienvenues !</h2>

    <div class="fr-callout">
      <p class="fr-callout__text">
        N’hésitez pas à nous faire part de vos retours depuis ce
        <RouterLink class="fr-link" :to="{ name: 'feedback' }">court formulaire</RouterLink>
      </p>
    </div>

    <p>Vous pouvez également :</p>
    <ul>
      <li>
        Nous écrire par e-mail à :
        <strong>ara@design.numerique.gouv.fr</strong>.
      </li>
      <li>
        Créer une issue sur le
        <a
          class="fr-link"
          target="_blank"
          rel="noreferrer noopener"
          href="https://github.com/DISIC/Ara"
        >dépôt <span class="fr-sr-only">(nouvelle fenêtre)</span>
        </a>
        (le
        <a
          class="fr-link"
          target="_blank"
          rel="noreferrer noopener"
          href="https://github.com/DISIC/Ara/blob/main/CONTRIBUTING.md"
        >guide de contribution
          <span class="fr-sr-only">(nouvelle fenêtre)</span></a>
        est disponible à la racine du dépôt).
      </li>
    </ul>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
