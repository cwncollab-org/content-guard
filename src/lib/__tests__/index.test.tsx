import { ContentGuard, ContentGuardProvider, useContentGuard } from "../index";

describe("Content Guard Library", () => {
  it("should export ContentGuard component", () => {
    expect(ContentGuard).toBeDefined();
  });

  it("should export ContentGuardProvider component", () => {
    expect(ContentGuardProvider).toBeDefined();
  });

  it("should export useContentGuard hook", () => {
    expect(useContentGuard).toBeDefined();
  });
});
