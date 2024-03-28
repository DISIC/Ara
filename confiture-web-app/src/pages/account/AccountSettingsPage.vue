<script lang="ts" setup>
import Profile from "../../components/account/settings/Profile.vue";
import Account from "../../components/account/settings/Account.vue";
import Password from "../../components/account/settings/Password.vue";
import Email from "../../components/account/settings/Email.vue";
import TopLink from "../../components/ui/TopLink.vue";
import PageMeta from "../../components/PageMeta";
</script>

<template>
  <PageMeta title="Mon compte" />

  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-3">
        <!-- Hide sidebar while there is only 1 link inside -->
        <!-- <Sidebar /> -->
      </div>
      <div class="fr-col-12 fr-col-lg-7">
        <h1 class="fr-h2">Mon compte</h1>
        <Profile />
        <hr class="fr-mt-3w" />
        <Password />
        <hr class="fr-mt-3w" />
        <Email />
        <hr />
        <h2 class="fr-h6">Données</h2>
        <p>
          Les données recueillies sont traitées par les équipes de la DINUM.
          Elles nous permettent d’améliorer votre expérience dans l’utilisation
          de l’outil Ara. Conformément à la règlementation, vous disposez d’un
          droit d’opposition et d’un droit à la limitation du traitement de
          données vous concernant, ainsi que d’un droit d’accès, de
          rectification, de portabilité et d’effacement de vos données. Vous
          pouvez exercer vos droits en nous écrivant par e-mail à l’adresse
          suivante : <strong>ara@design.numerique.gouv.fr</strong>
        </p>
        <hr />

        <h2 class="fr-h6">Compte</h2>
        <Account />

        <div class="top-link-container">
          <TopLink />
        </div>
      </div>
      <div class="fr-col-2" />
    </div>
  </div>
</template>

<style scoped>
.top-link-container {
  text-align: right;
}
</style>
