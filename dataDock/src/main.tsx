import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./App.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./aggrid-custom.css";

// AG Grid Styles
import "ag-grid-community/styles/ag-theme-quartz.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        draggable
      />
    </BrowserRouter>
  </StrictMode>,
);
