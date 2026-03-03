import { describe, expect, it } from "vitest";
import { hasRole, isPrivileged } from "./permissions";

describe("permissions", () => {
  it("treats admin as privileged", () => {
    expect(isPrivileged({ role: "admin" } as never)).toBe(true);
  });

  it("treats hr as privileged", () => {
    expect(isPrivileged({ role: "hr" } as never)).toBe(true);
  });

  it("does not treat employee as privileged", () => {
    expect(isPrivileged({ role: "employee" } as never)).toBe(false);
  });

  it("allows admin through privileged nav role checks", () => {
    expect(hasRole({ role: "admin" } as never, ["admin", "hr"])).toBe(true);
  });
});
