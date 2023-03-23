<script lang="ts" setup>
import { useRoute } from "vue-router";
import AuditNotFoundImage from "../../assets/images/audit-not-found.svg";
import GenericErrorImage from "../../assets/images/server-error.svg";
import { history } from "../../router";
import { marked } from "marked";

const statusCode = (history.state.errorStatus ?? 404) as number;

const errorTitle =
  {
    404: "Page non trouvée",
    408: "La connexion a expiré",
    410: "Audit supprimé",
    500: "Erreur inattendue",
    503: "Service indisponible",
    // TODO: get default content
  }[statusCode] ?? "Erreur inconnue";

const errorDescription =
  {
    404: "La page que vous cherchez est introuvable. Excusez-nous pour la gêne occasionnée.",
    408: "Désolé, la page n'a pa pu être affichée, le serveur a mis trop de temps à répondre.",
    410: "Désolé, l’audit que vous cherchez a été supprimé.",
    500: "Désolé, le service rencontre un problème. Nous travaillons pour le résoudre le plus rapidement possible.",
    503: "Désolé, le service est temporairement inaccessible, la page demandée ne peut être affichée.",
  }[statusCode] ??
  "Une erreur est survenue. Excusez-nous pour la gêne occasionnée.";

const errorInstruction =
  {
    404: `
Si vous avez tapé l’adresse web dans le navigateur, vérifiez qu’elle est correcte. La page n’est peut-être plus disponible.

Dans ce cas, pour continuer votre visite vous pouvez consulter notre page d’accueil ou nous contacter par e-mail à l'adresse suivante : **ara@design.numerique.gouv.fr**.
    `,
    408: `
Vous pouvez :
- Vérifier votre connexion internet
- Recharger la page dans quelques instants, le site peut être temporairement indisponible ou enregistrer trop de connexion simultanément
- Si votre ordinateur ou votre réseau est protégé par un pare-feu ou un proxy, assurez-vous que votre navigateur soit autorisé à accéder à internet

Si vous avez besoin d’une aide, merci de nous contacter par e-mail à l'adresse suivante : **ara@design.numerique.gouv.fr**.
    `,
    500: `
Essayez de rafraîchir la page ou bien ressayez plus tard.

Si vous avez besoin d’une aide, merci de nous contacter par e-mail à l'adresse suivante : **ara@design.numerique.gouv.fr**.
    `,
    503: `
Merci de réessayer plus tard, vous serez bientôt en mesure de réutiliser le service.

Si vous avez besoin d’une aide, nous contacter par e-mail à l'adresse suivante : **ara@design.numerique.gouv.fr**.
    `,
  }[statusCode] ??
  // TODO: get real wording
  `
Blablabla une erreur
Adipisicing officia in dolor do et voluptate cupidatat ut ut aute reprehenderit eu.
  `;

const route = useRoute();
</script>

<template>
  <div class="fr-grid-row fr-mt-7w fr-mt-md-15w">
    <div class="fr-col-12 fr-col-md-6 fr-mb-7w fr-mb-md-0">
      <h1>{{ errorTitle }}</h1>
      <p class="fr-text--sm">Erreur {{ statusCode }}</p>
      <p class="fr-text--xl fr-mb-5w">
        {{ errorDescription }}
      </p>
      <div
        v-if="statusCode !== 410"
        class="fr-text--sm"
        v-html="marked.parse(errorInstruction, { gfm: false })"
      ></div>
      <div>
        <!-- TODO: make the button full width on mobile. DSFR helper? -->
        <RouterLink
          v-if="[404, 410].includes(statusCode)"
          class="fr-btn fr-mr-2w"
          :to="{ name: 'home' }"
        >
          Page d’accueil
        </RouterLink>
        <RouterLink
          v-else-if="statusCode === 408"
          class="fr-btn fr-mr-2w"
          :to="route.fullPath"
        >
          Recharger la page
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
