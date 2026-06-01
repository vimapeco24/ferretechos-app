# Requirements Document

## Introduction

Sistema de inventario para ferretería que permite registrar y gestionar productos como pinturas, drywall, estucos y demás productos asociados al ramo ferretero. El sistema se adapta sobre la aplicación existente de inventario (React + Capacitor + Supabase) para manejar las categorías, atributos y unidades de medida propias de una ferretería.

## Glossary

- **Sistema_Inventario**: Aplicación web/móvil de gestión de inventario para ferretería
- **Producto**: Artículo registrado en el inventario con sus atributos (nombre, código, precio, stock, categoría)
- **Categoría**: Clasificación de productos (Pinturas, Drywall, Estucos, Herramientas, Tornillería, Eléctricos, Plomería, etc.)
- **Atributo_Específico**: Propiedad adicional de un producto según su categoría (color, tamaño, presentación, rendimiento)
- **Unidad_Medida**: Unidad en la que se mide el stock del producto (unidad, galón, cuarto, litro, metro, metro², pliego, rollo, bolsa, caja, libra, kilogramo)
- **Stock_Mínimo**: Cantidad mínima de un producto antes de generar una alerta de reabastecimiento
- **Proveedor**: Empresa o persona que suministra productos a la ferretería
- **Marca**: Fabricante o marca comercial del producto (Pintuco, Corona, Eternit, etc.)
- **Código_Producto**: Identificador único alfanumérico asignado a cada producto

## Requirements

### Requirement 1: Registro de productos de ferretería

**User Story:** Como administrador de la ferretería, quiero registrar productos con sus atributos específicos (marca, color, presentación, unidad de medida), para tener un catálogo completo y detallado de mi inventario.

#### Acceptance Criteria

1. WHEN el administrador crea un nuevo producto, THE Sistema_Inventario SHALL solicitar los campos obligatorios: código (alfanumérico, máximo 20 caracteres), nombre (máximo 100 caracteres), categoría, precio de compra (valor numérico entre 1 y 999.999.999 COP), precio de venta (valor numérico entre 1 y 999.999.999 COP), stock actual (entero entre 0 y 99.999), stock mínimo (entero entre 0 y 99.999) y unidad de medida.
2. WHEN el administrador selecciona una categoría, THE Sistema_Inventario SHALL mostrar los atributos específicos correspondientes a esa categoría (color para pinturas, dimensiones para drywall, peso para estucos).
3. THE Sistema_Inventario SHALL permitir registrar la marca del producto como campo opcional con un máximo de 50 caracteres.
4. IF el administrador intenta guardar un producto con código duplicado, THEN THE Sistema_Inventario SHALL impedir el guardado y mostrar un mensaje de error indicando que el código ya existe.
5. IF el precio de venta es menor al precio de compra, THEN THE Sistema_Inventario SHALL impedir el guardado y mostrar un mensaje de error indicando que el precio de venta debe ser mayor o igual al precio de compra.
6. IF el administrador intenta guardar un producto con algún campo obligatorio vacío o con valores fuera de los rangos permitidos, THEN THE Sistema_Inventario SHALL impedir el guardado y señalar visualmente los campos que requieren corrección.
7. WHEN el administrador guarda un producto con todos los campos válidos, THE Sistema_Inventario SHALL registrar el producto y mostrar un mensaje de confirmación indicando que el producto fue creado exitosamente.

### Requirement 2: Categorías de productos ferreteros

**User Story:** Como administrador de la ferretería, quiero organizar los productos en categorías específicas del ramo ferretero, para facilitar la navegación y gestión del inventario.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL incluir las categorías predefinidas: Pinturas, Drywall, Estucos, Herramientas, Tornillería, Eléctricos, Plomería, Adhesivos y Sellantes, Abrasivos, y Seguridad Industrial.
2. WHEN el administrador selecciona la opción de crear categoría, THE Sistema_Inventario SHALL solicitar un nombre (obligatorio, máximo 50 caracteres) y una descripción (opcional, máximo 200 caracteres) para la nueva categoría.
3. THE Sistema_Inventario SHALL permitir agregar, editar y eliminar atributos específicos asociados a cada categoría, con un máximo de 10 atributos por categoría.
4. IF el administrador intenta eliminar una categoría que tiene productos asociados, THEN THE Sistema_Inventario SHALL impedir la eliminación y mostrar un mensaje indicando la cantidad de productos asociados.
5. IF el administrador intenta crear una categoría con un nombre que ya existe, THEN THE Sistema_Inventario SHALL impedir la creación y mostrar un mensaje indicando que el nombre de categoría ya está en uso.

### Requirement 3: Atributos específicos por categoría

**User Story:** Como administrador de la ferretería, quiero que cada categoría tenga atributos propios (color para pinturas, dimensiones para drywall), para registrar información relevante de cada tipo de producto.

#### Acceptance Criteria

1. WHEN el administrador crea o edita un producto de la categoría Pinturas, THE Sistema_Inventario SHALL mostrar los atributos: color (campo de texto libre, máximo 50 caracteres), tipo (selección única entre: vinilo, esmalte, anticorrosivo, laca), acabado (selección única entre: mate, brillante, satinado), y presentación (selección única entre: galón, cuarto, litro, caneca).
2. WHEN el administrador crea o edita un producto de la categoría Drywall, THE Sistema_Inventario SHALL mostrar los atributos: dimensiones en centímetros (largo x ancho x espesor, campos numéricos individuales), tipo (selección única entre: estándar, resistente a humedad, resistente a fuego), y presentación (selección única entre: pliego, medio pliego).
3. WHEN el administrador crea o edita un producto de la categoría Estucos, THE Sistema_Inventario SHALL mostrar los atributos: peso en kilogramos (campo numérico), tipo (selección única entre: plástico, acrílico, veneciano), y color (campo de texto libre, máximo 50 caracteres).
4. WHEN un producto pertenece a una categoría sin atributos específicos configurados, THE Sistema_Inventario SHALL mostrar únicamente los campos generales del producto (código, nombre, categoría, precio de compra, precio de venta, stock actual, stock mínimo, unidad de medida y marca).
5. WHEN el administrador guarda un producto con atributos específicos, THE Sistema_Inventario SHALL requerir que los campos tipo y presentación estén seleccionados, mientras que color, dimensiones y peso son opcionales.
6. IF el administrador ingresa un valor numérico menor o igual a cero en los campos de dimensiones o peso, THEN THE Sistema_Inventario SHALL mostrar un mensaje de error indicando que el valor debe ser mayor a cero.
7. WHEN el administrador cambia la categoría de un producto existente, THE Sistema_Inventario SHALL reemplazar los atributos específicos mostrados por los correspondientes a la nueva categoría seleccionada.

### Requirement 4: Unidades de medida para ferretería

**User Story:** Como administrador de la ferretería, quiero manejar las unidades de medida apropiadas para productos ferreteros, para registrar correctamente las cantidades en stock.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL ofrecer las siguientes unidades de medida para selección: unidad, galón, cuarto, litro, metro, metro cuadrado, pliego, rollo, bolsa, caja, libra, kilogramo, pie, pulgada, y tubo.
2. WHEN el administrador selecciona una categoría al crear o editar un producto, THE Sistema_Inventario SHALL pre-seleccionar la unidad de medida por defecto según la siguiente correspondencia: Pinturas → galón, Drywall → pliego, Estucos → kilogramo, Herramientas → unidad, Tornillería → unidad, Eléctricos → metro, Plomería → metro, Adhesivos y Sellantes → unidad, Abrasivos → unidad, Seguridad Industrial → unidad.
3. IF el administrador selecciona una categoría personalizada que no tiene unidad por defecto configurada, THEN THE Sistema_Inventario SHALL pre-seleccionar "unidad" como unidad de medida por defecto.
4. THE Sistema_Inventario SHALL permitir al administrador cambiar la unidad de medida pre-seleccionada por cualquier otra de la lista disponible antes de guardar el producto.
5. WHEN el administrador guarda un producto, THE Sistema_Inventario SHALL almacenar la unidad de medida seleccionada y mostrarla junto al valor de stock en todas las vistas del producto.

### Requirement 5: Gestión de stock e inventario

**User Story:** Como administrador de la ferretería, quiero controlar las cantidades en stock y recibir alertas cuando un producto esté por debajo del mínimo, para evitar desabastecimiento.

#### Acceptance Criteria

1. WHILE el stock actual de un producto es menor o igual al stock mínimo definido, THE Sistema_Inventario SHALL mostrar una alerta visual (indicador rojo) junto al producto en la lista de inventario.
2. WHEN el administrador accede al dashboard, THE Sistema_Inventario SHALL mostrar el conteo total de productos cuyo stock actual es menor o igual a su stock mínimo definido.
3. THE Sistema_Inventario SHALL permitir filtrar la lista de productos para mostrar únicamente aquellos cuyo stock actual es menor o igual a su stock mínimo definido.
4. WHEN el administrador actualiza el stock de un producto ingresando un valor numérico entero mayor o igual a 0 y menor o igual a 999999, THE Sistema_Inventario SHALL registrar la cantidad anterior, la cantidad nueva, la fecha y hora de la modificación, y el identificador del administrador que realizó el cambio.
5. IF el administrador ingresa un valor de stock no numérico, negativo, o mayor a 999999, THEN THE Sistema_Inventario SHALL rechazar la actualización y mostrar un mensaje de error indicando el rango válido permitido (0 a 999999).
6. IF la actualización de stock falla por indisponibilidad del servicio, THEN THE Sistema_Inventario SHALL mostrar un mensaje de error indicando que no se pudo guardar el cambio y SHALL preservar el valor de stock anterior sin modificación.

### Requirement 6: Búsqueda y filtrado de productos

**User Story:** Como administrador de la ferretería, quiero buscar y filtrar productos por nombre, código, categoría o marca, para encontrar rápidamente lo que necesito.

#### Acceptance Criteria

1. WHEN el administrador escribe al menos 1 carácter en el campo de búsqueda, THE Sistema_Inventario SHALL filtrar los productos cuyo nombre, código o marca contenga el texto ingresado, sin distinguir entre mayúsculas y minúsculas.
2. THE Sistema_Inventario SHALL permitir filtrar productos por categoría mediante un selector desplegable que incluya una opción "Todas" para no restringir por categoría.
3. THE Sistema_Inventario SHALL permitir filtrar productos por marca mediante un selector desplegable que incluya una opción "Todas" para no restringir por marca.
4. WHEN se aplican múltiples filtros simultáneamente (texto de búsqueda, categoría y marca), THE Sistema_Inventario SHALL mostrar únicamente los productos que cumplan con todos los criterios seleccionados (intersección lógica AND).
5. WHEN no existen productos que coincidan con los filtros aplicados, THE Sistema_Inventario SHALL mostrar un mensaje indicando que no se encontraron resultados.
6. WHEN el administrador limpia el campo de búsqueda y restablece los selectores a "Todas", THE Sistema_Inventario SHALL mostrar la lista completa de productos activos.

### Requirement 7: Visualización adaptativa del inventario

**User Story:** Como administrador de la ferretería, quiero ver el inventario en formato de tabla en escritorio y en tarjetas en móvil, para tener una experiencia adecuada en cada dispositivo.

#### Acceptance Criteria

1. WHILE el dispositivo tiene un ancho de pantalla mayor a 768 píxeles, THE Sistema_Inventario SHALL mostrar los productos en formato de tabla con columnas: código, nombre, categoría, marca, precio compra, precio venta, stock, mínimo y estado.
2. WHILE el dispositivo tiene un ancho de pantalla menor o igual a 768 píxeles, THE Sistema_Inventario SHALL mostrar cada producto en formato de tarjeta que incluya: nombre, código, categoría, precio de venta, stock actual y estado.
3. THE Sistema_Inventario SHALL mostrar los precios en formato de moneda colombiana con símbolo "$", separador de miles con punto y sin decimales (ejemplo: $15.000).
4. WHEN la lista de productos supera 20 elementos, THE Sistema_Inventario SHALL paginar los resultados mostrando un máximo de 20 productos por página con controles de navegación entre páginas.
5. WHEN el ancho de pantalla cambia y cruza el umbral de 768 píxeles, THE Sistema_Inventario SHALL alternar automáticamente entre el formato de tabla y el formato de tarjetas sin pérdida de datos ni recarga de página.

### Requirement 8: Desactivación de productos

**User Story:** Como administrador de la ferretería, quiero desactivar productos que ya no manejo sin perder su historial, para mantener el inventario limpio sin eliminar datos.

#### Acceptance Criteria

1. WHEN el administrador solicita eliminar un producto, THE Sistema_Inventario SHALL desactivar el producto en lugar de eliminarlo permanentemente, conservando todos los datos del producto y sus registros históricos asociados (movimientos, ventas, órdenes de compra).
2. WHEN un producto es desactivado, THE Sistema_Inventario SHALL excluirlo de la lista de inventario activo, de los selectores de productos en ventas y órdenes de compra, y del conteo de productos en el dashboard.
3. WHEN el administrador solicita desactivar un producto, THE Sistema_Inventario SHALL mostrar un diálogo de confirmación antes de proceder con la desactivación.
4. IF el administrador cancela el diálogo de confirmación de desactivación, THEN THE Sistema_Inventario SHALL mantener el producto en estado activo sin realizar cambios.
5. THE Sistema_Inventario SHALL permitir al administrador consultar la lista de productos desactivados mediante un filtro o sección separada.
6. WHEN el administrador solicita reactivar un producto desactivado, THE Sistema_Inventario SHALL cambiar el estado del producto a activo y mostrarlo nuevamente en la lista de inventario activo.
