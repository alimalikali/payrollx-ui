import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LeaveRequest, leaveRequests as initialRequests } from "@/data/mockData";

interface LeavesState {
  requests: LeaveRequest[];
  isApplyModalOpen: boolean;
}

const initialState: LeavesState = {
  requests: initialRequests,
  isApplyModalOpen: false,
};

const leavesSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    setApplyModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isApplyModalOpen = action.payload;
    },
    addLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => {
      state.requests.push(action.payload);
    },
    updateLeaveStatus: (
      state,
      action: PayloadAction<{ id: string; status: LeaveRequest["status"] }>
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (request) {
        request.status = action.payload.status;
      }
    },
  },
});

export const { setApplyModalOpen, addLeaveRequest, updateLeaveStatus } =
  leavesSlice.actions;
export default leavesSlice.reducer;
