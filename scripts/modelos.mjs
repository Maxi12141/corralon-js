import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'modelos')
const baldosa = 0.22

function ruido(x, y) {
  const valor = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return valor - Math.floor(valor)
}

const crcTabla = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  crcTabla[n] = c >>> 0
}

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = crcTabla[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function trozoPng(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const nombre = Buffer.from(tipo)
  const suma = Buffer.alloc(4)
  suma.writeUInt32BE(crc32(Buffer.concat([nombre, datos])))
  return Buffer.concat([largo, nombre, datos, suma])
}

function texturaMadera() {
  const ancho = 256
  const alto = 256
  const crudo = Buffer.alloc(alto * (1 + ancho * 3))
  for (let y = 0; y < alto; y++) {
    const fila = y * (1 + ancho * 3)
    const tabla = Math.floor(y / 36)
    const junta = y % 36 < 2
    crudo[fila] = 0
    for (let x = 0; x < ancho; x++) {
      const veta = 0.5 + 0.5 * Math.sin(x * 0.22 + tabla * 1.7 + Math.sin(y * 0.08) * 3)
      const grano = ruido(x, y)
      const corte = (x + tabla * 47) % 96 < 2
      let rojo = 132 + veta * 58 + grano * 16
      let verde = 84 + veta * 36 + grano * 10
      let azul = 46 + veta * 16 + grano * 6
      if (junta || corte) {
        rojo *= 0.62
        verde *= 0.55
        azul *= 0.5
      }
      const i = fila + 1 + x * 3
      crudo[i] = Math.max(0, Math.min(255, rojo))
      crudo[i + 1] = Math.max(0, Math.min(255, verde))
      crudo[i + 2] = Math.max(0, Math.min(255, azul))
    }
  }
  const cabecera = Buffer.alloc(13)
  cabecera.writeUInt32BE(ancho, 0)
  cabecera.writeUInt32BE(alto, 4)
  cabecera[8] = 8
  cabecera[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozoPng('IHDR', cabecera),
    trozoPng('IDAT', deflateSync(crudo)),
    trozoPng('IEND', Buffer.alloc(0)),
  ])
}

function ejes(normal) {
  if (normal[1] !== 0) return [0, 2]
  if (normal[0] !== 0) return [2, 1]
  return [0, 1]
}

function caja(cx, cy, cz, sx, sy, sz) {
  const hx = sx / 2
  const hy = sy / 2
  const hz = sz / 2
  const caras = [
    { n: [0, 1, 0], v: [[-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz], [-hx, hy, -hz]] },
    { n: [0, -1, 0], v: [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]] },
    { n: [1, 0, 0], v: [[hx, -hy, hz], [hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz]] },
    { n: [-1, 0, 0], v: [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]] },
    { n: [0, 0, 1], v: [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]] },
    { n: [0, 0, -1], v: [[hx, -hy, -hz], [-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz]] },
  ]
  const posiciones = []
  const normales = []
  const uvs = []
  const indices = []
  for (const cara of caras) {
    const base = posiciones.length / 3
    const [eu, ev] = ejes(cara.n)
    for (const vertice of cara.v) {
      const punto = [vertice[0] + cx, vertice[1] + cy, vertice[2] + cz]
      posiciones.push(...punto)
      normales.push(...cara.n)
      uvs.push(punto[eu] / baldosa, punto[ev] / baldosa)
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  return { posiciones, normales, uvs, indices }
}

function unir(partes) {
  const posiciones = []
  const normales = []
  const uvs = []
  const indices = []
  for (const parte of partes) {
    const base = posiciones.length / 3
    posiciones.push(...parte.posiciones)
    normales.push(...parte.normales)
    uvs.push(...parte.uvs)
    for (const indice of parte.indices) indices.push(base + indice)
  }
  return { posiciones, normales, uvs, indices }
}

function glb(partesPorColor, textura) {
  const buffer = []
  const bufferViews = []
  const accessors = []
  const meshes = []
  const nodes = []
  const materials = []

  function reservar(bytes) {
    const resto = (4 - (buffer.length % 4)) % 4
    for (let i = 0; i < resto; i++) buffer.push(0)
    const inicio = buffer.length
    for (const byte of bytes) buffer.push(byte)
    return inicio
  }

  function vista(inicio, largo, target) {
    const indice = bufferViews.length
    const entrada = { buffer: 0, byteOffset: inicio, byteLength: largo }
    if (target) entrada.target = target
    bufferViews.push(entrada)
    return indice
  }

  const imagenes = []
  const texturas = []
  if (textura) {
    const inicio = reservar(textura)
    const vistaImagen = vista(inicio, textura.length)
    imagenes.push({ bufferView: vistaImagen, mimeType: 'image/png' })
    texturas.push({ sampler: 0, source: 0 })
  }

  for (const grupo of partesPorColor) {
    const geometria = unir(grupo.cajas)
    const pos = Buffer.from(new Float32Array(geometria.posiciones).buffer)
    const nor = Buffer.from(new Float32Array(geometria.normales).buffer)
    const uv = Buffer.from(new Float32Array(geometria.uvs).buffer)
    const ind = Buffer.from(new Uint16Array(geometria.indices).buffer)
    const posInicio = reservar(pos)
    const norInicio = reservar(nor)
    const uvInicio = reservar(uv)
    const indInicio = reservar(ind)
    const posVista = vista(posInicio, pos.length, 34962)
    const norVista = vista(norInicio, nor.length, 34962)
    const uvVista = vista(uvInicio, uv.length, 34962)
    const indVista = vista(indInicio, ind.length, 34963)
    const min = [Infinity, Infinity, Infinity]
    const max = [-Infinity, -Infinity, -Infinity]
    for (let i = 0; i < geometria.posiciones.length; i += 3) {
      for (let eje = 0; eje < 3; eje++) {
        const valor = geometria.posiciones[i + eje]
        if (valor < min[eje]) min[eje] = valor
        if (valor > max[eje]) max[eje] = valor
      }
    }
    const aPos = accessors.length
    accessors.push({
      bufferView: posVista,
      componentType: 5126,
      count: geometria.posiciones.length / 3,
      type: 'VEC3',
      min,
      max,
    })
    accessors.push({
      bufferView: norVista,
      componentType: 5126,
      count: geometria.normales.length / 3,
      type: 'VEC3',
    })
    accessors.push({
      bufferView: uvVista,
      componentType: 5126,
      count: geometria.uvs.length / 2,
      type: 'VEC2',
    })
    accessors.push({
      bufferView: indVista,
      componentType: 5123,
      count: geometria.indices.length,
      type: 'SCALAR',
    })
    const material = materials.length
    const pbr = {
      baseColorFactor: [...grupo.color, 1],
      metallicFactor: grupo.metal ?? 0,
      roughnessFactor: grupo.rugosidad,
    }
    if (grupo.madera && texturas.length) pbr.baseColorTexture = { index: 0 }
    materials.push({ doubleSided: true, pbrMetallicRoughness: pbr })
    const mesh = meshes.length
    meshes.push({
      primitives: [{
        attributes: { POSITION: aPos, NORMAL: aPos + 1, TEXCOORD_0: aPos + 2 },
        indices: aPos + 3,
        material,
      }],
    })
    nodes.push({ mesh })
  }

  const json = {
    asset: { version: '2.0', generator: 'corralon-js' },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, indice) => indice) }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: buffer.length }],
  }
  if (textura) {
    json.samplers = [{ magFilter: 9729, minFilter: 9729, wrapS: 10497, wrapT: 10497 }]
    json.images = imagenes
    json.textures = texturas
  }
  const jsonBuf = Buffer.from(JSON.stringify(json))
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4
  const jsonChunk = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)])
  const bin = Buffer.from(buffer)
  const binPad = (4 - (bin.length % 4)) % 4
  const binChunk = Buffer.concat([bin, Buffer.alloc(binPad, 0)])
  const total = 12 + 8 + jsonChunk.length + 8 + binChunk.length
  const header = Buffer.alloc(12)
  header.writeUInt32LE(0x46546c67, 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(total, 8)
  const jsonHeader = Buffer.alloc(8)
  jsonHeader.writeUInt32LE(jsonChunk.length, 0)
  jsonHeader.writeUInt32LE(0x4e4f534a, 4)
  const binHeader = Buffer.alloc(8)
  binHeader.writeUInt32LE(binChunk.length, 0)
  binHeader.writeUInt32LE(0x004e4942, 4)
  return Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk])
}

const veta = texturaMadera()
const claro = [1, 0.98, 0.94]
const medio = [0.78, 0.72, 0.66]
const oscuro = [0.42, 0.36, 0.3]
const metal = [0.78, 0.79, 0.8]

const mesa = glb([
  { color: claro, rugosidad: 0.58, madera: true, cajas: [caja(0, 0.732, 0, 1.6, 0.036, 0.9)] },
  { color: medio, rugosidad: 0.66, madera: true, cajas: [caja(0, 0.68, 0, 1.46, 0.07, 0.76)] },
  {
    color: oscuro,
    rugosidad: 0.72,
    madera: true,
    cajas: [
      caja(-0.72, 0.325, 0.36, 0.07, 0.65, 0.07),
      caja(0.72, 0.325, 0.36, 0.07, 0.65, 0.07),
      caja(-0.72, 0.325, -0.36, 0.07, 0.65, 0.07),
      caja(0.72, 0.325, -0.36, 0.07, 0.65, 0.07),
    ],
  },
], veta)

const placard = glb([
  { color: oscuro, rugosidad: 0.7, madera: true, cajas: [caja(0, 0.04, 0, 0.9, 0.08, 0.55)] },
  { color: medio, rugosidad: 0.64, madera: true, cajas: [caja(0, 0.99, 0, 0.9, 1.82, 0.55)] },
  {
    color: claro,
    rugosidad: 0.56,
    madera: true,
    cajas: [
      caja(-0.215, 1.02, 0.282, 0.4, 1.66, 0.02),
      caja(0.215, 1.02, 0.282, 0.4, 1.66, 0.02),
    ],
  },
  {
    color: metal,
    rugosidad: 0.28,
    metal: 0.86,
    cajas: [
      caja(-0.03, 1.02, 0.3, 0.012, 0.16, 0.02),
      caja(0.03, 1.02, 0.3, 0.012, 0.16, 0.02),
    ],
  },
], veta)

mkdirSync(raiz, { recursive: true })
writeFileSync(join(raiz, 'mesa.glb'), mesa)
writeFileSync(join(raiz, 'placard.glb'), placard)
console.log('modelos listos', mesa.length, placard.length)
