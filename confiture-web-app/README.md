# Confiture Web App

Partie front-end de l'application Confiture.

Le projet a été créé avec [Vite.js](https://vitejs.dev/). Le framework front-end est [Vue.js (en version 3)](https://vuejs.org/) avec [TypeScript](https://www.typescriptlang.org/).

La partie style utilise le [DSFR (Système de Design de l'État)](https://www.systeme-de-design.gouv.fr/) et du CSS sans pré-processeur.

## Développement

Installer les dépendances :

```sh
yarn
```

Générer le fichier de méthodologies de test :

```sh
yarn generate:methodologies
```

Lancer le [serveur local sur le port 3000](http://localhost:3000) :

```sh
yarn dev
```

## Déploiement

Le site est automatiquement déployé sur Netlify à chaque push. La branche principale `main` est déployée sur [https://confiture.netlify.app/](https://confiture.netlify.app/) et chaque branche comporte le lien du déploiement dans la PR associée.
