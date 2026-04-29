<script lang="ts" setup>
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import { useAccountStore } from "../../store/account";

const accountStore = useAccountStore();
</script>

<template>
  <PageMeta title="Audit manquant ?" />
  <div class="fr-mb-4w">
    <BackLink label="Retour à mes audits" :to="{ name: 'account-dashboard' }" />
  </div>

  <div class="wrapper fr-mb-6w">
    <h1>Un audit n’apparaît pas dans votre espace ?</h1>
    <p class="fr-text--lg">
      Pour qu’un audit apparaisse dans votre espace, il doit être transféré à l’adresse e-mail de votre compte<template v-if="accountStore.account">
         : <strong>{{ accountStore.account.email }}</strong>.
      </template><template v-else>.</template>
    </p>

    <div class="fr-callout">
      <p class="fr-callout__text">Seul le propriétaire d’un audit peut le transférer.</p>
    </div>

    <p>
      Pour transférer un audit :
    </p>

    <ol class="fr-pl-6w fr-mb-3v">
      <li class="fr-mb-1w">Ouvrez la page « Audit »</li>
      <li class="fr-mb-1w">Ouvrez le menu « Actions » situé en haut à droite de la page</li>
      <li class="fr-mb-1w">Cliquez dans le menu sur « Transférer »</li>
      <li class="fr-mb-1w">Renseignez l’adresse e-mail de votre compte<template v-if="accountStore.account">
         : {{ accountStore.account.email }}
      </template><template v-else>.</template></li>
      <li>Cliquez sur « Transférer l’audit »</li>
    </ol>

    <p>L’audit devrait désormais apparaître dans votre espace.</p>
  </div>

  <div class="fr-py-6w fr-px-2w banner">
    <h2 class="fr-h4 fr-mb-2w">Vous rencontrez un problème ?</h2>
    <p class="fr-mb-0">
      Contactez-nous par e-mail : <strong>ara@design.numerique.gouv.fr</strong>
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
  text-align: center;
  margin-bottom: -6rem;

  /* Make banner full width and overflow its parent container */
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
</style>
