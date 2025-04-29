export function testTabReachByURL(slug: string) {
  cy.get(`.tabs button[data-slug="${slug}"]`)
    .should("exist")
    .invoke("attr", "aria-selected")
    .should("eq", "true");
}

export function testTabsWithPrevNext(slug: string, nextSlug: string) {
  cy.get(`.tabs button[aria-selected="true"]`)
    .should("exist")
    .parent()
    .next()
    .find("button")
    .click();

  cy.get(`.tabs button[aria-selected="true"]`).isWithinViewport();

  cy.get(`.tabs button[aria-selected="true"]`)
    .invoke("attr", "data-slug")
    .should("eq", `${nextSlug}`);

  cy.go("back");

  cy.get(`.tabs button[data-slug="${slug}"]`)
    .should("exist")
    .invoke("attr", "aria-selected")
    .should("eq", "true");

  cy.go("forward");

  cy.get(`.tabs button[data-slug="${nextSlug}"]`)
    .should("exist")
    .invoke("attr", "aria-selected")
    .should("eq", "true");
}
