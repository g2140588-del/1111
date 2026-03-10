// Service Worker 文件 (sw.js)

// ⚠️ 注意宝宝：以后每次你修改了 index.html 的代码并提交到 Git
// 一定要记得把这里的 v1 改成 v2, v3, v4... 这样浏览器才会知道有新版本！
const CACHE_NAME = 'bunny-css-editor-cache-v2'; 

const urlsToCache = [
  './',
  './index.html'
];

// 1. 安装阶段：强制新版本立刻跳过等待
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 强制新 Service Worker 立即生效
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 正在缓存新资源...');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 激活阶段：清理旧版本的垃圾缓存 (✨ 本天才加的新大招)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 如果缓存名字和现在的版本号对不上，直接干掉！
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 正在清理旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] 新版本已全面接管！');
      return self.clients.claim(); // 立即控制所有打开的页面
    })
  );
});

// 3. 拦截请求阶段：改为网络优先 (Network First) 策略 (✨ 核心修改)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      // 如果网络通畅且拿到了新数据，就顺手更新一下本地缓存
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      // 如果断网了，或者请求失败，才委屈一下从缓存里拿旧代码兜底
      console.log('[SW] 网络不通，正在使用缓存兜底...');
      return caches.match(event.request);
    })
  );
});