const staticCacheName = 'site-static-v1';
const dynamicCacheName  = 'site-dynamic-v1';
const assets = [ 
  './',
  './index.html',
  './pages/about.html',
  './pages/fallback.html',
  './js/jszip.js',
  './js/jszip.min.js',
  './js/materialize.js',
  './js/materialize.min.js',
  './js/saveAs.js',
  './js/ui.js',
  './js/template.js',
  './css/materialize.css',
  './css/materialize.min.css',
  './css/style.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];



self.addEventListener('install', evt => {
    //console.log('service worker is installed successfully ');
    evt.waitUntil(
      caches.open(staticCacheName).then(cache => {
        console.log('caching shell assets');
        cache.addAll(assets);
      })
    );
  });
//Activating service worker
  self.addEventListener('activate', evt => {
    //console.log('Service worker has been actiated');
    evt.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(keys
          .filter(key => key !== staticCacheName)
          .map(key => caches.delete(key))
          )
      })
    );
  });

  //  cache size limiting
  const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
      cache.keys().then(keys => {
        if(keys.length > size){
          cache.delete(keys[0]).then(limitCacheSize(name, size));
        }
      });
    });
  };

  //fetch event
  self.addEventListener('fetch', evt => {
    //console.log('fetch event', evt);
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
           cache.put(evt.request.url, fetchRes.clone());
           limitCacheSize(dynamicCacheName, 10);
           return  fetchRes;
          })
        });
      }).catch(() => {
      if(evt.request.url.indexOf('.html') > -1) {
       return caches.match('./pages/fallback.html');
      }
      })
    );
  });
