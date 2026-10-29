export type Rubro = 'pinturas' | 'materiales' | 'pisos'

export interface Producto {
  id: string
  nombre: string
  rubro: Rubro
  detalle: string
  unidad: string
  unidadPlural: string
}

export const NEGOCIO = {
  nombre: 'Corralón JS',
  razon: 'JS Corralón de Materiales',
  slogan: 'Construimos lo que soñás',
  telefonoVisible: '353 508-6543',
  /** WhatsApp de la cuenta que figura en Instagram. */
  whatsapp: '5493535086543',
  direccion: 'San Martín 248',
  localidad: 'Pozo del Molle, Córdoba',
  cp: '5913',
  instagram: 'corralonjs_pdm',
  horarios: [
    { dias: 'Lunes a viernes', horas: '8:00 a 12:00 y 15:30 a 19:30' },
    { dias: 'Sábados', horas: '8:00 a 12:00' },
  ],
}

export const RUBROS: { id: Rubro; nombre: string; texto: string }[] = [
  {
    id: 'pinturas',
    nombre: 'Pinturas',
    texto: 'Látex, esmaltes, impermeabilizantes y lo que hace falta para aplicarlos.',
  },
  {
    id: 'materiales',
    nombre: 'Materiales',
    texto: 'Cemento, ladrillos, hierro, arena y el resto de la obra.',
  },
  {
    id: 'pisos',
    nombre: 'Pisos',
    texto: 'Cerámicos, porcelanatos, pastinas y pegamentos.',
  },
]

export const PRODUCTOS: Producto[] = [
  { id: 'latex-interior', nombre: 'Látex interior', rubro: 'pinturas', detalle: 'Paredes de adentro. En el pedido decinos el color.', unidad: 'balde', unidadPlural: 'baldes' },
  { id: 'latex-exterior', nombre: 'Látex exterior', rubro: 'pinturas', detalle: 'Frentes y muros a la intemperie.', unidad: 'balde', unidadPlural: 'baldes' },
  { id: 'esmalte', nombre: 'Esmalte sintético', rubro: 'pinturas', detalle: 'Madera y metal: puertas, rejas, aberturas.', unidad: 'litro', unidadPlural: 'litros' },
  { id: 'impermeabilizante', nombre: 'Impermeabilizante', rubro: 'pinturas', detalle: 'Techos y terrazas.', unidad: 'balde', unidadPlural: 'baldes' },
  { id: 'fijador', nombre: 'Fijador sellador', rubro: 'pinturas', detalle: 'Se da antes de pintar, para que la pintura rinda.', unidad: 'litro', unidadPlural: 'litros' },
  { id: 'enduido', nombre: 'Enduido', rubro: 'pinturas', detalle: 'Para emparejar la pared antes de pintar.', unidad: 'balde', unidadPlural: 'baldes' },
  { id: 'barniz', nombre: 'Barniz', rubro: 'pinturas', detalle: 'Muebles y madera a la vista.', unidad: 'litro', unidadPlural: 'litros' },
  { id: 'pintura-aplicar', nombre: 'Pinceles, rodillos y cintas', rubro: 'pinturas', detalle: 'Lo necesario para aplicar la pintura.', unidad: 'unidad', unidadPlural: 'unidades' },
  { id: 'cemento', nombre: 'Cemento', rubro: 'materiales', detalle: 'Para hormigón, revoque y carpeta.', unidad: 'bolsa', unidadPlural: 'bolsas' },
  { id: 'cal', nombre: 'Cal', rubro: 'materiales', detalle: 'Mezclas y terminaciones.', unidad: 'bolsa', unidadPlural: 'bolsas' },
  { id: 'ladrillo-hueco', nombre: 'Ladrillo hueco', rubro: 'materiales', detalle: 'Muros y tabiques.', unidad: 'unidad', unidadPlural: 'unidades' },
  { id: 'ladrillo-comun', nombre: 'Ladrillo común', rubro: 'materiales', detalle: 'Muros y parrillas.', unidad: 'unidad', unidadPlural: 'unidades' },
  { id: 'arena', nombre: 'Arena', rubro: 'materiales', detalle: 'Para mezclar.', unidad: 'm³', unidadPlural: 'm³' },
  { id: 'piedra', nombre: 'Piedra', rubro: 'materiales', detalle: 'Para hormigón.', unidad: 'm³', unidadPlural: 'm³' },
  { id: 'hierro', nombre: 'Hierro', rubro: 'materiales', detalle: 'Estructuras. Decinos el diámetro en la nota.', unidad: 'barra', unidadPlural: 'barras' },
  { id: 'alambre', nombre: 'Alambre', rubro: 'materiales', detalle: 'Ataduras y cerramientos.', unidad: 'rollo', unidadPlural: 'rollos' },
  { id: 'clavos', nombre: 'Clavos y tornillos', rubro: 'materiales', detalle: 'Ferretería de obra.', unidad: 'kg', unidadPlural: 'kg' },
  { id: 'chapas', nombre: 'Chapas', rubro: 'materiales', detalle: 'Techos. Decinos el largo en la nota.', unidad: 'unidad', unidadPlural: 'unidades' },
  { id: 'perfiles', nombre: 'Perfiles', rubro: 'materiales', detalle: 'Estructura de techos y tabiques.', unidad: 'unidad', unidadPlural: 'unidades' },
  { id: 'ceramico', nombre: 'Cerámico', rubro: 'pisos', detalle: 'Pisos y paredes. Decinos la medida.', unidad: 'm²', unidadPlural: 'm²' },
  { id: 'porcelanato', nombre: 'Porcelanato', rubro: 'pisos', detalle: 'Pisos de alto tránsito.', unidad: 'm²', unidadPlural: 'm²' },
  { id: 'pastina', nombre: 'Pastina', rubro: 'pisos', detalle: 'Para tomar las juntas.', unidad: 'bolsa', unidadPlural: 'bolsas' },
  { id: 'pegamento', nombre: 'Pegamento para pisos', rubro: 'pisos', detalle: 'Para pegar cerámico y porcelanato.', unidad: 'bolsa', unidadPlural: 'bolsas' },
  { id: 'zocalo', nombre: 'Zócalos', rubro: 'pisos', detalle: 'La terminación contra la pared.', unidad: 'caja', unidadPlural: 'cajas' },
  { id: 'revestimiento', nombre: 'Revestimiento', rubro: 'pisos', detalle: 'Paredes de baño y cocina.', unidad: 'm²', unidadPlural: 'm²' },
]

export function textoCantidad(producto: Producto, cantidad: number) {
  const unidad = cantidad === 1 ? producto.unidad : producto.unidadPlural
  return `${cantidad} ${unidad}`
}

export function enlaceMapa() {
  const consulta = `${NEGOCIO.direccion}, ${NEGOCIO.localidad}, Argentina`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`
}

export interface MuebleVista {
  id: string
  nombre: string
  detalle: string
  medidas: string
  src: string
  orbita: string
}

/** Piezas de muestra a escala real. Cuando lleguen las fotos, se cambia el modelo. */
export const MUEBLES: MuebleVista[] = [
  {
    id: 'mesa',
    nombre: 'Mesa de comedor',
    detalle: 'Queda apoyada en el piso. Con el celular abrís la cámara y caminás alrededor.',
    medidas: '1,60 m de ancho · 0,90 m de profundidad · 0,75 m de alto',
    src: '/modelos/mesa.glb?disable_occlusion=false',
    orbita: '25deg 68deg 2.5m',
  },
  {
    id: 'placard',
    nombre: 'Placard',
    detalle: 'Para ver si entra en la pared y a qué altura queda junto a la puerta.',
    medidas: '0,90 m de ancho · 0,55 m de profundidad · 1,90 m de alto',
    src: '/modelos/placard.glb?disable_occlusion=false',
    orbita: '30deg 75deg 3.6m',
  },
]

export function enlaceInstagram() {
  return `https://www.instagram.com/${NEGOCIO.instagram}/`
}
