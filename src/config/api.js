// Punto único de configuración de la URL del backend.
// En tu PC (desarrollo local) sigue apuntando a localhost:5000 automáticamente.
// En producción/demo, se define VITE_API_URL en un archivo .env (ver .env.example)
// y todo el proyecto usa esa URL sin tocar ningún otro archivo.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
