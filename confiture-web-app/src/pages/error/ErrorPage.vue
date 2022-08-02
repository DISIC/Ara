<script lang="ts" setup>
import AuditNotFoundImage from "../../assets/images/audit-not-found.svg";
import GenericErrorImage from "../../assets/images/server-error.svg";
import { history } from "../../router";

const statusCode = (history.state.errorStatus ?? 404) as number;

const errorTitle =
  {
    404: "Page non trouvée",
    410: "Audit supprimé",
    500: "Erreur inattendue",
    503: "Service indisponible",
    // TODO: get default content
  }[statusCode] ?? "Erreur inconnue";

const errorDescription =
  {
    404: "La page que vous cherchez est introuvable. Excusez-nous pour la gêne occasionnée.",
    410: "Désolé, l’audit que vous cherchez a été supprimé.",
    500: "Désolé, le service rencontre un problème. Nous travaillons pour le résoudre le plus rapidement possible.",
    503: "Désolé, le service est temporairement inaccessible, la page demandée ne peut être affichée.",
  }[statusCode] ??
  "Une erreur est survenue. Excusez-nous pour la gêne occasionnée.";

const errorInstruction = {
  404: [
    "Si vous avez tapé l’adresse web dans le navigateur, vérifiez qu’elle est correcte. La page n’est peut-être plus disponible.",
    "Dans ce cas, pour continuer votre visite vous pouvez consulter notre page d’accueil, ou effectuer une recherche avec notre moteur de recherche en haut de page.Sinon contactez-nous pour que l’on puisse vous rediriger vers la bonne information.",
  ],
  500: [
    "Essayez de rafraîchir la page ou bien ressayez plus tard.",
    "Si vous avez besoin d’une aide immédiate, merci de nous contacter.",
  ],
  503: [
    "Merci de réessayer plus tard, vous serez bientôt en mesure de réutiliser le service.",
    "Si vous avez besoin d’une aide immédiate, merci de nous contacter.",
  ],
}[statusCode] ?? [
  // TODO: get real wording
  "Blablabla une erreur",
  "Adipisicing officia in dolor do et voluptate cupidatat ut ut aute reprehenderit eu.",
];
</script>

<template>
  <div class="fr-grid-row fr-mt-7w fr-mt-md-15w">
    <div class="fr-col-12 fr-col-md-6 fr-mb-7w fr-mb-md-0">
      <h1>{{ errorTitle }}</h1>
      <p class="fr-text--sm">Erreur {{ statusCode }}</p>
      <p class="fr-text--xl fr-mb-5w">
        {{ errorDescription }}
      </p>
      <p v-if="statusCode !== 410" class="fr-text--sm">
        <template v-for="(instruction, i) in errorInstruction">
          {{ instruction }}
          <br
            v-if="
              i < errorInstruction.length - 1 && errorInstruction.length > 1
            "
            :key="i"
          />
        </template>
      </p>
      <div>
        <!-- TODO: make the button full width on mobile. DSFR helper? -->
        <RouterLink
          v-if="[404, 410].includes(statusCode)"
          class="fr-btn fr-mr-2w"
          :to="{ name: 'home' }"
        >
          Page d’accueil
        </RouterLink>
        <!-- FIXME: link URL? -->
        <RouterLink
          v-if="statusCode !== 410"
          class="fr-btn fr-btn--secondary"
          :to="{ name: 'home' }"
        >
          Contactez-nous
        </RouterLink>
      </div>
    </div>
    <div class="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
      <img
        :src="statusCode === 410 ? AuditNotFoundImage : GenericErrorImage"
        alt=""
      />
    </div>
  </div>
</template>
