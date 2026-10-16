/* めいしばこ service worker
   - ページ本体(index.html)はネット優先：つながっていれば常に最新、つながらなければ保存しておいた版で開く
   - アイコンなどはキャッシュ優先：中身を変えたら VERSION を上げる
   - Google Fonts は、一度読んだ分をオフライン用にとっておく */
const VERSION = 'meishibako-v1';
const FONT_CACHE = 'meishibako-fonts';
const SHELL = [
  './',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];
const PAGE_KEY = new URL('./', self.location).href;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONT_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') e.respondWith(pageFirstFromNetwork(e));
    else e.respondWith(cacheFirst(req));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(fontCache(e));
  }
});

async function pageFirstFromNetwork(e){
  const cache = await caches.open(VERSION);
  const net = fetch(e.request).then(res => {
    if (res.ok) cache.put(PAGE_KEY, res.clone());
    return res;
  });
  e.waitUntil(net.catch(() => {}));
  try {
    // 回線が遅いときは4秒で見切りをつけて、保存しておいた版を出す
    return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000))]);
  } catch {
    const hit = await cache.match(PAGE_KEY);
    return hit || net;
  }
}

async function cacheFirst(req){
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req, {ignoreSearch: true});
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function fontCache(e){
  const cache = await caches.open(FONT_CACHE);
  const hit = await cache.match(e.request);
  const net = fetch(e.request).then(res => {
    if (res.ok) cache.put(e.request, res.clone());
    return res;
  });
  if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
  return net;
}
