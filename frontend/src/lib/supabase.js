// Cliente API — compatible con web (producción y desarrollo) y móvil Capacitor
// En desarrollo: /api → proxiado a localhost:3001
// En producción: usa REACT_APP_API_URL (backend en Render)
// En móvil: usa la IP configurada en localStorage

function getApiBase() {
  // Detectar si corre como app nativa Capacitor
  const isCapacitor = !!(window.Capacitor?.isNativePlatform?.())
  if (isCapacitor) {
    const stored = localStorage.getItem('api_server')
    return stored ? `${stored}/api` : null // null = no configurado aún
  }

  // Web: usar variable de entorno si existe, sino /api (proxy en desarrollo)
  if (process.env.REACT_APP_API_URL) {
    return `${process.env.REACT_APP_API_URL}/api`
  }
  return '/api'
}

class QueryBuilder {
  constructor(table) {
    this._table = table
    this._op = 'select'
    this._selectSpec = '*'
    this._filters = []
    this._orderBy = null
    this._limitN = null
    this._data = null
    this._single = false
    this._returnData = false
  }

  select(spec = '*') {
    if (this._op === 'insert' || this._op === 'update') {
      this._returnData = true
    } else {
      this._op = 'select'
      this._selectSpec = spec
    }
    return this
  }

  insert(data) { this._op = 'insert'; this._data = data; return this }
  update(data) { this._op = 'update'; this._data = data; return this }

  eq(col, val) { this._filters.push({ op: 'eq', col, val }); return this }
  gte(col, val) { this._filters.push({ op: 'gte', col, val }); return this }
  lte(col, val) { this._filters.push({ op: 'lte', col, val }); return this }
  order(col, opts = {}) { this._orderBy = { col, asc: opts.ascending !== false }; return this }
  limit(n) { this._limitN = n; return this }
  single() { this._single = true; return this }

  then(resolve, reject) { return this._run().then(resolve, reject) }

  _buildFilterParams() {
    const p = new URLSearchParams()
    this._filters.forEach(f => p.append(`${f.op}[${f.col}]`, f.val))
    return p
  }

  async _run() {
    const API = getApiBase()
    if (API === null) {
      // Móvil sin servidor configurado — devolver vacío sin error para no romper la UI
      return { data: this._single ? null : [], error: null }
    }

    try {
      if (this._op === 'select') {
        const p = new URLSearchParams({ select: this._selectSpec })
        this._filters.forEach(f => p.append(`${f.op}[${f.col}]`, f.val))
        if (this._orderBy) p.set('order', `${this._orderBy.col}:${this._orderBy.asc ? 'asc' : 'desc'}`)
        if (this._limitN) p.set('limit', this._limitN)

        const url = `${API}/${this._table}?${p}`
        const r = await fetch(url)
        // CapacitorHttp puede devolver el body ya parseado en r.data
        // Intentamos r.json() primero; si falla, usamos r.data
        let data
        try {
          data = await r.json()
        } catch (_) {
          data = r.data ?? (this._single ? null : [])
        }
if (!r.ok && !(Array.isArray(data))) { return { data: null, error: data } }
        return { data: this._single ? (Array.isArray(data) ? (data[0] ?? null) : data) : data, error: null }
      }

      if (this._op === 'insert') {
        const r = await fetch(`${API}/${this._table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this._data),
        })
        if (!r.ok) { const e = await r.json(); return { data: null, error: e } }
        const data = await r.json()
        if (this._single) return { data: Array.isArray(data) ? data[0] : data, error: null }
        return { data, error: null }
      }

      if (this._op === 'update') {
        const p = this._buildFilterParams()
        const r = await fetch(`${API}/${this._table}?${p}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this._data),
        })
        if (!r.ok) { const e = await r.json(); return { data: null, error: e } }
        return { data: null, error: null }
      }
    } catch (err) {
      return { data: null, error: { message: err.message } }
    }
  }
}

export const supabase = {
  from: (table) => new QueryBuilder(table),
}

export { getApiBase }
