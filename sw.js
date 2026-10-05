self.addEventListener('fetch', (event) => {
  // Permite que la app funcione y cargue contenido dinámico desde Supabase
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});