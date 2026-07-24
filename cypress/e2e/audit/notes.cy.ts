describe("Notes management", () => {
  it("User can update notes", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".notes-desktop-link")
        .contains("button", "Ajouter des observations")
        .click();

      cy.get(".tiptap").type("Annotations de l’audit");
      cy.get("dialog#notes-modal").contains("button", "Fermer").click();

      cy.get(".notes-desktop-link")
        .contains("button", "Ajouter des observations")
        .click();
      cy.contains("Annotations de l’audit");
    });
  });
});
