describe("Accessibility", () => {
  it("Has no detectable a11y violations on load", () => {
    cy.visit("http://localhost:3000");
    cy.injectAxe();

    cy.configureAxe({
      locale: {
        lang: "fr"
      }
    });

    cy.checkA11y(undefined, {
      runOnly: {
        type: "tag",
        values: ["rgaav4"]
      }
    });
  });
});
