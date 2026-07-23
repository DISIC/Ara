import { TabSlug } from "../../../confiture-web-app/src/enums";

// FIXME: weird behaviour with page reloads (caused by "fake tabs"?)
describe("Report", () => {
  it("User can see correct pages count and transverse criteria count", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.get("#repartition-des-criteres-par-pages + .fr-table tbody tr").then(
        (els) => {
          expect(els).to.have.length(8);
        }
      );

      cy.contains(
        "35 critères non conformes concernent des éléments transverses à toutes les pages de l’échantillon."
      );
    });
  });

  it("User can filter errors", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.contains("button", "Détails des non-conformités").click();
      cy.contains("315 non-conformités");
      cy.get(".criterium-title").then((els) => {
        expect(els).to.have.length(315);
      });

      // Check & uncheck easy to fix
      cy.contains("Uniquement les erreurs faciles à corriger").click();
      cy.contains("45 non-conformités");
      cy.get(".criterium-title").then((els) => {
        expect(els).to.have.length(45);
      });
      cy.contains("Uniquement les erreurs faciles à corriger").click();

      // Uncheck minor impact
      cy.contains("Mineur (81)").click();
      cy.contains("234 non-conformités");
      cy.get(".criterium-title").then((els) => {
        expect(els).to.have.length(234);
      });

      // Uncheck major impact
      cy.contains("Majeur (81)").click();
      cy.contains("153 non-conformités");
      cy.get(".criterium-title").then((els) => {
        expect(els).to.have.length(153);
      });

      // Uncheck blocking impact
      cy.contains("Bloquant (81)").click();
      cy.contains("72 non-conformités");
      cy.get(".criterium-title").then((els) => {
        expect(els).to.have.length(72);
      });

      // Uncheck not specified impact
      cy.contains("Impact non renseigné (72)").click();
      cy.contains("0 non-conformité");
      cy.get(".criterium-title").should("not.exist");

      // Reset filters
      cy.contains("button", "Réinitialiser les filtres").click();
      cy.contains("315 non-conformités");
      cy.get(".criterium-title").then((els) => {
        expect(els).to.have.length(315);
      });
    });
  });

  it("User can reach topics titles with anchors", () => {
    cy.createTestAudit().then(({ reportId }) => {
      const slug = TabSlug.REPORT_ERRORS_SLUG;
      cy.visit(`http://localhost:3000/rapport/${reportId}/${slug}`);
      cy.get(".fr-sidemenu__link")
        .should("exist")
        .each(($el, index) => {
          cy.wrap($el).click();
          cy.get(".page-title").eq(index).should("exist").isWithinViewport();
        });
    });
  });
});
