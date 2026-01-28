<script setup lang="ts">
import PageMeta from "../../components/PageMeta";
import TopLink from "../../components/ui/TopLink.vue";
</script>

<!--
  TODO: missing elements:
  - product name
  - editor info
  - publishing info
  - hosting provider info
  - accessibility info
 -->
<template>
  <PageMeta
    title="Mentions légales"
    description="Mentions légales du site ara.numerique.gouv.fr"
  />

  <section class="fr-my-0 fr-mx-auto content">
    <h1>Mentions légales</h1>

    <p>
      Ce site est édité par l’équipe
      <a
        href="https://design.numerique.gouv.fr"
        target="_blank"
      >Design des services numériques
        <span class="fr-sr-only">(nouvelle fenêtre)</span></a>
      de la Direction interministérielle du numérique, un service du Premier
      ministre.
    </p>
    <p>
      DINUM<br />
      20 avenue de Ségur<br />
      75007 Paris<br />
      Tel. accueil : 01.71.21.01.70<br />
      SIRET : 12000101100010 (secrétariat général du gouvernement)<br />
      SIREN : 120 001 011
    </p>

    <h2>Directrice de publication</h2>
    <p>Stéphanie Schaer, directrice interministérielle du numérique.</p>

    <h2>Conception et gestion du site</h2>
    <p>
      Ce site est conçu et développé par l’équipe
      <a
        href="https://design.numerique.gouv.fr"
        target="_blank"
      >Design des services numériques
        <span class="fr-sr-only">(nouvelle fenêtre)</span></a>
      et utilise le système de design de l’État.
    </p>

    <h2>Hébergement du site</h2>

    <p>
      Ce site est hébergé sur une plateforme labellisée SecNumCloud par OVH :
    </p>

    <ul>
      <li>RCS Roubaix – Tourcoing 424 761 419 00045</li>
      <li>Code APE 6202A</li>
      <li>N<sup>o</sup> TVA : FR 22 424 761 419</li>
      <li>Siège social : 2 rue Kellermann</li>
      <li>59100 Roubaix</li>
      <li>France</li>
    </ul>

    <h2>Code source du site</h2>
    <p>
      Le code source du site est disponible sur
      <a
        href="https://github.com/DISIC/Ara/"
        rel="noreferrer noopener"
        target="_blank"
      >Github <span class="fr-sr-only">(nouvelle fenêtre)</span></a>.
    </p>

    <h2>Propriété intellectuelle et liens</h2>
    <p>
      Tout site public ou privé est autorisé à établir, sans autorisation
      préalable, un lien vers les informations diffusées sur
      ara.numerique.gouv.fr.
    </p>
    <p>
      Sauf mention de propriété intellectuelle détenue par des tiers, les
      contenus de ce site sont proposés sous licence ouverte 2.0.
    </p>
    <p class="fr-mb-0">
      La mise en place de liens vers nos contenus et documents est cependant est
      à privilégier par rapport à la reproduction sur un site tiers. La mention
      explicite du site source ara.numerique.gouv.fr est recommandée.
    </p>
    <div class="top-link">
      <TopLink />
    </div>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}

.top-link {
  text-align: end;
}
</style>
