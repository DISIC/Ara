# Front-end Ara

Le projet a été créé avec [Vite.js](https://vitejs.dev/). Le framework front-end est [Vue.js (en version 3)](https://vuejs.org/) avec [TypeScript](https://www.typescriptlang.org/).

La partie style utilise le [DSFR (Système de Design de l'État)](https://www.systeme-de-design.gouv.fr/) et du CSS sans pré-processeur.

## Installation du front

> [!NOTE]
> Si vous avez lancé `yarn install` à la racine du projet, ces étapes ont déjà été lancées au moment du `postinstall`

Installer les dépendances :

```sh
yarn install
```

Générer les fichiers requis du RGAA (critères et tests et méthodologies) :

```sh
yarn generate:rgaa
```

## Développement

Lancer le [serveur local sur le port 3000](http://localhost:3000) :

```sh
yarn dev
```

> [!TIP]
> On peut aussi utiliser
>
> ```sh
> yarn dev:front
> ```
>
> depuis la racine du projet.

## Guidelines

### Media queries "Desktop first"

Utiliser les media queries en "desktop first" et avec la notation suivante avec les [valeurs de points de rupture du DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-techniques/grille-et-points-de-rupture) :

```css
@media (width < 62rem) {
  /* ... */
}
```

### Ordre des classes CSS

Ordonner les classes CSS de la manière suivante : `<1. classes du composant DSFR> <2. classes utilitaires du DSFR> <3. classes custom>`. Exemple :

```html
<button class="fr-btn fr-btn--secondary fr-mt-4w submit-button">...</button>
```

1. `fr-btn fr-btn--secondary`
2. `fr-mt-4w`
3. `submit-button`

### Types de l’API

Lors des interactions avec le backend, utiliser les types générés dans `src/types/confiture-api.ts`. Pour générer ce fichier, utiliser la commande `yarn copytypes` depuis le dossier racine du projet. Exemple :

```typescript
import { paths } from "./confiture-api";

export type GetAuditReportResponseBody =
  paths["/reports/{consultUniqueId}"]["get"]["responses"]["200"]["content"]["application/json"];

const data = (await ky
  .get("/reports/{consultUniqueId}")
  .json()) as GetAuditReportResponseBody;
```

### Nommage des attributs `id`

Utiliser des valeurs d’attributs HTML `id` compréhensibles afin de facilement savoir à quoi elles font référence. Exemple :

```html
<li :id="`error-${errorId}`">...</li>
```

Au lieu de :

```html
<li :id="errorId">...</li>
```

### Validation des formulaires

Les formulaires sont validés avec une validation custom (≠ validation native) grâce à un composable (`useFormField()`) et des règles de validation (`REQUIRED()`, `EMAIL()`...). Cela permet de facilement récupérer la référence de l’élément HTML, la valeur du champs et le message d’erreur.

Une fois les champs branchés au composable, il est possible d’appeler la fonction `validate()` (par exemple au submit du formulaire) qui va retourner un boolean : `false` dans le cas d’une erreur, `true` sinon. Cette fonction va également positionner le focus sur le premier champ en erreur. Il est donc important de mettre la liste des champs à valider dans le bon ordre du formulaire au sein de la fonction `validate()`.

Pour utiliser ce système :

- le formulaire doit avoir l’attribut `novalidate` qui désactive la validation native.
- le modèle doit être branché avec les attributs `model-value` et `@update:model-value`.
- la valeur du champs doit être récupérée avec `email.value.value` (2 clefs `value` imbriquées).

Voici un exemple de formulaire :

```html
<script lang="ts" setup>
  import DsfrField from "./components/ui/DsfrField.vue";
  import { EMAIL, REQUIRED, useFormField, validate } from "./composables/validation";

  const email = useFormField("" as string, [REQUIRED("Ce champs est obligatoire"), EMAIL("Format email invalide")]);

  function onSubmit() {
    if (!validate(email)) {
      // invalid form
      return;
    }
    doSomething(email.value.value);
  }
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <DsfrField
      :ref="email.refFn"
      id="email-field"
      label="Votre email"
      :model-value="email.value.value"
      @update:model-value="email.value.value = $event"
      :error="email.error.value"
    />
  </form>
</template>
```

Cas particuliers : certains champs ou groupes de champs peuvent avoir des règles de validation spécifiques (par exemple la présence d’au moins un des deux champs). Dans ces cas rares, il n’est pas toujours possible d’utiliser le `useFormField()` et il est plus facile d’utiliser une fonction `validate()` propre au composant.
