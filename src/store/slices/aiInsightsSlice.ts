import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FraudAlert,
  SalaryAnomaly,
  SalaryRecommendation,
  PayrollForecast,
  fraudAlerts as initialAlerts,
  salaryAnomalies as initialAnomalies,
  salaryRecommendations as initialRecommendations,
  payrollForecast as initialForecast,
} from "@/data/mockData";

interface AIInsightsState {
  fraudAlerts: FraudAlert[];
  salaryAnomalies: SalaryAnomaly[];
  recommendations: SalaryRecommendation[];
  forecast: PayrollForecast[];
  activeTab: "all" | "fraud" | "anomalies" | "recommendations";
}

const initialState: AIInsightsState = {
  fraudAlerts: initialAlerts,
  salaryAnomalies: initialAnomalies,
  recommendations: initialRecommendations,
  forecast: initialForecast,
  activeTab: "all",
};

const aiInsightsSlice = createSlice({
  name: "aiInsights",
  initialState,
  reducers: {
    setActiveTab: (
      state,
      action: PayloadAction<"all" | "fraud" | "anomalies" | "recommendations">
    ) => {
      state.activeTab = action.payload;
    },
    markAlertReviewed: (state, action: PayloadAction<string>) => {
      const alert = state.fraudAlerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.reviewed = true;
      }
    },
    markAnomalyReviewed: (state, action: PayloadAction<string>) => {
      const anomaly = state.salaryAnomalies.find((a) => a.id === action.payload);
      if (anomaly) {
        anomaly.reviewed = true;
      }
    },
  },
});

export const { setActiveTab, markAlertReviewed, markAnomalyReviewed } =
  aiInsightsSlice.actions;
export default aiInsightsSlice.reducer;
