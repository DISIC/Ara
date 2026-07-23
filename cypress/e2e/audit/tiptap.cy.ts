describe("Tiptap management", () => {
  it("User can insert an image in the comment editor", () => {
    cy.intercept("POST", "/api/audits/editor/images").as("uploadImage");
    cy.intercept("PATCH", `/api/audits/*/results`).as("updateResults");

    cy.createTestAudit({ isPristine: true }).then(({ editId, reportId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);
      cy.get(".criterium-container").contains("Non conforme");
      cy.get(".criterium-container").contains("Erreurs et recommandations (1)").click();

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
      cy.get(".tiptap").type("Copier coller de Markdown :{enter}");
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
      cy.get(".tiptap").type("Copier coller de texte HTML :{enter}");
      cy.get(".tiptap").pasteText("../fixtures/notMdContent.txt");
      cy.get(".tiptap strong").should("not.exist");
      cy.get(".tiptap img").should("not.exist");
    });
  });

  it("User can insert HTML content in the comment editor (and images are stripped out)", () => {
    cy.intercept("PATCH", `/api/audits/*/results`).as("updateResults");

    cy.createTestAudit({ isPristine: true }).then(({ editId, reportId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation`);

      cy.get(".criterium-container").contains("Non conforme");
      cy.get(".criterium-container").contains("Erreurs et recommandations (1)").click();

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
