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
});
