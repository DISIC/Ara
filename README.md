# Ara

Réaliser des audits d'accessibilité numérique sur la base du référentiel général d'amélioration de l'accessibilité (RGAA).
Générer et consulter les rapports de ces audits et les déclarations d'accessibilité.

## Développement

- [Documentation du front](https://github.com/DISIC/Ara/blob/main/confiture-web-app/README.md).
- [Documentation du back](https://github.com/DISIC/Ara/blob/main/confiture-rest-api/README.md).

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
