describe("Common", () => {
  it("check that audit stats are coherent accross pages", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({
        auditorEmail: username,
        isComplete: true,
        fillStatement: true
      }).then(({ editId, reportId }) => {
        // TODO: include OnboardingModal donut when fixed
        cy.visit("http://localhost:3000/compte");
        cy.get(".audit-compliance-level").should("contain.text", "51 %");

        cy.visit(`http://localhost:3000/declarations/${reportId}`);
        cy.contains(`que 51 % des critères`);

        cy.visit(`http://localhost:3000/rapport/${reportId}`);
        cy.get("[role='tabpanel'] .card-metric.card-metric--blue").should(
          "contain.text",
          "51 %"
        );
        cy.get("[role='tabpanel'] .card-metric.card-metric--red").should(
          "contain.text",
          "35"
        );
        cy.get("[role='tabpanel'] .card-metric.card-metric--green").should(
          "contain.text",
          "36"
        );

        cy.visit(`http://localhost:3000/audits/${editId}/generation`);
        cy.get(".card-metric.card-metric--blue").should("contain.text", "51 %");
        cy.get(".card-metric.card-metric--red").should("contain.text", "35");
        cy.get(".card-metric.card-metric--green").should("contain.text", "36");

        cy.contains("button", username).click();
        cy.contains("button", "Me déconnecter").click();

        cy.visit(`http://localhost:3000/audits/${editId}/synthese`);
        cy.get(".card-metric.card-metric--blue").should("contain.text", "51 %");
        cy.get(".card-metric.card-metric--red").should("contain.text", "35");
        cy.get(".card-metric.card-metric--green").should("contain.text", "36");
      });
    });
  });
});
