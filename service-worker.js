const CACHE_NAME = "skyplan-cache-v3"; // Versiyonu güncelledim
const urlsToCache = [
    "./",
    "./index.html",
    "./service.html",
    "./detail.html",
    "./about.html",
    "./contact.html",
    "./offline.html",
    "./css/style.css",
    "./js/main.js",
    "./js/service.js",
    "./js/detail.js",
    "./js/data.js",
    "./manifest.json",
    // İkonlar
    "./icons/Custom-Icon-Design-Pretty-Office-12-Cloud.48.png",
    "./icons/Custom-Icon-Design-Pretty-Office-12-Cloud.64.png",
    "./icons/Custom-Icon-Design-Pretty-Office-12-Cloud.72.png",
    "./icons/Custom-Icon-Design-Pretty-Office-12-Cloud.96.png",
    "./icons/Custom-Icon-Design-Pretty-Office-12-Cloud.128.png",
    "./icons/Custom-Icon-Design-Pretty-Office-12-Cloud.256.png",
    "./icons/Custom-Icon-Design-Pretty-Office-12-Cloud.512.png"
];

// 1. KURULUM (INSTALL): Dosyaları önbelleğe al
self.addEventListener("install", event => {
    console.log("Service Worker: Kuruluyor...");
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Service Worker: Dosyalar önbelleğe alınıyor");
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. AKTİF OLMA (ACTIVATE): Eski önbellekleri temizle
self.addEventListener("activate", event => {
    console.log("Service Worker: Aktif oldu");
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. YAKALAMA (FETCH): İnternet yoksa önbellekten getir
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Önbellekte varsa onu döndür, yoksa internetten çek
            return response || fetch(event.request).catch(() => {
                // İnternet yoksa ve HTML sayfası isteniyorsa offline.html döndür
                if (event.request.mode === "navigate") {
                    return caches.match("./offline.html");
                }
            });
        })
    );
});