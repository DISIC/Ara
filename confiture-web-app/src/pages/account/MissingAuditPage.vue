<script lang="ts" setup>
import PageMeta from "../../components/PageMeta";
import { useAccountStore } from "../../store/account";

const accountStore = useAccountStore();
</script>

<template>
  <PageMeta title="Audit manquant ?" />
  <div class="fr-mb-4w">
    <RouterLink
      :to="{ name: 'account-dashboard' }"
      class="fr-link fr-icon-arrow-left-fill fr-link--icon-left"
    >
      Retourner à mes audits
    </RouterLink>
  </div>

  <div class="wrapper fr-mb-6w">
    <h1>Un audit manque dans votre espace ?</h1>
    <p>
      Vérifiez que l'adresse e-mail associée à votre audit est identique à celle
      utilisée pour votre compte. Si ce n’est pas le cas, remplacez l’adresse
      e-mail associée à votre audit par l’adresse utilisée pour votre compte :
      <strong>{{ accountStore.account?.email }}</strong
      >.
    </p>

    <p class="fr-text--lg">
      <strong>Modifier l’adresse e-mail associée à un audit :</strong>
    </p>

    <ol>
      <li>
        Ouvrez votre audit à l’aide des liens qui vous ont été envoyés par
        e-mail
      </li>
      <li>Cliquez sur le menu “Options” situé en haut à droite de la page</li>
      <li>Cliquez sur “Modifier les paramètres”</li>
      <li>
        En bas de page, saisissez l’adresse e-mail associée à votre compte Ara
        puis validez votre saisie via le bouton “Mettre à jour les paramètres”
      </li>
    </ol>

    <p>Votre audit devrait désormais apparaitre dans votre espace.</p>
  </div>

  <div class="fr-py-6w fr-px-2w banner">
    <h2 class="fr-h4 fr-mb-2w">Vous rencontrez toujours un problème ?</h2>
    <p class="fr-mb-0">
      Contactez notre support par e-mail à l’adresse :
      <strong>ara@design.numerique.gouv.fr</strong>
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 49.5rem;
  margin: 0 auto;
}

.banner {
  background: var(--background-alt-blue-france);
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-bottom: -6rem;
}

.banner > * {
  max-width: 40rem;
  margin: 0 auto;
}
</style>
