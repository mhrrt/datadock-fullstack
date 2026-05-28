import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./App.tsx";

// AG Grid Styles
import "ag-grid-community/styles/ag-theme-quartz.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
