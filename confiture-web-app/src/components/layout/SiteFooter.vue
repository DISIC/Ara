<script setup lang="ts">
import { useDebugStore } from "../../store";
import AraLogo from "../ui/AraLogo.vue";
import ThemeModal from "./ThemeModal.vue";

const debugStore = useDebugStore();

function switchDevMode() {
  debugStore.saveDevMode(!debugStore.devMode);
}
</script>

<template>
  <footer id="footer" class="fr-footer fr-mt-auto" role="contentinfo">
    <div class="fr-container">
      <div class="fr-footer__body">
        <div class="fr-footer__brand">
          <AraLogo variant="footer" />
        </div>
        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">
            Cet outil est basé sur la solution

            <a
              class="fr-link fr-text--sm"
              href="https://github.com/DISIC/Ara"
              target="_blank"
            >Ara</a>, sous
            <a
              class="fr-link fr-text--sm"

              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              target="_blank"
            >licence etalab-2.0</a>

            développée par <a
              class="fr-link fr-text--sm"
              href="https://design.numerique.gouv.fr/"
              target="_blank"
            >DesignGouv<span class="fr-sr-only">(nouvelle fenêtre)</span></a>.

            Les rapports d'audit ne sont pas en accès libre et ne sont partagés à aucun tiers.
          </p>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://ara.numerique.gouv.fr/"
                target="_blank"
              >ara.numerique.gouv.fr
                <span class="fr-sr-only">(nouvelle fenêtre)</span></a>
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://www.talan.com/france/fr"
                target="_blank"
              >talan.com
                <span class="fr-sr-only">(nouvelle fenêtre)</span></a>
            </li>
          </ul>
        </div>
        <div class="footer-actions">
          <button
            class="fr-footer__bottom-link fr-fi-theme-fill fr-link--icon-left"
            aria-controls="fr-theme-modal"
            data-fr-opened="false"
          >
            Paramètres d'affichage
          </button>
          <button
            v-if="debugStore.allowDevMode"
            type="button"
            class="fr-footer__bottom-link fr-icon-computer-line fr-link--icon-left"
            @click="switchDevMode"
          >
            <template v-if="debugStore.devMode">Désactiver le mode développeur</template>
            <template v-else>Activer le mode développeur</template>
          </button>
        </div>
      </div>
    </div>
  </footer>
  <ThemeModal />
</template>

<style scoped>
.footer-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

@media (width >= 62em) {
  .footer-actions {
    margin-left: auto;
  }
}

@media (width < 768px) {
  .fr-footer__brand {
    margin: auto;
  }
}
</style>
