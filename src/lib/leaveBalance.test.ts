import { describe, expect, it } from "vitest";
import { buildLeaveBalanceCards } from "./leaveBalance";

describe("buildLeaveBalanceCards", () => {
  it("merges active leave types with matching balance rows", () => {
    const result = buildLeaveBalanceCards(
      [{ id: "annual", name: "Annual Leave", code: "AL" }] as never[],
      [{
        leaveTypeId: "annual",
        leaveTypeName: "Annual Leave",
        leaveTypeCode: "AL",
        allocatedDays: 10,
        usedDays: 5,
        carriedForwardDays: 0,
        remainingDays: 5,
      }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].remainingDays).toBe(5);
  });

  it("creates zero-balance cards when no allocation exists", () => {
    const result = buildLeaveBalanceCards(
      [{ id: "annual", name: "Annual Leave", code: "AL" }] as never[],
      []
    );

    expect(result).toEqual([
      {
        leaveTypeId: "annual",
        leaveTypeName: "Annual Leave",
        leaveTypeCode: "AL",
        allocatedDays: 0,
        usedDays: 0,
        carriedForwardDays: 0,
        remainingDays: 0,
      },
    ]);
  });
});
