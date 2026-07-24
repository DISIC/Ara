import { slugify } from "../../../confiture-web-app/src/utils";
import * as auditJson from "../../fixtures/audit.json";
import { testTabReachByURL, testTabsWithPrevNext } from "../common";

describe("Audit tabs management", () => {
  it("User can display the audit at a given tab directly thanks to a URL slug", () => {
    cy.createTestAudit().then(({ editId }) => {
      const slug = slugify(auditJson.pages[2].name);
      cy.visit(`http://localhost:3000/audits/${editId}/generation/${slug}`);
      testTabReachByURL(slug);
    });
  });

  it("User can go back to previous/next tab with navigator back and previous buttons", () => {
    cy.createTestAudit().then(({ editId }) => {
      const slug = slugify(auditJson.pages[2].name);
      const nextSlug = slugify(auditJson.pages[3].name);
      cy.visit(`http://localhost:3000/audits/${editId}/generation/${slug}`);
      testTabsWithPrevNext(slug, nextSlug);
    });
  });

  it("User can reach topics titles with anchors", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation/`);
      cy.get(".topic-filter-anchor")
        .should("exist")
        .each(($el, index) => {
          cy.wrap($el).click();
          cy.get(`#topic_${index + 1}`).isWithinViewport();
        });
    });
  });

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
