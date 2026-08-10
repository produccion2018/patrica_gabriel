import { API_URL } from "../config/api";

// Fetch "con sesión": agrega automáticamente el token guardado en
// localStorage al header Authorization. Usar SIEMPRE este helper en
// vez de fetch() directo para cualquier endpoint del panel admin
// (los que quedaron protegidos con verificarToken en el backend).
//
// Ejemplo de uso (reemplaza a fetch normal):
//   const res = await apiFetch("/api/reservas");
//   const data = await res.json();
//
// "path" es la parte después de API_URL, ej: "/api/reservas".
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Si el token venció o es inválido, el backend responde 401.
  // En ese caso, se limpia la sesión y se manda al usuario al login
  // en vez de dejar la pantalla rota con datos vacíos.
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    window.location.href = "/admin/login";
    return null;
  }

  return res;
}