const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  './index.html',
  './css/styles.css',
  './js/index.js',
  './js/idb.js',
  './manifest.json',
  './icons/icon-512x512.png',
  './icons/icon-192x192.png',

];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(keyList.map(function (key, i) {
        if (cacheKeeplist.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i]);
          return caches.delete(keyList[i]);
        }
      }));
    })
  )
});

self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)
  if (!e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(function () {
        caches.match(e.request).then(function (request) {
          if (request) { // if cache is available, respond with cache
            console.log('responding with cache : ' + e.request.url)
            return request
          } else if (e.request.headers.get('accept').includes('text/html')) {       // if there are no cache, try fetching request
            console.log('file is not cached, fetching : ' + e.request.url)
            return caches.match('/');
          }
        })
      })
    )
    return;
  }
});