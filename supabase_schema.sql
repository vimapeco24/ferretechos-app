-- ============================================================
-- Schema para Ferretechos - Inventario de Ferretería
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Categorías ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(200),
  es_predefinida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Categoria Atributos ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS categoria_atributos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  tipo_campo VARCHAR(20) NOT NULL,
  opciones JSONB,
  obligatorio BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0
);

-- ─── Proveedores ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  nit TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Productos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  categoria_id UUID REFERENCES categorias(id) NOT NULL,
  marca VARCHAR(50),
  precio_compra NUMERIC(12,0) NOT NULL CHECK (precio_compra >= 1 AND precio_compra <= 999999999),
  precio_venta NUMERIC(12,0) NOT NULL CHECK (precio_venta >= 1 AND precio_venta <= 999999999),
  stock_actual INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0 AND stock_actual <= 99999),
  stock_minimo INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0 AND stock_minimo <= 99999),
  unidad VARCHAR(20) NOT NULL DEFAULT 'unidad',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT precio_venta_mayor_compra CHECK (precio_venta >= precio_compra)
);

-- ─── Producto Atributos ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS producto_atributos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
  categoria_atributo_id UUID REFERENCES categoria_atributos(id) ON DELETE CASCADE NOT NULL,
  valor VARCHAR(200) NOT NULL,
  UNIQUE(producto_id, categoria_atributo_id)
);

-- ─── Movimientos de Stock ────────────────────────────────────
CREATE TABLE IF NOT EXISTS movimientos_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
  cantidad_anterior INTEGER NOT NULL,
  cantidad_nueva INTEGER NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  usuario_id VARCHAR(100),
  fecha TIMESTAMPTZ DEFAULT now()
);

-- ─── Movimientos (tabla existente para compatibilidad) ───────
CREATE TABLE IF NOT EXISTS movimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) NOT NULL,
  tipo TEXT NOT NULL,
  cantidad NUMERIC NOT NULL,
  precio_unitario NUMERIC,
  motivo TEXT,
  proveedor_id UUID REFERENCES proveedores(id),
  orden_compra_id UUID,
  usuario TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Órdenes de Compra ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT UNIQUE NOT NULL,
  proveedor_id UUID REFERENCES proveedores(id) NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  fecha_pedido DATE DEFAULT CURRENT_DATE,
  fecha_entrega DATE,
  total NUMERIC DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ordenes_compra_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_compra_id UUID REFERENCES ordenes_compra(id),
  producto_id UUID REFERENCES productos(id),
  cantidad NUMERIC NOT NULL,
  precio_unitario NUMERIC NOT NULL,
  subtotal NUMERIC
);

-- ─── Ventas ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT UNIQUE NOT NULL,
  fecha TIMESTAMPTZ DEFAULT now(),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  metodo_pago TEXT DEFAULT 'efectivo',
  cliente TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ventas_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID REFERENCES ventas(id),
  producto_id UUID REFERENCES productos(id),
  cantidad NUMERIC NOT NULL,
  precio_unitario NUMERIC NOT NULL,
  subtotal NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Habilitar RLS (Row Level Security) ─────────────────────
-- Para uso interno con anon key, permitir todo (app interna)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria_atributos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_atributos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_items ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (app interna sin auth)
CREATE POLICY "allow_all" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON categoria_atributos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON proveedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON producto_atributos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON movimientos_stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON movimientos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ordenes_compra FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ordenes_compra_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ventas_items FOR ALL USING (true) WITH CHECK (true);

-- ─── Datos predefinidos: Categorías de ferretería ────────────
INSERT INTO categorias (nombre, descripcion, es_predefinida) VALUES
  ('Pinturas', 'Pinturas, esmaltes, lacas y anticorrosivos', true),
  ('Drywall', 'Láminas, perfiles y accesorios de drywall', true),
  ('Estucos', 'Estucos plásticos, acrílicos y venecianos', true),
  ('Herramientas', 'Herramientas manuales y eléctricas', true),
  ('Tornillería', 'Tornillos, tuercas, pernos y anclajes', true),
  ('Eléctricos', 'Cables, interruptores, tomacorrientes y accesorios eléctricos', true),
  ('Plomería', 'Tubería, accesorios y grifería', true),
  ('Adhesivos y Sellantes', 'Silicona, pegantes, cintas y selladores', true),
  ('Abrasivos', 'Lijas, discos de corte y pulidoras', true),
  ('Seguridad Industrial', 'Elementos de protección personal y señalización', true);

-- ─── Datos predefinidos: PVC Techos ──────────────────────────
INSERT INTO categorias (nombre, descripcion, es_predefinida) VALUES
  ('PVC Techos', 'Cielos rasos y láminas de PVC para techos', true);

-- ─── Atributos específicos: PVC Techos ──────────────────────
INSERT INTO categoria_atributos (categoria_id, nombre, tipo_campo, opciones, obligatorio, orden) VALUES
  ((SELECT id FROM categorias WHERE nombre = 'PVC Techos'), 'Color', 'texto', NULL, false, 1),
  ((SELECT id FROM categorias WHERE nombre = 'PVC Techos'), 'Tipo', 'seleccion', '["liso", "decorado", "madera", "mármol"]', true, 2),
  ((SELECT id FROM categorias WHERE nombre = 'PVC Techos'), 'Largo (cm)', 'numero', NULL, false, 3),
  ((SELECT id FROM categorias WHERE nombre = 'PVC Techos'), 'Ancho (cm)', 'numero', NULL, false, 4),
  ((SELECT id FROM categorias WHERE nombre = 'PVC Techos'), 'Presentación', 'seleccion', '["caja", "paquete"]', true, 5),
  ((SELECT id FROM categorias WHERE nombre = 'PVC Techos'), 'Unidades por caja', 'numero', NULL, false, 6);

-- ─── Atributos específicos: Pinturas ─────────────────────────
INSERT INTO categoria_atributos (categoria_id, nombre, tipo_campo, opciones, obligatorio, orden) VALUES
  ((SELECT id FROM categorias WHERE nombre = 'Pinturas'), 'Color', 'texto', NULL, false, 1),
  ((SELECT id FROM categorias WHERE nombre = 'Pinturas'), 'Tipo', 'seleccion', '["vinilo", "esmalte", "anticorrosivo", "laca"]', true, 2),
  ((SELECT id FROM categorias WHERE nombre = 'Pinturas'), 'Acabado', 'seleccion', '["mate", "brillante", "satinado"]', true, 3),
  ((SELECT id FROM categorias WHERE nombre = 'Pinturas'), 'Presentación', 'seleccion', '["galón", "cuarto", "litro", "caneca"]', true, 4);

-- ─── Atributos específicos: Drywall ──────────────────────────
INSERT INTO categoria_atributos (categoria_id, nombre, tipo_campo, opciones, obligatorio, orden) VALUES
  ((SELECT id FROM categorias WHERE nombre = 'Drywall'), 'Largo (cm)', 'numero', NULL, false, 1),
  ((SELECT id FROM categorias WHERE nombre = 'Drywall'), 'Ancho (cm)', 'numero', NULL, false, 2),
  ((SELECT id FROM categorias WHERE nombre = 'Drywall'), 'Espesor (cm)', 'numero', NULL, false, 3),
  ((SELECT id FROM categorias WHERE nombre = 'Drywall'), 'Tipo', 'seleccion', '["estándar", "resistente a humedad", "resistente a fuego"]', true, 4),
  ((SELECT id FROM categorias WHERE nombre = 'Drywall'), 'Presentación', 'seleccion', '["pliego", "medio pliego"]', true, 5);

-- ─── Atributos específicos: Estucos ──────────────────────────
INSERT INTO categoria_atributos (categoria_id, nombre, tipo_campo, opciones, obligatorio, orden) VALUES
  ((SELECT id FROM categorias WHERE nombre = 'Estucos'), 'Peso (kg)', 'numero', NULL, false, 1),
  ((SELECT id FROM categorias WHERE nombre = 'Estucos'), 'Tipo', 'seleccion', '["plástico", "acrílico", "veneciano"]', true, 2),
  ((SELECT id FROM categorias WHERE nombre = 'Estucos'), 'Color', 'texto', NULL, false, 3);
