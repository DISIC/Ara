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

Les formulaires sont validés avec une validation custom (≠ validation native) grâce à des composants dédiés (`<FormWithValidation>`, `<FieldValidation>`) et des règles de validation (`REQUIRED()`, `EMAIL()`...).

#### Utilisation

Déclarer un formulaire avec `<FormWithValidation>`, tout les champs contenus dans ce composants seront automatiquement validés et le focus déplacé sur le premier champs en erreur le cas échéant. Si tout les champs sont valides à la soumission du formulaire, `<FormWithValidation>` émet un événement `@submit`.

Chaque champs validé doit être contenu dans un composant `<FielValidation>`, qui reçoit en props la valeur du champs (`:value`) et les règles de validation (`:validation`). Le composant expose via des props de slots l’erreur de validation du champs et une ref à bind sur l’élément ou composant focusable du champs.

#### Composants

Il extiste des variantes des composants de champs fréquement utilisés (`<DsfrField>` et `<DsfrPassword>`) qui ne nécéssitent pas l’utilisation du wrapper `<FieldValidation>` (voir l’exemple ci-dessous).

#### Exemple de formulaire

```html
<script lang="ts" setup>
  import { EMAIL, REQUIRED } from "./composables/validation";

  const email = ref("");
  const password = ref("");

  function onSubmit() {
    doSomething(email.value, password.value);
  }
</script>

<template>
  <FormWithValidation @submit="onSubmit">
    <!-- Usage avec <FieldValidation> -->
    <FieldValidation
      v-slot="{ error, focusRef }"
      :value="email"
      :validation="[REQUIRED('Ce champs est obligatoire'), EMAIL('Format email invalide')]"
    >
      <DsfrField :ref="focusRef" v-model="email" :error="error" label="Votre email" />
    </FieldValidation>

    <!-- Shortcut component. Also exists for DsfrFiel -->
    <DsfrPasswordWithValidation
      v-model="userPassword"
      label="Mot de passe"
      :validation="[REQUIRED('Champ obligatoire. Saisissez votre mot de passe.')]"
    />

    <button type="submit">Valider</button>
  </FormWithValidation>
</template>
```

Cas particuliers : certains champs ou groupes de champs peuvent avoir des règles de validation spécifiques (par exemple la présence d’au moins un des deux champs). Dans ces cas rares, il n’est pas toujours possible d’utiliser le `useFormField()` et il est plus facile d’utiliser une fonction `validate()` propre au composant.
