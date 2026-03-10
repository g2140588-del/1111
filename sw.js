// Service Worker 文件 (sw.js)

// 定义缓存名称
const CACHE_NAME = 'bunny-css-editor-cache-v1';
// 定义需要缓存的核心文件
const urlsToCache = [
  './',
  './index.html'
  // 如果你有其他 CSS 或 JS 文件，也可以加在这里
];

// 监听 install 事件，在安装时缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 监听 fetch 事件，拦截网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 尝试从缓存中查找匹配的请求
    caches.match(event.request)
      .then((response) => {
        // 如果在缓存中找到了，就直接返回缓存的资源
        // 如果没找到，就通过网络去请求，并正常返回
        return response || fetch(event.request);
      })
  );
});