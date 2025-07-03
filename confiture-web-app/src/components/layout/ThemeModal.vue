<script setup lang="ts">
import dark from "@gouvfr/dsfr/dist/artwork/dark.svg";
import light from "@gouvfr/dsfr/dist/artwork/light.svg";
import system from "@gouvfr/dsfr/dist/artwork/system.svg";
</script>

<template>
  <dialog
    id="fr-theme-modal"
    class="fr-modal"
    role="dialog"
    aria-labelledby="fr-theme-modal-title"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-6 fr-col-lg-4">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                aria-controls="fr-theme-modal"
                title="Fermer"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="fr-theme-modal-title" class="fr-modal__title">
                Paramètres d’affichage
              </h1>
              <div id="fr-display" class="fr-display">
                <div class="fr-form-group">
                  <fieldset class="fr-fieldset">
                    <legend
                      id="-legend"
                      class="fr-fieldset__legend fr-text--regular"
                    >
                      Choisissez un thème pour personnaliser l’apparence du
                      site.
                    </legend>
                    <div class="fr-fieldset__content">
                      <div class="fr-radio-group fr-radio-rich">
                        <input
                          id="fr-radios-theme-light"
                          value="light"
                          type="radio"
                          name="fr-radios-theme"
                        />
                        <label class="fr-label" for="fr-radios-theme-light">
                          Thème clair
                        </label>
                        <div class="fr-radio-rich__img">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="fr-artwork"
                            width="80px"
                            height="80px"
                            viewBox="0 0 80 80"
                          >
                            <use
                              class="fr-artwork-decorative"
                              :xlink:href="`${light}#artwork-decorative`"
                            ></use>
                            <use
                              class="fr-artwork-minor"
                              :xlink:href="`${light}#artwork-minor`"
                            ></use>
                            <use
                              class="fr-artwork-major"
                              :xlink:href="`${light}#artwork-major`"
                            ></use>
                          </svg>
                        </div>
                      </div>
                      <div class="fr-radio-group fr-radio-rich">
                        <input
                          id="fr-radios-theme-dark"
                          value="dark"
                          type="radio"
                          name="fr-radios-theme"
                        />
                        <label class="fr-label" for="fr-radios-theme-dark">
                          Thème sombre
                        </label>
                        <div class="fr-radio-rich__img">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="fr-artwork"
                            width="80px"
                            height="80px"
                            viewBox="0 0 80 80"
                          >
                            <use
                              class="fr-artwork-decorative"
                              :xlink:href="`${dark}#artwork-decorative`"
                            ></use>
                            <use
                              class="fr-artwork-minor"
                              :xlink:href="`${dark}#artwork-minor`"
                            ></use>
                            <use
                              class="fr-artwork-major"
                              :xlink:href="`${dark}#artwork-major`"
                            ></use>
                          </svg>
                        </div>
                      </div>
                      <div class="fr-radio-group fr-radio-rich">
                        <input
                          id="fr-radios-theme-system"
                          value="system"
                          type="radio"
                          name="fr-radios-theme"
                        />
                        <label class="fr-label" for="fr-radios-theme-system">
                          Système
                          <span class="fr-hint-text">Utilise les paramètres système.</span>
                        </label>
                        <div class="fr-radio-rich__img">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="fr-artwork"
                            width="80px"
                            height="80px"
                            viewBox="0 0 80 80"
                          >
                            <use
                              class="fr-artwork-decorative"
                              :xlink:href="`${system}#artwork-decorative`"
                            ></use>
                            <use
                              class="fr-artwork-minor"
                              :xlink:href="`${system}#artwork-minor`"
                            ></use>
                            <use
                              class="fr-artwork-major"
                              :xlink:href="`${system}#artwork-major`"
                            ></use>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>
