import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  MUEBLES,
  NEGOCIO,
  PRODUCTOS,
  RUBROS,
  enlaceInstagram,
  enlaceMapa,
  textoCantidad,
  type MuebleVista,
  type Producto,
  type Rubro,
} from './datos'
const Visor = lazy(() => import('./Visor').then((modulo) => ({ default: modulo.Visor })))

interface Linea {
  id: string
  cantidad: number
}

type Filtro = Rubro | 'todos'

function productoPorId(id: string) {
  const producto = PRODUCTOS.find((item) => item.id === id)
  if (!producto) throw new Error(`Producto desconocido: ${id}`)
  return producto
}

function armarMensaje(lineas: Linea[], nombre: string, nota: string, reparto: boolean, direccion: string) {
  const items = lineas.map((linea) => {
    const producto = productoPorId(linea.id)
    return `• ${producto.nombre} — ${textoCantidad(producto, linea.cantidad)}`
  })
  const partes = ['Hola, Corralón JS. Quiero hacer un pedido:', '', ...items]
  if (reparto) {
    const donde = direccion.trim() ? ` en ${direccion.trim()}` : ''
    partes.push('', `Necesito reparto${donde}.`)
  }
  if (nombre.trim()) partes.push(`A nombre de: ${nombre.trim()}`)
  if (nota.trim()) partes.push(`Nota: ${nota.trim()}`)
  partes.push('', '¿Me confirman precio y stock? Gracias.')
  return partes.join('\n')
}

function enlaceWhatsapp(texto: string) {
  return `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(texto)}`
}

export function App() {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pedido, setPedido] = useState<Linea[]>([])
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [nota, setNota] = useState('')
  const [reparto, setReparto] = useState(false)
  const [direccion, setDireccion] = useState('')
  const [sombra, setSombra] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [mueble, setMueble] = useState<MuebleVista | null>(null)
  const cerrarRef = useRef<HTMLButtonElement>(null)

  const totalUnidades = pedido.reduce((suma, linea) => suma + linea.cantidad, 0)

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return PRODUCTOS.filter((producto) => {
      const coincideRubro = filtro === 'todos' || producto.rubro === filtro
      const coincideTexto = texto === ''
        || producto.nombre.toLowerCase().includes(texto)
        || producto.detalle.toLowerCase().includes(texto)
      return coincideRubro && coincideTexto
    })
  }, [busqueda, filtro])

  useEffect(() => {
    const id = window.setTimeout(() => setCargando(false), 4000)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    function alScroll() {
      setSombra(window.scrollY > 8)
    }
    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => window.removeEventListener('scroll', alScroll)
  }, [])

  useEffect(() => {
    if (!abierto) return
    cerrarRef.current?.focus()
    function alTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAbierto(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', alTecla)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', alTecla)
    }
  }, [abierto])

  function cantidadDe(id: string) {
    return pedido.find((linea) => linea.id === id)?.cantidad ?? 0
  }

  function fijarCantidad(id: string, cantidad: number) {
    setPedido((actual) => {
      const sinEste = actual.filter((linea) => linea.id !== id)
      if (cantidad <= 0) return sinEste
      return [...sinEste, { id, cantidad }]
    })
  }

  function elegirRubro(rubro: Rubro) {
    setFiltro(rubro)
    setBusqueda('')
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const saludo = 'Hola, Corralón JS. Quería consultar por un pedido.'
  const mensajePedido = armarMensaje(pedido, nombre, nota, reparto, direccion)

  return (
    <>
      {cargando && <PantallaCarga />}
      <a className="saltear" href="#catalogo">Saltar al catálogo</a>
      <header className={sombra ? 'cabecera con-sombra' : 'cabecera'}>
        <div className="envoltorio">
          <a className="identidad" href="#inicio">
            <span className="marca"><img src="/logo.png" alt="" /></span>
            <span>
              <strong>{NEGOCIO.nombre}</strong>
              <span className="lugar">{NEGOCIO.localidad}</span>
            </span>
          </a>
          <nav className="nav" aria-label="Secciones">
            <a href="#espacio">Tu espacio</a>
            <a href="#catalogo">Catálogo</a>
            <a href="#repartos">Repartos</a>
            <a href="#horarios">Horarios</a>
          </nav>
          <div className="acciones">
            <button type="button" className="boton" onClick={() => setAbierto(true)}>
              Pedido
              {totalUnidades > 0 && <span className="cuenta">{totalUnidades}</span>}
            </button>
            <a className="boton-whatsapp" href={enlaceWhatsapp(saludo)} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="envoltorio hero-grilla">
            <div>
              <p className="ceja">JS Corralón de Materiales</p>
              <h1>{NEGOCIO.slogan}</h1>
              <p className="bajada">
                Pinturas, materiales y pisos en Pozo del Molle. Elegís lo que necesitás y el pedido llega a nuestro WhatsApp.
              </p>
              <div className="hero-acciones">
                <a className="boton" href="#catalogo">Ver catálogo</a>
                <a className="boton-linea" href={enlaceWhatsapp(saludo)} target="_blank" rel="noreferrer">
                  Escribir ahora
                </a>
              </div>
            </div>
            <div className="ficha">
              <a href={enlaceMapa()} target="_blank" rel="noreferrer">
                <small>Dónde estamos</small>
                <strong>{NEGOCIO.direccion}</strong>
                <strong>{NEGOCIO.localidad}</strong>
              </a>
              <div className="dato">
                <small>Horario</small>
                <strong>Lun. a vie. 8 a 12 y 15:30 a 19:30</strong>
                <strong>Sábados 8 a 12</strong>
              </div>
              <a href={`tel:+${NEGOCIO.whatsapp}`}>
                <small>Teléfono y WhatsApp</small>
                <strong>{NEGOCIO.telefonoVisible}</strong>
              </a>
            </div>
          </div>
        </section>

        <section className="seccion" aria-labelledby="titulo-rubros">
          <div className="envoltorio">
            <h2 id="titulo-rubros">Qué vas a encontrar</h2>
            <p className="lead">Cuatro formas de entrar. El precio y el stock se confirman cuando mandás el pedido.</p>
            <div className="rubros">
              {RUBROS.map((rubro) => (
                <button key={rubro.id} type="button" className="rubro" onClick={() => elegirRubro(rubro.id)}>
                  <b>{rubro.nombre}</b>
                  <span>{rubro.texto}</span>
                </button>
              ))}
              <a className="rubro" href="#repartos">
                <b>Repartos</b>
                <span>Lo llevamos. En el pedido dejanos la dirección.</span>
              </a>
            </div>
          </div>
        </section>

        <section className="seccion" id="espacio" aria-labelledby="titulo-espacio" style={{ paddingTop: 0 }}>
          <div className="envoltorio">
            <h2 id="titulo-espacio">Miralos en tu casa</h2>
            <p className="lead">
              El mueble queda quieto sobre el piso, a su tamaño. En el celular se abre la cámara y vos te movés alrededor.
            </p>
            <div className="muebles">
              {MUEBLES.map((pieza) => (
                <article key={pieza.id} className="mueble">
                  <div>
                    <h3>{pieza.nombre}</h3>
                    <p>{pieza.detalle}</p>
                    <p className="medidas">{pieza.medidas}</p>
                  </div>
                  <button type="button" className="boton" onClick={() => setMueble(pieza)}>
                    Ver en 3D
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="seccion" id="catalogo" aria-labelledby="titulo-catalogo" style={{ paddingTop: 0 }}>
          <div className="envoltorio">
            <h2 id="titulo-catalogo">Catálogo</h2>
            <p className="lead">Sumá cantidades. Si falta un color, una medida o una marca, escribilas en la nota del pedido.</p>
            <div className="barra-catalogo">
              <input
                className="buscar"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar cemento, látex, piso…"
                aria-label="Buscar en el catálogo"
                type="search"
              />
              <div className="filtros" role="group" aria-label="Rubro">
                <button type="button" className={filtro === 'todos' ? 'filtro activo' : 'filtro'} onClick={() => setFiltro('todos')}>
                  Todo
                </button>
                {RUBROS.map((rubro) => (
                  <button
                    key={rubro.id}
                    type="button"
                    className={filtro === rubro.id ? 'filtro activo' : 'filtro'}
                    onClick={() => setFiltro(rubro.id)}
                  >
                    {rubro.nombre}
                  </button>
                ))}
              </div>
            </div>

            {visibles.length === 0 ? (
              <div className="vacio">
                <p>No hay nada con esa búsqueda. Escribinos y lo vemos.</p>
                <a className="boton" href={enlaceWhatsapp(saludo)} target="_blank" rel="noreferrer">Consultar por WhatsApp</a>
              </div>
            ) : (
              <div className="grilla">
                {visibles.map((producto) => (
                  <Tarjeta
                    key={producto.id}
                    producto={producto}
                    cantidad={cantidadDe(producto.id)}
                    onCambiar={(cantidad) => fijarCantidad(producto.id, cantidad)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="seccion" aria-labelledby="titulo-pasos" style={{ paddingTop: 0 }}>
          <div className="envoltorio">
            <h2 id="titulo-pasos">Cómo se pide</h2>
            <div className="pasos">
              <article className="paso">
                <b>1</b>
                <h3>Elegís</h3>
                <p>Recorrés el catálogo y sumás lo que necesitás para la obra.</p>
              </article>
              <article className="paso">
                <b>2</b>
                <h3>Mandás</h3>
                <p>El pedido se abre en WhatsApp, con las cantidades ya escritas.</p>
              </article>
              <article className="paso">
                <b>3</b>
                <h3>Confirmamos</h3>
                <p>Te decimos precio y stock. Recién ahí se prepara.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="seccion" id="repartos" style={{ paddingTop: 0 }}>
          <div className="envoltorio">
            <div className="reparto">
              <p className="ceja">Repartos</p>
              <h2>Lo llevamos a la obra</h2>
              <p>
                Marcá el reparto en el pedido y dejanos la dirección. Te confirmamos el envío junto con el precio.
              </p>
              <button type="button" className="boton" onClick={() => { setReparto(true); setAbierto(true) }}>
                Pedir con reparto
              </button>
            </div>
          </div>
        </section>

        <section className="seccion" id="horarios" aria-labelledby="titulo-horarios">
          <div className="envoltorio">
            <h2 id="titulo-horarios">Horarios y dirección</h2>
            <div className="horarios-grilla">
              <div className="bloque">
                <h3>Cuándo abrimos</h3>
                <ul>
                  {NEGOCIO.horarios.map((horario) => (
                    <li key={horario.dias}><strong>{horario.dias}:</strong> {horario.horas}</li>
                  ))}
                </ul>
              </div>
              <div className="bloque">
                <h3>{NEGOCIO.direccion}</h3>
                <p>{NEGOCIO.localidad} · CP {NEGOCIO.cp}</p>
                <p>
                  <a href={enlaceMapa()} target="_blank" rel="noreferrer">Cómo llegar</a>
                  {' · '}
                  <a href={enlaceInstagram()} target="_blank" rel="noreferrer">@{NEGOCIO.instagram}</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="pie">
        <div className="envoltorio">
          <span>{NEGOCIO.razon}</span>
          <span>{NEGOCIO.slogan}</span>
        </div>
      </footer>

      {mueble && (
        <Suspense fallback={null}>
          <Visor mueble={mueble} onCerrar={() => setMueble(null)} />
        </Suspense>
      )}

      {abierto && (
        <>
          <button type="button" className="velo" aria-label="Cerrar pedido" onClick={() => setAbierto(false)} />
          <aside className="panel" role="dialog" aria-modal="true" aria-labelledby="titulo-pedido">
            <header>
              <h2 id="titulo-pedido">Tu pedido</h2>
              <button ref={cerrarRef} type="button" className="cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar">
                ×
              </button>
            </header>
            <div className="cuerpo">
              {pedido.length === 0 ? (
                <p>Todavía no sumaste nada. Elegí productos del catálogo.</p>
              ) : (
                pedido.map((linea) => {
                  const producto = productoPorId(linea.id)
                  return (
                    <div className="linea-pedido" key={linea.id}>
                      <p>{producto.nombre}</p>
                      <div className="stepper">
                        <button type="button" aria-label={`Sacar un ${producto.nombre}`} onClick={() => fijarCantidad(linea.id, linea.cantidad - 1)}>−</button>
                        <strong>{linea.cantidad}</strong>
                        <button type="button" aria-label={`Sumar un ${producto.nombre}`} onClick={() => fijarCantidad(linea.id, linea.cantidad + 1)}>+</button>
                      </div>
                    </div>
                  )
                })
              )}

              <label className="campo">
                Tu nombre
                <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} autoComplete="name" />
              </label>
              <label className="check">
                <input type="checkbox" checked={reparto} onChange={(evento) => setReparto(evento.target.checked)} />
                <span>Necesito que me lo traigan</span>
              </label>
              {reparto && (
                <label className="campo">
                  Dirección del reparto
                  <input value={direccion} onChange={(evento) => setDireccion(evento.target.value)} autoComplete="street-address" />
                </label>
              )}
              <label className="campo">
                Nota
                <textarea
                  value={nota}
                  onChange={(evento) => setNota(evento.target.value)}
                  placeholder="Color, medida, marca o lo que no esté en la lista"
                />
              </label>
              <p className="aviso">El mensaje no confirma la compra. Te respondemos con precio y stock.</p>
            </div>
            <footer>
              <a
                className="boton-whatsapp"
                href={pedido.length === 0 ? undefined : enlaceWhatsapp(mensajePedido)}
                aria-disabled={pedido.length === 0}
                onClick={(evento) => { if (pedido.length === 0) evento.preventDefault() }}
                target="_blank"
                rel="noreferrer"
              >
                Enviar pedido por WhatsApp
              </a>
              <button type="button" className="boton-linea oscuro" onClick={() => setPedido([])} disabled={pedido.length === 0}>
                Vaciar pedido
              </button>
            </footer>
          </aside>
        </>
      )}
    </>
  )
}

function PantallaCarga() {
  return (
    <div className="carga" role="status" aria-live="polite" aria-label="Abriendo Corralón JS">
      <div className="carga-escena">
        <span className="carga-anillo" />
        <span className="carga-anillo carga-anillo-tarde" />
        <img className="carga-logo" src="/logo.png" alt="" />
      </div>
      <p className="carga-nombre">Corralón JS</p>
      <p className="carga-slogan">Construimos lo que soñás</p>
    </div>
  )
}

function Tarjeta({
  producto,
  cantidad,
  onCambiar,
}: {
  producto: Producto
  cantidad: number
  onCambiar: (cantidad: number) => void
}) {
  const rubro = RUBROS.find((item) => item.id === producto.rubro)
  return (
    <article className={cantidad > 0 ? 'tarjeta en-pedido' : 'tarjeta'}>
      <span className="etiqueta">{rubro?.nombre}</span>
      <h3>{producto.nombre}</h3>
      <p>{producto.detalle}</p>
      <div className="pedido-fila">
        <div className="stepper">
          <button type="button" aria-label={`Sacar un ${producto.nombre}`} onClick={() => onCambiar(cantidad - 1)} disabled={cantidad === 0}>−</button>
          <strong>{cantidad}</strong>
          <button type="button" aria-label={`Sumar un ${producto.nombre}`} onClick={() => onCambiar(cantidad + 1)}>+</button>
        </div>
        <span className="unidad-pedido">{cantidad > 0 ? textoCantidad(producto, cantidad) : producto.unidad}</span>
      </div>
    </article>
  )
}
