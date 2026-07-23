import { slugify } from "../../../confiture-web-app/src/utils";
import * as auditJson from "../../fixtures/audit.json";
import { testTabReachByURL, testTabsWithPrevNext } from "./../common";

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
});
