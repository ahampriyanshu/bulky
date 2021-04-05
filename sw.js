const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
  './',
  './index.html',
  './asset/fallback.html',
  './asset/js/FileSaver.js',
  './asset/js/index.js',
  './asset/js/pdf-lib@1.4.0',
  './asset/js/parse.js',
  './asset/js/fontkit@0.0.4',
  './asset/css/custom-forms.min.css',
  './asset/css/tailwind.min.css',
  './asset/css/style.css',
  './asset/sample.csv',
  './asset/sign.jpg',
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
  './asset/font/BebasNeue-Regular.ttf',
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
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      )
    })
  );
});

const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request).then(fetchRes => {
        return caches.open(dynamicCacheName).then(cache => {
          cache.put(evt.request.url, fetchRes.clone());
          limitCacheSize(dynamicCacheName, 10);
          return fetchRes;
        })
      });
    }).catch(() => {
      if (evt.request.url.indexOf('.html') > -1) {
        return caches.match('./asset/fallback.html');
      }
    })
  );
});
