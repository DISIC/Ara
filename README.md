# Ara

Ara est une plateforme web basée sur le référentiel général d'amélioration de l'accessibilité (RGAA) qui permet aux auditeur et auditrices de :

- réaliser leurs audits d'accessibilité numérique en ligne,
- générer automatiquement les rapports de ces audits ainsi que les déclarations d'accessibilité.

> [!WARNING]
> Ara n’audite pas automatiquement votre site.

## Organisation du code

Ce projet est organisé en _monorepo_ (voir [Monorepo - Wikipedia](https://en.wikipedia.org/wiki/Monorepo)).\
Les espaces de travail (_workspaces_) sont :

- `confiture-rest-api` (_backend_) ([Documentation du backend](./confiture-rest-api/README.md))
- `confiture-web-app` (_frontend_) ([Documentation du frontend](./confiture-web-app/README.md))

## Prérequis

- Environnement d'exécution JavaScript (_JavaScript runtime environment_) :\
  [Node.js](https://nodejs.org) version `22.14.0`
- Gestionnaire de paquets (_Package manager_) :\
  [Yarn 4 (Modern)](https://yarnpkg.com/) version `4.9.2`
- Conteneurisation :\
  [Docker](https://www.docker.com)

## Installation

Une seule commande pour :

- installer toutes les dépendances : backend + frontend
- générer les fichiers requis du RGAA (critères et tests et méthodologies)
- générer les types de l’API

```sh
yarn install
```

> [!IMPORTANT]
> Il faut aussi suivre [les étapes d’installation du backend](./confiture-rest-api/README.md#installation-du-backend).

## Développement

Une seule commande pour lancer les 2 serveurs backend et frontend en local en parallèle :

```sh
yarn dev
```

- le serveur backend (NodeJS)
- le [serveur frontend sur le port 3000](http://localhost:3000) (ou 3001, 3002, si port occupé)

> [!NOTE]
> Les logs du backend et du frontend sont alors affichés dans la même session shell.

> [!TIP]
> Appuyer sur la touche **"o"** (_open_) pour ouvrir Ara en local dans un navigateur.

## ESLint, l’utilitaire de _lint_ et de formatage du code

**ESLint** est utilisé à la fois pour l’analyse statique du code et le formatage stylistique (indentation, etc.).
Pour les fichiers non pris en charge par ESLint (CSS, HTML, Markdown, etc), ESLint utilise **Prettier** en tant qu’outil de formatage externe.
Nous utilisons [la configuration ESLint d’Anthony Fu](https://github.com/antfu/eslint-config) comme base.
Voir aussi la configuration de ce projet : [eslint.config.mjs](https://github.com/DISIC/Ara/blob/main/eslint.config.mjs)

Une vue de l’ensemble des règles de _lint_ est disponible en exécutant à la racine du projet :

```sh
yarn dlx @eslint/config-inspector
```

On peut _linter_ l’ensemble du projet en exécutant, à la racine du projet :

```sh
yarn lint
```

On peut _linter_ et corriger les erreurs corrigeables automatiquement avec :

```sh
yarn lint --fix
```

## Stylelint, le linter pour les styles

**Stylelint** est utilisé pour linter le code CSS présent dans les fichiers `.css` et `.vue` du projet frontend.

On peut _linter_ l’ensemble du projet en exécutant, à la racine du projet :

```sh
yarn lint:styles
```

On peut _linter_ et corriger les erreurs corrigeables automatiquement avec :

```sh
yarn lint:styles --fix
```

## Éditeur de code VSCodium / VS Code

Sont disponibles sur ce projet :

- un paramètrage par défaut qui améliore l’expérience de développement :
  - _lint_ et formatage automatique à la sauvegarde des fichiers ;
  - on ne tient pas compte des règles stylistiques dans l'IDE, mais on continue à les corriger automatiquement.
- des tâches pour _linter_ l’ensemble du projet (voir [Integrate with External Tools via Tasks](https://code.visualstudio.com/docs/debugtest/tasks)) :
  - "Lint entire project"
  - "Lint + fix entire project"
  - "TypeScript: show all errors" pour les erreurs TypeScript non relevées par ESLint

## Déploiement

- La branche principale `main` correspond à l’environnement de production.
- Les branches de pull request (PR) correspondent à l’environnement de développement.

### Environnement de développement

Le frontend est automatiquement déployé sur Heroku :

- La branche principale `main` est déployée sur [https://ara-production-81d0da406fda.herokuapp.com/](https://ara-production-81d0da406fda.herokuapp.com/).
- Les branches des PR sont déployées sur [pipeline-xxxxxx-xxxxxx.herokuapp.com](pipeline-xxxxxx-xxxxxx.herokuapp.com) (où XXX est un identifiant aléatoire généré par Heroku).

Pour réinitialiser la base de données :

```sh
DATABASE_URL="<url_de_la_base_de_donnees_de_developpement>" yarn prisma migrate reset
```

### Environnement de production

> [!IMPORTANT]
> Avant de déployer sur l’environnement de production, s’assurer que son adresse IP est whitelistée sur OVH.

Pour lancer les migrations de la base de données sur OVH :

```sh
DATABASE_URL="<url_de_la_base_de_donnees_de_production>" yarn prisma migrate deploy
```
