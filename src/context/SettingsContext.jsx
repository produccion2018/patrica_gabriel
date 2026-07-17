import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

const defaultSettings = {
  darkMode: false,
  accentColor: "#2563eb",
  fontSize: "normal",
  userName: "Patricia Gabriel",
  profilePic: null,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));

    // ===== FONT SIZE (global, vía html) =====
    document.documentElement.classList.remove(
      "font-chico",
      "font-normal",
      "font-grande",
    );
    document.documentElement.classList.add(`font-${settings.fontSize}`);

    // ===== ROOT VARIABLES (acento) =====
    document.documentElement.style.setProperty(
      "--accent-color",
      settings.accentColor,
    );

    // NOTA: el dark mode YA NO se aplica al body.
    // Se aplica solo dentro de AdminDashboard, en el div .patricia-layout
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
