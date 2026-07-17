import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext"; // 1. Importamos el provider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        {" "}
        {/* 2. Envolvemos todo con el Provider */}
        <App />
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
