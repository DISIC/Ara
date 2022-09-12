<script setup lang="ts">
import TopLink from "../../components/TopLink.vue";
import ErwanPicture from "../../assets/images/erwan-legall.png";
import BenoitPicture from "../../assets/images/benoit-dequick.png";
import transcriptionUrl from "../../assets/Transcription-Accessibilite-18novembre2021.docx";
</script>

<template>
  <section class="fr-my-0 content">
    <h1 class="fr-mt-6w">Introduction à l'accessibilité numérique</h1>
    <h2>Revivez la formation</h2>
    <p>Cette vidéo est sous-titrée.</p>

    <div class="fr-content-media">
      <iframe
        title="Formation accessibilité numérique par DesignGouv"
        class="fr-responsive-vid"
        src="https://www.youtube.com/embed/_5zIrh-LDto"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <div class="fr-download fr-mb-6w">
      <p>
        <a :href="transcriptionUrl" download class="fr-download__link"
          >Télécharger la transcription
          <span class="fr-download__detail">DOCX (Word) – 44 Ko</span>
        </a>
      </p>
    </div>
    <h2>Informations</h2>
    <p><strong>Objectifs de la formation</strong> :</p>
    <ul class="fr-mb-3w">
      <li>
        S’approprier les concepts de l’accessibilité d’un point de vue
        historique et juridique
      </li>
      <li>
        Connaître les obligations, identifier les rôles et responsabilités
      </li>
      <li>S’organiser et disposer d’une boîte à outils</li>
    </ul>
    <p>
      <strong>Public concerné</strong> : Agents de la fonction publique ou
      prestataires impliqués dans la conception des démarches administratives
      numériques.
    </p>
    <p class="fr-mb-3v"><strong>Programme :</strong></p>
    <ul class="fr-mb-3w">
      <li>Immersion</li>
      <li>Un peu d’histoire</li>
      <li>Démonstration</li>
      <li>Définition et dispositif légal</li>
      <li>Prévalence du handicap</li>
      <li>Le référentiel général d’amélioration de l’accessibilité (RGAA)</li>
      <li>Méthodes et outils</li>
    </ul>

    <p class="fr-mb-3v"><strong>Formateurs</strong> :</p>
    <ul>
      <li class="fr-mb-3v trainer">
        <img class="fr-mr-2w" :src="ErwanPicture" alt="" />
        <div>
          <strong>Erwan le Gall</strong><br />
          <span>Expert accessibilité au sein de DesignGouv</span>
        </div>
      </li>
      <li class="trainer">
        <img class="fr-mr-2w" :src="BenoitPicture" alt="" />
        <div>
          <strong>Benoît Dequick</strong><br />
          <span>Expert accessibilité au sein de DesignGouv</span>
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
