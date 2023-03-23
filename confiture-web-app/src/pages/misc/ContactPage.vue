<script setup lang="ts">
import PageMeta from "../../components/PageMeta";
import { useReportStore } from "../../store";

const reportStore = useReportStore();
</script>

<template>
  <PageMeta
    title="Contactez-nous ou contribuez !"
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
        >DesignGouv <span class="sr-only">(nouvelle fenêtre)</span></a
      >, le pôle design des services numériques de la
      <a
        class="fr-link"
        target="_blank"
        href="https://www.numerique.gouv.fr/dinum/"
        >direction interministérielle du numérique
        <span class="sr-only">(nouvelle fenêtre)</span></a
      >.
    </p>
    <p>
      Vous pouvez nous contacter par e-mail à l’adresse :
      <strong>ara@design.numerique.gouv.fr</strong>.
    </p>

    <div v-if="reportStore.data" class="fr-callout">
      <p class="fr-callout__text">
        Pour toute question relative au rapport d’audit, veuillez contacter
        l’auditeur ou l’auditrice qui a réalisé cet audit<template
          v-if="reportStore.data.context.auditorEmail"
        >
          à l’adresse suivante :
          <strong>{{ reportStore.data.context.auditorEmail }}</strong></template
        >.
      </p>
    </div>

    <h2>Vos contributions sont les bienvenues !</h2>

    <p>Vous pouvez contribuer à l’amélioration de ce site :</p>
    <ul>
      <li>
        En nous écrivant à :
        <strong>ara@design.numerique.gouv.fr</strong>.
      </li>
      <li>
        En créant une issue sur le
        <a
          class="fr-link"
          target="_blank"
          rel="noreferrer noopener"
          href="https://github.com/DISIC/Ara"
          >dépôt <span class="sr-only">(nouvelle fenêtre)</span></a
        >. <br />Le
        <a
          class="fr-link"
          target="_blank"
          rel="noreferrer noopener"
          href="https://github.com/DISIC/Ara/blob/main/CONTRIBUTING.md"
          >guide de contribution
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        est disponible à la racine du dépôt.
      </li>
    </ul>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
