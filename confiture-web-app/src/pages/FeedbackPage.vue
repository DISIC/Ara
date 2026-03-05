<script setup lang="ts">
import ky from "ky";
import { ref } from "vue";
import { useRouter } from "vue-router";

import emojiMedium from "../assets/images/emoji-medium.svg";
import emojiNo from "../assets/images/emoji-no.svg";
import emojiYes from "../assets/images/emoji-yes.svg";
import greenCheck from "../assets/images/green-check.svg";
import PageMeta from "../components/PageMeta";
import DsfrFieldWithValidation from "../components/validation/DsfrFieldWithValidation.vue";
import FieldValidation from "../components/validation/FieldValidation.vue";
import FormWithValidation from "../components/validation/form-with-validation/FormWithValidation.vue";
import { useNotifications } from "../composables/useNotifications";
import { usePreviousRoute } from "../composables/usePreviousRoute";
import { ARRAY_LENGTH, EMAIL, REQUIRED } from "../composables/validation";
import { DEFAULT_NOTIFICATION_ERROR_DESCRIPTION } from "../enums";
import { paths } from "../types/confiture-api";
import { captureWithPayloads } from "../utils";

export type CreateFeedbackRequestData =
  paths["/feedback"]["post"]["requestBody"]["content"]["application/json"];

const availableRadioAnswers = [
  { label: "Oui", slug: "yes", emoji: emojiYes },
  { label: "Moyen", slug: "medium", emoji: emojiMedium },
  { label: "Non", slug: "no", emoji: emojiNo }
];

const availableJobs = [
  "Designer (ou lead)",
  "Développeur / Développeuse (ou lead)",
  "Chef / Cheffe de projet (product manager)",
  "Chef / Cheffe de produit (product owner)",
  "Auditeur / Auditrice accessibilité",
  "Référent / Référente accessibilité",
  "Autre"
];

const easyToUse = ref<CreateFeedbackRequestData["easyToUse"] | null>(null);
const easyToUnderstand = ref<CreateFeedbackRequestData["easyToUnderstand"] | null>(null);
const feedback = ref("");
const suggestions = ref("");
const contact = ref();
const name = ref("");
const email = ref("");
const occupations = ref<string[]>([]);

function handleOccupationsChange(it: string, value: boolean) {
  if (value && !occupations.value.includes(it)) {
    occupations.value.push(it);
  }

  if (!value && occupations.value.includes(it)) {
    occupations.value = occupations.value.filter(v => v !== it);
  }
}

const showSuccess = ref(false);

const notify = useNotifications();
/**
 * Submit form and display success notice
 */
function submitFeedback() {
  const body: CreateFeedbackRequestData = {
    easyToUse: easyToUse.value!,
    easyToUnderstand: easyToUnderstand.value!,
    feedback: feedback.value,
    suggestions: suggestions.value,
    ...(contact.value === "yes" && {
      email: email.value,
      name: name.value,
      occupations:
        // FIXME: the @nestjs/swagger CLI plugin generating the API types doesnt seem to pick up on the each option
        // see: https://github.com/nestjs/swagger/issues/2027
        occupations.value as unknown as CreateFeedbackRequestData["occupations"]
    })
  };

  ky.post("/api/feedback", {
    json: body
  })
    .then(() => {
      showSuccess.value = true;
    })
    .catch((err) => {
      notify(
        "error",
        "Échec de l'envoi de vos retours",
        DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
      );
      captureWithPayloads(err);
    });
}
const router = useRouter();

const { route, url } = usePreviousRoute();
const previousPageUrl = url ?? router.resolve({ name: "home" }).href;
const previousPageName =
  (typeof route?.meta.name === "function"
    ? route?.meta.name()
    : route?.meta.name) ?? "précédente";
</script>

<template>
  <PageMeta
    title="Donner mon avis"
    description="Contribuez à l’amélioration de l’outil Ara en donnant votre avis."
  />

  <h1 class="fr-mb-3w">Donner mon avis</h1>
  <div aria-live="polite" aria-atomic="true" role="alert">
    <template v-if="showSuccess">
      <p class="fr-h3 success-title">
        <img class="fr-mr-2w" :src="greenCheck" alt="">
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
        Retour à la page {{ previousPageName }}
      </RouterLink>
    </template>
  </div>

  <FormWithValidation v-if="!showSuccess" class="content" @submit="submitFeedback">
    <p class="fr-text--sm fr-mb-4w mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires
    </p>

    <FieldValidation
      v-slot="{ error, focusRef }"
      :value="easyToUse"
      :validation="[REQUIRED('Sélection obligatoire. Indiquez si le site est facile à utiliser.')]"
    >
      <fieldset
        :ref="focusRef"
        tabindex="-1"
        aria-describedby="easy-to-use-error"
        class="fr-fieldset fr-fieldset--inline"
        :class="{ 'fr-fieldset--error': error }"
      >
        <legend class="fr-fieldset__legend fr-text--regular">
          Ce site est-il facile à utiliser ?
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
            >
            <label class="fr-label" :for="`easy-to-use-${answer.slug}`">
              {{ answer.label }}
            </label>
            <div class="fr-radio-rich__img">
              <img class="fr-p-2w" :src="answer.emoji" alt="">
            </div>
          </div>
        </div>
        <div v-if="error" id="easy-to-use-error" class="fr-messages-group">
          <p class="fr-message fr-message--error">{{ error }}</p>
        </div>
      </fieldset>
    </FieldValidation>

    <FieldValidation
      v-slot="{ error, focusRef }"
      :value="easyToUnderstand"
      :validation="[REQUIRED('Sélection obligatoire. Indiquez si le langage employé sur le site est facile à comprendre.')]"
    >
      <fieldset
        :ref="focusRef"
        tabindex="-1"
        aria-describedby="easy-to-understand-error"
        class="fr-fieldset fr-fieldset--inline"
        :class="{ 'fr-fieldset--error': error }"
      >
        <legend class="fr-fieldset__legend fr-text--regular">
          Le langage employé est-il facile à comprendre ?
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
            >
            <label class="fr-label" :for="`easy-to-understand-${answer.slug}`">
              {{ answer.label }}
            </label>
            <div class="fr-radio-rich__img">
              <img class="fr-p-2w" :src="answer.emoji" alt="">
            </div>
          </div>
        </div>
        <div v-if="error" id="easy-to-understand-error" class="fr-messages-group">
          <p class="fr-message fr-message--error">{{ error }}</p>
        </div>
      </fieldset>
    </FieldValidation>

    <div class="fr-input-group fr-mb-4w narrow-content">
      <DsfrFieldWithValidation
        id="general-feedback"
        v-model="feedback"
        label="Quelles sont vos remarques générales ?"
        hint="Indiquez ce que vous aimez, n'aimez pas ou les problèmes rencontrés."
        is-text-area
        :validation="[REQUIRED('Champ obligatoire. Indiquez vos remarques générales.')]"
      />
    </div>

    <div class="fr-input-group fr-mb-4w narrow-content">
      <DsfrFieldWithValidation
        id="changes"
        v-model="suggestions"
        label="Que changeriez-vous ou ajouteriez-vous ?"
        hint="Indiquez vos besoins ou proposez-nous vos idées d'amélioration."
        is-text-area
        :validation="[REQUIRED('Champ obligatoire. Indiquez ce que vous ajouteriez ou changeriez.')]"
      />
    </div>

    <div>
      <div class="fr-form-group fr-mb-4w narrow-content">
        <fieldset class="fr-fieldset">
          <legend class="fr-fieldset__legend fr-text--regular">
            Si besoin, acceptez-vous d’être contacté par l’équipe de conception ?
            <span class="fr-hint-text">Nous pourrions vous soliciter pour des
              tests utilisateur ou pour échanger sur vos besoins</span>
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
              >
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
              >
              <label class="fr-label" for="contact-no">Non</label>
            </div>
          </div>
        </fieldset>
      </div>

      <template v-if="contact === 'yes'">
        <DsfrFieldWithValidation
          id="name"
          v-model="name"
          class="narrow-content"
          type="text"
          label="Prénom et nom"
          :validation="[REQUIRED('Champ obligatoire. Saisissez votre prénom et nom.')]"
        />

        <DsfrFieldWithValidation
          id="email"
          v-model="email"
          class="narrow-content"
          type="email"
          label="Adresse e-mail"
          hint="Format attendu : nom@domaine.fr"
          :validation="[
            REQUIRED('Champ obligatoire. Saisissez votre adresse e-mail.'),
            EMAIL('Format incorrect. Utilisez le format : nom@domaine.fr.')
          ]"
        />

        <FieldValidation
          v-slot="{ error, focusRef }"
          :validation="[ARRAY_LENGTH(1, 'Sélection obligatoire. Indiquez votre ou vos fonctions.')]"
          :value="occupations"
        >
          <fieldset
            :ref="focusRef"
            tabindex="-1"
            aria-describedby="occupations-error"
            class="fr-fieldset narrow-content"
            :class="{ 'fr-fieldset--error': error }"
          >
            <legend class="fr-fieldset__legend fr-text--regular">
              Fonction(s)
              <span class="fr-hint-text">Sélectionnez une ou plusieurs fonctions que vous exercez.</span>
            </legend>
            <div class="fr-fieldset__content">
              <div
                v-for="job in availableJobs"
                :key="job"
                class="fr-checkbox-group"
              >
                <input
                  :id="`job-${job}`"
                  type="checkbox"
                  :name="`job-${job}`"
                  :value="job"
                  :checked="occupations.includes(job)"
                  @change="handleOccupationsChange(
                    job,
                    ($event.target as HTMLInputElement).checked)
                  "
                >
                <label class="fr-label" :for="`job-${job}`">{{ job }}</label>
              </div>
            </div>
            <div v-if="error" id="occupations-error" class="fr-messages-group">
              <p class="fr-message fr-message--error">{{ error }}</p>
            </div>
          </fieldset>
        </FieldValidation>
      </template>
    </div>

    <p class="fr-text--sm fr-mb-5w data-notice">
      Les données recueillies sur ce formulaire sont traitées par les équipes de
      la DINUM. Elles nous permettent d’améliorer ce site et de vous recontacter
      si besoin par e-mail pour approndires vos remarques, ou vous solliciter
      pour des tests usagers dans le cas où vous auriez accepté d’être
      recontacté. Conformément à la règlementation, vous disposez d’un droit
      d’opposition et d’un droit à la limitation du traitement de données vous
      concernant, ainsi que d’un droit d’accès, de rectification, de portabilité
      et d’effacement de vos données. Vous pouvez exercer vos droits en nous
      écrivant par e-mail à l’adresse suivante :
      ara@design.numerique.gouv.fr.
    </p>
    <button class="fr-btn fr-mb-5w" type="submit">Envoyer mon avis</button>
  </FormWithValidation>

  <a
    v-if="!showSuccess"
    class="fr-link fr-icon-arrow-up-fill fr-link--icon-left"
    href="#header"
  >Haut de page</a>
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
