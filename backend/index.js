'use strict'
const http = require('http')
const { randomUUID } = require('crypto')

const PORT = process.env.PORT || 3001

// ─── Supabase Config ─────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan variables: SUPABASE_URL y SUPABASE_ANON_KEY')
  console.error('   Configúralas en Environment de Render')
  process.exit(1)
}

// Dominios permitidos para CORS (frontend en Render Static Site)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim())

function getCorsOrigin(req) {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes('*')) return '*'
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin
  return ALLOWED_ORIGINS[0]
}

// ─── Supabase REST client ────────────────────────────────────────────────────
async function supabaseRequest(method, tablePath, body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${tablePath}`
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
  }
  if (method === 'GET') {
    headers['Accept'] = 'application/json'
  }

  const opts = { method, headers }
  if (body && method !== 'GET') {
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(url, opts)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase ${method} ${tablePath}: ${res.status} - ${err}`)
  }

  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}

// ─── PostgREST query helpers ─────────────────────────────────────────────────
function buildPostgrestFilters(params) {
  const parts = []
  for (const [key, val] of Object.entries(params)) {
    const eqMatch = key.match(/^eq\[(.+)\]$/)
    const gteMatch = key.match(/^gte\[(.+)\]$/)
    const lteMatch = key.match(/^lte\[(.+)\]$/)
    if (eqMatch) parts.push(`${eqMatch[1]}=eq.${val}`)
    else if (gteMatch) parts.push(`${gteMatch[1]}=gte.${val}`)
    else if (lteMatch) parts.push(`${lteMatch[1]}=lte.${val}`)
  }
  return parts
}

// FK hints para PostgREST embedding
const FK_HINTS = {
  productos: { categorias: 'categoria_id', proveedores: 'proveedor_id' },
  producto_atributos: { productos: 'producto_id', categoria_atributos: 'categoria_atributo_id' },
  categoria_atributos: { categorias: 'categoria_id' },
  movimientos_stock: { productos: 'producto_id' },
  movimientos: { productos: 'producto_id', proveedores: 'proveedor_id' },
  ordenes_compra: { proveedores: 'proveedor_id' },
  ordenes_compra_items: { productos: 'producto_id', ordenes_compra: 'orden_compra_id' },
  ventas_items: { productos: 'producto_id', ventas: 'venta_id' },
}
const FK_CHILDREN = {
  ventas: { ventas_items: 'venta_id' },
  ordenes_compra: { ordenes_compra_items: 'orden_compra_id' },
}

function translateSelect(table, selectSpec) {
  if (!selectSpec || selectSpec === '*') return '*'
  let result = selectSpec
  const fkMap = FK_HINTS[table]
  const childMap = FK_CHILDREN[table]
  if (fkMap) {
    for (const [relTable, fkCol] of Object.entries(fkMap)) {
      const regex = new RegExp(`\\b${relTable}\\(`, 'g')
      result = result.replace(regex, `${relTable}!${fkCol}(`)
    }
  }
  if (childMap) {
    for (const [relTable, fkCol] of Object.entries(childMap)) {
      const regex = new RegExp(`\\b${relTable}\\(`, 'g')
      result = result.replace(regex, `${relTable}!${fkCol}(`)
    }
  }
  return result
}

// ─── API Handlers ─────────────────────────────────────────────────────────────
async function handleGet(table, params) {
  const select = translateSelect(table, params.select || '*')
  const queryParts = [`select=${encodeURIComponent(select)}`]
  queryParts.push(...buildPostgrestFilters(params))
  if (params.order) {
    const [col, dir] = params.order.split(':')
    queryParts.push(`order=${col}.${dir || 'asc'}`)
  }
  if (params.limit) queryParts.push(`limit=${parseInt(params.limit)}`)
  return await supabaseRequest('GET', `${table}?${queryParts.join('&')}`)
}

async function handleInsert(table, data) {
  const row = { ...data }
  if (!row.id) row.id = randomUUID()
  if (!row.created_at) row.created_at = new Date().toISOString()
  if ((table === 'ventas_items' || table === 'ordenes_compra_items') && !row.subtotal) {
    row.subtotal = (row.cantidad || 0) * (row.precio_unitario || 0)
  }
  const result = await supabaseRequest('POST', table, row)
  if (table === 'movimientos' && row.producto_id) await updateStock(row)
  return result ? (Array.isArray(result) ? result[0] : result) : row
}

async function handleUpdate(table, data, params) {
  const filters = buildPostgrestFilters(params)
  if (!filters.length) throw new Error('UPDATE sin filtros no permitido')
  if (['productos', 'ordenes_compra'].includes(table)) {
    data.updated_at = new Date().toISOString()
  }
  await supabaseRequest('PATCH', `${table}?${filters.join('&')}`, data)
  return { ok: true }
}

async function updateStock(movimiento) {
  const { tipo, cantidad, producto_id } = movimiento
  const productos = await supabaseRequest('GET', `productos?id=eq.${producto_id}&select=stock_actual`)
  if (!productos || !productos.length) return
  const stockActual = parseFloat(productos[0].stock_actual) || 0
  let nuevoStock
  if (tipo === 'entrada' || tipo === 'ajuste') nuevoStock = stockActual + parseFloat(cantidad)
  else if (tipo === 'salida' || tipo === 'venta') nuevoStock = Math.max(0, stockActual - parseFloat(cantidad))
  else return
  await supabaseRequest('PATCH', `productos?id=eq.${producto_id}`, {
    stock_actual: nuevoStock,
    updated_at: new Date().toISOString(),
  })
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function parseQuery(search) {
  const params = {}
  new URLSearchParams(search).forEach((v, k) => { params[k] = v })
  return params
}

function jsonResponse(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}) }
      catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

// ─── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const corsOrigin = getCorsOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const parsed = new URL(req.url, `http://localhost:${PORT}`)
  const parts = parsed.pathname.split('/').filter(Boolean)

  // Health check
  if (parts[0] === 'health') {
    jsonResponse(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
    return
  }

  // API routes: /api/{table}
  if (parts[0] === 'api' && parts[1]) {
    const table = parts[1]
    const params = parseQuery(parsed.search)

    try {
      if (req.method === 'GET') {
        const rows = await handleGet(table, params)
        jsonResponse(res, 200, rows || [])
      } else if (req.method === 'POST') {
        const body = await readBody(req)
        if (Array.isArray(body)) {
          const results = []
          for (const item of body) results.push(await handleInsert(table, item))
          jsonResponse(res, 201, results)
        } else {
          const result = await handleInsert(table, body)
          jsonResponse(res, 201, result)
        }
      } else if (req.method === 'PATCH') {
        const body = await readBody(req)
        const result = await handleUpdate(table, body, params)
        jsonResponse(res, 200, result)
      } else {
        jsonResponse(res, 405, { error: 'Method not allowed' })
      }
    } catch (err) {
      console.error(`[${req.method} ${req.url}]`, err.message)
      jsonResponse(res, 500, { message: err.message })
    }
    return
  }

  jsonResponse(res, 404, { error: 'Not found. Use /api/{table}' })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔧 Ferretechos API corriendo en http://0.0.0.0:${PORT}`)
  console.log(`   Supabase: ${SUPABASE_URL}`)
  console.log(`   CORS: ${ALLOWED_ORIGINS.join(', ')}`)
})
