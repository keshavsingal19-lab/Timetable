self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // This empty fetch event is required by Chrome to trigger the Install Prompt!
});