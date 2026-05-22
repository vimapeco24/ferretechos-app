const CACHE = 'charcuteria-v2'
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Solo cachear GET de assets estáticos de la misma origin
  if (e.request.method !== 'GET') return

  const url = e.request.url

  // Nunca interceptar peticiones a APIs externas o de CapacitorHttp
  if (url.includes('supabase.co')) return
  if (url.includes(':3001')) return
  if (url.includes('/api/')) return
  if (url.includes('_capacitor_http_interceptor_')) return
  if (url.includes('%3A3001') || url.includes('%3a3001')) return
  if (/https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url)) return

  // Solo cachear assets estáticos (JS, CSS, imágenes, fuentes)
  const ext = url.split('?')[0].split('.').pop().toLowerCase()
  const staticExts = ['js', 'css', 'png', 'jpg', 'jpeg', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'webp']
  if (!staticExts.includes(ext) && !url.endsWith('/') && !url.endsWith('/index.html')) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      }).catch(() => cached || new Response('', { status: 503 }))
    })
  )
})
