# Tests end-to-end

[Cypress](https://www.cypress.io/) est utilisé pour lancer des tests end-to-end (e2e) dans un navigateur pour reproduire le comportement des utilisateurs.

Avant de lancer les tests, il faut seeder la base de données depuis le dossier `confiture-rest-api` :

```sh
yarn prisma migrate reset
yarn ts-node scripts/seed.ts
```

Comme certains tests modifient la base de données (édition, suppression d’audit...), il est important de vérifier l’état de cette dernière et de la réinitialiser au besoin.

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

- Cypress ne supporte pas la gestion des liens externes avec `target="_blank"`. Dans ce cas, il faut ajouter `.invoke("removeAttr", "target")` sur le lien avant de cliquer dessus. Exemple :

  ```js
  cy.contains("a", "Compléter").invoke("removeAttr", "target").click();
  ```

- Il est préférable d'indique le type d’élément ciblé avec `contains()` pour s’assurer qu’il ne s’agisse pas d’un autre texte sur la page. Exemple :
  ```js
  cy.contains("button", "Valider les paramètres").click();
  ```
