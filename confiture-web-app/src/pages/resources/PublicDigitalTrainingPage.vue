<script setup lang="ts">
import TopLink from "../../components/TopLink.vue";
import UgoPicture from "../../assets/images/ugo-dessertine.png";
import MarinePicture from "../../assets/images/marine-boudeau.png";
import transcriptionUrl from "../../assets/Transcription-Bienfairedunumerique-19mai2022.docx";
</script>

<template>
  <section class="fr-my-0 content">
    <h1 class="fr-mt-6w">Bien faire du numérique public</h1>
    <h2>Revivez la formation</h2>
    <p>Cette vidéo est sous-titrée.</p>

    <div class="fr-content-media">
      <iframe
        title="Service maximum : mieux faire du design de services publics numériques par DesignGouv"
        class="fr-responsive-vid"
        src="https://www.youtube.com/embed/7Z9_YLcynXw"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <div class="fr-download fr-mb-6w">
      <p>
        <a :href="transcriptionUrl" download class="fr-download__link"
          >Télécharger la transcription
          <span class="fr-download__detail">DOCX (Word) – 51 Ko</span>
        </a>
      </p>
    </div>
    <h2>Informations</h2>
    <p>
      Lors de ce webinaire, nous vous présenterons les enseignements et les
      recommandations que nous tirons de notre travail continu d’immersion
      auprès des usagers et d'accompagnement des administrations dans
      l’amélioration de leurs services en ligne.
    </p>
    <p><strong>Objectifs de la formation</strong> :</p>
    <ul class="fr-mb-3w">
      <li>
        Découvrir les principes fondateurs d’un bon service public numérique
      </li>
      <li>
        Faire un tour d’horizon des thématiques qui doivent systématiquement
        être abordées
      </li>
      <li>
        Aborder la question des méthodes de travail et des différentes
        disciplines qui œuvrent à la création d’un produit numérique
      </li>
      <li>Identifier les rôles clés</li>
      <li>
        Discuter des difficultés qui peuvent être rencontrées dans le contexte
        du secteur public et comment les lever
      </li>
    </ul>
    <p>
      <strong>Public concerné</strong> : toute personne impliquée dans la
      conception de services publics numériques.
    </p>
    <p class="fr-mb-3v"><strong>Programme :</strong></p>
    <ul class="fr-mb-3w">
      <li>Contexte : la numérisation du service publict</li>
      <li>Qu’est-ce qu’un bon service public numérique ?</li>
      <li>Comment faire un bon service public numérique ?</li>
      <li>Quelles sont les difficultés rencontrées et comment les lever ?</li>
      <li>Agir ici et maintenant</li>
    </ul>

    <p class="fr-mb-3v"><strong>Formateurs</strong> :</p>
    <ul>
      <li class="fr-mb-3v trainer">
        <img class="fr-mr-2w" :src="UgoPicture" alt="" />
        <div>
          <strong>Ugo Dessertine</strong><br />
          <span>Lead designer au sein de DesignGouv</span>
        </div>
      </li>
      <li class="trainer">
        <img class="fr-mr-2w" :src="MarinePicture" alt="" />
        <div>
          <strong>Marine Boudeau</strong><br />
          <span>Cheffe du pôle Design des services numériques</span>
        </div>
      </li>
    </ul>

    <TopLink />
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}

.trainer {
  display: flex;
  align-items: center;
}
</style>
