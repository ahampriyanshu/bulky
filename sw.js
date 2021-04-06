importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');
const VERSION = 1.0;

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

const staticCachePrefix = 'static';
const staticCacheName = 'staticCacheName';
const dynamicCacheName = 'dynamic';
const appShell = [
  '',
  'index.html',
  'asset/fallback.html',
  'asset/js/FileSaver.js',
  'asset/js/index.js',
  'asset/js/xlsx.full.min.js',
  'asset/js/pdf-lib@1.4.0',
  'asset/js/parse.js',
  'asset/js/fontkit@0.0.4',
  'asset/css/custom-forms.min.css',
  'asset/css/tailwind.min.css',
  'asset/css/style.css',
  'asset/sample.csv',
  'asset/sign.jpg',
  'asset/img/apple-icon-60x60.png',
  'asset/img/apple-icon-72x72.png',
  'asset/img/apple-icon-76x76.png',
  'asset/img/apple-icon-114x114.png',
  'asset/img/apple-icon-120x120.png',
  'asset/img/apple-icon-144x144.png',
  'asset/img/apple-icon-152x152.png',
  'asset/img/apple-icon-180x180.png',
  'asset/img/android-icon-192x192.png',
  'asset/img/favicon-32x32.png',
  'asset/img/favicon-96x96.png',
  'asset/img/favicon-16x16.png',
  'favicon.ico',
  'asset/font/BebasNeue-Regular.ttf',
  'asset/img/ms-icon-144x144.png',
  'asset/img/logo.png',
  'asset/sample_result/1.png',
  'asset/sample_result/2.png',
  'asset/sample_result/2.png',
  'asset/sample_result/3.png',
  'asset/sample_result/4.png',
  'asset/sample_result/5.png',
  'asset/sample_result/6.png',
  'asset/sample_result/7.png',
  'asset/sample_result/8.png',
  'asset/sample_result/9.png',
  'asset/sample_result/10.png',
  'asset/sample_result/11.png',
  'asset/sample_result/12.png',
  'asset/sample_result/13.png',
  'asset/sample_result/14.png',
  'asset/sample_result/15.png',
  'asset/sample_result/16.png',
  'asset/sample_result/17.png',
  'asset/sample_result/18.png',
  'asset/sample_result/19.png',
  'asset/sample_result/20.png',
  'asset/sample_result/21.png',
  'asset/sample_result/22.png',
  'asset/sample_result/23.png',
  'asset/sample_result/24.png',
  'asset/sample_layout/layout_1.png',
  'asset/sample_layout/layout_2.png',
  'asset/sample_layout/layout_2.png',
  'asset/sample_layout/layout_3.png',
  'asset/sample_layout/layout_4.png',
  'asset/sample_layout/layout_5.png',
  'asset/sample_layout/layout_6.png',
  'asset/sample_layout/layout_7.png',
  'asset/sample_layout/layout_8.png',
  'asset/sample_layout/layout_9.png',
  'asset/sample_layout/layout_10.png',
  'asset/sample_layout/layout_11.png',
  'asset/sample_layout/layout_12.png',
  'asset/sample_layout/layout_13.png',
  'asset/sample_layout/layout_14.png',
  'asset/sample_layout/layout_15.png',
  'asset/sample_layout/layout_16.png',
  'asset/sample_layout/layout_17.png',
  'asset/sample_layout/layout_18.png',
  'asset/sample_layout/layout_19.png',
  'asset/sample_layout/layout_20.png',
  'asset/sample_layout/layout_21.png',
  'asset/sample_layout/layout_22.png',
  'asset/sample_layout/layout_23.png',
  'asset/sample_layout/layout_24.png',
].map((partialUrl) => `${location.protocol}//${location.host}${partialUrl}`);
const maxNumberItemsDynamicCache = 5;
const urlsToCacheTimes = new Map();
const networkWaitTime = 2000;


self.addEventListener('install', (event) => {
    console.log('[SW] Installing SW version:', VERSION);
    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                console.log('[SW] Caching app shell');
                cache.addAll(appShell);
            }),
    );
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Cleaning old cache shell');
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== staticCacheName && key.startsWith(staticCachePrefix))
                    .map((key) => caches.delete(key))
            )),
    );
});


self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        networkThenCache(event),
    );
});

function networkThenCache(event) {
    if (appShell.includes(event.request.url)) {
        console.log('[SW] Requested file from app shell, serving from the cache.');
        return getFromCache(event);
    }

    return Promise.race([
        tryToFetchAndSaveInCache(event, dynamicCacheName),
        new Promise((resolve, reject) => setTimeout(reject, networkWaitTime))
    ])
        .then(
            (response) => response,
            () => getFromCache(event).catch(() => provideOfflineFallback(event))
        );
}

function getFromCache(event) {
    return caches.match(event.request)
        .then((response) => {
            console.log(`[SW] Requesting ${event.request.url}.`);
            if (response) {
                console.log(`[SW] Served response to ${event.request.url} from the cache.`);
                return response;
            }

            return Promise.reject();
        });
}

function tryToFetchAndSaveInCache(event, cacheName) {
    return fetchAndSaveInCache(event, cacheName)
        .catch(err => {
            console.warn('[SW] Network request failed, app is probably offline', err);
            return provideOfflineFallback(event)
                .catch(err => console.warn('[SW] failed to get response from network and cache.', err));
        });
}

function fetchAndSaveInCache(event, cacheName) {
    console.log(`[SW] Fetching ${event.request.url}`);
    return fetch(event.request)
        .then(res => {
            const requestSucceeded = res.status >= 200 && res.status <= 300;
            const cacheHeader = res.headers.get('cache-control') || [];
            const mustNotCache = cacheHeader.includes('no-cache');
            if (!requestSucceeded) {
                console.log('[SW] Request failed.');
                return res;
            } else if (mustNotCache) {
                console.log('[SW] The page must not be cached.');
                return res;
            }

            return caches.open(cacheName)
                .then(cache => {
                    cache.put(event.request.url, res.clone())
                        .then(() => {
                            urlsToCacheTimes.set(event.request.url, Date.now());
                            return trimCache(cache, maxNumberItemsDynamicCache, urlsToCacheTimes);
                        });

                    return res;
                });
        });
}

function trimCache(cache, maxItems, cacheTimeInfos) {
    if (cacheTimeInfos.size <= maxItems) {
        console.log('[SW] Nothing to trim from the cache.');
        return Promise.resolve();
    }


    const urlsToKeep = Array.from(cacheTimeInfos.entries())
        .sort((a, b) => a[1] - b[1])
        .reverse()
        .slice(0, maxItems)
        .map(([url, _]) => url);

    console.log('[SW] Keeping in cache', urlsToKeep);
    return cache.keys()
        .then((keys) => {
            const deletions = keys.map(key => {
                if (urlsToKeep.includes(key.url)) {
                    return Promise.resolve();
                }

                console.log(`[SW] Removing ${key.url} from the cache.`);
                cacheTimeInfos.delete(key.url);
                return cache.delete(key);
            });
            return Promise.all(deletions);
        })
        .then(() => console.log('[SW] Done trimming cache.'))
        .catch(() => console.log('[SW] Error while trimming cache.'));
}

function provideOfflineFallback(event) {
    return caches.open(staticCacheName)
        .then((cache) => {
            if (event.request.headers.get('accept').includes('text/html')) {
                return cache.match('asset/fallback.html');
            }

            return Promise.reject();
        });
}