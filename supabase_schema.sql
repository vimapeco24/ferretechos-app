-- ============================================================
-- Schema para Charcutería Inventario Pro
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Categorías ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
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
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria_id UUID REFERENCES categorias(id),
  proveedor_id UUID REFERENCES proveedores(id),
  precio_compra NUMERIC NOT NULL DEFAULT 0,
  precio_venta NUMERIC NOT NULL DEFAULT 0,
  stock_actual NUMERIC NOT NULL DEFAULT 0,
  stock_minimo NUMERIC NOT NULL DEFAULT 0,
  unidad TEXT DEFAULT 'kg',
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Movimientos ─────────────────────────────────────────────
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
-- Para uso público con anon key, permitir todo (app interna)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_items ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (app interna sin auth)
CREATE POLICY "allow_all" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON proveedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON movimientos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ordenes_compra FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ordenes_compra_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ventas_items FOR ALL USING (true) WITH CHECK (true);

-- ─── Datos de ejemplo ────────────────────────────────────────
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Embutidos', 'Chorizo, salchichón, longaniza'),
  ('Jamones', 'Jamón serrano, cocido, ibérico'),
  ('Quesos', 'Quesos frescos, maduros y semicurados'),
  ('Carnes Frías', 'Mortadela, salami, paté'),
  ('Ahumados', 'Productos ahumados y marinados');

INSERT INTO proveedores (nombre, contacto, telefono, email, nit) VALUES
  ('Embutidos Del Campo S.A.S', 'Carlos Ruiz', '3001234567', 'ventas@delcampo.co', '900123456-1'),
  ('Distribuidora La Española', 'María Torres', '3157654321', 'pedidos@laespanola.co', '800234567-2'),
  ('Lácteos Andinos Ltda', 'Pedro Gómez', '3209876543', 'comercial@lacteosandinos.co', '700345678-3');

INSERT INTO productos (codigo, nombre, categoria_id, proveedor_id, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES
  ('CHO-001', 'Chorizo Corriente', (SELECT id FROM categorias WHERE nombre='Embutidos'), (SELECT id FROM proveedores WHERE nombre='Embutidos Del Campo S.A.S'), 12000, 18000, 25.5, 5),
  ('CHO-002', 'Chorizo Santarrosano', (SELECT id FROM categorias WHERE nombre='Embutidos'), (SELECT id FROM proveedores WHERE nombre='Embutidos Del Campo S.A.S'), 15000, 22000, 18.0, 3),
  ('JAM-001', 'Jamón Serrano Importado', (SELECT id FROM categorias WHERE nombre='Jamones'), (SELECT id FROM proveedores WHERE nombre='Distribuidora La Española'), 35000, 52000, 8.5, 2),
  ('JAM-002', 'Jamón Cocido Nacional', (SELECT id FROM categorias WHERE nombre='Jamones'), (SELECT id FROM proveedores WHERE nombre='Embutidos Del Campo S.A.S'), 18000, 27000, 12.0, 3),
  ('QUE-001', 'Queso Doble Crema', (SELECT id FROM categorias WHERE nombre='Quesos'), (SELECT id FROM proveedores WHERE nombre='Lácteos Andinos Ltda'), 14000, 20000, 3.5, 5),
  ('QUE-002', 'Queso Parmesano', (SELECT id FROM categorias WHERE nombre='Quesos'), (SELECT id FROM proveedores WHERE nombre='Lácteos Andinos Ltda'), 28000, 42000, 6.0, 2),
  ('SAL-001', 'Salami Milano', (SELECT id FROM categorias WHERE nombre='Carnes Frías'), (SELECT id FROM proveedores WHERE nombre='Distribuidora La Española'), 22000, 33000, 4.0, 2),
  ('LON-001', 'Longaniza Ahumada', (SELECT id FROM categorias WHERE nombre='Ahumados'), (SELECT id FROM proveedores WHERE nombre='Embutidos Del Campo S.A.S'), 16000, 24000, 1.5, 3);
