<script setup lang="ts">
import PageMeta from "../../components/PageMeta";

const links = [
  { label: "Accueil", href: "/" },
  { label: "Ressources", href: "/ressources" },
  { label: "Glossaire", href: "/glossaire" },
  { label: "Outils", href: "/outils" },
  { label: "Formations accessibilité", href: "/formations-accessibilite" },
  { label: "Aide", href: "/aide" },
  { label: "Obligations légales", href: "/aide/obligations-legales" },
  { label: "RGAA", href: "/aide/rgaa" },
  {
    label: "Déclaration d’accessibilité",
    href: "/aide/declaration-accessibilite",
  },
  { label: "Schéma pluriannuel", href: "/aide/schema-pluriannuel" },
  { label: "Donner mon avis", href: "/donner-mon-avis" },
  { label: "Plan du site", href: "/plan-du-site" },
  { label: "Accessibilité", href: "/accessibilite" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Données personnelles", href: "/donnees-personnelles" },
];
</script>

<template>
  <PageMeta
    title="Plan du site"
    description="Plan du site confiture.numerique.gouv.fr."
  />

  <section class="fr-my-0 fr-mx-auto content">
    <h1>Plan du site</h1>

    <ul role="list" class="fr-pl-0 list">
      <li v-for="link in links" :key="link.href">
        <RouterLink
          class="fr-link fr-fi-arrow-right-line fr-link--icon-right"
          :to="link.href"
        >
          {{ link.label }}
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}

.list {
  list-style-type: none;
  padding-inline-start: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
