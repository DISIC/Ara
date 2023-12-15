# Ara

Réaliser des audits d'accessibilité numérique sur la base du référentiel général d'amélioration de l'accessibilité (RGAA).
Générer et consulter les rapports de ces audits et les déclarations d'accessibilité.

## Développement

- La partie front est une application Vue.js 3 avec Typescript. [Voir les instructions de développement](https://github.com/DISIC/Ara/blob/main/confiture-web-app/README.md).
- La partie back est une API Nest.js et utilise une base de données PostgreSQL. [Voir les instructions de développement](https://github.com/DISIC/Ara/blob/main/confiture-rest-api/README.md).

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
