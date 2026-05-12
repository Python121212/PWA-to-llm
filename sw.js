const CACHE_NAME = 'llm-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // アイコンやCSSを分けた場合はここに追加
];

// インストール時にファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// オフライン時にキャッシュから応答
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
