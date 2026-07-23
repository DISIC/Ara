import { TabSlug } from "../../../confiture-web-app/src/enums";

describe("Actions management", () => {
  it("User can go to settings page from audit", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.contains("Actions").click();
      cy.contains("Modifier les paramètres de l’audit").click();
      cy.get("h1").contains("Paramètres de l’audit");
      cy.url().should(
        "eq",
        `http://localhost:3000/audits/${editId}/parametres`
      );
    });
  });

  it("User can edit procedure name", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/parametres`);

      cy.getByLabel("Nom du site ou du service audité").should(
        "have.value",
        "Audit de mon petit site"
      );

      cy.getByLabel("Nom du site ou du service audité")
        .clear()
        .type("Audit de mon gros site");

      cy.contains("Enregistrer les modifications").click();

      cy.url().should(
        "eq",
        `http://localhost:3000/audits/${editId}/synthese`
      );
      cy.get("h1").contains("Audit de mon gros site");
    });
  });

  it("User can edit pages", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation/`);

      cy.contains("Actions").click();
      cy.contains("Modifier les paramètres de l’audit").click();

      cy.get("fieldset .fr-input-group .fr-input[id^='page-name']").then(
        (els) => {
          expect(els).to.have.length(8);
          const expectedPages = [
            "Accueil",
            "Contact",
            "À propos",
            "Blog",
            "Article",
            "Connexion",
            "Documentation",
            "FAQ"
          ];
          expectedPages.forEach((expectedPageName, i) => {
            cy.wrap(els[i]).should("have.value", expectedPageName);
          });
        }
      );

      cy.contains("button", "Supprimer").click();
      cy.contains("button", "Supprimer").click();
      cy.contains("button", "Supprimer").click();

      cy.getByLabel("Nom de la page").clear().type("Accueil du blog");
      cy.getByLabel("URL de la page")
        .clear()
        .type("https://example.com/blog/accueil");

      cy.get("#page-order-1").select("0");

      cy.get("#page-order-4").select("1");

      cy.contains("Ajouter une page").click();
      cy.get("fieldset .fr-input-group .fr-input[id^='page-name']")
        .last()
        .type("Paramètres");
      cy.get("fieldset .fr-input-group .fr-input[id^='page-url']")
        .last()
        .type("https://example.com/parametres");

      cy.contains("Enregistrer les modifications").click();
      cy.url().should(
        "eq",
        `http://localhost:3000/audits/${editId}/generation/${TabSlug.AUDIT_COMMON_ELEMENTS_SLUG}`
      );

      cy.get("[data-cy='tab-label']").then((els) => {
        expect(els).to.have.length(7);
        const expectedPages = [
          "Éléments transverses",
          "Article",
          "FAQ",
          "Accueil du blog",
          "Connexion",
          "Documentation",
          "Paramètres"
        ];
        expectedPages.forEach((expectedPageName, i) => {
          cy.wrap(els[i]).should("have.text", expectedPageName);
        });
      });
    });
  });

  it("User can interchange page names", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation/`);

      cy.contains("Actions").click();
      cy.contains("Modifier les paramètres de l’audit").click();

      cy.get("fieldset .fr-input-group .fr-input[id^='page-name']").then(
        (els) => {
          expect(els).to.have.length(8);
          const expectedPages = [
            "Accueil",
            "Contact",
            "À propos",
            "Blog",
            "Article",
            "Connexion",
            "Documentation",
            "FAQ"
          ];
          expectedPages.forEach((expectedPageName, i) => {
            cy.wrap(els[i]).should("have.value", expectedPageName);
          });
        }
      );

      cy.get("#page-name-1-input").clear().type("Blog");
      cy.get("#page-name-2-input").clear().type("Accueil");
      cy.get("#page-name-4-input").clear().type("Contact");
      cy.get("#page-name-6-input").clear().type("FAQ");
      cy.get("#page-name-8-input").clear().type("Connexion");

      cy.contains("Enregistrer les modifications").click();

      cy.url().should(
        "eq",
        `http://localhost:3000/audits/${editId}/generation/${TabSlug.AUDIT_COMMON_ELEMENTS_SLUG}`
      );

      cy.get("[data-cy='tab-label']").then((els) => {
        expect(els).to.have.length(9);
        const expectedPages = [
          "Éléments transverses",
          "Blog",
          "Accueil",
          "À propos",
          "Contact",
          "Article",
          "FAQ",
          "Documentation",
          "Connexion"
        ];
        expectedPages.forEach((expectedPageName, i) => {
          cy.wrap(els[i]).should("have.text", expectedPageName);
        });
      });
    });
  });

  it("User can delete an audit", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("Actions").click();
      cy.contains("Supprimer l’audit").click();

      cy.contains("Supprimer l’audit « Audit de mon petit site »");
      cy.get("dialog").contains("button", "Supprimer définitivement l’audit").click();

      cy.url().should("eq", "http://localhost:3000/");
      cy.contains("Audit « Audit de mon petit site » supprimé");
    });
  });

  it("User can copy an audit", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.contains("button", "Actions").click();
      cy.contains("button", "Dupliquer l’audit").click();

      cy.getByLabel("Nom de la copie").type("Audit de mon petit site (2)");
      cy.get("dialog").contains("button", "Dupliquer l’audit").click();

      cy.contains("Audit « Audit de mon petit site (2) » créé", { timeout: 50_000 });
      cy.contains("button", "Accéder à l’audit").click();

      cy.contains("h1 + p", "Audit de mon petit site (2)");
    });
  });

  it("User can download an audit", () => {
    cy.exec("rm -rf cypress/downloads");

    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("Actions").click();
      cy.contains("Exporter l’audit").click();

      cy.readFile("cypress/downloads/audit-audit-de-mon-petit-site.csv");
    });
  });

  it("User can transfer an audit", () => {
    cy.createTestAudit({ isPristine: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.contains("button", "Actions").click();
      cy.contains("button", "Transférer l’audit").click();

      // Error: 2nd field is empty
      cy.getByLabel("Adresse e-mail du destinataire")
        .clear()
        .type("example@domain.com");

      cy.contains("button[type='submit']", "Transférer l’audit").click();
      cy.getByLabel("Confirmer e-mail du destinataire").should("be.focused");

      cy.getByLabel("Confirmer e-mail du destinataire")
        .clear()
        .type("exampl@domain.com");

      // Error: 2nd field isnt equal to first
      cy.contains("button[type='submit']", "Transférer l’audit").click();
      cy.getByLabel("Confirmer e-mail du destinataire").should("be.focused");

      // Valid form
      cy.getByLabel("Confirmer e-mail du destinataire")
        .clear()
        .type("example@domain.com");
      cy.contains("button[type='submit']", "Transférer l’audit").click();

      // Assert we're on homepage with toast
      cy.contains("Je réalise un audit d’accessibilité avec Ara");
      cy.contains("Audit « Audit de mon petit site » transféré");
      cy.contains("Lien d’accès envoyé à example@domain.com");
    });
  });
});
