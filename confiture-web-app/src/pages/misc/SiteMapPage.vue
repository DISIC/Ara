<script lang="ts">
interface SiteMapLink {
  label: string;
  name: string;
  children?: SiteMapLink[];
}
</script>

<script setup lang="ts">
import PageMeta from "../../components/PageMeta";
import { useAccountStore } from "../../store";

const accountStore = useAccountStore();

const links: SiteMapLink[] = [
  ...(accountStore.account?.email
    ? [
        { label: "Mes audits", name: "account-dashboard" },
        { label: "Mon compte", name: "account-settings" }
      ]
    : [{ label: "Accueil", name: "home" }]),
  { label: "Feuille de route", name: "roadmap" },
  { label: "Notes de version", name: "changelog" },
  { label: "Donner mon avis", name: "feedback" },
  { label: "Plan du site", name: "site-map" },
  { label: "Accessibilité", name: "accessibility" },
  { label: "Mentions légales", name: "legal" },
  { label: "Données personnelles", name: "privacy" },
  { label: "Contact et contributions", name: "contact" }
];
</script>

<template>
  <PageMeta
    title="Plan du site"
    description="Plan du site ara.numerique.gouv.fr."
  />

  <section class="fr-my-0 fr-mx-auto content">
    <h1>Plan du site</h1>

    <ul role="list" class="fr-pl-0 list">
      <li v-for="link in links" :key="link.name" class="">
        <RouterLink
          class="fr-link fr-fi-arrow-right-line fr-link--icon-right"
          :to="{ name: link.name }"
        >
          {{ link.label }}
        </RouterLink>
        <ul v-if="link.children" role="list" class="fr-pl-2w fr-mt-2w list">
          <li v-for="subLink in link.children" :key="subLink.name">
            <RouterLink
              class="fr-link fr-fi-arrow-right-line fr-link--icon-right fr-text--sm"
              :to="{ name: subLink.name }"
            >
              {{ subLink.label }}
            </RouterLink>

            <ul
              v-if="subLink.children"
              role="list"
              class="fr-pl-2w fr-mt-2w list"
            >
              <li v-for="subSubLink in subLink.children" :key="subSubLink.name">
                <RouterLink
                  class="fr-link fr-fi-arrow-right-line fr-link--icon-right fr-text--sm"
                  :to="{ name: subSubLink.name }"
                >
                  {{ subSubLink.label }}
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>
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
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.list .list {
  gap: 1rem;
}
</style>
