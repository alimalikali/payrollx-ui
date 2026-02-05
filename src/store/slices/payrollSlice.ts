import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PayrollRecord, payrollRecords as initialRecords } from "@/data/mockData";

interface PayrollState {
  records: PayrollRecord[];
  selectedMonth: string;
}

const initialState: PayrollState = {
  records: initialRecords,
  selectedMonth: "2024-11",
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
    updatePayrollStatus: (
      state,
      action: PayloadAction<{ id: string; status: PayrollRecord["status"] }>
    ) => {
      const record = state.records.find((r) => r.id === action.payload.id);
      if (record) {
        record.status = action.payload.status;
      }
    },
  },
});

export const { setSelectedMonth, updatePayrollStatus } = payrollSlice.actions;
export default payrollSlice.reducer;
