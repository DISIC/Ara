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
        .type(content);
    }

    cy.visit("http://localhost:3000");

    // Navigate to new audit page
    cy.contains("Je démarre un audit").click();

    // Fill fields
    cy.contains("Complet, de conformité").click();

    cy.contains("Nom du site à auditer")
      .parent()
      .find("input")
      .type(auditJson.procedureName);

    fillPageField(1, "Nom de la page", auditJson.pages[0].name);
    fillPageField(1, "URL de la page", auditJson.pages[0].url);

    fillPageField(2, "Nom de la page", auditJson.pages[1].name);
    fillPageField(2, "URL de la page", auditJson.pages[1].url);

    // Delete empty pages "Supprimer" buttons
    cy.get('[data-cy="delete"]').eq(2).click();
    cy.get('[data-cy="delete"]').eq(2).click();
    cy.get('[data-cy="delete"]').eq(2).click();
    cy.get('[data-cy="delete"]').eq(2).click();
    cy.get('[data-cy="delete"]').eq(2).click();

    // Fill auditor informations
    cy.contains("Prénom et nom (optionnel)")
      .parent()
      .find("input")
      .type(auditJson.procedureAuditorName);

    cy.contains("Adresse e-mail")
      .parent()
      .find("input")
      .type(auditJson.procedureAuditorEmail);

    // Submit new audit form
    cy.contains("Valider les paramètres").click();

    // Check user is redirect to audit overview page
    cy.get("h1").contains(auditJson.procedureName);
  });
  // it.skip("User can fill an audit (status, description, recommendation, image, impact, easy to fix)", () => {});
  // it.skip("User can check Markdown syntax", () => {});
  // it.skip("User can complete a11y statement", () => {});
  // it.skip("User can update notes", () => {});
  // it.skip("User can filter criteria", () => {});
  // it.skip("User can search criteria", () => {});
  // it.skip("User can copy an audit", () => {});
  // it.skip("User can delete an audit", () => {});
  // it.skip("User can downlaod an audit", () => {});
});
