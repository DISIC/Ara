# Front-end Ara

Le projet a été créé avec [Vite.js](https://vitejs.dev/). Le framework front-end est [Vue.js (en version 3)](https://vuejs.org/) avec [TypeScript](https://www.typescriptlang.org/).

La partie style utilise le [DSFR (Système de Design de l'État)](https://www.systeme-de-design.gouv.fr/) et du CSS sans pré-processeur.

## Prérequis

- [Node.js](https://nodejs.org) en version `22.14.0`
- [Yarn 4 (Modern)](https://yarnpkg.com/) version `4.9.2`

## Installation

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
