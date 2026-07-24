describe("Tranverse tab management", () => {
  it("User can see transverse status and comment from other pages", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("button[role=\"tab\"]", "Documentation").click();
      cy.get(".criterium-container")
        .eq(2)
        .find(".criterium-transverse-notice")
        .contains(
          "Vous avez évalué ce critère Non conforme pour les éléments transverses."
        );

      cy.get(".criterium-container")
        .eq(2)
        .contains("button", "Voir les erreurs")
        .click();

      cy.get(".criterium-container").eq(2).contains("Une erreur ici");

      cy.get(".criterium-container")
        .eq(2)
        .contains("button", "Masquer les erreurs")
        .click();

      cy.get(".criterium-container")
        .eq(2)
        .contains("Une erreur ici")
        .should("not.exist");
    });
  });

  it("User can add transverse elements", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("Lister les éléments transverses").click();
      cy.getByLabel("Nom de l’élément transverse").type(
        "FoooElements, BarElements, ThingElements"
      );
      cy.get(".transverse-elements").contains("Ajouter").click();

      cy.contains("button", "FoooElements").should("exist");
      cy.contains("button", "BarElements").should("exist");
      cy.contains("button", "ThingElements").should("exist");

      cy.contains("BarElements").click();

      cy.contains("Enregistrer").click();

      cy.contains("FoooElements").should("exist");
      cy.contains("BarElements").should("not.exist");
      cy.contains("ThingElements").should("exist");
    });
  });
});
