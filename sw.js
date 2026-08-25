const CACHE = "hrvatski-glagoljica-v5";
const ASSETS = [
  "./index.html",
  "./genel.html",
  "./daily.html",
  "./padezi.html",
  "./genitiv.html",
  "./dativ.html",
  "./imenice.html",
  "./adjectives.html",
  "./verbtest.html",
  "./conjunctions.html",
  "./grandtest.html",
  "./theme.css",
  "./nav.js",
  "./quiz.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  if (new URL(req.url).origin === self.location.origin) {
    // app shell: cache first, fall back to network
    e.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
      )
    );
  } else {
    // fonts: network first, fall back to whatever was cached
    e.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});
