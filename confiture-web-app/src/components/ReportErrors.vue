<script setup lang="ts">
import { ref } from "vue";
import slugify from "slugify";

import { useReportStore } from "../store";
import { formatUserImpact, formatStatus } from "../utils";
import { CriterionResultUserImpact, CriteriumResultStatus } from "../types";
import rgaa from "../criteres.json";

const report = useReportStore();

const errorsCount = ref(34);
const status = ref(CriteriumResultStatus.NOT_COMPLIANT);
const userImpact = ref(CriterionResultUserImpact.BLOCKING);

function expandAll() {
  console.log("expandAll");
}

function getPageSlug(pageName: string) {
  return slugify(pageName, { lower: true });
}

function getCriteriumUniqueId(
  pageName: string,
  topicNumber: number,
  criteriumNumber: number,
  suffix?: string
): string {
  return `${getPageSlug(pageName)}-${topicNumber}-${criteriumNumber}${
    suffix ? `-${suffix}` : null
  }`;
}
</script>

<template>
  <div class="fr-mb-6w header">
    <span class="fr-mb-0 fr-text--xl fr-text--bold"
      >{{ errorsCount }} erreurs d’accessibilité</span
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
                :href="`#${getPageSlug(report.data.pageDistributions[0].name)}`"
                target="_self"
                aria-current="page"
                >{{ report.data.pageDistributions[0].name }}</a
              >
            </li>
            <li
              v-for="page in report.data.pageDistributions.slice(1)"
              :key="page.name"
              class="fr-sidemenu__item"
            >
              <a
                class="fr-sidemenu__link"
                :href="`#${getPageSlug(page.name)}`"
                target="_self"
                >{{ page.name }}</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div>
      <section
        v-for="page in report.data.pageDistributions"
        :key="page.name"
        class="fr-mb-8w"
      >
        <h3 :id="`${getPageSlug(page.name)}`" class="fr-mb-4w page-title">
          {{ page.name }}
        </h3>

        <div v-for="topic in rgaa.topics" :key="topic.number" class="fr-mb-9v">
          <p class="fr-tag fr-tag--sm fr-mb-3w">{{ topic.topic }}</p>
          <p
            class="fr-text--lg fr-text--bold fr-mb-2w"
            v-html="
              '1.1 Chaque image porteuse d’information a-t-elle une alternative textuelle ?'
            "
          />
          <!-- FIXME: tags like this are not customizable (color) -->
          <ul class="fr-tags-group fr-mb-2w">
            <li>
              <p class="fr-tag">{{ formatStatus(status) }}</p>
            </li>
            <li>
              <p class="fr-tag">{{ formatUserImpact(userImpact) }}</p>
            </li>
          </ul>

          <!-- Error -->
          <section class="fr-accordion">
            <h4 class="fr-accordion__title">
              <button
                class="fr-accordion__btn"
                aria-expanded="false"
                :aria-controls="
                  getCriteriumUniqueId(page.name, topic.number, 1, 'error')
                "
              >
                Erreur
              </button>
            </h4>
            <div
              :id="getCriteriumUniqueId(page.name, topic.number, 1, 'error')"
              class="fr-collapse"
            >
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
            </div>
          </section>

          <!-- Recommendation -->
          <section class="fr-accordion">
            <h4 class="fr-accordion__title">
              <button
                class="fr-accordion__btn"
                aria-expanded="false"
                :aria-controls="
                  getCriteriumUniqueId(
                    page.name,
                    topic.number,
                    1,
                    'recommendation'
                  )
                "
              >
                Recommandation de correction
              </button>
            </h4>
            <div
              :id="
                getCriteriumUniqueId(
                  page.name,
                  topic.number,
                  1,
                  'recommendation'
                )
              "
              class="fr-collapse"
            >
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam
              commodi cumque consequuntur est. Nulla pariatur quo molestiae
              ipsam ut dicta dignissimos repellendus, accusamus velit corporis
              iste cumque adipisci doloribus odit?
            </div>
          </section>
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

.error-accordion-subtitle {
  color: var(--text-mention-grey);
}
</style>
