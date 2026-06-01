# Implementation Plan: Hardware Store Inventory

## Overview

Transformar el sistema de inventario existente (charcutería/lácteos) en un sistema especializado para ferretería. La implementación se divide en: esquema de base de datos, módulos de lógica pura (validación, filtrado, formato), componentes UI nuevos, refactorización de páginas existentes, y tests basados en propiedades.

## Tasks

- [x] 1. Configurar esquema de base de datos y constantes del sistema
  - [x] 1.1 Crear migración SQL para las tablas de ferretería
    - Crear/modificar la tabla `productos` con los campos: id, codigo (UNIQUE, varchar 20), nombre (varchar 100), categoria_id (FK), marca (varchar 50), precio_compra (numeric CHECK 1..999999999), precio_venta (numeric CHECK >= precio_compra), stock_actual (integer CHECK 0..99999), stock_minimo (integer CHECK 0..99999), unidad (varchar 20 DEFAULT 'unidad'), activo (boolean DEFAULT true), created_at, updated_at
    - Crear tabla `categorias` con: id, nombre (UNIQUE, varchar 50), descripcion (varchar 200), es_predefinida (boolean), created_at
    - Crear tabla `categoria_atributos` con: id, categoria_id (FK), nombre (varchar 50), tipo_campo (varchar 20), opciones (jsonb), obligatorio (boolean), orden (integer)
    - Crear tabla `producto_atributos` con: id, producto_id (FK), categoria_atributo_id (FK), valor (varchar 200), UNIQUE(producto_id, categoria_atributo_id)
    - Crear tabla `movimientos_stock` con: id, producto_id (FK), cantidad_anterior, cantidad_nueva, tipo, usuario_id, fecha
    - Insertar las 10 categorías predefinidas con sus atributos específicos (Pinturas, Drywall, Estucos, etc.)
    - Actualizar `supabase_schema.sql` en la raíz del proyecto
    - _Requisitos: 1.1, 2.1, 2.3, 3.1, 3.2, 3.3, 4.1, 5.4_

  - [x] 1.2 Crear módulo de constantes del sistema
    - Crear archivo `frontend/src/lib/constants.js`
    - Definir `UNIDADES_FERRETERIA` con las 15 unidades de medida
    - Definir `UNIDAD_POR_DEFECTO` con el mapeo categoría → unidad
    - Definir `CATEGORIAS_PREDEFINIDAS` con las 10 categorías
    - Definir `ATRIBUTOS_POR_CATEGORIA` con la configuración de atributos específicos para Pinturas, Drywall y Estucos (tipo_campo, opciones, obligatorio)
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 4.1, 4.2_

- [x] 2. Implementar módulo de validación
  - [x] 2.1 Crear funciones de validación de producto y categoría
    - Crear archivo `frontend/src/lib/validation.js`
    - Implementar `validarProducto(form, productosExistentes, atributosConfig, editandoId)` que valide: campos obligatorios no vacíos, código máx 20 chars, nombre máx 100 chars, precios en rango [1, 999.999.999], precio_venta >= precio_compra, stock en [0, 99.999], código único, marca máx 50 chars, atributos numéricos > 0, atributos obligatorios no vacíos
    - Implementar `validarCategoria(form, categoriasExistentes, editandoId)` que valide: nombre obligatorio máx 50 chars, descripción máx 200 chars, nombre único case-insensitive, máximo 10 atributos
    - Implementar `obtenerUnidadPorDefecto(nombreCategoria)` que retorne la unidad mapeada o 'unidad' por defecto
    - Implementar `esStockBajo(producto)` que retorne true si stock_actual <= stock_minimo
    - Implementar `validarStock(valor)` que valide entero en [0, 999999]
    - Exportar todas las funciones
    - _Requisitos: 1.1, 1.3, 1.4, 1.5, 1.6, 2.2, 2.3, 2.5, 3.5, 3.6, 4.2, 4.3, 5.1, 5.5_

  - [ ]* 2.2 Escribir test de propiedad para validación integral de producto
    - **Propiedad 1: Validación integral de producto**
    - Instalar `fast-check` como dependencia de desarrollo si no existe
    - Crear archivo `frontend/src/__tests__/validation.property.test.js`
    - Generar payloads aleatorios de producto con fast-check (campos válidos e inválidos)
    - Verificar que `validarProducto` rechaza cuando algún campo obligatorio está vacío, código > 20 chars, nombre > 100 chars, precios fuera de rango, precio_venta < precio_compra, stock fuera de rango, código duplicado, marca > 50 chars, atributo numérico ≤ 0, atributo obligatorio vacío
    - Verificar que acepta cuando todos los campos cumplen restricciones
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 1.1, 1.3, 1.4, 1.5, 1.6, 3.5, 3.6, 5.5**

  - [ ]* 2.3 Escribir test de propiedad para validación de categoría
    - **Propiedad 2: Validación de categoría**
    - Agregar tests en `frontend/src/__tests__/validation.property.test.js`
    - Generar payloads aleatorios de categoría con fast-check
    - Verificar que `validarCategoria` rechaza si nombre vacío o > 50 chars, descripción > 200 chars, nombre duplicado case-insensitive, más de 10 atributos
    - Verificar que acepta si todos los campos cumplen restricciones
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 2.2, 2.3, 2.5**

  - [ ]* 2.4 Escribir test de propiedad para mapeo de unidad por defecto
    - **Propiedad 3: Mapeo de unidad de medida por defecto**
    - Crear archivo `frontend/src/__tests__/units.property.test.js`
    - Generar nombres de categoría aleatorios (incluyendo las predefinidas y strings arbitrarios)
    - Verificar que `obtenerUnidadPorDefecto` retorna la unidad correcta para categorías mapeadas y 'unidad' para las no mapeadas
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 1.2, 4.2, 4.3**

- [x] 3. Implementar módulo de filtrado y formato
  - [x] 3.1 Crear funciones de filtrado, paginación y formato de precio
    - Crear archivo `frontend/src/lib/filters.js`
    - Implementar `filtrarProductos(productos, filtros)` que filtre por búsqueda (nombre/código/marca, case-insensitive), categoría y marca con lógica AND, solo productos activos
    - Implementar `paginar(items, pagina, porPagina = 20)` que retorne `{ items, totalPaginas, paginaActual }` con máximo 20 elementos por página
    - Implementar `formatearPrecioCOP(valor)` que retorne string con formato "$X.XXX" (separador de miles con punto, sin decimales)
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.6, 7.3, 7.4, 8.2_

  - [ ]* 3.2 Escribir test de propiedad para invariante de alerta de stock
    - **Propiedad 4: Invariante de alerta de stock**
    - Crear archivo `frontend/src/__tests__/filters.property.test.js`
    - Generar productos con stock_actual y stock_minimo aleatorios
    - Verificar que `esStockBajo` retorna true cuando stock_actual ≤ stock_minimo y false en caso contrario
    - Verificar que el conteo de productos en alerta en una lista es igual al número que cumple la condición
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 5.1, 5.2, 5.3**

  - [ ]* 3.3 Escribir test de propiedad para filtrado combinado
    - **Propiedad 5: Filtrado combinado de productos (intersección AND)**
    - Agregar tests en `frontend/src/__tests__/filters.property.test.js`
    - Generar listas de productos y combinaciones de filtros aleatorios
    - Verificar que `filtrarProductos` retorna exactamente los productos que cumplen TODOS los criterios simultáneamente
    - Verificar que con filtros vacíos retorna todos los productos activos
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 6.1, 6.2, 6.3, 6.4, 6.6, 8.2**

  - [ ]* 3.4 Escribir test de propiedad para formato de precio COP
    - **Propiedad 6: Formato de precio COP (round-trip)**
    - Crear archivo `frontend/src/__tests__/formatting.property.test.js`
    - Generar valores numéricos enteros no negativos aleatorios
    - Verificar que `formatearPrecioCOP` produce string que comienza con "$", usa "." como separador de miles, sin decimales
    - Verificar round-trip: parsear el resultado (removiendo "$" y ".") produce el valor original
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 7.3**

  - [ ]* 3.5 Escribir test de propiedad para correctitud de paginación
    - **Propiedad 7: Correctitud de paginación**
    - Agregar tests en `frontend/src/__tests__/formatting.property.test.js`
    - Generar listas de longitud aleatoria (0 a 200 elementos)
    - Verificar que `paginar` produce ceil(N/20) páginas, cada una con máximo 20 elementos
    - Verificar que la unión de todas las páginas contiene exactamente todos los N elementos sin duplicados ni omisiones
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 7.4**

- [x] 4. Checkpoint - Verificar módulos de lógica pura
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 5. Implementar componentes UI nuevos
  - [x] 5.1 Crear componente ConfirmDialog
    - Crear archivo `frontend/src/components/ConfirmDialog.js`
    - Implementar diálogo modal de confirmación con props: `visible`, `titulo`, `mensaje`, `onConfirmar`, `onCancelar`
    - Incluir botones "Confirmar" y "Cancelar" con estilos apropiados
    - Usar para confirmación de desactivación de productos y eliminación de categorías
    - _Requisitos: 8.3, 8.4_

  - [x] 5.2 Crear componente AtributosEspecificos
    - Crear archivo `frontend/src/components/AtributosEspecificos.js`
    - Implementar renderizado dinámico de campos según `atributosConfig`: texto libre (input text), número (input number), selección (select con opciones)
    - Props: `categoriaId`, `atributosConfig`, `valores`, `onChange`, `errores`
    - Mostrar errores de validación por campo
    - Validar que campos numéricos (dimensiones, peso) no acepten valores ≤ 0
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 5.3 Crear componente ProductoForm
    - Crear archivo `frontend/src/components/ProductoForm.js`
    - Implementar formulario completo con campos: código, nombre, categoría (select), marca, precio compra, precio venta, stock actual, stock mínimo, unidad de medida (select)
    - Integrar componente `AtributosEspecificos` que se actualiza al cambiar categoría
    - Al seleccionar categoría: pre-seleccionar unidad por defecto usando `obtenerUnidadPorDefecto`, mostrar atributos específicos correspondientes
    - Al cambiar categoría: reemplazar atributos específicos por los de la nueva categoría
    - Usar `validarProducto` antes de enviar, mostrar errores visuales en campos inválidos
    - Props: `producto`, `categorias`, `productosExistentes`, `onGuardar`, `onCancelar`
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.7, 4.2, 4.3, 4.4_

  - [x] 5.4 Crear componente FiltrosProducto
    - Crear archivo `frontend/src/components/FiltrosProducto.js`
    - Implementar campo de búsqueda por texto (nombre/código/marca)
    - Implementar selector de categoría con opción "Todas"
    - Implementar selector de marca con opción "Todas"
    - Props: `busqueda`, `onBusquedaChange`, `categoriaSeleccionada`, `onCategoriaChange`, `marcaSeleccionada`, `onMarcaChange`, `categorias`, `marcas`
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 5.5 Crear componente Paginacion
    - Crear archivo `frontend/src/components/Paginacion.js`
    - Implementar controles de navegación entre páginas (anterior, siguiente, números de página)
    - Props: `paginaActual`, `totalPaginas`, `onCambiarPagina`
    - Mostrar solo cuando totalPaginas > 1
    - _Requisitos: 7.4_

- [x] 6. Refactorizar página de Inventario
  - [x] 6.1 Refactorizar Inventario.js para ferretería
    - Modificar `frontend/src/pages/Inventario.js`
    - Integrar componentes: `FiltrosProducto`, `ProductoForm`, `Paginacion`, `ConfirmDialog`
    - Implementar vista de tabla (desktop > 768px) con columnas: código, nombre, categoría, marca, precio compra, precio venta, stock, mínimo, estado
    - Implementar vista de tarjetas (móvil ≤ 768px) con: nombre, código, categoría, precio venta, stock, estado
    - Usar hook `useIsMobile` para alternar entre vistas
    - Mostrar indicador rojo de stock bajo cuando stock_actual ≤ stock_minimo
    - Implementar filtrado usando `filtrarProductos` del módulo filters
    - Implementar paginación usando `paginar` del módulo filters
    - Formatear precios con `formatearPrecioCOP`
    - Implementar CRUD de productos: crear, editar, desactivar (soft-delete con confirmación)
    - Implementar reactivación de productos desactivados
    - Implementar filtro para ver productos desactivados
    - Mostrar mensaje "No se encontraron resultados" cuando filtros no coinciden
    - Registrar movimientos de stock al actualizar cantidades
    - Manejar errores de red: preservar estado, mostrar toast de error, no modificar datos locales hasta confirmar éxito
    - _Requisitos: 1.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 6.2 Actualizar Dashboard.js con conteo de stock bajo
    - Modificar `frontend/src/pages/Dashboard.js`
    - Agregar indicador con el conteo total de productos cuyo stock_actual ≤ stock_minimo
    - Excluir productos desactivados del conteo general
    - _Requisitos: 5.2, 8.2_

- [x] 7. Implementar gestión de categorías
  - [x] 7.1 Crear interfaz de gestión de categorías
    - Agregar sección o página para administrar categorías (puede ser modal o sección dentro de Inventario)
    - Implementar crear categoría con nombre y descripción, usando `validarCategoria`
    - Implementar editar categoría existente
    - Implementar eliminar categoría: verificar que no tenga productos asociados antes de permitir eliminación, mostrar ConfirmDialog con conteo de productos si tiene asociados
    - Implementar agregar/editar/eliminar atributos específicos por categoría (máximo 10)
    - _Requisitos: 2.2, 2.3, 2.4, 2.5_

- [x] 8. Implementar capa de API y conexión con Supabase
  - [x] 8.1 Crear funciones de API para productos y categorías
    - Crear archivo `frontend/src/lib/api.js`
    - Implementar funciones CRUD para productos: listar (activos/inactivos), crear, actualizar, desactivar, reactivar
    - Implementar funciones CRUD para categorías: listar, crear, actualizar, eliminar (con verificación de productos asociados)
    - Implementar función para obtener atributos de categoría
    - Implementar función para guardar/actualizar atributos de producto
    - Implementar función para registrar movimiento de stock
    - Implementar manejo de errores: capturar errores de red, retornar mensajes descriptivos, no modificar estado ante fallo
    - Usar el cliente Supabase existente en `frontend/src/lib/supabase.js`
    - _Requisitos: 1.4, 1.7, 2.4, 5.4, 5.6, 8.1_

- [x] 9. Checkpoint - Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [ ] 10. Tests de propiedad para desactivación y protección de categorías
  - [ ]* 10.1 Escribir test de propiedad para desactivación/reactivación
    - **Propiedad 8: Desactivación y reactivación preservan datos**
    - Crear archivo `frontend/src/__tests__/products.property.test.js`
    - Generar productos aleatorios completos
    - Verificar que al cambiar `activo` (true→false o false→true), todos los demás campos permanecen sin modificación
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 8.1, 8.6**

  - [ ]* 10.2 Escribir test de propiedad para protección de eliminación de categoría
    - **Propiedad 9: Protección de eliminación de categoría**
    - Agregar tests en `frontend/src/__tests__/products.property.test.js`
    - Generar categorías con y sin productos asociados (activos e inactivos)
    - Verificar que la función de eliminación rechaza cuando hay al menos un producto asociado y permite cuando no hay productos
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 2.4**

- [x] 11. Checkpoint final - Verificar sistema completo
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedad validan propiedades universales de correctitud con fast-check (mínimo 100 iteraciones)
- Los tests unitarios validan ejemplos específicos y casos borde
- El proyecto usa React con Create React App (Jest incluido), Capacitor para móvil, y Supabase como backend
- Los hooks existentes (`useIsMobile`, `useToast`) y componentes (`Sidebar`) se reutilizan sin modificación
- **Base de datos**: Supabase (PostgreSQL hosted). Las migraciones SQL se ejecutan directamente en el dashboard de Supabase o via CLI de Supabase
- **Despliegue**: El frontend se despliega en Render como sitio estático (build de React). El backend Node.js se despliega como Web Service en Render
- **Variables de entorno**: REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY deben configurarse en Render

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.4", "5.5"] },
    { "id": 4, "tasks": ["5.3", "8.1"] },
    { "id": 5, "tasks": ["6.1", "6.2", "7.1"] },
    { "id": 6, "tasks": ["10.1", "10.2"] }
  ]
}
```
