# Ara

Réaliser des audits d'accessibilité numérique sur la base du référentiel général d'amélioration de l'accessibilité (RGAA).
Générer et consulter les rapports de ces audits et les déclarations d'accessibilité.

## Développement

### Généralités

Ce projet est organisé en _monorepo_ (voir [Monorepo - Wikipedia](https://en.wikipedia.org/wiki/Monorepo)).
Les espaces de travail (_workspaces_) sont :

- `confiture-rest-api` (_backend_)
- `confiture-web-app` (_frontend_)

#### Gestionnaire de paquets (_Package manager_)

Le gestionnaire de paquets utilisé est [Yarn 1 (Classic)]() mais nous devrions migrer sur [Yarn Modern](https://yarnpkg.com) prochainement.
Voir :

- [Why should you upgrade to Yarn Modern?](https://yarnpkg.com/getting-started/qa#why-should-you-upgrade-to-yarn-modern)
- [Mise à jour de Yarn · Issue #1142 · DISIC/Ara](https://github.com/DISIC/Ara/issues/1142)

#### ESLint, l’utilitaire de _lint_ et de formatage du code

**ESLint** est utilisé à la fois pour l’analyse statique du code et le formatage stylistique (indentation, etc.)
Pour les fichiers non pris en charge par ESLint (CSS, HTML, Markdown, etc), ESLint utilise **Prettier** en tant qu’outil de formatage externe.
Nous utilisons [la configuration ESLint d’Anthony Fu](https://github.com/antfu/eslint-config) comme base.
Voir aussi la configuration de ce projet : [eslint.config.mjs](https://github.com/DISIC/Ara/blob/main/eslint.config.mjs)

Une vue de l’ensemble des règles de _lint_ est disponible en exécutant à la racine du projet :

```sh
npx @eslint/config-inspector
```

On peut _linter_ l’ensemble du projet en exécutant, à la racine du projet :

```sh
yarn lint
```

On peut _linter_ et corriger les erreurs corrigeables automatiquement avec :

```sh
yarn lint --fix
```

#### Éditeur de code VSCodium / VS Code

Sont disponibles sur ce projet :

- un paramètrage par défaut qui améliore l’expérience de développement :
  - _lint_ et formatage automatique à la sauvegarde des fichiers ;
  - on ne tient pas compte des règles stylistiques dans l'IDE, mais on continue à les corriger automatiquement.
- des tâches pour _linter_ l’ensemble du projet (voir [Integrate with External Tools via Tasks](https://code.visualstudio.com/docs/debugtest/tasks)) :
  - "Lint entire project"
  - "Lint + fix entire project"

### Spécificités par _workspace_

- [Documentation du back (confiture-rest-api)](https://github.com/DISIC/Ara/blob/main/confiture-rest-api/README.md)
- [Documentation du front (confiture-web-app)](https://github.com/DISIC/Ara/blob/main/confiture-web-app/README.md)

## Déploiement

- La branche principale `main` correspond à l’environnement de production.
- Les branches de pull request (PR) correspondent à l’environnement de développement.

### Environnement de développement

Le front-end est automatiquement déployé sur Netlify :

- La branche principale `main` est déployée sur [https://ara-production-81d0da406fda.herokuapp.com/](https://ara-production-81d0da406fda.herokuapp.com/).
- Les branches des PR sont déployées sur [ pipeline-xxxxxx-xxxxxx.herokuapp.com ](pipeline-xxxxxx-xxxxxx.herokuapp.com) (où XXX est un identifiant aléatoire généré par Heroku).

Pour réinitialiser la base de données :

```sh
DATABASE_URL="<url_de_la_base_de_donnees_de_developpement>" yarn prisma migrate reset
```

### Environnement de production

⚠️ Avant de déployer sur l’environnement de production, s’assurer que son adresse IP est whitelistée sur OVH.

Pour lancer les migrations de la base de données sur OVH :

```sh
DATABASE_URL="<url_de_la_base_de_donnees_de_production>" yarn prisma migrate deploy
```
