// Service worker de notificaciones push (se sirve desde la raiz: /sw.js)
//escucha cuando llega un push y le pide al navegador que muestre la notificacion

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let d = {}
  try {
    d = event.data ? event.data.json() : {}
  } catch {
    d = { titulo: 'Sistema de Turnos', cuerpo: event.data ? event.data.text() : '' }
  }

  event.waitUntil(
    self.registration.showNotification(d.titulo || 'Sistema de Turnos', {
      body: d.cuerpo || '',
      icon: '/icons/favicon-128x128.png',
      badge: '/icons/favicon-96x96.png',
      tag: d.tag,
      renotify: Boolean(d.tag),
      data: { url: '/misturnos' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/misturnos'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if ('focus' in v) {
          v.navigate?.(url)
          return v.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})