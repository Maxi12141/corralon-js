import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'modelos')

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
  const indices = []
  for (const cara of caras) {
    const base = posiciones.length / 3
    for (const vertice of cara.v) {
      posiciones.push(vertice[0] + cx, vertice[1] + cy, vertice[2] + cz)
      normales.push(...cara.n)
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  return { posiciones, normales, indices }
}

function unir(partes) {
  const posiciones = []
  const normales = []
  const indices = []
  for (const parte of partes) {
    const base = posiciones.length / 3
    posiciones.push(...parte.posiciones)
    normales.push(...parte.normales)
    for (const indice of parte.indices) indices.push(base + indice)
  }
  return { posiciones, normales, indices }
}

function glb(partesPorColor) {
  const buffer = []
  const bufferViews = []
  const accessors = []
  const meshes = []
  const nodes = []
  const materials = []

  function reservar(bytes) {
    const offset = buffer.length
    const resto = (4 - (offset % 4)) % 4
    for (let i = 0; i < resto; i++) buffer.push(0)
    const inicio = buffer.length
    for (const byte of bytes) buffer.push(byte)
    return inicio
  }

  function vista(inicio, largo, target) {
    const indice = bufferViews.length
    bufferViews.push({ buffer: 0, byteOffset: inicio, byteLength: largo, target })
    return indice
  }

  for (const grupo of partesPorColor) {
    const geometria = unir(grupo.cajas)
    const pos = Buffer.from(new Float32Array(geometria.posiciones).buffer)
    const nor = Buffer.from(new Float32Array(geometria.normales).buffer)
    const ind = Buffer.from(new Uint16Array(geometria.indices).buffer)
    const posInicio = reservar(pos)
    const norInicio = reservar(nor)
    const indInicio = reservar(ind)
    const posVista = vista(posInicio, pos.length, 34962)
    const norVista = vista(norInicio, nor.length, 34962)
    const indVista = vista(indInicio, ind.length, 34963)
    let min = [Infinity, Infinity, Infinity]
    let max = [-Infinity, -Infinity, -Infinity]
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
      bufferView: indVista,
      componentType: 5123,
      count: geometria.indices.length,
      type: 'SCALAR',
    })
    const material = materials.length
    materials.push({
      doubleSided: true,
      pbrMetallicRoughness: {
        baseColorFactor: [...grupo.color, 1],
        metallicFactor: 0,
        roughnessFactor: grupo.rugosidad,
      },
    })
    const mesh = meshes.length
    meshes.push({
      primitives: [{
        attributes: { POSITION: aPos, NORMAL: aPos + 1 },
        indices: aPos + 2,
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

const maderaClara = [0.62, 0.45, 0.28]
const madera = [0.42, 0.27, 0.15]
const maderaOscura = [0.24, 0.14, 0.08]
const metal = [0.72, 0.73, 0.75]

const mesa = glb([
  { color: maderaClara, rugosidad: 0.48, cajas: [caja(0, 0.732, 0, 1.6, 0.036, 0.9)] },
  { color: madera, rugosidad: 0.55, cajas: [caja(0, 0.68, 0, 1.46, 0.07, 0.76)] },
  {
    color: maderaOscura,
    rugosidad: 0.62,
    cajas: [
      caja(-0.72, 0.325, 0.36, 0.07, 0.65, 0.07),
      caja(0.72, 0.325, 0.36, 0.07, 0.65, 0.07),
      caja(-0.72, 0.325, -0.36, 0.07, 0.65, 0.07),
      caja(0.72, 0.325, -0.36, 0.07, 0.65, 0.07),
    ],
  },
])

const placard = glb([
  { color: maderaOscura, rugosidad: 0.6, cajas: [caja(0, 0.04, 0, 0.9, 0.08, 0.55)] },
  { color: madera, rugosidad: 0.52, cajas: [caja(0, 0.99, 0, 0.9, 1.82, 0.55)] },
  {
    color: maderaClara,
    rugosidad: 0.45,
    cajas: [
      caja(-0.215, 1.02, 0.282, 0.4, 1.66, 0.02),
      caja(0.215, 1.02, 0.282, 0.4, 1.66, 0.02),
    ],
  },
  {
    color: metal,
    rugosidad: 0.3,
    cajas: [
      caja(-0.03, 1.02, 0.3, 0.012, 0.16, 0.02),
      caja(0.03, 1.02, 0.3, 0.012, 0.16, 0.02),
    ],
  },
])

mkdirSync(raiz, { recursive: true })
writeFileSync(join(raiz, 'mesa.glb'), mesa)
writeFileSync(join(raiz, 'placard.glb'), placard)
console.log('modelos listos', mesa.length, placard.length)
