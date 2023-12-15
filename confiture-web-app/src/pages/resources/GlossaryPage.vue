<script setup lang="ts">
import slugify from "slugify";
import { onMounted, ref } from "vue";

import TopLink from "../../components/ui/TopLink.vue";
import PageMeta from "../../components/PageMeta";

// TODO: fetch glossary from GitHub: https://github.com/DISIC/accessibilite.numerique.gouv.fr/blob/main/RGAA/4.1/glossaire.json
import glossary from "../../glossaire.json";

const letters = ref<string[]>([]);

onMounted(() => {
  setUniqueLetters();
});

/**
 * Loop over terms to get unique starting letters
 */
function setUniqueLetters() {
  const rawLetters = glossary.glossary.map((term) =>
    term.title[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );
  letters.value = [...new Set(rawLetters)];
}

/**
 * Check if the letter anchor should be rendered
 * @param {number} i index of term in glossary
 */
function renderLetterAnchor(i: number) {
  if (!glossary.glossary[i - 1]) return true;
  const currentStart = glossary.glossary[i].title[0];
  const previousStart = glossary.glossary[i - 1].title[0];

  return currentStart !== previousStart;
}

/**
 * Convert term title to a slug to use in URL
 * @param {string} title
 */
function getTermSlug(title: string) {
  return slugify(title, {
    lower: true,
    strict: false,
    remove: /[(),«»]/g
  }).replace(/[/']/g, "-");
}
</script>

<template>
  <PageMeta
    title="Glossaire"
    description="Tous les termes du glossaire du référentiel général d’amélioration de l’accessibilité."
  />

  <section class="fr-my-0 content">
    <RouterLink
      class="fr-link fr-icon-arrow-left-line fr-link--icon-left"
      to="/ressources"
    >
      Retourner à la page ressources
    </RouterLink>

    <h1 class="fr-mt-6w">Glossaire</h1>
    <ul class="letters fr-tags-group fr-mt-8w fr-mb-4w">
      <li v-for="letter in letters" :key="letter">
        <a class="fr-tag" :href="`#${letter.toLowerCase()}`">{{ letter }}</a>
      </li>
    </ul>

    <dl>
      <template v-for="(term, i) in glossary.glossary" :key="term.title">
        <dt>
          <span
            v-if="renderLetterAnchor(i)"
            :id="term.title[0].toLowerCase()"
          />
          <h2 :id="getTermSlug(term.title)" class="fr-h5">
            {{ term.title }}
            <a
              :href="`#${getTermSlug(term.title)}`"
              :title="`Lien vers ${term.title}`"
              class="term-link"
            >
              <span class="fr-icon-links-fill" />
            </a>
          </h2>
        </dt>
        <dd
          class="fr-m-0 fr-mb-4w fr-p-2w term-description"
          v-html="term.body"
        />
      </template>
    </dl>

    <TopLink />
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}

.term-description {
  background-color: var(--background-alt-blue-france);
}

.term-link {
  background-image: none;
  opacity: 0.6;
}

.term-link:hover {
  opacity: 1;
}
</style>
