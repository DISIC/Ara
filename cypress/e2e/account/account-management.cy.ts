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
      cy.contains("h1", "Consultez votre boite de réception");
      cy.contains(
        "Un lien pour confirmer votre adresse e-mail vient de vous être envoyé à l’adresse"
      );
      cy.contains(email);
    });

    it("(verification link)", () => {
      cy.get("@email").then((email) => {
        // Simulate receiving the verification link by email.
        cy.request(
          "POST",
          "http://localhost:3000/api/tests/verification-token",
          {
            username: email
          }
        )
          .its("body")
          .then((verificationToken) => {
            const verificationLink = `http://localhost:3000/compte/validation?token=${verificationToken}`;
            cy.visit(verificationLink);
          });

        cy.contains("Votre compte a bien été créé");
        cy.getByLabel("Adresse e-mail").should("have.value", email);
      });
    });

    it("(same tab, account verified elsewhere)", () => {
      cy.get("@email").then((email) => {
        // Simulate the account being verified in another tab
        cy.request(
          "POST",
          "http://localhost:3000/api/tests/verification-token",
          {
            username: email
          }
        )
          .its("body")
          .then((verificationToken) => {
            cy.request("POST", "/api/auth/verify", {
              token: verificationToken
            });
          });

        cy.contains("h1", "Votre compte a bien été créé", {
          timeout: 8000
        });

        cy.contains("a", "Aller à la page de connexion").click();
        cy.contains("Votre compte a bien été créé");
        cy.getByLabel("Adresse e-mail").should("have.value", email);
      });
    });
  });

  it("User can not create account with already taken email", () => {
    cy.createTestAccount().then(({ username }) => {
      cy.visit("http://localhost:3000");
      cy.contains("a", "Créer un compte").click();
      cy.getByLabel("Adresse e-mail").type(username);
      cy.getByLabel("Mot de passe").type("blablablablablabla");
      cy.contains("button", "Valider").click();
      cy.contains(
        "Cette adresse e-mail est déjà associée à un compte. Connectez-vous."
      );
      cy.getByLabel("Adresse e-mail").should("have.focus");
    });
  });

  it("User can not create account with expired verification token", () => {
    cy.visit("http://localhost:3000/compte/validation?token=pouet");
    cy.contains("h1", "Désolé, votre lien n’est plus valide");
  });

  it("User can sign in with their account", () => {
    cy.createTestAccount().then(({ username, password }) => {
      cy.visit("http://localhost:3000/compte/connexion");
      cy.getByLabel("Adresse e-mail").type(username);
      cy.getByLabel("Mot de passe").type(password);
      cy.contains("button", "Se connecter").click();
      cy.contains("h1", "Mes audits");
    });
  });

  it("User can update their user profile infos", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true });

      cy.visit("http://localhost:3000/compte");
      cy.contains("button", username).click();
      cy.contains("a", "Mon compte").click();

      cy.getByLabel("Prénom et nom (optionnel)").type("John Doe");
      cy.contains("Mettre à jour").click();

      cy.contains("Profil mis à jour avec succès");

      // Check that user audits have updated auditorName
      cy.contains("a", "Mes audits").click();
      cy.contains("button", "Actions").click();
      cy.contains("a", "Consulter le rapport").invoke("removeAttr", "target").click();
      cy.contains("Auditeur ou auditrice : John Doe");
    });
  });

  it("User can update their password", () => {
    cy.createTestAccount({ login: true }).then(({ username, password }) => {
      cy.visit("http://localhost:3000/compte/parametres");

      const newPassword = "totototototo";

      cy.contains("button", "Changer de mot de passe").click();
      cy.getByLabel("Mot de passe actuel").type(password);
      cy.getByLabel("Nouveau mot de passe").type(newPassword);
      cy.contains("button", "Changer de mot de passe").click();

      cy.contains("Votre mot de passe a été mis à jour avec succès");

      cy.contains("button", username).click();
      cy.contains("button", "Me déconnecter").click();

      cy.contains("Vous avez été deconnecté avec succès.");

      cy.getByLabel("Adresse e-mail").type(username);
      cy.getByLabel("Mot de passe").type(password);
      cy.contains("button", "Se connecter").click();

      cy.contains("L’adresse e-mail ou le mot de passe saisi est incorrect. Vérifiez vos saisies.");

      cy.getByLabel("Adresse e-mail").clear().type(username);
      cy.getByLabel("Mot de passe").clear().type(newPassword);
      cy.contains("button", "Se connecter").click();

      cy.contains("h1", "Mes audits");
    });
  });

  it("User can reset their password", () => {
    cy.createTestAccount().then(({ username, password }) => {
      cy.visit("http://localhost:3000/compte/connexion");
      cy.contains("a", "Mot de passe oublié").click();
      cy.getByLabel("Adresse e-mail").type(username);
      cy.contains("button", "Valider").click();
      cy.contains(
        `Un lien pour réinitialiser votre mot de passe vient de vous être envoyé par e-mail à l’adresse :`
      );
      cy.contains(username);

      cy.request(
        "POST",
        "http://localhost:3000/api/tests/password-reset-verification-token",
        { username }
      ).then((resp) => {
        const verificationLink = `http://localhost:3000/compte/reinitialiser-mot-de-passe?token=${resp.body}`;
        cy.visit(verificationLink);

        const newPassword = "blablablabla";

        cy.contains("h1", "Changer de mot de passe");
        cy.getByLabel("Mot de passe").type(newPassword);
        cy.contains("button", "Changer de mot de passe").click();

        cy.contains("Votre mot de passe a été mis à jour avec succès");

        // Try login with old password
        cy.getByLabel("Mot de passe").type(password);
        cy.contains("button", "Se connecter").click();
        cy.contains("L’adresse e-mail ou le mot de passe saisi est incorrect. Vérifiez vos saisies.");

        // Login with new password
        cy.getByLabel("Mot de passe").clear().type(newPassword);
        cy.contains("button", "Se connecter").click();
        cy.contains("h1", "Mes audits");
      });
    });
  });

  it("User can reset their password (logged in)", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.visit("http://localhost:3000/compte/parametres");
      cy.contains("Changer de mot de passe").click();
      cy.contains("Mot de passe oublié ?").click();

      cy.contains(
        "Un lien pour réinitialiser votre mot de passe vient de vous être envoyé par e-mail à l’adresse :"
      );
      cy.contains(username);

      cy.request(
        "POST",
        "http://localhost:3000/api/tests/password-reset-verification-token",
        { username }
      ).then((resp) => {
        const verificationLink = `http://localhost:3000/compte/reinitialiser-mot-de-passe?token=${resp.body}`;
        cy.visit(verificationLink);

        const newPassword = "blablablabla";

        cy.contains("h1", "Changer de mot de passe");
        cy.getByLabel("Mot de passe").type(newPassword);
        cy.contains("button", "Changer de mot de passe").click();

        cy.location("pathname").should("eq", "/compte");
        cy.contains("Votre mot de passe a été mis à jour avec succès");
      });
    });
  });

  it("User can update their email address", () => {
    cy.createTestAccount({ login: true }).then(({ password, uid }) => {
      cy.visit("http://localhost:3000/compte/parametres");

      const newEmail = `john-smith${Math.random()}@example.com`;
      cy.contains("button", "Changer d’adresse e-mail").click();
      cy.getByLabel("Mot de passe").type(password);
      cy.getByLabel("Nouvelle adresse e-mail").type(newEmail);
      cy.contains("button", "Changer d’adresse e-mail").click();

      cy.contains(
        `Un lien pour confirmer votre nouvelle adresse e-mail vient de vous être envoyé à l’adresse suivante : ${newEmail}`
      );

      // Simulate receiving the verification link by email.
      cy.request(
        "POST",
        "http://localhost:3000/api/tests/email-update-verification-token",
        { uid }
      ).then((resp) => {
        const verificationLink = `http://localhost:3000/compte/email-update-validation?token=${resp.body.token}`;
        cy.visit(verificationLink);

        cy.contains(`Votre adresse email : ${newEmail}`);
        cy.contains("Votre adresse e-mail a été mise à jour");
      });
    });
  });

  it("User can delete their account", () => {
    cy.createTestAccount({ login: true }).then(({ username, password }) => {
      cy.createTestAudit({ auditorEmail: username }).then(({ editId }) => {
        cy.visit("http://localhost:3000/compte/parametres");

        // Delete account form
        cy.contains("button", "Supprimer mon compte").click();
        cy.getByLabel(
          "Saisissez la phrase suivante pour confirmer la suppression de votre compte : je confirme vouloir supprimer mon compte"
        ).type("je confirme vouloir supprimer mon compte");
        cy.getByLabel("Mot de passe").type(password);
        cy.contains("button", "Supprimer mon compte").click();
        cy.contains(
          "Vous avez été déconnecté et votre compte a été supprimé avec succès"
        );

        // FIXME: make this work locally
        // Submit feedback form
        // cy.getByLabel(
        //   "Pourriez-vous nous donner la raison de votre départ ?"
        // ).type("Quoi ? Ça n’est pas un outil d’audit automatique ⁈");
        // cy.contains("button", "Envoyer mon avis").click();
        // cy.contains("Votre avis a bien été envoyé");

        cy.visit(`http://localhost:3000/audits/${editId}/generation`);
        cy.contains("Désolé, l’audit que vous cherchez a été supprimé.");
      });
    });
  });
});
