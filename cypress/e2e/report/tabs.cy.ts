import { TabSlug } from "../../../confiture-web-app/src/enums";
import { testTabsWithPrevNext, testTabReachByURL } from "../common";

describe("Tabs management", () => {
  it("User can’t see improvements tab if there are no improvements with comment", () => {
    cy.createTestAudit({
      isComplete: true,
      hasNoImprovementsComments: true
    }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.contains("button", "Points d’amélioration").should("not.exist");
    });
  });

  it("User can see pages anchors in improvements tab", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.contains("button", "Détails des non-conformités").click();
      cy.get(".fr-sidemenu__item").then((els) => {
        expect(els).to.have.length(9);
      });
    });
  });

  it("User can see pages anchors in errors tab", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.contains("button", "Détails des non-conformités").click();
      cy.get(".fr-sidemenu__item").then((els) => {
        expect(els).to.have.length(9);
      });
    });
  });

  it("User can go back to previous/next tab with navigator back and previous buttons", () => {
    cy.createTestAudit().then(({ reportId }) => {
      const slug = TabSlug.REPORT_ERRORS_SLUG;
      const nextSlug = TabSlug.REPORT_IMPROVEMENTS_SLUG;
      cy.visit(`http://localhost:3000/rapport/${reportId}/${slug}`);
      testTabsWithPrevNext(slug, nextSlug);
    });
  });

  it("User can display the audit at a given tab directly thanks to a URL slug", () => {
    cy.createTestAudit().then(({ reportId }) => {
      const slug = TabSlug.REPORT_ERRORS_SLUG;
      cy.visit(`http://localhost:3000/rapport/${reportId}/${slug}`);
      testTabReachByURL(slug);
    });
  });
});
