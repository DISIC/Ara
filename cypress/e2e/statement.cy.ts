describe("Statement", () => {
  it("User can copy statement html", () => {
    cy.createTestAudit({ fillStatement: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/declaration/${reportId}`);
      cy.contains("Copier le code HTML").click();
      cy.contains("Code HTML copié");
      cy.window().focus();
      cy.window()
        .its("navigator.clipboard")
        .then(clipboard => clipboard.readText()
          .then((t: string) => {
            cy.wrap(t).should("not.be.empty");
          }));
    });
  });
});
