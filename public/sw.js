// Service worker mínimo: solo permite que el panel se pueda instalar como app.
// No guarda nada en caché, así que la web siempre muestra lo último.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});