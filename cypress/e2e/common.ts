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
    .click()
    .isWithinViewport();
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

export function createNotCompliantItem(index: number, title: string, comment: string, force: boolean = false) {
  cy.get(`.criterium-container .not-compliant-item:nth-child(${index}) input[type='text']`)
    .clear({ force })
    .type(title);

  cy.wait(["@updateResults"]);

  cy.get(`.criterium-container .not-compliant-item:nth-child(${index}) .tiptap`)
    .type(comment);

  cy.wait(["@updateResults"]);
}

export function shouldHaveNotCompliantItem(index: number, title: string, comment: string) {
  cy.get(`.criterium-container .not-compliant-item:nth-child(${index}) input[type='text']`).should("have.value", title);
  cy.get(`.criterium-container .not-compliant-item:nth-child(${index}) .tiptap`).should("contain.text", comment);
}
