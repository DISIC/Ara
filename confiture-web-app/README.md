# Front-end Ara

Le projet a été créé avec [Vite.js](https://vitejs.dev/). Le framework front-end est [Vue.js (en version 3)](https://vuejs.org/) avec [TypeScript](https://www.typescriptlang.org/).

La partie style utilise le [DSFR (Système de Design de l'État)](https://www.systeme-de-design.gouv.fr/) et du CSS sans pré-processeur.

## Prérequis

- [Node.js](https://nodejs.org)
- [Yarn](https://yarnpkg.com)

## Installation

Installer les dépendances :

```sh
yarn install
```

Générer les fichiers requis du RGAA (critères et tests et méthodologies) :

```sh
yarn generate:rgaa
```

## Développement

Lancer le [serveur local sur le port 3000](http://localhost:3000) :

```sh
yarn dev
```

## Tests

[Cypress](https://www.cypress.io/) est utilisé pour lancer des tests end-to-end (e2e) dans un navigateur pour reproduire le comportement des utilisateurs.

Les tests peuvent être lancés de 2 manières :

- Via l’application Cypress avec :

  ```sh
  yarn cypress open
  ```

- Via le terminal avec :

  ```sh
  yarn cypress run
  ```

## Guidelines

- Utiliser les media queries en "desktop first" et avec la notation suivante avec les [valeurs de points de rupture du DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-techniques/grille-et-points-de-rupture) :
  ```css
  @media (width < 62rem) {
    ...
  }
  ```
