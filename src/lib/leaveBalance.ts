import type { LeaveBalance, LeaveType } from "@/hooks/useLeaves";

export const buildLeaveBalanceCards = (
  leaveTypes: LeaveType[] = [],
  leaveBalance: LeaveBalance[] = [],
): LeaveBalance[] => {
  if (leaveTypes.length === 0) {
    return leaveBalance;
  }

  const balanceByType = new Map(leaveBalance.map((item) => [item.leaveTypeId, item]));

  return leaveTypes.map((type) => balanceByType.get(type.id) || {
    leaveTypeId: type.id,
    leaveTypeName: type.name,
    leaveTypeCode: type.code,
    allocatedDays: 0,
    usedDays: 0,
    carriedForwardDays: 0,
    remainingDays: 0,
  });
};
