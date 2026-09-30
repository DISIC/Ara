import { subject } from "@casl/ability";
import { CaslAbilityFactory } from "./casl-ability.factory";

describe("caslAbilityFactory", () => {
  let factory: CaslAbilityFactory;

  beforeEach(() => {
    factory = new CaslAbilityFactory();
  });

  it("is defined", () => {
    expect(factory).toBeDefined();
  });

  describe("createForUser method", () => {
    it("is defined", () => {
      expect(factory.createForUser).toBeDefined();
    });

    it("returns an ability object with proper permissions", () => {
      const user = { username: "bob", isVerified: true };
      const ability = factory.createForUser(user);
      expect(ability.can("create", "Audit")).toBe(false);
      expect(ability.can("read", "Audit")).toBe(true);
      expect(ability.can("delete", subject("Audit", { auditorEmail: "alice" }))).toBe(false);
      expect(ability.can("delete", subject("Audit", { auditorEmail: "bob" }))).toBe(true);
    });
  });
});
