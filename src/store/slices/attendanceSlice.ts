import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AttendanceRecord, attendanceRecords as initialRecords } from "@/data/mockData";

interface AttendanceState {
  records: AttendanceRecord[];
  viewMode: "daily" | "weekly" | "monthly";
  selectedMonth: string;
}

const initialState: AttendanceState = {
  records: initialRecords,
  viewMode: "monthly",
  selectedMonth: new Date().toISOString().slice(0, 7),
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<"daily" | "weekly" | "monthly">) => {
      state.viewMode = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
    updateAttendance: (state, action: PayloadAction<AttendanceRecord>) => {
      const index = state.records.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
  },
});

export const { setViewMode, setSelectedMonth, updateAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
