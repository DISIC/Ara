import * as auditJson from "../../fixtures/audit.json";

describe("Audit management", () => {
  it("User can create an audit", () => {
    function fillPageField(pageIndex: number, field: string, content: string) {
      cy.contains(`Page ${pageIndex}`)
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

    cy.contains("Nom du site ou du service à auditer")
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

    cy.contains("button", "Ignorer cette étape").click();

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

    // Check user is redirect to audit generation page
    cy.get("h1").contains(auditJson.procedureName);
  });

  it("User can create an audit with prefilled NA topics", () => {
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

    cy.contains("Nom du site ou du service à auditer")
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

    cy.get(".checkboxes .checkbox-wrapper").last().click();

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

    // Check user is redirect to audit generation page
    cy.get("h1").contains(auditJson.procedureName);

    cy.contains("a", "Continuer").click();

    // Check NA criteria: 2 criteria on 9 pages = 18
    cy.contains("Non applicable (18)");

    // Check topic "Cadres" completion is 100%
    cy.get(".topic-filter-item").eq(1).contains("Cadres");
    cy.get(".topic-filter-item").eq(1).contains("100%");

    cy.get(".audit-progress-label").contains("Progression de l’audit");
  });

  it("User can finish the audit", () => {
    const monthes = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const monthesRe = "(?:" + monthes.join("|") + ")";
    cy.createTestAudit().then(({ editId, reportId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("button[role=\"tab\"]", "Accueil").click();

      cy.get("li.criterium-container fieldset input")
        .first()
        .click({ force: true });

      cy.contains(new RegExp(`Terminé le \\d{1,2} ${monthesRe} \\d{4}`));
      cy.contains("Progression de l’audit").should("not.exist");

      cy.contains("Bravo ! Vous êtes sur le point de terminer votre audit 🎉");

      cy.contains("a", "Accéder aux livrables").click();

      cy.contains(new RegExp(`Terminé le \\d{1,2} ${monthesRe} \\d{4}`));
      cy.contains("a", "Accéder");

      cy.contains("button", "Copier le lien de partage").click();
      cy.contains("button", "Lien copié");
      cy.assertClipboardValue(`http://localhost:3000/rapport/${reportId}/`);
    });
  });

  it("User can set a topic as NA", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.contains("button[role=\"tab\"]", "Connexion").click();
      cy.contains(" Non applicable sur la page").click();

      cy.get(".topic-heading").should("have.class", "topic-heading--hidden");
    });
  });

  it("User can edit a criterium content", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("button[role=\"tab\"]", "FAQ").click();
      cy.get(".criterium-container").contains("Non conforme");

      cy.get(".criterium-container").contains("Erreurs et recommandations (1)").click();

      cy.get(".criterium-container .not-compliant-item input[type='text']")
        .type("Absence de l'alt sur l'image");

      cy.get(".criterium-container .not-compliant-item .tiptap")
        .clear({ force: true })
        .type("Il n’y a pas de alt sur l’image du hero");

      cy.get(".criterium-container .not-compliant-item label").contains("majeur").click();
      cy.get(".criterium-container .not-compliant-item .fr-checkbox-group").contains("Facile à corriger").click();
    });
  });

  it("User can add a new not compliant item", () => {
    cy.createTestAudit({ isPristine: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".criterium-container").contains("Non conforme");

      cy.get(".criterium-container").contains("Erreurs et recommandations (1)").click();

      cy.get(".criterium-container").contains("Ajouter une erreur").click();

      cy.get(".criterium-container .not-compliant-item:last input[type='text']")
        .type("Absence de l'alt sur l'image");

      cy.get(".criterium-container .not-compliant-item:last .tiptap")
        .type("Il n’y a pas de alt sur l’image du hero");

      cy.get(".criterium-container .not-compliant-item:last label").contains("mineur").click();

      cy.get(".criterium-container .not-compliant-item:last .fr-checkbox-group").contains("Facile à corriger").click();

      cy.get(".criterium-container").contains("Erreurs et recommandations (2)");
    });
  });

  it("User can delete an not compliant item", () => {
    cy.createTestAudit({ isPristine: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".criterium-container").contains("Non conforme");

      cy.get(".criterium-container").contains("Erreurs et recommandations (1)").click();

      cy.get(".criterium-container .not-compliant-item:first .error-user-delete button").should("not.exist");

      cy.get(".criterium-container").contains("Ajouter une erreur").click();

      cy.get(".criterium-container .not-compliant-item:last input[type='text']")
        .type("Absence de l'alt sur l'image");

      cy.get(".criterium-container .not-compliant-item:last .tiptap")
        .type("Il n’y a pas de alt sur l’image du hero");

      cy.get(".criterium-container .not-compliant-item:last label").contains("mineur").click();

      cy.get(".criterium-container .not-compliant-item:last .fr-checkbox-group").contains("Facile à corriger").click();

      cy.get(".criterium-container").contains("Erreurs et recommandations (2)");

      cy.get(".criterium-container .not-compliant-item:first .error-user-delete button").contains("Supprimer").click();

      cy.get(".criterium-container").contains("Erreurs et recommandations (1)");
    });
  });

  it("User can change criteria in a completed audit to update editionDate", () => {
    cy.intercept("PATCH", `/api/audits/*/results`).as("updateResults");

    const today = new Date();
    const publicationDate = new Date(today.setDate(today.getDate() - 2));

    cy.createTestAudit({
      isComplete: true,
      publicationDate: publicationDate.toString()
    }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".audit-status").contains("Terminé le");
      cy.get(".audit-status").contains("Mis à jour le").should("not.exist");

      cy.contains("button[role=\"tab\"]", "Accueil").click();
      cy.get(".criterium-container").contains("Non conforme").click();

      cy.wait("@updateResults");

      cy.get(".audit-status").contains("Terminé le");
      cy.get(".audit-status").contains("Mis à jour le");
    });
  });

  it("User can uncheck criterium in a completed audit so it becomes in progress", () => {
    cy.intercept("PATCH", `/api/audits/*/results`).as("updateResults");

    cy.createTestAudit({
      isComplete: true
    }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".audit-status").contains("Terminé le");

      cy.contains("button[role=\"tab\"]", "Accueil").click();
      cy.get(".criterium-container").contains("Conforme").click();

      cy.wait("@updateResults");

      cy.get(".audit-progress-label").contains("Progression de l’audit");
    });
  });
});
