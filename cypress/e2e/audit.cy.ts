import { TabSlug } from "../../confiture-web-app/src/enums";
import { slugify } from "../../confiture-web-app/src/utils";
import * as auditJson from "../fixtures/audit.json";
import * as statementJson from "../fixtures/statement.json";
import { testTabReachByURL, testTabsWithPrevNext } from "./common";

describe("Audit", () => {
  it("User can create an audit", () => {
    function fillPageField(pageIndex: number, field: string, content: string) {
      cy.contains(`Page ${pageIndex}`)
        .parent()
        .parent()
        .contains(field)
        .parent()
        .find("input")
        .clear()
        .type(content);
    }

    cy.visit("http://localhost:3000");

    // Navigate to new audit page
    cy.contains("a", "Je réalise un audit").click();

    // Fill fields
    cy.contains("106 critères").click();

    cy.contains("Nom du site ou du service à auditer")
      .parent()
      .find("input")
      .type(auditJson.procedureName);

    cy.contains("button", "Étape suivante").click();
    cy.contains("button", "Ajouter une page").click();

    fillPageField(1, "Nom de la page", auditJson.pages[0].name);
    fillPageField(1, "URL de la page", auditJson.pages[0].url);
    fillPageField(2, "Nom de la page", auditJson.pages[1].name);
    fillPageField(2, "URL de la page", auditJson.pages[1].url);
    fillPageField(3, "Nom de la page", auditJson.pages[2].name);
    fillPageField(3, "URL de la page", auditJson.pages[2].url);
    fillPageField(4, "Nom de la page", auditJson.pages[3].name);
    fillPageField(4, "URL de la page", auditJson.pages[3].url);
    fillPageField(5, "Nom de la page", auditJson.pages[4].name);
    fillPageField(5, "URL de la page", auditJson.pages[4].url);
    fillPageField(6, "Nom de la page", auditJson.pages[5].name);
    fillPageField(6, "URL de la page", auditJson.pages[5].url);
    fillPageField(7, "Nom de la page", auditJson.pages[6].name);
    fillPageField(7, "URL de la page", auditJson.pages[6].url);
    fillPageField(8, "Nom de la page", auditJson.pages[7].name);
    fillPageField(8, "URL de la page", auditJson.pages[7].url);

    cy.contains("button", "Étape suivante").click();

    cy.contains("button", "Ignorer cette étape").click();

    // Fill auditor informations
    cy.contains("Adresse e-mail")
      .parent()
      .find("input")
      .type(auditJson.auditorEmail);

    cy.contains("Prénom et nom (optionnel)")
      .parent()
      .find("input")
      .type(auditJson.auditorName);

    // Submit new audit form
    cy.contains("Valider les paramètres").click();

    // Check user is redirect to audit generation page
    cy.get("h1").contains(auditJson.procedureName);
  });

  it("User can create an audit with prefilled NA topics", () => {
    function fillPageField(pageIndex: number, field: string, content: string) {
      cy.contains("Page " + pageIndex)
        .parent()
        .parent()
        .contains(field)
        .parent()
        .find("input")
        .clear()
        .type(content);
    }

    cy.visit("http://localhost:3000");

    // Navigate to new audit page
    cy.contains("a", "Je réalise un audit").click();

    // Fill fields
    cy.contains("106 critères").click();

    cy.contains("Nom du site ou du service à auditer")
      .parent()
      .find("input")
      .type(auditJson.procedureName);

    cy.contains("button", "Étape suivante").click();
    cy.contains("button", "Ajouter une page").click();

    fillPageField(1, "Nom de la page", auditJson.pages[0].name);
    fillPageField(1, "URL de la page", auditJson.pages[0].url);
    fillPageField(2, "Nom de la page", auditJson.pages[1].name);
    fillPageField(2, "URL de la page", auditJson.pages[1].url);
    fillPageField(3, "Nom de la page", auditJson.pages[2].name);
    fillPageField(3, "URL de la page", auditJson.pages[2].url);
    fillPageField(4, "Nom de la page", auditJson.pages[3].name);
    fillPageField(4, "URL de la page", auditJson.pages[3].url);
    fillPageField(5, "Nom de la page", auditJson.pages[4].name);
    fillPageField(5, "URL de la page", auditJson.pages[4].url);
    fillPageField(6, "Nom de la page", auditJson.pages[5].name);
    fillPageField(6, "URL de la page", auditJson.pages[5].url);
    fillPageField(7, "Nom de la page", auditJson.pages[6].name);
    fillPageField(7, "URL de la page", auditJson.pages[6].url);
    fillPageField(8, "Nom de la page", auditJson.pages[7].name);
    fillPageField(8, "URL de la page", auditJson.pages[7].url);

    cy.contains("button", "Étape suivante").click();

    cy.get(".checkboxes .checkbox-wrapper").last().click();

    cy.contains("button", "Étape suivante").click();

    // Fill auditor informations
    cy.contains("Adresse e-mail")
      .parent()
      .find("input")
      .type(auditJson.auditorEmail);

    cy.contains("Prénom et nom (optionnel)")
      .parent()
      .find("input")
      .type(auditJson.auditorName);

    // Submit new audit form
    cy.contains("Valider les paramètres").click();

    // Check user is redirect to audit generation page
    cy.get("h1").contains(auditJson.procedureName);

    cy.contains("a", "Continuer").click();

    // Check NA criteria: 2 criteria on 9 pages = 18
    cy.contains("Non applicable (18)");

    // Check topic "Cadres" completion is 100%
    cy.get(".topic-filter-item").eq(1).contains("Cadres");
    cy.get(".topic-filter-item").eq(1).contains("100%");
  });

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

  it("User can update notes", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".notes-desktop-link")
        .contains("button", "Ajouter des observations")
        .click();
      cy.get(".tiptap").clear().type("Annotations de l’audit");
      cy.get("dialog#notes-modal").contains("button", "Fermer").click();

      cy.get(".notes-desktop-link")
        .contains("button", "Ajouter des observations")
        .click();
      cy.contains("Annotations de l’audit");
    });
  });

  it("User can fill a11y statement", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/synthese`);
      cy.contains("Compléter").invoke("removeAttr", "target").click();

      // General infos
      cy.getByLabel("Entité qui a demandé l’audit")
        .clear()
        .type(statementJson.auditInitiator);
      cy.getByLabel("Entité qui a réalisé l’audit")
        .clear()
        .type(statementJson.auditorOrganisation);
      cy.getByLabel("URL de la page d’accueil du site audité")
        .clear()
        .type(statementJson.procedureUrl);

      // Contact
      cy.getByLabel("Nom et prénom du contact (optionnel)")
        .clear()
        .type(statementJson.contactName);
      cy.getByLabel("Adresse e-mail").clear().type(statementJson.contactEmail);
      cy.getByLabel("Formulaire de contact en ligne")
        .clear()
        .type(statementJson.contactFormUrl);

      // Technologies
      cy.getByLabel("Ajouter des technologies")
        .clear()
        .type(statementJson.technologies);

      cy.contains("button", "Ajouter les technologies").click();

      // Tools
      cy.contains("Web Developer Toolbar").click();
      cy.contains("WCAG Contrast checker").click();
      cy.getByLabel("Ajouter des outils d’assistance")
        .clear()
        .type(statementJson.tools);

      cy.contains("button", "Ajouter les outils").click();

      // Environments
      cy.contains("Combinaison 1").click();
      cy.contains("button", "Ajouter un environnement de test").click();
      cy.getByLabel("Appareil").clear().type("Ordinateur");
      cy.getByLabel("Logiciel d’exploitation").clear().type("Windows");
      cy.getByLabel("Technologie d’assistance").clear().type("JAWS");
      cy.getByLabel("Navigateur").clear().type("Edge");

      // Not accessible content
      cy.getByLabel("Non-conformités (optionnel)")
        .clear()
        .type(statementJson.notCompliantContent);
      cy.getByLabel("Dérogations pour charge disproportionnée (optionnel)")
        .clear()
        .type(statementJson.derogatedContent);
      cy.getByLabel(
        "Contenus non soumis à l’obligation d’accessibilité (optionnel)"
      )
        .clear()
        .type(statementJson.notInScopeContent);

      cy.contains("button", "Valider la déclaration").click();
      cy.contains("h1", auditJson.procedureName);
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

  it("User can finish the audit", () => {
    const monthes = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const monthesRe = "(?:" + monthes.join("|") + ")";
    cy.createTestAudit().then(({ editId, reportId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("button[role=\"tab\"]", "Accueil").click();

      cy.get("li.criterium-container fieldset input")
        .first()
        .click({ force: true });

      cy.contains(new RegExp(`Terminé le \\d{1,2} ${monthesRe} \\d{4}`));
      cy.contains("Bravo ! Vous êtes sur le point de terminer votre audit 🎉");

      cy.contains("a", "Accéder aux livrables").click();

      cy.contains(new RegExp(`Terminé le \\d{1,2} ${monthesRe} \\d{4}`));
      cy.contains("a", "Accéder");

      cy.contains("button", "Copier le lien").click();
      cy.contains(
        "Le lien vers le rapport d’audit a bien été copié dans le presse-papier."
      );
      cy.assertClipboardValue(`http://localhost:3000/rapport/${reportId}/`);
    });
  });

  it("User can set a topic as NA", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.contains("button[role=\"tab\"]", "Connexion").click();
      cy.contains(" Non applicable sur la page").click();

      cy.get(".topic-heading").should("have.class", "topic-heading--hidden");
    });
  });

  it("User can edit a criterium content", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("button[role=\"tab\"]", "FAQ").click();
      cy.get(".criterium-container").contains("Non conforme").click();

      cy.focused().should("have.attr", "role", "textbox");

      cy.get(".criterium-container .tiptap.tiptap")
        .clear({ force: true })
        .type("Il n’y a pas de alt sur l’image du hero");

      cy.get(".criterium-container label").contains("majeur").click();
      cy.get(".criterium-container").contains("Facile à corriger").click();
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

  it("User can download an audit", () => {
    cy.exec("rm -rf cypress/downloads");

    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.contains("Actions").click();
      cy.contains("Exporter l’audit").click();

      cy.readFile("cypress/downloads/audit-audit-de-mon-petit-site.csv");
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

  it("User can insert an image in the comment editor", () => {
    cy.intercept("POST", "/api/audits/editor/images").as("uploadImage");
    cy.intercept("PATCH", `/api/audits/*/results`).as("updateResults");

    cy.createTestAudit({ isPristine: true }).then(({ editId, reportId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.get(".criterium-container").contains("Non conforme").click();
      cy.wait("@updateResults");

      // 1. Insert an image into the editor with the button
      cy.log("** Insert 1 image with the button **");
      cy.contains("Insérer une image").click();
      cy.get(".criterium-container input[type='file']")
        .selectFile("cypress/fixtures/aras-rouges.jpg", { force: true });

      // Editor content has changed => results updated
      cy.wait(["@uploadImage", "@updateResults"]);

      // 2. Drag and drop a local image
      cy.log("** Drag and drop 1 local image **");
      cy.get(".criterium-container .tiptap")
        .selectFile("cypress/fixtures/ara-bleu.jpg", { action: "drag-drop" });

      // Editor content has changed => results updated
      cy.wait(["@uploadImage", "@updateResults"]);

      // 3. Copy-paste a local image
      cy.log("** Paste 1 image from clipboard **");
      const fileName = "groupe-ara.jpg";
      cy.get(".criterium-container .tiptap").pasteImage({ filePath: `../fixtures/${fileName}`, fileName });

      // Check success message
      cy.get(".criterium-container [aria-live='polite']").contains(`L’image « ${fileName} » a été correctement insérée`);
      cy.get(`.criterium-container .tiptap img[alt="${fileName}"]:not([data-loading="true"])`).debug();
      cy.get(`.criterium-container .tiptap img[alt="${fileName}"]:not([data-loading="true"])`).should("exist");

      // Editor content has changed => results updated
      cy.wait("@updateResults");

      cy.get(".criterium-container img[src^='/uploads/']")
        .should("have.length", 3);

      // Go to report page to check images count (3)
      cy.visit(`http://localhost:3000/rapport/${reportId}/details-des-non-conformites`);
      cy.get(".tiptap--rendered img").should("have.length", 3);
    });
  });

  it("User can paste Markdown content in the comment editor (and it’s interpreted)", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".notes-desktop-link")
        .contains("button", "Ajouter des observations")
        .click();
      cy.get(".tiptap").clear().type("Copier coller de Markdown :")
        .type("{enter}");
      cy.get(".tiptap").pasteText("../fixtures/mdContent.md");
      cy.get(".tiptap strong").should("exist");
      cy.get(".tiptap img").should("not.exist");
    });
  });

  it("User can paste HTML text content in the comment editor (and it's not interpreted)", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".notes-desktop-link")
        .contains("button", "Ajouter des observations")
        .click();
      cy.get(".tiptap").clear().type("Copier coller de texte HTML :")
        .type("{enter}");
      cy.get(".tiptap").pasteText("../fixtures/notMdContent.txt");
      cy.get(".tiptap strong").should("not.exist");
      cy.get(".tiptap img").should("not.exist");
    });
  });

  it("User can insert HTML content in the comment editor (and images are stripped out)", () => {
    cy.intercept("PATCH", `/api/audits/*/results`).as("updateResults");

    cy.createTestAudit({ isPristine: true }).then(({ editId, reportId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.get(".criterium-container").contains("Non conforme").click();
      cy.wait("@updateResults");

      // 3. Copy-paste HTML content with 2 images
      cy.log("** Paste 1 image from clipboard **");
      cy.get(".criterium-container .tiptap").pasteHTML("../fixtures/contentExample.html");

      // Editor content has changed => results updated
      cy.wait("@updateResults");

      // Go to report page to check text + images count (0)
      cy.visit(`http://localhost:3000/rapport/${reportId}/details-des-non-conformites`);
      // - 1 h4
      cy.get(".tiptap--rendered h4").should("have.length", 1);
      // - 2 li
      cy.get(".tiptap--rendered li").should("have.length", 2);
      // - 0 img
      cy.get(".tiptap--rendered img").should("have.length", 0);
    });
  });
});
