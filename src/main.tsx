import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply stored theme before first render
try {
  const theme = localStorage.getItem("payrollx-theme");
  if (theme === "light") {
    document.documentElement.classList.add("light");
  }
} catch {
  // ignore
}

createRoot(document.getElementById("root")!).render(<App />);
