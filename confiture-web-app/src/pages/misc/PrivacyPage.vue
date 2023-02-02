<script setup lang="ts">
import PageMeta from "../../components/PageMeta";
</script>

<!--
  TODO: complete all content once the audit will be done.
 -->
<template>
  <PageMeta
    title="Données personnelles"
    description="Politique de confidentialité des données personnelles du site ara.numerique.gouv.fr"
  />
  <section class="fr-my-0 fr-mx-auto content">


    <h1>Politique de confidentialité des données personnelles</h1>
    <h2>Traitement des données</h2>
    <p>La Direction interministérielle du numérique s’engage à ce que le traitement des données personnelles effectué sur ara.numerique.gouv.fr soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.</p>

    <h2>Objet du traitement</h2>
    <p>Ara est un outil d’audit d’accessibilité numérique. Un audit est réalisé par une personne experte qui doit saisir les informations personnelles suivantes : prénom, nom et adresse électronique.</p>
    <p>Ces données personnelles sont utilisées :</p>
    <ul><li>pour envoyer par courriel à l’auditeur ou l’auditrice l’URL de l’audit en cours de réalisation</li><li>pour que la personne qui reçoit l’audit puisse conacter facilement l’auditeur ou l’auditrice</li></ul>
    <p>Lors de la suppression de l’audit, les données de l’audit, le rapport de l’audit et les données personnelles de l’auditeur ou l’auditrice sont supprimées.</p>
    <h2>Vos droits sur vos données</h2>
    <p>Vous pouvez exercer vos droits ou obtenir des informations concernant le traitement de vos données personnelles par courriel à l'adresse suivante : <strong>contact@design.numerique.gouv.fr</strong>.</p>
    <p>Si la réponse apportée ne vous convient pas, vous pouvez alors saisir le délégué à la protection des données des services du Premier ministre.</p>
    <ul>
    <li>par courriel à l'adresse suivante : dpd@pm.gouv.fr ;</li>
    <li>par courrier à l'adresse suivante :<br/>
    Service du Premier ministre<br/>
    À l'attention du délégué à la protection des données (DPD)<br/>
    56 rue de Varenne<br/>75700 Paris</li>
    </ul>

    <h2>À propos des <span lang="en">cookies</span> </h2>
    <p>Nous utilisons différents <span lang="en">cookies</span> sur le site pour mesurer l’audience et intégrer des services permettant d’améliorer l’interactivité du site.</p>
    <h3>Qu’est-ce qu’un &laquo;<span lang="en">cookie</span>&raquo; ?</h3>
    <p>Un &laquo;<span lang="en">cookie</span>&raquo; est une suite d'informations, généralement de petite taille et identifié par un nom, qui peut être transmis à votre navigateur par un site <span lang="en">web</span> sur lequel vous vous connectez. Votre navigateur <span lang="en">web</span> le conservera pendant une certaine durée, et le renverra au serveur web chaque fois que vous vous y re-connecterez. Les cookies ont de multiples usages : ils peuvent servir à mémoriser votre identifiant client auprès d'un site marchand, le contenu courant de votre panier d'achat, un identifiant permettant de tracer votre navigation pour des finalités statistiques ou publicitaires, etc. </p>
    
    <h4>Type de <span lang="en">cookie</span> déposé sur ara.numerique.gouv.fr</h4>
 
    <p>L’outil de mesure d’audience que nous utilisons, Matomo (ex-Piwik), est paramétré de façon à ce que les informations recueillies soient anonymisées. Le petit fichier texte (« <span lang="en">cookie</span> ») déposé sur votre ordinateur lorsque vous le consultez nous permet simplement de connaître le nombre de visites et les pages les plus consultées, et ainsi d’améliorer nos contenus et votre expérience, sans pour autant permettre de vous identifier personnellement.</p>

    <p>Nous sommes ainsi en conformité avec la réglementation « <span lang="en">cookie</span> » de la CNIL et exemptés d’autorisation préalable. C’est pour cela que vous n’avez pas eu besoin de cliquer sur un bloc pour accepter le dépôt de cookies ! </p>
 
    <table  class="fr-table fr-table--bordered">
      <caption><span lang="en">Cookies</span> de mesure d’audience</caption>
      <thead>
      <tr>
        <th  scope="col">Cookie lié au service</th>
        <th  scope="col">Nom technique</th>
        <th  scope="col">Finalité</th>
        <th  scope="col">Durée de conservation</th>
      </tr>  
      </thead>
      <tbody>
      <tr>
        <td>Matomo</td>
        <td>_pk_id#</td>
        <td>Permet de stocker votre identifiant unique de visite via Matomo</td>
        <td>13 mois</td>
      </tr>  
      <tr>
        <td>Matomo</td>
        <td>_pk_ses#</td>
        <td>Permet de stocker temporairement vos données de visite via Matomo</td>
        <td>30 minutes</td>
      </tr> 
      <tr>
        <td>Matomo</td>
        <td>piwik_ignore</td>
        <td>Permet de mémoriser votre choix d'ignorer la mesure d'audience via Matomo</td>
        <td>2 ans</td>
      </tr>  
    </tbody>
    </table>
</section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
