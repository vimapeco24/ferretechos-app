import {
  validarProducto,
  validarCategoria,
  obtenerUnidadPorDefecto,
  esStockBajo,
  validarStock,
} from './validation';

describe('validarProducto', () => {
  const formValido = {
    codigo: 'PROD001',
    nombre: 'Pintura Vinilo Blanco',
    categoria_id: 'cat-001',
    precio_compra: 25000,
    precio_venta: 35000,
    stock_actual: 50,
    stock_minimo: 10,
    unidad: 'galón',
    marca: 'Pintuco',
    atributos: {},
  };

  test('acepta un producto válido', () => {
    const resultado = validarProducto(formValido, [], [], null);
    expect(resultado.valido).toBe(true);
    expect(Object.keys(resultado.errores)).toHaveLength(0);
  });

  test('rechaza campos obligatorios vacíos', () => {
    const form = { ...formValido, codigo: '', nombre: '', categoria_id: '' };
    const resultado = validarProducto(form, [], [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.codigo).toBeDefined();
    expect(resultado.errores.nombre).toBeDefined();
    expect(resultado.errores.categoria_id).toBeDefined();
  });

  test('rechaza código mayor a 20 caracteres', () => {
    const form = { ...formValido, codigo: 'A'.repeat(21) };
    const resultado = validarProducto(form, [], [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.codigo).toContain('20');
  });

  test('rechaza nombre mayor a 100 caracteres', () => {
    const form = { ...formValido, nombre: 'A'.repeat(101) };
    const resultado = validarProducto(form, [], [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.nombre).toContain('100');
  });

  test('rechaza precios fuera de rango', () => {
    const form = { ...formValido, precio_compra: 0, precio_venta: 1000000000 };
    const resultado = validarProducto(form, [], [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.precio_compra).toBeDefined();
    expect(resultado.errores.precio_venta).toBeDefined();
  });

  test('rechaza precio_venta menor a precio_compra', () => {
    const form = { ...formValido, precio_compra: 50000, precio_venta: 30000 };
    const resultado = validarProducto(form, [], [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.precio_venta).toContain('mayor o igual');
  });

  test('rechaza stock fuera de rango', () => {
    const form = { ...formValido, stock_actual: -1 };
    const resultado = validarProducto(form, [], [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.stock_actual).toBeDefined();
  });

  test('rechaza código duplicado', () => {
    const existentes = [{ id: 'otro-id', codigo: 'PROD001' }];
    const resultado = validarProducto(formValido, existentes, [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.codigo).toContain('Ya existe');
  });

  test('permite código duplicado si es el mismo producto en edición', () => {
    const existentes = [{ id: 'edit-id', codigo: 'PROD001' }];
    const resultado = validarProducto(formValido, existentes, [], 'edit-id');
    expect(resultado.valido).toBe(true);
  });

  test('rechaza marca mayor a 50 caracteres', () => {
    const form = { ...formValido, marca: 'A'.repeat(51) };
    const resultado = validarProducto(form, [], [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.marca).toContain('50');
  });

  test('rechaza atributo numérico <= 0', () => {
    const atributosConfig = [{ nombre: 'peso_kg', tipo_campo: 'numero', obligatorio: false }];
    const form = { ...formValido, atributos: { peso_kg: -5 } };
    const resultado = validarProducto(form, [], atributosConfig, null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.atributo_peso_kg).toContain('mayor a cero');
  });

  test('rechaza atributo obligatorio vacío', () => {
    const atributosConfig = [{ nombre: 'tipo', tipo_campo: 'seleccion', obligatorio: true }];
    const form = { ...formValido, atributos: { tipo: '' } };
    const resultado = validarProducto(form, [], atributosConfig, null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.atributo_tipo).toContain('obligatorio');
  });
});

describe('validarCategoria', () => {
  const formValido = {
    nombre: 'Pinturas',
    descripcion: 'Categoría de pinturas',
    atributos: [],
  };

  test('acepta una categoría válida', () => {
    const resultado = validarCategoria(formValido, [], null);
    expect(resultado.valido).toBe(true);
  });

  test('rechaza nombre vacío', () => {
    const form = { ...formValido, nombre: '' };
    const resultado = validarCategoria(form, [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.nombre).toContain('obligatorio');
  });

  test('rechaza nombre mayor a 50 caracteres', () => {
    const form = { ...formValido, nombre: 'A'.repeat(51) };
    const resultado = validarCategoria(form, [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.nombre).toContain('50');
  });

  test('rechaza descripción mayor a 200 caracteres', () => {
    const form = { ...formValido, descripcion: 'A'.repeat(201) };
    const resultado = validarCategoria(form, [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.descripcion).toContain('200');
  });

  test('rechaza nombre duplicado case-insensitive', () => {
    const existentes = [{ id: 'cat-1', nombre: 'Pinturas' }];
    const form = { ...formValido, nombre: 'pinturas' };
    const resultado = validarCategoria(form, existentes, null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.nombre).toContain('Ya existe');
  });

  test('permite nombre duplicado si es la misma categoría en edición', () => {
    const existentes = [{ id: 'cat-1', nombre: 'Pinturas' }];
    const resultado = validarCategoria(formValido, existentes, 'cat-1');
    expect(resultado.valido).toBe(true);
  });

  test('rechaza más de 10 atributos', () => {
    const form = { ...formValido, atributos: Array(11).fill({ nombre: 'attr' }) };
    const resultado = validarCategoria(form, [], null);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.atributos).toContain('10');
  });
});

describe('obtenerUnidadPorDefecto', () => {
  test('retorna galón para Pinturas', () => {
    expect(obtenerUnidadPorDefecto('Pinturas')).toBe('galón');
  });

  test('retorna pliego para Drywall', () => {
    expect(obtenerUnidadPorDefecto('Drywall')).toBe('pliego');
  });

  test('retorna kilogramo para Estucos', () => {
    expect(obtenerUnidadPorDefecto('Estucos')).toBe('kilogramo');
  });

  test('retorna metro para Eléctricos', () => {
    expect(obtenerUnidadPorDefecto('Eléctricos')).toBe('metro');
  });

  test('retorna unidad para categoría no mapeada', () => {
    expect(obtenerUnidadPorDefecto('Categoría Personalizada')).toBe('unidad');
  });

  test('retorna unidad para null', () => {
    expect(obtenerUnidadPorDefecto(null)).toBe('unidad');
  });

  test('retorna unidad para string vacío', () => {
    expect(obtenerUnidadPorDefecto('')).toBe('unidad');
  });
});

describe('esStockBajo', () => {
  test('retorna true cuando stock_actual <= stock_minimo', () => {
    expect(esStockBajo({ stock_actual: 5, stock_minimo: 10 })).toBe(true);
  });

  test('retorna true cuando stock_actual == stock_minimo', () => {
    expect(esStockBajo({ stock_actual: 10, stock_minimo: 10 })).toBe(true);
  });

  test('retorna false cuando stock_actual > stock_minimo', () => {
    expect(esStockBajo({ stock_actual: 15, stock_minimo: 10 })).toBe(false);
  });

  test('retorna false para producto null', () => {
    expect(esStockBajo(null)).toBe(false);
  });
});

describe('validarStock', () => {
  test('acepta valor 0', () => {
    const resultado = validarStock(0);
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });

  test('acepta valor 999999', () => {
    const resultado = validarStock(999999);
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });

  test('acepta valor intermedio', () => {
    const resultado = validarStock(500);
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });

  test('rechaza valor negativo', () => {
    const resultado = validarStock(-1);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBeDefined();
  });

  test('rechaza valor mayor a 999999', () => {
    const resultado = validarStock(1000000);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBeDefined();
  });

  test('rechaza valor no entero', () => {
    const resultado = validarStock(5.5);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toContain('entero');
  });

  test('rechaza valor vacío', () => {
    const resultado = validarStock('');
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBeDefined();
  });

  test('rechaza valor null', () => {
    const resultado = validarStock(null);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBeDefined();
  });

  test('rechaza texto no numérico', () => {
    const resultado = validarStock('abc');
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBeDefined();
  });
});
