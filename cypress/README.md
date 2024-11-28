# Tests end-to-end

[Cypress](https://www.cypress.io/) est utilisé pour lancer des tests end-to-end (e2e) dans un navigateur pour reproduire le comportement des utilisateurs.

Différentes données (audit, rapport ou compte) sont créées avant chaque test et de manière indépendante. Il est possible d’ajouter des options en fonction de la donnée souhaitée avec la fonction [`createTestAudit()`](/cypress/support/commands.ts).

Les tests peuvent être lancés de 2 manières, depuis la racine du projet :

- Via l’application Cypress avec :

  ```sh
  yarn tests:open
  ```

- Via le terminal avec :

  ```sh
  yarn tests:run
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
