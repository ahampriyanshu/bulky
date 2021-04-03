const staticCacheName = 'site-static-v1';
const dynamicCacheName  = 'site-dynamic-v1';
const assets = [ 
  './',
  './index.html',
  './asset/js/FileSaver.js',
  './asset/js/index.js',
  './asset/js/parse.js',
  './asset/css/custom-forms.min.css',
  './asset/css/tailwind.min.css',
  './asset/css/style.css',
  'https://rsms.me/inter/inter.css',
  './favicon.ico',
'https://unpkg.com/pdf-lib@1.4.0',
'https://unpkg.com/@pdf-lib/fontkit@0.0.4',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  './Roboto-Medium.tff',
  './asset/sample.png',
  './asset/sample.csv',
  './asset/sample.pdf',
  './asset/fallback.html',
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
       return caches.match('./asset/fallback.html');
      }
      })
    );
  });