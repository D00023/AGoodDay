/* =========================================================
 * sw.js — Service Worker（离线缓存 + 版本更新）
 * 策略：
 *   同源资源  → 预缓存 + cache-first（离线可用）
 *   外部资源  → stale-while-revalidate（字体等，离线降级）
 * 升级版本号 CACHE_NAME 即可触发全量更新
 * ========================================================= */
const CACHE_NAME = 'agoodday-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './mock.js',
  './api.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

/* 安装：预缓存全部核心资源 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* 激活：清理旧版本缓存 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* 请求拦截 */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const sameOrigin = new URL(req.url).origin === self.location.origin;

  if (sameOrigin) {
    /* 同源：缓存优先，未命中则联网并回填缓存；离线兜底首页 */
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            return res;
          })
          .catch(() => caches.match('./index.html'));
      })
    );
  } else {
    /* 外部（如 Google Fonts）：先用缓存，同时后台刷新 */
    event.respondWith(
      caches.match(req).then((cached) => {
        const fresh = fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            return res;
          })
          .catch(() => cached);
        return cached || fresh;
      })
    );
  }
});
