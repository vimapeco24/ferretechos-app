/**
 * Constantes del sistema de inventario para ferretería.
 * Define unidades de medida, categorías predefinidas y atributos específicos por categoría.
 */

/**
 * Unidades de medida disponibles para productos de ferretería.
 * Lista de 15 unidades que cubren los diferentes tipos de productos.
 */
export const UNIDADES_FERRETERIA = [
  'unidad',
  'galón',
  'cuarto',
  'litro',
  'metro',
  'metro cuadrado',
  'pliego',
  'rollo',
  'bolsa',
  'caja',
  'paquete',
  'libra',
  'kilogramo',
  'pie',
  'pulgada',
  'tubo',
];

/**
 * Mapeo de categoría → unidad de medida por defecto.
 * Se usa para pre-seleccionar la unidad al elegir una categoría.
 * Categorías no listadas aquí usan 'unidad' como valor por defecto.
 */
export const UNIDAD_POR_DEFECTO = {
  'Pinturas': 'galón',
  'Drywall': 'pliego',
  'Estucos': 'kilogramo',
  'PVC Techos': 'caja',
  'Herramientas': 'unidad',
  'Tornillería': 'unidad',
  'Eléctricos': 'metro',
  'Plomería': 'metro',
  'Adhesivos y Sellantes': 'unidad',
  'Abrasivos': 'unidad',
  'Seguridad Industrial': 'unidad',
};

/**
 * Categorías predefinidas del sistema (10 categorías del ramo ferretero).
 */
export const CATEGORIAS_PREDEFINIDAS = [
  'Pinturas',
  'Drywall',
  'Estucos',
  'PVC Techos',
  'Herramientas',
  'Tornillería',
  'Eléctricos',
  'Plomería',
  'Adhesivos y Sellantes',
  'Abrasivos',
  'Seguridad Industrial',
];

/**
 * Configuración de atributos específicos por categoría.
 * Cada categoría define un array de atributos con:
 * - nombre: identificador del atributo
 * - tipo_campo: 'texto' | 'numero' | 'seleccion'
 * - opciones: array de opciones (solo para tipo 'seleccion')
 * - obligatorio: si el campo es requerido al guardar el producto
 * - max_length: longitud máxima (solo para tipo 'texto')
 */
export const ATRIBUTOS_POR_CATEGORIA = {
  'Pinturas': [
    {
      nombre: 'color',
      tipo_campo: 'texto',
      opciones: null,
      obligatorio: false,
      max_length: 50,
    },
    {
      nombre: 'tipo',
      tipo_campo: 'seleccion',
      opciones: ['vinilo', 'esmalte', 'anticorrosivo', 'laca'],
      obligatorio: true,
    },
    {
      nombre: 'acabado',
      tipo_campo: 'seleccion',
      opciones: ['mate', 'brillante', 'satinado'],
      obligatorio: true,
    },
    {
      nombre: 'presentacion',
      tipo_campo: 'seleccion',
      opciones: ['galón', 'cuarto', 'litro', 'caneca'],
      obligatorio: true,
    },
  ],
  'Drywall': [
    {
      nombre: 'largo_cm',
      tipo_campo: 'numero',
      opciones: null,
      obligatorio: false,
    },
    {
      nombre: 'ancho_cm',
      tipo_campo: 'numero',
      opciones: null,
      obligatorio: false,
    },
    {
      nombre: 'espesor_cm',
      tipo_campo: 'numero',
      opciones: null,
      obligatorio: false,
    },
    {
      nombre: 'tipo',
      tipo_campo: 'seleccion',
      opciones: ['estándar', 'resistente a humedad', 'resistente a fuego'],
      obligatorio: true,
    },
    {
      nombre: 'presentacion',
      tipo_campo: 'seleccion',
      opciones: ['pliego', 'medio pliego'],
      obligatorio: true,
    },
  ],
  'Estucos': [
    {
      nombre: 'peso_kg',
      tipo_campo: 'numero',
      opciones: null,
      obligatorio: false,
    },
    {
      nombre: 'tipo',
      tipo_campo: 'seleccion',
      opciones: ['plástico', 'acrílico', 'veneciano'],
      obligatorio: true,
    },
    {
      nombre: 'color',
      tipo_campo: 'texto',
      opciones: null,
      obligatorio: false,
      max_length: 50,
    },
  ],
  'PVC Techos': [
    {
      nombre: 'color',
      tipo_campo: 'texto',
      opciones: null,
      obligatorio: false,
      max_length: 50,
    },
    {
      nombre: 'tipo',
      tipo_campo: 'seleccion',
      opciones: ['liso', 'decorado', 'madera', 'mármol'],
      obligatorio: true,
    },
    {
      nombre: 'largo_cm',
      tipo_campo: 'numero',
      opciones: null,
      obligatorio: false,
    },
    {
      nombre: 'ancho_cm',
      tipo_campo: 'numero',
      opciones: null,
      obligatorio: false,
    },
    {
      nombre: 'presentacion',
      tipo_campo: 'seleccion',
      opciones: ['caja', 'paquete'],
      obligatorio: true,
    },
    {
      nombre: 'unidades_por_caja',
      tipo_campo: 'numero',
      opciones: null,
      obligatorio: false,
    },
  ],
};
