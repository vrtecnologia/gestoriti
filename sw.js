// Service worker do Gestor de TI — cache do app para instalar e abrir offline.
// Estrategia: network-first para a navegacao (sempre pega a versao mais nova quando ha internet),
// com fallback para o cache quando estiver offline.
const CACHE = "gestorti-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // So tratamos navegacao para a propria pagina (o index.html).
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
          return r;
        })
        .catch(() =>
          caches.match(req).then((m) => m || caches.match("./") || caches.match("index.html"))
        )
    );
  }
});
