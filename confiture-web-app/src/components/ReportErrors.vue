<script setup lang="ts">
import { computed } from "vue";
import slugify from "slugify";
import { groupBy, mapValues } from "lodash";
import { marked } from "marked";

import { useReportStore } from "../store";
import { formatUserImpact, formatStatus } from "../utils";
import { CriteriumResultStatus } from "../types";
import CriteriumTestsAccordion from "./CriteriumTestsAccordion.vue";
import LazyAccordion from "./LazyAccordion.vue";
import rgaa from "../criteres.json";

const report = useReportStore();

/*
[{
  pageUrl: "https://example.com",
  pageName: "Accueil"
  topics: [{
    topic: 2,
    name: "Cadres",
    errors: [{ ... }]
  }]
}]

*/

const errors = computed(() => {
  // TODO: make more legible
  const data = Object.values(
    mapValues(
      groupBy(
        report.data.results.filter(
          (r) => r.status === CriteriumResultStatus.NOT_COMPLIANT
        ),
        "pageUrl"
      ),
      (results, pageUrl) => {
        return {
          pageUrl,
          pageName: getPageName(pageUrl),
          topics: Object.values(
            mapValues(groupBy(results, "topic"), (results, topicNumber) => {
              return {
                topic: topicNumber,
                name: getTopicName(Number(topicNumber)),
                errors: results,
              };
            })
          ),
        };
      }
    )
  );

  return data;
});

function expandAll() {
  console.log("expandAll");
}

function getTopicName(topicNumber: number) {
  return rgaa.topics.find((t) => t.number === topicNumber)?.topic;
}

function getCriterium(topicNumber: number, criteriumNumber: number) {
  const criterium = rgaa.topics
    .find((t) => t.number === topicNumber)
    // @ts-expect-error The criteria properties of each topic do not have the same signature. See: https://github.com/microsoft/TypeScript/issues/33591#issuecomment-786443978
    ?.criteria.find((c) => c.criterium.number === criteriumNumber).criterium;

  return criterium;
}

function getCriteriumTitle(topicNumber: number, criteriumNumber: number) {
  return marked.parseInline(getCriterium(topicNumber, criteriumNumber).title);
}

function getPageName(pageUrl: string) {
  return report.data.context.samples.find(
    (p: { name: string; url: string; number: number }) => p.url === pageUrl
  ).name;
}

function getPageSlug(pageUrl: string) {
  return slugify(getPageName(pageUrl), { lower: true });
}

function getCriteriumUniqueId(
  pageUrl: string,
  topicNumber: number,
  criteriumNumber: number,
  suffix?: string
): string {
  return `${getPageSlug(pageUrl)}-${topicNumber}-${criteriumNumber}${
    suffix ? `-${suffix}` : null
  }`;
}
</script>

<template>
  <div class="fr-mb-6w header">
    <span class="fr-mb-0 fr-text--xl fr-text--bold"
      >{{ errors.length }} erreurs d’accessibilité</span
    >
    <button class="fr-btn fr-btn--tertiary-no-outline" @click="expandAll">
      Tout déplier
    </button>
  </div>
  <div class="main">
    <nav class="fr-sidemenu" aria-label="Liste des pages">
      <div class="fr-sidemenu__inner">
        <button
          class="fr-sidemenu__btn"
          hidden
          aria-controls="fr-sidemenu-wrapper"
          aria-expanded="false"
        >
          Pages
        </button>
        <div id="fr-sidemenu-wrapper" class="fr-collapse">
          <div class="fr-sidemenu__title">Pages</div>
          <ul class="fr-sidemenu__list">
            <li class="fr-sidemenu__item fr-sidemenu__item--active">
              <!-- FIXME: seems there is an issue with anchor links inside tabs -->
              <a
                class="fr-sidemenu__link"
                :href="`#${getPageSlug(report.data.context.samples[0].url)}`"
                target="_self"
                aria-current="page"
                >{{ report.data.context.samples[0].name }}</a
              >
            </li>
            <li
              v-for="page in report.data.context.samples.slice(1)"
              :key="page.name"
              class="fr-sidemenu__item"
            >
              <a
                class="fr-sidemenu__link"
                :href="`#${getPageSlug(page.url)}`"
                target="_self"
                >{{ page.name }}</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div>
      <section v-for="page in errors" :key="page.pageUrl" class="fr-mb-8w">
        <h2
          :id="`${getPageSlug(page.pageUrl as string)}`"
          class="fr-mb-4w fr-h3 page-title"
        >
          {{ page.pageName }}
        </h2>

        <div
          v-for="(topic, i) in page.topics"
          :key="topic.topic"
          :class="{ 'fr-mt-9v': i !== 0 }"
        >
          <p class="fr-tag fr-tag--sm fr-mb-3w">
            {{ topic.name }}
          </p>
          <template v-for="(error, j) in topic.errors" :key="j">
            <p
              :class="[
                'fr-text--lg fr-text--bold criterium-title',
                { 'fr-mt-9v': j !== 0 },
              ]"
            >
              {{ error.topic }}.{{ error.criterium }}&nbsp;
              <span v-html="getCriteriumTitle(error.topic, error.criterium)" />
            </p>

            <!-- FIXME: tags like this are not customizable (color) -->
            <ul class="fr-tags-group fr-mb-2w">
              <li>
                <p class="fr-tag">{{ formatStatus(error.status) }}</p>
              </li>
              <li>
                <p class="fr-tag">{{ formatUserImpact(error.userImpact) }}</p>
              </li>
            </ul>

            <!-- Error -->
            <LazyAccordion title="Erreur">
              <p class="fr-mb-3w">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio
                saepe earum voluptates rem possimus rerum aut id tempora veniam
                quibusdam sint vero, iste quidem. Praesentium voluptate dolorem
                amet magnam quibusdam.
              </p>
              <p class="fr-text--xs fr-mb-1w error-accordion-subtitle">
                Exemple(s) d’erreur(s)
              </p>
              <div class="fr-container--fluid">
                <div class="fr-grid-row fr-grid-row--gutters">
                  <div class="fr-col-md-6 fr-col-12">
                    <img
                      style="width: 100%"
                      src="https://picsum.photos/id/123/300/200"
                      alt=""
                    />
                  </div>
                  <div class="fr-col-md-6 fr-col-12">
                    <img
                      style="width: 100%"
                      src="https://picsum.photos/id/43/300/200"
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <p class="fr-text--xs fr-mt-3w fr-mb-1w error-accordion-subtitle">
                URL de la page concernée
              </p>
              <p class="fr-mb-0">
                <a href="https://example.com" target="_blank" class="fr-link"
                  >https://example.com</a
                >
              </p>
            </LazyAccordion>

            <!-- Recommendation -->
            <LazyAccordion title="Recommandation de correction">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam
              commodi cumque consequuntur est. Nulla pariatur quo molestiae
              ipsam ut dicta dignissimos repellendus, accusamus velit corporis
              iste cumque adipisci doloribus odit?
            </LazyAccordion>

            <!-- Tests -->
            <CriteriumTestsAccordion
              :topic-number="error.topic"
              :criterium="getCriterium(error.topic, error.criterium)"
            />
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.main {
  display: flex;
  gap: 2rem;
}

.page-title {
  color: var(--text-active-blue-france);
}

.criterium-title {
  color: var(--text-title-grey);
}

.error-accordion-subtitle {
  color: var(--text-mention-grey);
}
</style>
