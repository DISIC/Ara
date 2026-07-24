import { NodeResult, Result } from "axe-core";

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

export function checkA11y() {
  cy.injectAxe();

  cy.configureAxe({
    locale: {
      lang: "fr"
    },
    reporter: "option"
  });

  cy.checkA11y(undefined, {
    runOnly: {
      type: "tag",
      values: ["RGAAv4"]
    }
  }, terminalLog);
}

function terminalLog(violations: Result[]) {
  cy.log(
    "log",
    `${violations.length} accessibility violation${
      violations.length === 1 ? "" : "s"
    } ${violations.length === 1 ? "was" : "were"} detected`
  );

  const violationData = violations.map(
    ({ id, impact, description, nodes }) => ({

      id,
      impact,
      description,
      nodes: nodes.map((value: NodeResult) => value.target).join(",")
    })
  );

  cy.table(violationData);
}
