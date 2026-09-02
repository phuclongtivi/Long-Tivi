/* Long 1986 V2 PWA service worker
   Fix stale UI after new deployments.
   HTML/navigation + API are network-first/no-store.
   Only static assets are cached. */

const CACHE = "pl-long-v2-20260903";
const LEGACY_PREFIXES = ["pl-long-v1", "pl-long-v2"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE && LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix)))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === "navigate" || req.destination === "document";
  const isApi = url.pathname.startsWith("/api/");

  if (isNavigation || isApi) {
    event.respondWith(
      fetch(req, { cache: "no-store" }).catch(async () => {
        if (isNavigation) {
          const cached = await caches.match(req);
          if (cached) return cached;
        }
        return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
