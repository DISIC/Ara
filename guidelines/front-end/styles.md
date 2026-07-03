# Styles guidelines

Ces guidelines s’applique au code CSS présent dans l’application, soit dans les fichiers `.css` et dans les blocs de styles des fichiers `.vue`.

La principale règle est d’écrire le moins de code CSS possible et de se reposer au maximum sur le DSFR avec ses composants et ses classes utilitaires. Par exemple, il est inutile de créer une classe CSS sur un élément pour uniquement lui attribuer une marge : on va plutôt utiliser la classe du DSFR `fr-mb-2v`.

> [!NOTE]
> Le style des fichiers `.css` et `.vue` est automatiquement linté avec `stylelint` à chaque commit ou en lançant `yarn lint:styles` à la racine du projet. Quelques règles à ajouter :
>
> - [stylelint-use-logical](https://github.com/csstools/stylelint-use-logical) : remplace les `margin-top` par des `margin-block-start`, etc.
> - [unit-disallowed-list](https://stylelint.io/user-guide/rules/unit-disallowed-list/) : ajouter la liste des unités interdites : `em` (commenter si exception).

## Media queries "Desktop first"

Utiliser les media queries en "desktop first" et avec la notation suivante avec, quand c’est possible, les [valeurs de points de rupture du DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-techniques/grille-et-points-de-rupture) :

```css
.my-component {
  margin-block: 2rem;

  @media (width < 62rem) {
    margin-block: 1rem;
  }
}
```

## Nommage de classes CSS custom

Il n’y a pas de méthodologie fixe de nommage des classes CSS (comme le BEM par exemple). Les seules règles applicables sont les suivantes :

- **Utiliser des noms compréhensibles et explicites** : `.submit-button` plutôt que `.button` ou `.btn` ou `.b`.
- **Rester cohérent à travers le fichier** : si le composant s’appelle `<SubmitButton />` et des variables JS `submitButtonRef`, on va préférer utiliser `.submit-button` plutôt que `.form-button` ou `.button`.

## Ordre des classes CSS

Ordonner les classes CSS de la manière suivante : `<1. classes du composant DSFR> <2. classes utilitaires du DSFR> <3. classes custom>` :

```html
<button class="fr-btn fr-btn--secondary fr-mt-4w submit-button">...</button>
```

Dans cet exemple :

1. `fr-btn fr-btn--secondary`
2. `fr-mt-4w`
3. `submit-button`

## Scoping des blocs `<style>`

Dans les fichiers `.vue`, la règle est de scoper par défaut les blocs de styles avec : `<style scoped>`.

Dans le cas où cela n’est pas envisageable, il y a 2 options :

- Si cela concerne tout un bloc : ne pas ajouter l’attribut `scoped`.
- Si cela concerne une règle spécifique : utiliser le [sélecteur `:deep()`](https://vuejs.org/api/sfc-css-features.html#deep-selectors).

```html
<style scoped>
  .my-component {
    p {
      color: pink;
    }

    &:deep(label) {
      color: red;
    }
  }
</style>
```

## Utilisation du `!important`

L’utilisation du mot-clef `!important` n’est pas interdite mais son utilisation est à limitée à certains cas dont :

- Overrider les règles CSS du DSFR quand le design le nécessite.

Dans les deux cas, il est impératif d’ajouter un commentaire au-dessus de la règle CSS concernée indiquant la raison de la présence du mot-clef. Exemple :

```css
/* Ajoute une bordure sur les champs du DSFR */
.fr-select {
  border-top: 1px solid var(--border-plain-grey) !important;
  border-inline: 1px solid var(--border-plain-grey) !important;
}
```
