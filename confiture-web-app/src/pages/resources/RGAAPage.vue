<script setup lang="ts">
import TopLink from "../../components/ui/TopLink.vue";
import PageMeta from "../../components/PageMeta";
</script>

<template>
  <PageMeta
    title="Le RGAA"
    description="Tout savoir sur le Référentiel général d’amélioration de l’accessibilité (RGAA)."
  />

  <section class="fr-my-0 content">
    <h1 class="fr-mt-6w fr-mb-9v">
      Le Référentiel général d’amélioration de l’accessibilité (RGAA)
    </h1>
    <h2>À quoi ça sert ?</h2>
    <p>
      Le RGAA permet de contrôler l’accessibilité d’un site et de ses contenus
      suivant les normes internationales de l’accessibilité numérique connues
      sous l’appellation de
      <a
        class="fr-link"
        href="https://www.w3.org/WAI/standards-guidelines/wcag/fr"
        target="_blank"
        >WCAG <span class="sr-only">(nouvelle fenêtre)</span></a
      >.
      <strong
        >En France, le taux d’accessibilité d’un site est calculé en l’auditant
        au regard des critères du RGAA</strong
      >.
    </p>
    <p>
      Le RGAA définit une méthode technique et propose un cadre opérationnel de
      vérification de la conformité aux exigences d’accessibilité. Elle comporte
      106 critères de contrôle RGAA incluant une moyenne de 2,5 tests par
      critères. Certains tests font référence à des techniques d'implémentation
      (HTML, CSS, JavaScript...) pour vérifier que le critère est respecté afin
      de réduire la marge d’interprétation quant au respect des normes
      d’accessibilité.
    </p>
    <p class="fr-mb-6w">
      <a
        class="fr-link"
        href="https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/"
        target="_blank"
      >
        Consulter les critères du RGAA
        <span class="sr-only">(nouvelle fenêtre)</span>
      </a>
    </p>

    <h2>La 4e version du RGAA</h2>
    <p>
      La version en vigueur du RGAA est la 4.1 et a été publiée le 18 février
      2021.
    </p>
    <p class="fr-mb-6w">
      Le RGAA 4 fait disparaître la distinction entre niveau A et AA qui n’est
      plus justifiée puisque toutes ces règles sont obligatoires.
    </p>

    <h2>Si le RGAA n'était plus mis à jour</h2>
    <p class="fr-mb-6w">
      En cas d'absence de mise à jour du référentiel sous 3 ans pour prendre en
      compte de nouveaux standards ou spécifications techniques, il est possible
      de créer ses propres tests en complément de ceux existant. Certains tests,
      concernant notamment les composants d’interface développés en JavaScript,
      requièrent de vérifier la restitution des contenus avec des technologies
      d’assistance associées à des navigateurs et des systèmes d’exploitation.
    </p>

    <h2>Applications mobiles, progiciels et mobilier urbain numérique</h2>
    <p>
      La méthode technique du RGAA 4.1 ne couvre pas les applications mobiles
      natives, les progiciels et le mobilier urbain numérique pour lesquels il
      sera nécessaire de vérifier directement la mise en œuvre de la norme de
      référence EN 301-549 V2.1.2.
    </p>

    <TopLink />
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
