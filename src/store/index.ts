import { configureStore } from "@reduxjs/toolkit";
import employeesReducer from "./slices/employeesSlice";
import attendanceReducer from "./slices/attendanceSlice";
import leavesReducer from "./slices/leavesSlice";
import payrollReducer from "./slices/payrollSlice";
import aiInsightsReducer from "./slices/aiInsightsSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    attendance: attendanceReducer,
    leaves: leavesReducer,
    payroll: payrollReducer,
    aiInsights: aiInsightsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
