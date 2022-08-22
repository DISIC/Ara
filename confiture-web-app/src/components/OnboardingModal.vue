<script lang="ts" setup>
import { ref, computed, watch } from "vue";

import uploadIllustration from "../assets/images/onboarding-upload.svg";
import hammerIllustration from "../assets/images/onboarding-hammer.svg";
import magnifierIllustration from "../assets/images/onboarding-magnifier.svg";
import handsIllustration from "../assets/images/onboarding-hands.svg";
import StatDonut from "./StatDonut.vue";

const props = defineProps<{
  accessibilityRate: number;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
}>();

const modal = ref<HTMLDialogElement>();

watch(
  () => props.show,
  (show) => {
    // FIXME: wrapping calls to dsfr in setTimeout seems to fix the issue
    // of the dsfr modal not being initialized yet when dsfr() is called
    // immediately on mounted
    setTimeout(() => {
      if (show) {
        dsfr(modal.value).modal.disclose();
      } else {
        dsfr(modal.value).modal.conceal();
      }
    });
  },
  { immediate: true }
);

const steps = computed(() => [
  {
    title: "Bienvenue sur votre rapport d’audit",
    subTitle: "",
    // FIXME: different wording when accessibility rate is low ?
    text: `Wow ! Le taux d’accessibilité de votre site est de ${props.accessibilityRate}%, ce qui est super mais on peut faire encore mieux ! Et pour ça nous allons vous aider.`,
    illustration: `url(${uploadIllustration})`,
  },
  {
    title: "Je mets en ligne la déclaration d’accessibilité",
    subTitle: "Par quoi commencer ?",
    text: "Vous pouvez dès maintenant mettre la déclaration d’accessibilité fournis avec ce rapport sur votre site. ",
    illustration: `url(${uploadIllustration})`,
  },
  {
    title: "Je corrige les erreurs relevées",
    subTitle: "Ensuite ?",
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
    subTitle: "Et si jamais ?",
    text: "L’<strong>auditeur</strong> qui à réalisé cet audit peut vous aider, n’hésiter pas à lui écrire. Vous pouvez aussi trouver de l’aide à tout moment depuis la <strong>page Aide</strong> ou auprès de la <strong>communauté Slack</strong>.",
    illustration: `url(${handsIllustration})`,
  },
]);

const currentStep = ref(0);
const contentEl = ref<HTMLDivElement>();

const previousStep = () => {
  currentStep.value = Math.max(0, currentStep.value - 1);
};

const nextStep = () => {
  if (currentStep.value === 4) {
    emit("update:show", false);
  }

  currentStep.value = Math.min(4, currentStep.value + 1);
};

watch(currentStep, () => {
  // reset focus on the modal content when text changes
  contentEl.value?.focus();
});
</script>

<template>
  <Teleport to="body">
    <dialog
      id="fr-modal-1"
      ref="modal"
      aria-label="Bienvenue sur votre rapport d’audit"
      role="dialog"
      class="fr-modal"
      v-on="{
        'dsfr.conceal': () => $emit('update:show', false),
      }"
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

              <div ref="contentEl" class="fr-modal__content" tabindex="-1">
                <div class="content">
                  <StatDonut
                    v-if="currentStep === 0"
                    class="stat-donut"
                    :value="accessibilityRate"
                    :total="100"
                    unit="%"
                  />

                  <div
                    v-else
                    class="circle"
                    :style="{
                      '--illustration': steps[currentStep].illustration,
                    }"
                  ></div>

                  <p class="fr-text--xs content-sub-title">
                    {{ steps[currentStep].subTitle }}
                  </p>

                  <p class="fr-modal__title content-title">
                    {{ steps[currentStep].title }}
                  </p>
                  <p class="content-text" v-html="steps[currentStep].text"></p>
                  <div
                    class="steps"
                    :aria-label="`Étape ${currentStep + 1} sur ${steps.length}`"
                  >
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
                  class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left"
                >
                  <li>
                    <button
                      class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-arrow-left-s-line"
                      :disabled="currentStep === 0"
                      @click="previousStep"
                    >
                      Précedent
                    </button>
                  </li>
                  <li>
                    <button
                      class="fr-btn fr-btn--icon-right fr-icon-arrow-right-s-line"
                      @click="nextStep"
                    >
                      {{ currentStep === 4 ? "Accéder au rapport" : "Suivant" }}
                    </button>
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
  height: 20rem;
  grid-template-rows: 1fr auto auto 1fr;
  grid-template-columns: repeat(2, auto);
  grid-auto-flow: row;
  column-gap: 76px;
  row-gap: 1rem;
}

.stat-donut {
  font-size: 2rem;
}

.stat-donut,
.circle {
  width: 12rem;
  height: 12rem;
  grid-column: 1 / 2;
  grid-row: 1 / 5;
  align-self: center;
}

.circle {
  border-radius: 50%;
  background-color: #f5f5f5;
  background-image: var(--illustration);
  background-position: center;
  background-repeat: no-repeat;
}

.content-sub-title {
  align-self: flex-end;
}

.content-sub-title,
.content-title,
.content-text,
.steps {
  grid-column: 2 / 3;
  margin: 0;
}

.steps {
  display: flex;
  gap: 6px;
  align-self: center;
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
