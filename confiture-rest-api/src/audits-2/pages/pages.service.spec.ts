import { PagesService } from "./pages.service";

describe("pagesService", () => {
  describe("generateUniqueSlug", () => {
    it("slugify given name", () => {
      const existingSlugs = [];
      const pageName = "Mentions légales";
      expect(PagesService.generateUniqueSlug(pageName, existingSlugs)).toEqual("mentions-legales");
    });

    it("slugify given name with 1 duplicate", () => {
      const existingSlugs = ["mentions-legales"];
      const pageName = "Mentions légales";
      expect(PagesService.generateUniqueSlug(pageName, existingSlugs)).toEqual("mentions-legales-1");
    });

    it("slugify given name with 2 duplicates", () => {
      const existingSlugs = ["mentions-legales", "mentions-legales-1"];
      const pageName = "Mentions légales";
      expect(PagesService.generateUniqueSlug(pageName, existingSlugs)).toEqual("mentions-legales-2");
    });
  });

  describe("generateManyUniqueSlugs", () => {
    it("slugify given names", () => {
      const existingSlugs = [];
      const pageNames = ["Accueil", "Mentions légales", "Blog"];
      expect(PagesService.generateManyUniqueSlugs(pageNames, existingSlugs)).toEqual(["accueil", "mentions-legales", "blog"]);
    });

    it("slugify given names with 1 duplicate", () => {
      const existingSlugs = ["mentions-legales"];
      const pageNames = ["Accueil", "Mentions légales", "Blog"];
      expect(PagesService.generateManyUniqueSlugs(pageNames, existingSlugs)).toEqual(["accueil", "mentions-legales-1", "blog"]);
    });

    it("slugify given names with 2 duplicates", () => {
      const existingSlugs = ["mentions-legales", "mentions-legales-1"];
      const pageNames = ["Accueil", "Mentions légales", "Blog"];
      expect(PagesService.generateManyUniqueSlugs(pageNames, existingSlugs)).toEqual(["accueil", "mentions-legales-2", "blog"]);
    });
  });
});
