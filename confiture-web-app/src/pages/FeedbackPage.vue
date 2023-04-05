<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { createFeedback } from "../api";
import emojiYes from "../assets/images/emoji-yes.svg";
import emojiMedium from "../assets/images/emoji-medium.svg";
import emojiNo from "../assets/images/emoji-no.svg";
import greenCheck from "../assets/images/green-check.svg";
import { usePreviousRoute } from "../composables/usePreviousRoute";
import PageMeta from "../components/PageMeta";

const availableRadioAnswers = [
  { label: "Oui", slug: "yes", emoji: emojiYes },
  { label: "Moyen", slug: "medium", emoji: emojiMedium },
  { label: "Non", slug: "no", emoji: emojiNo },
];

const availableJobs = [
  "Designer (ou lead)",
  "Développeur / Développeuse (ou lead)",
  "Chef / Cheffe de projet (product manager)",
  "Chef / Cheffe de produit (product owner)",
  "Auditeur / Auditrice accessibilité",
  "Référent·es accessibilité",
  "Autre",
];

const easyToUse = ref("");
const easyToUnderstand = ref("");
const feedback = ref("");
const suggestions = ref("");
const contact = ref();
const name = ref("");
const email = ref("");
const occupations = ref([]);

const showSuccess = ref(false);

/**
 * Submit form and display success notice
 */
function submitFeedback() {
  createFeedback({
    easyToUse: easyToUse.value,
    easyToUnderstand: easyToUnderstand.value,
    feedback: feedback.value,
    suggestions: suggestions.value,
    ...(contact.value === "yes" && {
      email: email.value,
      name: name.value,
      occupations: occupations.value,
    }),
  }).then(() => {
    showSuccess.value = true;
  });
  // TODO: handle error
}
const router = useRouter();

const { route, url } = usePreviousRoute();
const previousPageUrl = url ?? router.resolve({ name: "home" }).href;
const previousPageName = route?.meta.name ?? "précédente";
</script>

<template>
  <PageMeta
    title="Donner mon avis"
    description="Contribuez à l’amélioration de l’outil Ara en donnant votre avis."
  />

  <h1 class="fr-mb-6w">Donner mon avis</h1>
  <div aria-live="polite" aria-atomic="true" role="alert">
    <template v-if="showSuccess">
      <p class="fr-h3 success-title">
        <img class="fr-mr-2w" :src="greenCheck" alt="" />
        Votre avis a bien été envoyé
      </p>
      <p>
        Nous vous remercions pour le temps que vous avez pris, tous les avis
        partagés seront étudiés.
      </p>
      <RouterLink
        class="fr-link fr-icon-arrow-left-line fr-link--icon-left"
        :to="previousPageUrl"
      >
        Retourner à la page {{ previousPageName }}
      </RouterLink>
    </template>
  </div>
  <form v-if="!showSuccess" class="content" @submit.prevent="submitFeedback">
    <p class="fr-text--sm mandatory-notice">
      Sauf mentions contraires, tous les champs sont obligatoires
    </p>

    <section class="fr-form-group">
      <fieldset class="fr-fieldset fr-fieldset--inline">
        <legend class="fr-fieldset__legend fr-text--regular">
          <h2 class="fr-text--md fr-text--bold fr-mb-3w">
            Ce site est-il facile à utiliser ?
          </h2>
        </legend>
        <div
          v-for="answer in availableRadioAnswers"
          :key="answer.slug"
          class="fr-fieldset__element fr-fieldset__element--inline"
        >
          <div class="fr-radio-group fr-radio-rich">
            <input
              :id="`easy-to-use-${answer.slug}`"
              v-model="easyToUse"
              type="radio"
              name="easyToUse"
              :value="answer.label"
            />
            <label class="fr-label" :for="`easy-to-use-${answer.slug}`">
              {{ answer.label }}
            </label>
            <div class="fr-radio-rich__img">
              <img class="fr-p-2w" :src="answer.emoji" alt="" />
            </div>
          </div>
        </div>
      </fieldset>
    </section>

    <section class="fr-form-group">
      <fieldset class="fr-fieldset fr-fieldset--inline">
        <legend class="fr-fieldset__legend fr-text--regular">
          <h2 class="fr-text--md fr-text--bold fr-mb-3w">
            Le langage employé est-il facile à comprendre ?
          </h2>
        </legend>
        <div
          v-for="answer in availableRadioAnswers"
          :key="answer.slug"
          class="fr-fieldset__element fr-fieldset__element--inline"
        >
          <div class="fr-radio-group fr-radio-rich">
            <input
              :id="`easy-to-understand-${answer.slug}`"
              v-model="easyToUnderstand"
              type="radio"
              name="easyToUnderstand"
              :value="answer.label"
            />
            <label class="fr-label" :for="`easy-to-understand-${answer.slug}`">
              {{ answer.label }}
            </label>
            <div class="fr-radio-rich__img">
              <img class="fr-p-2w" :src="answer.emoji" alt="" />
            </div>
          </div>
        </div>
      </fieldset>
    </section>

    <section class="fr-input-group fr-mb-4w narrow-content">
      <label class="fr-label" for="general-feedback">
        <h2 class="fr-text--md fr-text--bold fr-mb-1v">
          Quelles sont vos remarques générales ?
        </h2>
        <span class="fr-hint-text"
          >Vous pouvez détailler les problèmes que vous avez rencontrés ou
          simplement nous dire ce qui vous plaît ou vous déplait</span
        >
      </label>
      <textarea
        id="general-feedback"
        v-model="feedback"
        class="fr-input"
        required
      />
    </section>

    <section class="fr-input-group fr-mb-4w narrow-content">
      <label class="fr-label" for="changes">
        <h2 class="fr-text--md fr-text--bold fr-mb-1v">
          Que changeriez-vous ou ajouteriez-vous ?
        </h2>

        <span class="fr-hint-text">
          Vous pouvez exprimer vos besoins ou proposer vos idées d’amélioration
        </span>
      </label>
      <textarea id="changes" v-model="suggestions" class="fr-input" required />
    </section>

    <section>
      <div class="fr-form-group fr-mb-4w narrow-content">
        <fieldset class="fr-fieldset">
          <legend class="fr-fieldset__legend fr-text--regular">
            <h2 class="fr-text--md fr-text--bold fr-mb-1v">
              Si besoin, accepteriez-vous d’être contacté par l’équipe de
              conception ?
            </h2>
            <span class="fr-hint-text"
              >Nous pourrions vous soliciter pour des tests utilisateur ou pour
              échanger sur vos besoins</span
            >
          </legend>
          <div class="fr-fieldset__content">
            <div class="fr-radio-group">
              <input
                id="contact-yes"
                v-model="contact"
                type="radio"
                name="contact"
                value="yes"
                required
              />
              <label class="fr-label" for="contact-yes">Oui</label>
            </div>
            <div class="fr-radio-group">
              <input
                id="contact-no"
                v-model="contact"
                type="radio"
                name="contact"
                value="no"
                required
              />
              <label class="fr-label" for="contact-no">Non</label>
            </div>
          </div>
        </fieldset>
      </div>

      <template v-if="contact === 'yes'">
        <div class="fr-input-group narrow-content">
          <label class="fr-label" for="name">
            Je m’appelle

            <span class="fr-hint-text">Au format : Prénom Nom</span>
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="fr-input"
            required
          />
        </div>

        <div class="fr-input-group narrow-content">
          <label class="fr-label" for="email">
            Mon adresse e-mail

            <span class="fr-hint-text">Au format : prenom@domaine.fr</span>
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="fr-input"
            required
          />
        </div>

        <div class="fr-form-group narrow-content">
          <fieldset class="fr-fieldset">
            <legend class="fr-fieldset__legend fr-text--regular">
              Je suis
            </legend>
            <div class="fr-fieldset__content">
              <div
                v-for="job in availableJobs"
                :key="job"
                class="fr-checkbox-group"
              >
                <input
                  :id="`job-${job}`"
                  v-model="occupations"
                  type="checkbox"
                  :name="`job-${job}`"
                  :value="job"
                />
                <label class="fr-label" :for="`job-${job}`">{{ job }}</label>
              </div>
            </div>
          </fieldset>
        </div>
      </template>
    </section>

    <p class="fr-text--sm fr-mb-5w data-notice">
      Les données recueillies sur ce formulaire sont traitées par les équipes de
      la DINUM. Elles nous permettent d’améliorer ce site et de vous recontacter
      si besoin par e-mail pour approndires vos remarques, ou vous solliciter
      pour des tests usagers dans le cas où vous auriez accepté d’être
      recontacté. Conformément à la règlementation, vous disposez d’un droit
      d’opposition et d’un droit à la limitation du traitement de données vous
      concernant, ainsi que d’un droit d’accès, de rectification, de portabilité
      et d’effacement de vos données. Vous pouvez exercer vos droits en nous
      écrivant par e-mail à l’adresse suivante :
      contact@design.numerique.gouv.fr.
    </p>
    <button class="fr-btn fr-mb-5w" type="submit">Envoyer mon avis</button>
  </form>

  <a
    v-if="!showSuccess"
    class="fr-link fr-icon-arrow-up-fill fr-link--icon-left"
    href="#header"
    >Haut de page</a
  >
</template>

<style scoped>
.success-title {
  display: flex;
  align-items: center;
}

.content {
  max-width: 49.5rem;
}

.narrow-content {
  max-width: 30rem;
}

.mandatory-notice,
.data-notice {
  color: var(--text-mention-grey);
}

.check-icon {
  color: var(--text-default-success);
}
</style>
