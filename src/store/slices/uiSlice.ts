import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Theme = "dark" | "light";

const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem("payrollx-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return "dark";
};

interface UIState {
  sidebarCollapsed: boolean;
  chatbotOpen: boolean;
  mobileMenuOpen: boolean;
  theme: Theme;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  chatbotOpen: false,
  mobileMenuOpen: false,
  theme: getStoredTheme(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleChatbot: (state) => {
      state.chatbotOpen = !state.chatbotOpen;
    },
    setChatbotOpen: (state, action: PayloadAction<boolean>) => {
      state.chatbotOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("payrollx-theme", state.theme);
        document.documentElement.classList.toggle("light", state.theme === "light");
      } catch {
        // ignore
      }
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      try {
        localStorage.setItem("payrollx-theme", action.payload);
        document.documentElement.classList.toggle("light", action.payload === "light");
      } catch {
        // ignore
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleChatbot,
  setChatbotOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleTheme,
  setTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
