<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import hammerIllustration from "../../assets/images/onboarding-hammer.svg";
import handsIllustration from "../../assets/images/onboarding-hands.svg";
import magnifierIllustration from "../../assets/images/onboarding-magnifier.svg";
import uploadIllustration from "../../assets/images/onboarding-upload.svg";
import StatDonut from "../StatDonut.vue";
import DsfrModal from "../ui/DsfrModal.vue";

const props = defineProps<{
  accessibilityRate: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const modal = ref<InstanceType<typeof DsfrModal>>();

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});

const steps = computed(() => [
  {
    title: "Bienvenue sur votre rapport d’audit",
    subTitle: "",
    // FIXME: different wording when accessibility rate is low ?
    text: `Le taux d’accessibilité de votre site est de ${props.accessibilityRate}%, on peut faire encore mieux et pour ça nous allons vous aider !`,
    illustration: `url(${uploadIllustration})`
  },
  {
    title: "Je mets en ligne la déclaration d’accessibilité",
    subTitle: "Par quoi commencer ?",
    text: "Vous pouvez dès maintenant mettre la déclaration d’accessibilité fournie avec ce rapport sur votre site.",
    illustration: `url(${uploadIllustration})`
  },
  {
    title: "Je corrige les erreurs relevées",
    subTitle: "Ensuite ?",
    text: "Prioriser, corriger, tester. Vous trouverez dans ce rapport toutes les informations nécessaires pour vous aider dans chacune de ces tâches.",
    illustration: `url(${hammerIllustration})`
  },
  {
    subTitle: "Et après ?",
    title: "Je réalise un contre-audit",
    text: "Une fois les erreurs corrigées, il sera temps de réaliser un contre-audit pour connaitre le nouveau taux d’accessibilité de votre site.",
    illustration: `url(${magnifierIllustration})`
  },
  {
    title: "Je peux trouver de l’aide",
    subTitle: "Et si jamais ?",
    text: "L’<strong>auditeur</strong> ou l’<strong>auditrice</strong> qui a réalisé cet audit peut vous aider, n’hésitez pas à lui écrire. Vous pouvez aussi trouver de l’aide à tout moment depuis la <strong>page Aide</strong>.",
    illustration: `url(${handsIllustration})`
  }
]);

const currentStep = ref(0);
const contentEl = ref<HTMLDivElement>();

const previousStep = () => {
  currentStep.value = Math.max(0, currentStep.value - 1);
};

const nextStep = () => {
  if (currentStep.value === 4) {
    modal.value?.hide();
  }

  currentStep.value = Math.min(4, currentStep.value + 1);
};

watch(currentStep, () => {
  // reset focus on the modal content when text changes
  contentEl.value?.focus();
});
</script>

<template>
  <DsfrModal
    id="onboarding-modal"
    ref="modal"
    aria-label="Bienvenue sur votre rapport d’audit"
    @closed="emit('close')"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-link--close fr-link"
                title="Fermer la fenêtre modale"
                aria-controls="onboarding-modal"
              >
                Fermer
              </button>
            </div>

            <div ref="contentEl" class="fr-modal__content" tabindex="-1">
              <div class="content">
                <h1 class="fr-sr-only">{{ steps[0].title }}</h1>

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
                    '--illustration': steps[currentStep].illustration
                  }"
                ></div>

                <p class="fr-text--xs content-sub-title">
                  {{ steps[currentStep].subTitle }}
                </p>

                <p
                  class="fr-modal__title content-title"
                  :aria-hidden="currentStep === 0"
                >
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
  </DsfrModal>
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
