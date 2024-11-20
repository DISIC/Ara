import * as auditJson from "../fixtures/audit.json";

describe("Audit", () => {
  it("User can create an audit", () => {
    function fillPageField(pageIndex: number, field: string, content: string) {
      cy.contains("Page " + pageIndex)
        .parent()
        .parent()
        .contains(field)
        .parent()
        .find("input")
        .clear()
        .type(content);
    }

    cy.visit("http://localhost:3000");

    // Navigate to new audit page
    cy.contains("a", "Je réalise un audit").click();

    // Fill fields
    cy.contains("106 critères").click();

    cy.contains("Nom du site à auditer")
      .parent()
      .find("input")
      .type(auditJson.procedureName);

    cy.contains("button", "Étape suivante").click();
    cy.contains("button", "Ajouter une page").click();

    fillPageField(1, "Nom de la page", auditJson.pages[0].name);
    fillPageField(1, "URL de la page", auditJson.pages[0].url);
    fillPageField(2, "Nom de la page", auditJson.pages[1].name);
    fillPageField(2, "URL de la page", auditJson.pages[1].url);
    fillPageField(3, "Nom de la page", auditJson.pages[2].name);
    fillPageField(3, "URL de la page", auditJson.pages[2].url);
    fillPageField(4, "Nom de la page", auditJson.pages[3].name);
    fillPageField(4, "URL de la page", auditJson.pages[3].url);
    fillPageField(5, "Nom de la page", auditJson.pages[4].name);
    fillPageField(5, "URL de la page", auditJson.pages[4].url);
    fillPageField(6, "Nom de la page", auditJson.pages[5].name);
    fillPageField(6, "URL de la page", auditJson.pages[5].url);
    fillPageField(7, "Nom de la page", auditJson.pages[6].name);
    fillPageField(7, "URL de la page", auditJson.pages[6].url);
    fillPageField(8, "Nom de la page", auditJson.pages[7].name);
    fillPageField(8, "URL de la page", auditJson.pages[7].url);

    cy.contains("button", "Étape suivante").click();

    // Fill auditor informations
    cy.contains("Adresse e-mail")
      .parent()
      .find("input")
      .type(auditJson.auditorEmail);

    cy.contains("Prénom et nom (optionnel)")
      .parent()
      .find("input")
      .type(auditJson.auditorName);

    // Submit new audit form
    cy.contains("Valider les paramètres").click();

    // Check user is redirect to audit overview page
    cy.get("h1").contains(auditJson.procedureName);
  });

  // TODO: debounce bagillion PATCHes more correclty
  it.skip("User can fill an audit (status, description, recommendation, image, impact, easy to fix)", () => {
    cy.request("POST", "http://localhost:3000/api/audits", {
      ...auditJson,
      pages: auditJson.pages.slice(0, 2),
    }).then((data) => {
      cy.visit(
        `   http://localhost:3000/audits/${data.body.editUniqueId}/generation`,
      );

      cy.contains("button", auditJson.pages[0].name).click();

      // Fill each criterium for the page
      cy.get(".criterium-container").each((container, i) => {
        if (i % 3 === 0) {
          // conforme
          cy.wrap(container).contains("Conforme").click();
          cy.wrap(container).contains("Points d’amélioration").click();
          cy.wrap(container)
            .getByLabel("Points d’amélioration")
            .type("This is a comment about a compliant criterium");
        } else if (i % 3 === 1) {
          // non conforme
          cy.wrap(container).contains("Non conforme").click();
          cy.wrap(container)
            .getByLabel("Erreur et recommandation")
            .type(
              "   Oh no there's an error concerning this non compliant criterium",
            );

          if (i % 2 === 0) {
            cy.wrap(container).contains("Facile à corriger").click();
          }
        } else {
          cy.wrap(container).contains("Non applicable").click();
          cy.wrap(container).contains("Commentaire").click();
          cy.wrap(container).getByLabel("Commentaire").type("I dunno.");
        }
      });
    });
  });

  it("User can go to settings page from audit (small viewport)", () => {
    cy.visit("http://localhost:3000/audits/edit-audit-edition/generation");
    cy.contains("Actions").click();
    cy.contains("Accéder aux paramètres").click();
    cy.get("h1").contains("Paramètres de l’audit");
    cy.url().should(
      "eq",
      "http://localhost:3000/audits/edit-audit-edition/parametres",
    );
  });

  it("User can go to settings page from audit (large viewport)", () => {
    cy.viewport(1400, 800);
    cy.visit("http://localhost:3000/audits/edit-audit-edition/generation");
    cy.contains("a", "Paramètres").click();
    cy.get("h1").contains("Paramètres de l’audit");
    cy.url().should(
      "eq",
      "http://localhost:3000/audits/edit-audit-edition/parametres",
    );
  });

  it("User can edit procedure name", () => {
    cy.visit("http://localhost:3000/audits/edit-audit-edition/parametres");

    cy.getByLabel("Nom du site audité").should(
      "have.value",
      "Audit de mon petit site",
    );

    cy.getByLabel("Nom du site audité").clear().type("Audit de mon gros site");

    cy.contains("Enregistrer les modifications").click();

    cy.url().should(
      "eq",
      "http://localhost:3000/audits/edit-audit-edition/generation",
    );
    cy.get("h1").contains("Audit de mon gros site");
  });

  it("User can edit pages", () => {
    cy.visit("http://localhost:3000/audits/edit-audit-edition/parametres");

    cy.get("fieldset .fr-input-group .fr-input[id^='page-name']").then(
      (els) => {
        expect(els).to.have.length(8);
        const expectedPages = [
          "Accueil",
          "Contact",
          "À propos",
          "Blog",
          "Article",
          "Connexion",
          "Documentation",
          "FAQ",
        ];
        expectedPages.forEach((expectedPageName, i) => {
          cy.wrap(els[i]).should("have.value", expectedPageName);
        });
      },
    );

    cy.contains("button", "Supprimer").click();
    cy.contains("button", "Supprimer").click();
    cy.contains("button", "Supprimer").click();

    cy.getByLabel("Nom de la page").clear().type("Accueil du blog");
    cy.getByLabel("URL de la page")
      .clear()
      .type("https://example.com/blog/accueil");

    cy.get("#page-order-1").select("0");

    cy.get("#page-order-4").select("1");

    cy.contains("Ajouter une page").click();
    cy.get("fieldset .fr-input-group .fr-input[id^='page-name']")
      .last()
      .type("Paramètres");
    cy.get("fieldset .fr-input-group .fr-input[id^='page-url']")
      .last()
      .type("https://example.com/parametres");

    cy.contains("Enregistrer les modifications").click();
    cy.url().should(
      "eq",
      "http://localhost:3000/audits/edit-audit-edition/generation",
    );

    cy.get("[role='tablist'] button").then((els) => {
      expect(els).to.have.length(7);
      const expectedPages = [
        "Éléments transverses",
        "Article",
        "FAQ",
        "Accueil du blog",
        "Connexion",
        "Documentation",
        "Paramètres",
      ];
      expectedPages.forEach((expectedPageName, i) => {
        cy.wrap(els[i]).should("have.text", expectedPageName);
      });
    });
  });

  it("User can delete an audit (small viewport)", () => {
    cy.visit("http://localhost:3000/audits/edit-audit-deletion/generation");

    cy.contains("Actions").click();
    cy.contains("Supprimer l’audit").click();

    cy.contains("Vous allez supprimer l’audit");
    cy.get("dialog").contains("button", "Supprimer l’audit").click();

    cy.url().should("eq", "http://localhost:3000/");
    cy.contains("L’audit a correctement été supprimé.");
  });

  // it.skip("User can filter criteria", () => {});
  // it.skip("User can copy an audit", () => {});
  // it.skip("User can complete a11y statement", () => {});
  // it.skip("User can update notes", () => {});
  // it.skip("User can download an audit", () => {});
  // it.skip("User can search criteria", () => {});
  // it.skip("User can check Markdown syntax", () => {});
});
