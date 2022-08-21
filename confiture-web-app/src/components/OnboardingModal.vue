<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";

import uploadIllustration from "../assets/images/onboarding-upload.svg";
import hammerIllustration from "../assets/images/onboarding-hammer.svg";
import magnifierIllustration from "../assets/images/onboarding-magnifier.svg";
import handsIllustration from "../assets/images/onboarding-hands.svg";

const modal = ref<HTMLDialogElement>();

onMounted(() => {
  setTimeout(() => {
    dsfr(modal.value).modal.disclose();
  });
});

const STEPS = [
  {
    title: "Bienvenue sur votre rapport d’audit",
    subTitle: "",
    // TODO: accessibility
    text: "Wow ! Le taux d’accessibilité de votre site est de 82%, ce qui est super mais on peut faire encore mieux ! Et pour ça nous allons vous aider.",
    illustration: `url(${uploadIllustration})`,
  },
  {
    title: "Je mets en ligne la déclaration d’accessibilité",
    subTitle: "Par quoi commencer ? ",
    text: "Vous pouvez dès maintenant mettre la déclaration d’accessibilité fournis avec ce rapport sur votre site. ",
    illustration: `url(${uploadIllustration})`,
  },
  {
    title: "Je corrige les erreurs relevées",
    subTitle: "Ensuite ? ",
    text: "Prioriser, corriger, tester. Vous trouverez dans ce rapport toutes les informations nécessaires pour vous aider dans chacune de ses tâches.",
    illustration: `url(${hammerIllustration})`,
  },
  {
    subTitle: "Et après ?",
    title: "Je réalise un contre-audit",
    text: "Une fois les erreurs corrigées, il sera temps de réaliser un contre-audit pour connaitre le nouveau taux d’accessibilité de votre site.",
    illustration: `url(${magnifierIllustration})`,
  },
  {
    title: "Je peux trouver de l’aide",
    subTitle: "Et si jamais ? ",
    // TODO: bold text
    text: "L’auditeur qui à réalisé cet audit peut vous aider, n’hésiter pas à lui écrire. Vous pouvez aussi trouver de l’aide à tout moment depuis la page Aide ou auprès de la communauté Slack.",
    illustration: `url(${handsIllustration})`,
  },
];

const currentStep = ref(0);

const previousStep = () => {
  currentStep.value = Math.max(0, currentStep.value - 1);
};

const nextStep = () => {
  if (currentStep.value === 4) {
    dsfr(modal.value).modal.conceal();
  }

  currentStep.value = Math.min(4, currentStep.value + 1);
};
</script>

<template>
  <Teleport to="body">
    <dialog
      id="fr-modal-1"
      ref="modal"
      aria-label="Bienvenue sur votre rapport d’audit"
      role="dialog"
      class="fr-modal"
    >
      <div class="fr-container fr-container--fluid fr-container-md">
        <div class="fr-grid-row fr-grid-row--center">
          <div class="fr-col-12 fr-col-md-8">
            <div class="fr-modal__body">
              <div class="fr-modal__header">
                <button
                  class="fr-link--close fr-link"
                  title="Fermer la fenêtre modale"
                  aria-controls="fr-modal-1"
                >
                  Fermer
                </button>
              </div>
              <div class="fr-modal__content">
                <div class="content">
                  <div
                    class="circle"
                    :style="{
                      '--illustration': STEPS[currentStep].illustration,
                    }"
                  ></div>

                  <p class="fr-text--xs content-sub-title">
                    {{ STEPS[currentStep].subTitle }}
                  </p>

                  <p class="fr-modal__title content-title">
                    {{ STEPS[currentStep].title }}
                  </p>
                  <p class="content-text">
                    {{ STEPS[currentStep].text }}
                  </p>
                  <div class="steps">
                    <div
                      v-for="i in 5"
                      :key="i"
                      :class="{ 'active-step': i === currentStep + 1 }"
                    />
                  </div>
                </div>
              </div>
              <div class="fr-modal__footer">
                <ul
                  class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left"
                >
                  <li>
                    <button
                      class="fr-btn fr-btn--secondary"
                      @click="previousStep"
                    >
                      Précedent
                    </button>
                  </li>
                  <li>
                    <button class="fr-btn" @click="nextStep">Suivant</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.content {
  display: grid;
  grid-template-rows: auto auto 12rem auto;
  grid-template-columns: repeat(2, auto);
  grid-auto-flow: row;
  column-gap: 76px;
}
.circle {
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  background-color: #f5f5f5;
  grid-column: 1 / 2;
  grid-row: 1 / 4;
  align-self: center;
  background-image: var(--illustration);
  background-position: center;
  background-repeat: no-repeat;
}

.content-sub-title,
.content-title,
.content-text,
.steps {
  grid-column: 2 / 3;
}

.steps {
  display: flex;
  gap: 6px;
}

.steps > * {
  width: 28px;
  height: 8px;
  background-color: #eeeeee;
}

.active-step {
  background-color: var(--background-action-high-blue-france);
}
</style>
