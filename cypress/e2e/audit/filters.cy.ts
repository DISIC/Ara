describe("Filter management", () => {
  it("User can search in criteria title", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.getByLabel("Recherche par mots clés")
        .clear()
        .type("alternative")
        .type("{enter}");

      cy.contains("9 résultats");
      cy.get("li.criterium-container").then((els) => {
        expect(els).to.have.length(9);
      });
    });
  });

  it("User can hide tests and references", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.contains("Masquer les tests et références").click();
      cy.contains("Tests et références du critère 1.1").should("not.exist");
    });
  });

  it("User can filter criteria", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      // Check total length
      cy.get("li.criterium-container").then((els) => {
        expect(els).to.have.length(106);
      });

      // Check C criteria
      cy.contains("Conforme (323)").click();
      cy.get("li.criterium-container").then((els) => {
        expect(els).to.have.length(36);
      });
      cy.get("li.criterium-container").each((el) => {
        cy.wrap(el)
          .find("fieldset > div label")
          .first()
          .should("have.class", "green");
      });

      // Add NA criteria
      cy.contains("Non applicable (315)").click();
      cy.get("li.criterium-container").then((els) => {
        expect(els).to.have.length(71);
      });
      cy.get("li.criterium-container").each((el) => {
        cy.wrap(el)
          .find("fieldset > div label")
          .should(
            "satisfy",
            (el) =>
              el[0].classList.contains("green") || el.at(-1).contains("grey")
          );
      });

      // Add NC criteria
      cy.contains("Non conforme (315)").click();
      cy.get("li.criterium-container").then((els) => {
        expect(els).to.have.length(106);
      });
      cy.get("li.criterium-container").each((el) => {
        cy.wrap(el)
          .find("fieldset > div label")
          .should(
            "satisfy",
            (el) =>
              el[0].classList.contains("green") ||
              el[1].contains("red") ||
              el.at(-1).contains("grey")
          );
      });
    });
  });

  it("User can filter evaluated criteria", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("Masquer les critères évalués").click();
      cy.contains("Tous les critères évalués ont été masqués");

      cy.contains("Masquer les critères évalués").click();

      cy.get("li.criterium-container fieldset input:checked")
        .first()
        .click({ force: true });

      cy.get("li.criterium-container fieldset input:checked")
        .eq(0)
        .click({ force: true });

      cy.contains("button[role=\"tab\"]", "Article").click();

      cy.get("li.criterium-container fieldset input:checked")
        .first()
        .click({ force: true });

      cy.contains("Masquer les critères évalués").click();
      cy.get("li.criterium-container").should("have.length", 1);

      cy.contains("button[role=\"tab\"]", "Éléments transverses").click();
      cy.get("li.criterium-container").should("have.length", 2);

      cy.get("li.criterium-container fieldset input")
        .first()
        .click({ force: true });

      cy.contains("Mettre à jour critères masqués").click();

      cy.get("li.criterium-container").should("have.length", 1);
    });
  });

  it("User can reset filters", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("Conforme (323)").click();
      cy.contains("Non applicable (315)").click();
      cy.contains("Masquer les tests et références").click();
      cy.getByLabel("Recherche par mots clés")
        .clear()
        .type("alternative")
        .type("{enter}");

      cy.get("li.criterium-container").then((els) => {
        expect(els).to.have.length(6);
      });

      cy.contains("button", "Réinitialiser").click();

      cy.get("li.criterium-container").then((els) => {
        expect(els).to.have.length(106);
      });

      cy.focused().should("have.attr", "placeholder", "Rechercher un critère");
      cy.contains("button", "Réinitialiser").should("not.exist");
    });
  });

  it("User can automatically set as NA some linked criteria", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      // check that linked criteria are also NA
      cy.get(".criterium-container").contains("Non applicable").click();
      cy.get(".criterium-container").eq(2).find("fieldset > div input[type='checkbox']").eq(2).should("be.checked");
      cy.get(".criterium-container").eq(2).contains("Vous avez évalué le critère 1.1 Non applicable");

      // check that linked criteria get their previous status back
      cy.get(".criterium-container").contains("Conforme").click();
      cy.get(".criterium-container").eq(2).find("fieldset > div input[type='checkbox']").eq(2).should("not.be.checked");
      cy.get(".criterium-container").eq(2).find("fieldset > div input[type='checkbox']").eq(1).should("be.checked");
      cy.get(".criterium-container").eq(2).contains("Vous avez évalué le critère 1.1 Non applicable").should("not.exist");
    });
  });

  it("User can show or hide topic criteria", () => {
    cy.createTestAudit({ isPristine: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      // Check total criteria count
      cy.get(".criterium-container").should("have.length", 106);

      // Hide topic 1 criteria (-9)
      cy.get("button.toggle-topic-button").first().click();
      cy.get(".criterium-container").should("have.length", 97);

      // Show topic 1 criteria (+9)
      cy.get("button.toggle-topic-button").first().click();
      cy.get(".criterium-container").should("have.length", 106);
    });
  });
});
