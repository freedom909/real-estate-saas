import { describe, it, expect } from "@jest/globals";
import { SystemSettings } from "@/core/admin/domain/entities/systemSettings";

describe("SystemSettings entity", () => {
  it("should create settings with all fields", () => {
    const now = new Date();
    const s = new SystemSettings({
      id: "s-1",
      key: "site.name",
      value: "Minshuku",
      category: "general",
      description: "Site name",
      updatedBy: "admin-1",
      updatedAt: now,
      createdAt: now,
    });

    expect(s.id).toBe("s-1");
    expect(s.key).toBe("site.name");
    expect(s.value).toBe("Minshuku");
    expect(s.category).toBe("general");
    expect(s.description).toBe("Site name");
    expect(s.updatedBy).toBe("admin-1");
    expect(s.updatedAt).toBe(now);
    expect(s.createdAt).toBe(now);
  });

  it("should have optional fields undefined", () => {
    const now = new Date();
    const s = new SystemSettings({
      id: "s-2",
      key: "key",
      value: "val",
      category: "cat",
      updatedAt: now,
      createdAt: now,
    });

    expect(s.description).toBeUndefined();
    expect(s.updatedBy).toBeUndefined();
  });

  describe("updateValue", () => {
    it("should update value, updatedBy, and updatedAt", () => {
      const now = new Date();
      const s = new SystemSettings({
        id: "s-1",
        key: "site.name",
        value: "Old",
        category: "general",
        updatedAt: now,
        createdAt: now,
      });

      s.updateValue("New", "admin-2");

      expect(s.value).toBe("New");
      expect(s.updatedBy).toBe("admin-2");
      expect(s.updatedAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });

    it("should update value without updatedBy", () => {
      const now = new Date();
      const s = new SystemSettings({
        id: "s-1",
        key: "site.name",
        value: "Old",
        category: "general",
        updatedAt: now,
        createdAt: now,
      });

      s.updateValue("New");

      expect(s.value).toBe("New");
      expect(s.updatedBy).toBeUndefined();
    });
  });
});
