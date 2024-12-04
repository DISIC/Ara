describe("Account", () => {
  /**
   * Créer une fonction qui renvoie un lien issu d'un email pour les tests [EMAIL]
   * Avant chaque test (sauf premier) :
   * - Créer un compte
   */
  describe("Account management", () => {
    describe("User can create a new account", () => {
      beforeEach(() => {
        const email = `john-doe-${Math.random()}@example.com`;
        cy.wrap(email).as("email");

        cy.visit("http://localhost:3000");
        cy.contains("a", "Créer un compte").click();
        cy.getByLabel("Adresse e-mail").type(email);
        cy.getByLabel("Mot de passe").type("pouetpouetpouet");
        cy.contains("button", "Valider").click();
        cy.contains("h1", "Consulter votre boite de réception");
        cy.contains(
          `Un mail contenant un lien pour vérifier votre e-mail vient de vous être envoyé à l’adresse : ${email}`,
        );
      });

      it("(verification link)", () => {
        cy.get("@email").then((email) => {
          // Simulate receiving the verification link by email.
          cy.request(
            "POST",
            "http://localhost:3000/api/debug/verification-token",
            {
              username: email,
            },
          )
            .its("body")
            .then((verificationToken) => {
              const verificationLink = `http://localhost:3000/compte/validation?token=${verificationToken}`;
              cy.visit(verificationLink);
            });

          cy.contains("Votre compte a été créé avec succès");
          cy.getByLabel("Adresse e-mail").should("have.value", email);
        });
      });

      it("(same tab, account verified elsewhere)", () => {
        cy.get("@email").then((email) => {
          // Simulate the account being verified in another tab
          cy.request(
            "POST",
            "http://localhost:3000/api/debug/verification-token",
            {
              username: email,
            },
          )
            .its("body")
            .then((verificationToken) => {
              cy.request("POST", "/api/auth/verify", {
                token: verificationToken,
              });
            });

          cy.contains("h1", "Votre compte a été créé avec succès", {
            timeout: 8000,
          });

          cy.contains("a", "Aller à la page de connexion").click();
          cy.contains("Votre compte a été créé avec succès");
          cy.getByLabel("Adresse e-mail").should("have.value", email);
        });
      });
    });

    it("User can not create account with already taken email", () => {
      cy.request("POST", "http://localhost:3000/api/debug/create-verified-user")
        .its("body")
        .then(({ username }) => {
          cy.visit("http://localhost:3000");
          cy.contains("a", "Créer un compte").click();
          cy.getByLabel("Adresse e-mail").type(username);
          cy.getByLabel("Mot de passe").type("blablablablablabla");
          cy.contains("button", "Valider").click();
          cy.contains(
            "Un compte est déjà associé à cette adresse e-mail. Veuillez choisir une autre adresse e-mail. Si vous êtes le propriétaire de cette adresse e-mail vous pouvez vous connecter.",
          );
          cy.getByLabel("Adresse e-mail").should("have.focus");
        });
    });

    it("User can not create account with expired verification token", () => {
      cy.visit("http://localhost:3000/compte/validation?token=pouet");
      cy.contains("h1", "Désolé, votre lien n’est plus valide");
    });

    // it.skip("User can sign in with their account", () => {});
    // it.skip("User can update their user profile infos", () => {});
    // it.skip("[EMAIL] User can update their password", () => {});
    // it.skip("[EMAIL] User can reset their password", () => {});
    // it.skip("[EMAIL] User can update their email address", () => {});
    // it.skip("User can delete their account", () => {});
  });

  /**
   * Avant chaque test :
   * - Créer un compte
   * - Créer des audits pour ce compte avec :
   *  - 1+ audits terminés
   *  - 1+ audits en cours
   *  - 1+ audits non commencés
   */
  describe("Audits list", () => {
    // it.skip("User can access all their audits", () => {});
    // it.skip("User can start audit with prefilled infos", () => {});
    // it.skip("User can duplicate audit", () => {});
    // it.skip("User can copy audit link", () => {});
    // it.skip("User can copy report link", () => {});
    // it.skip("User can download audit", () => {});
    // it.skip("User can delete audit", () => {});
  });
});
