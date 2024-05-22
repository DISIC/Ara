<script lang="ts" setup>
import { ref } from "vue";

import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";

defineEmits(["closed", "confirm"]);

const titlesExample = `### Titre h3 (commencer à partir de ce niveau)
#### Titre h4
##### Titre h5
###### Titre h6`;
const italicExample = `_italique_`;
const boldExample = `**gras**`;
const boldItalicExample = `**_gras-italique_**`;
const strikedExample = `~~barré~~`;
const codeExample =
  "Utiliser la balise `<main>` pour indiquer la zone de contenu principal.";
const codeBlockExample = `\`\`\`
Bloc de code
\`\`\`
`;
const quoteExample = `> Citation mise en forme`;
const specialCharExample = `\`\`\`
\\> Élément ignoré par le Markdown
\\> \\_Élément ignoré par le Markdown\\_
\`\`\`
`;
const specialCharExampleResult =
  "> Élément ignoré par le Markdown <br />> _Élément ignoré par le Markdown_";
const unorderedListExample = `* un élément
  * un sous élément`;
const orderedListExample = `1. élément un
2. élément deux`;
const linkExample = `L’outil Ara est réalisé par [DesignGouv](https://design.numerique.gouv.fr/).`;
</script>

<template>
  <PageMeta
    title="Syntaxe markdown"
    description="Syntaxe markdown sur le site ara.numerique.gouv.fr"
  />
  <section class="fr-col-12 fr-col-md-8 fr-mx-auto">
    <h1>Syntaxe markdown</h1>

    <p>
      Vous avez la possibilité de mettre en forme votre texte en utilisant la
      syntaxe markdown décrite ci-dessous.
    </p>

    <nav
      class="fr-summary"
      role="navigation"
      aria-labelledby="fr-summary-title"
    >
      <p id="fr-summary-title" class="fr-summary__title">Sommaire</p>
      <ol class="fr-summary__list">
        <li>
          <a class="fr-summary__link" href="#markdown-titres"> Titres </a>
        </li>
        <li>
          <a class="fr-summary__link" href="#markdown-styles-de-texte">
            Styles de texte
          </a>
        </li>
        <li>
          <a class="fr-summary__link" href="#markdown-citation-de-code">
            Citation de code
          </a>
        </li>
        <li>
          <a class="fr-summary__link" href="#markdown-citation-de-texte">
            Citation de texte
          </a>
        </li>
        <li>
          <a class="fr-summary__link" href="#markdown-caracteres-speciaux">
            Caractères spéciaux
          </a>
        </li>
        <li>
          <a class="fr-summary__link" href="#markdown-listes"> Listes </a>
        </li>
        <li>
          <a class="fr-summary__link" href="#markdown-paragraphes">
            Paragraphe et saut de ligne
          </a>
        </li>
        <li>
          <a class="fr-summary__link" href="#markdown-liens"> Liens </a>
        </li>
      </ol>
    </nav>

    <!-- Titres -->

    <h2 id="markdown-titres" class="fr-h6 fr-mt-6w">Titres</h2>
    <p>
      Pour ajouter un titre, vous devez mettre 3 dièses
      <code>#</code> devant la ligne. Pour ajouter titre de niveau inférieur,
      ajoutez à la suite un nouveau dièse <code>#</code> . Vous pouvez créer des
      titres jusqu’au niveau h6.
    </p>
    <div class="fr-callout">
      <p class="fr-callout__text">
        La page du rapport comporte déjà un titre h1 et h2. Afin de garder une
        cohérence dans le rendu de la page, veuillez commencer votre titrage à
        partir du niveau h3.
      </p>
    </div>
    <p class="fr-mb-3v">Exemples :</p>
    <pre><code>{{titlesExample}}</code></pre>
    <div aria-hidden="true">
      <!-- Example results are aria-hidden to no polute AT heading list. -->
      <p class="fr-mb-3v">S’affichent ainsi :</p>
      <MarkdownRenderer :markdown="titlesExample" />
    </div>

    <!-- Styles de texte -->

    <h2 id="markdown-styles-de-texte" class="fr-h6 fr-mt-6w">
      Styles de texte
    </h2>
    <p>
      Vous pouvez utiliser un tiret bas <code>_</code> autour d'un mot pour le
      mettre en italique. Utilisez deux astérisques <code>*</code> autour d’un
      mot pour le mettre en gras. Les styles se combinent.
    </p>
    <p class="fr-mb-3v">Exemples</p>
    <p>
      <code>{{ italicExample }}</code> s'affiche ainsi :
      <MarkdownRenderer :markdown="italicExample" inline />
    </p>
    <p>
      <code>{{ boldExample }}</code> s'affiche ainsi :
      <MarkdownRenderer :markdown="boldExample" inline />
    </p>
    <p>
      <code>{{ boldItalicExample }}</code> s'affiche ainsi :
      <MarkdownRenderer :markdown="boldItalicExample" inline />
    </p>
    <p>
      <code>{{ strikedExample }}</code> s'affiche ainsi :
      <MarkdownRenderer :markdown="strikedExample" inline />
    </p>

    <!-- Citation de code -->

    <h2 id="markdown-citation-de-code" class="fr-h6 fr-mt-6w">
      Citation de code
    </h2>
    <p>Pour afficher du code HTML, vous devez utiliser la syntaxe suivante :</p>
    <h3 class="fr-text--md fr-text--bold">Code dans une phrase</h3>
    <p>Utilisez des accents graves <code>`</code> autour des balises HTML.</p>
    <p class="fr-mb-3v">Exemple :</p>
    <pre><code>{{codeExample}}</code></pre>
    <p class="fr-mb-3v">S’affiche ainsi :</p>
    <MarkdownRenderer :markdown="codeExample" />

    <h3 class="fr-text--md fr-text--bold">Bloc de code</h3>
    <p>
      Créez un bloc de code en ajoutant trois accents graves
      <code>```</code> sur la ligne au dessus et en dessous de votre code.
    </p>
    <p class="fr-mb-3v">Exemple :</p>
    <pre><code>{{ codeBlockExample }}</code></pre>
    <p class="fr-mb-3v">S’affiche ainsi :</p>
    <MarkdownRenderer :markdown="codeBlockExample" />

    <!-- Citation de texte -->

    <h2 id="markdown-citation-de-texte" class="fr-h6 fr-mt-6w">
      Citation de texte
    </h2>
    <p>
      Les citations se font avec le signe supérieur
      <code>&gt;</code> .
    </p>
    <p class="fr-mb-3v">Exemple :</p>
    <pre><code>{{ quoteExample }}</code></pre>
    <p class="fr-mb-3v">S’affiche ainsi :</p>
    <MarkdownRenderer :markdown="quoteExample" />

    <!-- Caractères spéciaux -->
    <h2 id="markdown-caracteres-speciaux" class="fr-h6 fr-mt-6w">
      Caractères spéciaux
    </h2>
    <p>
      Pour supprimer le formatage en Markdown des caractères spéciaux, utilisez
      une barre oblique inversée <code>\</code> avant chaque caractère spécial.
    </p>
    <p class="fr-mb-3v">Exemple :</p>
    <pre><code>{{ specialCharExample }}</code></pre>
    <p class="fr-mb-3v">S’affiche ainsi :</p>
    <p v-html="specialCharExampleResult" />

    <!-- Listes -->

    <h2 id="markdown-listes" class="fr-h6 fr-mt-6w">Listes</h2>
    <p>
      Vous pouvez créer des listes avec les caractères étoile
      <code>*</code> et tiret <code>-</code>
      pour des listes non ordonnées ou avec des nombres pour des listes
      ordonnées.
    </p>

    <h3 class="fr-text--md fr-text--bold">Liste non ordonnée</h3>
    <p class="fr-mb-3v">Exemple :</p>
    <pre><code>{{ unorderedListExample }}</code></pre>
    <p class="fr-mb-3v">S’affiche ainsi :</p>
    <MarkdownRenderer :markdown="unorderedListExample" />

    <h3 class="fr-text--md fr-text--bold">Liste ordonnée</h3>
    <p class="fr-mb-3v">Exemple :</p>
    <pre><code>{{ orderedListExample }}</code></pre>
    <p class="fr-mb-3v">S’affiche ainsi :</p>
    <MarkdownRenderer :markdown="orderedListExample" />

    <!-- Paragraphe et saut de ligne -->

    <h2 id="markdown-paragraphes" class="fr-h6 fr-mt-6w">
      Paragraphe et saut de ligne
    </h2>
    <p>
      Vous pouvez créer un paragraphe en effectuant deux retours à la ligne.
      Deux espaces en fin de ligne suivi d’un retour à la ligne permettent
      d'ajouter un saut de ligne.
    </p>

    <!-- Liens -->

    <h2 id="markdown-liens" class="fr-h6 fr-mt-6w">Liens</h2>
    <p>
      Vous pouvez créer un lien en plaçant le texte du lien entre crochets
      <code>[]</code> suivis de l'URL entre parenthèses <code>()</code>.
    </p>
    <p class="fr-mb-3v">Exemple :</p>
    <pre><code>{{ linkExample }}</code></pre>
    <p class="fr-mb-3v">S’affiche ainsi :</p>
    <MarkdownRenderer :markdown="linkExample" />
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}

code {
  background-color: var(--grey-950-100);
  padding: 0.25rem 0.75rem;
}

pre code {
  display: block;
  padding: 0.75rem;
}
</style>
